import { Link, Navigate, useParams } from 'react-router-dom';
import { useFetch } from '../fetch.ts';
import createClient from 'openapi-fetch';
import { components, paths } from '../lib/api/v3';
import Fetch from '../components/Fetch.tsx';
import { WebSocketState } from '../components/WebSocketState.tsx';
import useProctorWebSocket, { InboundMessage } from '../hooks/useProctorWebSocket.ts';
import React, { useEffect, useState } from 'react';
import useI18n from '../hooks/i18n.ts';
import useProctorRTC from '../hooks/useProctorRTC.ts';
import Video from '../Video.tsx';

const { GET } = createClient<paths>();

export default function ExaminationPage() {
  const { examId } = useParams();

  if (!examId) {
    return <Navigate to="/" />;
  }

  return <FetchExamination examId={examId} />;
}

function FetchExamination({ examId }: { examId: string }) {
  const examination = useFetch(() => {
    return GET('/api/proctor/examination/{examId}', { params: { path: { examId } } });
  }, [examId]);

  return (
    <Fetch response={examination}>
      {(examination) => {
        return <Examination examination={examination} />;
      }}
    </Fetch>
  );
}

interface ExaminationProps {
  examination: components['schemas']['proctor.ExaminationDetails'];
}

function Examination({ examination }: ExaminationProps) {
  const { readyState, sendJsonMessage } = useProctorWebSocket({ onMessage: () => {} });
  const [microphone, setMicrophone] = useState<MediaStreamTrack>();
  const [streamSize, setStreamSize] = useState<number>(5);
  const i18n = useI18n();

  const connectMicrophone = async () => {
    const microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
    setMicrophone(microphone.getAudioTracks()[0]);
  };

  useEffect(() => {
    if (readyState == WebSocket.OPEN) {
      sendJsonMessage({
        type: 'proctor_examination',
        exam_id: examination.id,
      });
    }
  }, [examination.id, readyState, sendJsonMessage]);

  useEffect(() => {
    const onended = () => {
      setMicrophone(undefined);
    };
    if (microphone) {
      microphone.addEventListener('ended', onended);
      return () => {
        microphone.removeEventListener('ended', onended);
      };
    }
  }, [microphone]);

  return (
    <>
      <div className="navbar bg-primary" data-bs-theme="dark">
        <div className="container-fluid">
          <a className="navbar-brand">{examination.title}</a>
          <span className="border rounded bg-white px-1 me-3 ms-auto">
            <input
              className="form-range"
              type="range"
              min={1}
              max={10}
              onChange={(e) => {
                setStreamSize(e.target.valueAsNumber);
              }}
              defaultValue={streamSize}
            />
          </span>
          {!microphone && (
            <button className="btn btn-primary me-3" onClick={connectMicrophone}>
              Connect microphone
            </button>
          )}
          {microphone && <span className="badge bg-success me-3">Microphone connected</span>}
          <WebSocketState readyState={readyState} />
        </div>
      </div>
      <div className={'mt-3 container-fluid'}>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">{i18n['Home']}</Link>
            </li>
            <li className="breadcrumb-item">{i18n['Proctoring']}</li>
            <li className="breadcrumb-item active">{examination.title}</li>
          </ol>
        </nav>
        {!microphone && (
          <>
            <p>
              To begin, connect your microphone using the button in the top right. Once the microphone has been connected the candidates
              will show up and you can begin your proctoring.
            </p>
          </>
        )}
        {microphone && (
          <div className={'d-flex flex-wrap gap-3 justify-content-center'}>
            {examination.candidates.map((candidate) => {
              return (
                <div key={candidate.principal} style={{ width: `calc(${100 / streamSize}% - 1rem * ${streamSize - 1} / ${streamSize})` }}>
                  <WithClonedMicrophone key={microphone.id} microphone={microphone}>
                    {(clonedMicrophone) => (
                      <Candidate
                        key={candidate.principal}
                        candidate={candidate}
                        globalMicrophone={microphone}
                        localMicrophone={clonedMicrophone}
                      />
                    )}
                  </WithClonedMicrophone>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function WithClonedMicrophone({
  microphone,
  children,
}: {
  microphone: MediaStreamTrack;
  children: (microphone: MediaStreamTrack) => React.JSX.Element;
}) {
  const [clonedMicrophone, setClonedMicrophone] = useState<MediaStreamTrack>();
  useEffect(() => {
    if (microphone) {
      const clonedMicrophone = microphone.clone();
      setClonedMicrophone(clonedMicrophone);
      return () => {
        clonedMicrophone.stop();
      };
    }
  }, [microphone]);

  if (clonedMicrophone) return <div key={clonedMicrophone.id}>{children(clonedMicrophone)}</div>;
  else return <></>;
}

interface CandidateProps {
  candidate: components['schemas']['Candidate'];
  globalMicrophone: MediaStreamTrack;
  localMicrophone: MediaStreamTrack;
}

function Candidate({ candidate, globalMicrophone, localMicrophone }: CandidateProps) {
  const [connectionId, setConnectionId] = useState<string>();

  const onMessage = (message: InboundMessage) => {
    switch (message.type) {
      case 'connection_established':
        console.log(message);
        if (message.principal == candidate.principal) {
          setConnectionId(message.connection_id);
        }
        break;
      case 'candidate_joined':
        sendJsonMessage({
          type: 'connect_candidate',
          principal: candidate.principal,
        });
        break;
    }
  };

  const { sendJsonMessage } = useProctorWebSocket({ onMessage });

  useEffect(() => {
    sendJsonMessage({
      type: 'connect_candidate',
      principal: candidate.principal,
    });
  }, [candidate.principal, sendJsonMessage]);

  return (
    <>
      <div className={'card'}>
        <div className={'card-header'}>{candidate.principal}</div>
        <div className={'card-body'}>
          {connectionId && (
            <LiveView
              key={connectionId}
              connectionId={connectionId}
              globalMicrophone={globalMicrophone}
              localMicrophone={localMicrophone}
            />
          )}
          {!connectionId && <p>Not connected yet</p>}
        </div>
      </div>
    </>
  );
}

interface LiveViewProps {
  connectionId: string;
  globalMicrophone: MediaStreamTrack;
  localMicrophone: MediaStreamTrack;
}

function LiveView({ connectionId, globalMicrophone, localMicrophone }: LiveViewProps) {
  const { connection: getConnection } = useProctorRTC({ id: connectionId });
  const [streams, setStreams] = useState<MediaStream[]>([]);

  useEffect(() => {
    const connection = getConnection();
    if (connection) {
      const sender = connection.addTrack(globalMicrophone);
      return () => {
        if (connection.connectionState !== 'closed') {
          connection.removeTrack(sender);
        }
      };
    }
  }, [getConnection, globalMicrophone]);

  useEffect(() => {
    const connection = getConnection();
    if (connection) {
      const sender = connection.addTrack(localMicrophone);
      return () => {
        if (connection.connectionState !== 'closed') {
          connection.removeTrack(sender);
        }
      };
    }
  }, [getConnection, localMicrophone]);

  useEffect(() => {
    const connection = getConnection();
    if (connection) {
      const ontrack = (event: RTCTrackEvent) => {
        for (const stream of event.streams) {
          setStreams((existing) => {
            for (const existingStream of existing) {
              if (existingStream.id === stream.id) {
                return existing;
              }
            }
            return [...existing, stream];
          });
        }
      };
      connection.addEventListener('track', ontrack);
      return () => {
        connection.removeEventListener('track', ontrack);
      };
    }
  }, [getConnection]);

  return (
    <div className={'d-flex'}>
      {streams.map((stream) => {
        return <Video key={stream.id} stream={stream} />;
      })}
    </div>
  );
}
