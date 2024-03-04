import { useParams } from 'react-router-dom';
import { ReadyState } from 'react-use-websocket';
import { useEffect, useState } from 'react';
import Candidate from './proctor/Candidate';
import useProctorWebSocket, { InboundMessage } from './hooks/useProctorWebSocket.ts';

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

  return (
    <>
      <div className="navbar bg-primary" data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand">{examInfo}</a>
          <span className="ms-auto border rounded bg-white px-1">
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
      <div className="candidates">
        {candidates.map((candidate) => (
          <Candidate key={candidate} candidate={candidate} streamSize={streamSize} />
        ))}
      </div>
    </>
  );
};

function WebSocketState({ readyState }: { readyState: ReadyState }) {
  switch (readyState) {
    case ReadyState.CONNECTING:
      return <span className="text-info">Connecting ...</span>;
    case ReadyState.OPEN:
      return (
        <span className="text-success btn-primary">
          <span>◉</span> Connected
        </span>
      );
    default:
      return (
        <span className="text-danger">
          <span>◉</span> Disconnected
        </span>
      );
  }
}

export default Proctor;
