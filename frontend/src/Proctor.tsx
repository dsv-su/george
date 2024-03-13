import { useParams } from 'react-router-dom';
import { ReadyState } from 'react-use-websocket';
import { useEffect, useState } from 'react';
import Candidate from './proctor/Candidate';
import useProctorWebSocket, { InboundMessage } from './hooks/useProctorWebSocket.ts';
import { WebSocketState } from './components/WebSocketState.tsx';

type ExaminationInfo = string;
type Candidate = string;

const Proctor = () => {
  const { examId } = useParams();
  const { readyState, sendJsonMessage } = useProctorWebSocket({
    onMessage: (message) => {
      onMessage(message);
    },
  });
  const [examInfo, setExamInfo] = useState<ExaminationInfo>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [streamSize, setStreamSize] = useState<number>(50);

  const onMessage = (message: InboundMessage) => {
    try {
      console.log(message);
      switch (message.type) {
        case 'exam_info':
          setExamInfo(message.title);
          break;
        case 'candidate':
          setCandidates((existing) => [...new Set([...existing, message.principal_name])]);
          break;
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (readyState == ReadyState.OPEN) {
      sendJsonMessage({
        type: 'proctor_examination',
        exam_id: examId!,
      });
    }
  }, [readyState, sendJsonMessage, examId]);

  const [microphone, setMicrophone] = useState<MediaStreamTrack>();

  useEffect(() => {
    const clearMicrophone = () => {
      setMicrophone(undefined);
    };
    if (microphone) {
      microphone.addEventListener('ended', clearMicrophone);
    }
    return () => {
      if (microphone) {
        microphone.stop();
        microphone.removeEventListener('ended', clearMicrophone);
      }
    };
  }, [microphone]);

  const connectMicrophone = async () => {
    try {
      const microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
      const track = microphone.getAudioTracks()[0];
      setMicrophone(track);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="navbar bg-primary" data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand">{examInfo}</a>
          {!microphone && (
            <button className="btn btn-primary ms-auto me-3" onClick={connectMicrophone}>
              Connect microphone
            </button>
          )}
          {microphone && <span className="ms-auto badge bg-success me-3">Microphone connected</span>}
          <span className="border rounded bg-white px-1 me-3">
            <input
              className="form-range"
              type="range"
              min={1}
              max={100}
              onChange={(e) => {
                setStreamSize(e.target.valueAsNumber);
              }}
              defaultValue={streamSize}
            />
          </span>
          <span className="border rounded bg-white p-1">
            <WebSocketState readyState={readyState} />
          </span>
        </div>
      </div>
      {microphone && (
        <div className="candidates">
          {candidates.map((candidate) => (
            <Candidate key={candidate} candidate={candidate} streamSize={streamSize} microphone={microphone} />
          ))}
        </div>
      )}
    </>
  );
};

export default Proctor;
