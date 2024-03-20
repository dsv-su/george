import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import useCandidateWebSocket, { InboundMessage } from '../hooks/useCandidateWebSocket.ts';
import useCandidateRTC from '../hooks/useCandidateRTC.ts';

const MAX_CONNECTIONS = 3;

const Exam = () => {
  const [userMedia, setUserMedia] = useState<MediaStream>();
  const [displayMedia, setDisplayMedia] = useState<MediaStream>();

  const userVideo = useRef<HTMLVideoElement>(null);
  const displayVideo = useRef<HTMLVideoElement>(null);

  const [connections, setConnections] = useState<string[]>([]);

  const { examId } = useParams();

  const [hasJoined, setHasJoined] = useState(false);

  async function onMessage(message: InboundMessage) {
    console.log(message);
    switch (message.type) {
      case 'connection_request':
        setConnections((existing) => [message.connection_id, ...existing].slice(0, MAX_CONNECTIONS));
        break;
    }
  }

  const { sendJsonMessage } = useCandidateWebSocket({ onMessage });

  async function captureCamera() {
    const userMedia = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    setUserMedia(userMedia);
  }

  async function captureScreen() {
    const displayMedia = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
    setDisplayMedia(displayMedia);
  }

  useEffect(() => {
    if (userMedia !== undefined && userVideo.current !== null) {
      userVideo.current.srcObject = userMedia;
    }
    if (displayMedia !== undefined && displayVideo.current !== null) {
      displayVideo.current.srcObject = displayMedia;
    }
  }, [userMedia, displayMedia]);

  const join = async () => {
    sendJsonMessage({ type: 'candidate_joined', exam_id: examId! });
    setHasJoined(true);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <h1>[Exam title]</h1>
          <p>
            To start taking the exam you first have to share your camera and screen. Follow the instructions below, and once connected, wait
            for the proctor to give you further instructions via chat or audio.
          </p>
          <ol>
            <li>
              Share your camera and microphone by clicking the button below. You will be asked to give permission to use your camera and
              microphone.
              <button onClick={captureCamera}>Share camera and microphone</button>
            </li>
            <li aria-disabled={userMedia === undefined}>
              Share your screen by clicking the button below. You will be asked to give permission to share your screen.
              <button onClick={captureScreen} disabled={userMedia === undefined}>
                Share screen
              </button>
            </li>
            <li aria-disabled={displayMedia === undefined}>
              Click the button below to join the exam.
              <button onClick={join} disabled={displayMedia === undefined}>
                Join exam
              </button>
            </li>
          </ol>

          {hasJoined && (
            <>
              {connections.length === 0 && (
                <div className="alert alert-info">You have successfully joined the exam. Waiting for the proctor to let you in.</div>
              )}
              {connections.length > 0 && (
                <>
                  <div className="alert alert-success">You have successfully joined the exam.</div>
                </>
              )}
            </>
          )}
        </div>
        <div className="col">
          <h5>Camera preview</h5>
          <video ref={userVideo} autoPlay={true} style={{ maxWidth: '100%' }}></video>
          <h5>Screen preview</h5>
          <video ref={displayVideo} autoPlay={true} style={{ maxWidth: '100%' }}></video>
          {userMedia &&
            displayMedia &&
            connections.map((id) => <Stream key={id} streamId={id} userMedia={userMedia} displayMedia={displayMedia} />)}
        </div>
      </div>
    </div>
  );
};

function Stream({ streamId, userMedia, displayMedia }: { streamId: string; userMedia: MediaStream; displayMedia: MediaStream }) {
  const { connection } = useCandidateRTC({ id: streamId });

  useEffect(() => {
    for (const track of userMedia.getTracks()) {
      console.log('adding track');
      connection().addTrack(track, userMedia);
    }
    for (const track of displayMedia.getTracks()) {
      connection().addTrack(track, displayMedia);
    }
  }, [connection, userMedia, displayMedia]);

  return <>{streamId}</>;
}

export default Exam;
