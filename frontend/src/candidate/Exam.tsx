import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IncomingMessage, useProctorWebsocket } from '../hooks/websockets.ts';
import { useWebRTC } from '../hooks/webrtc.ts';

const Exam = () => {
  const [userMedia, setUserMedia] = useState<MediaStream>();
  const [displayMedia, setDisplayMedia] = useState<MediaStream>();

  const userVideo = useRef<HTMLVideoElement>(null);
  const displayVideo = useRef<HTMLVideoElement>(null);

  const [connections, setConnections] = useState<string[]>([]);

  const { examId } = useParams();

  async function onMessage(message: IncomingMessage) {
    console.log(message);
    switch (message.type) {
      case 'connection_request':
        setConnections((existing) => [...existing, message.id]);
        break;
    }
  }

  const { sendJsonMessage } = useProctorWebsocket({ onMessage });

  async function captureMedia() {
    const userMedia = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    const displayMedia = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
    setUserMedia(userMedia);
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

  if (userMedia === undefined || displayMedia === undefined) {
    return (
      <>
        <button onClick={captureMedia}>Capture Media</button>
      </>
    );
  }

  const join = async () => {
    sendJsonMessage({ type: 'candidate_joined', exam_id: examId! });
  };

  return (
    <>
      <button onClick={join}>Join exam</button>
      <video ref={userVideo} autoPlay={true} style={{ maxWidth: '1600px' }}></video>
      <video ref={displayVideo} autoPlay={true} style={{ maxWidth: '1600px' }}></video>
      {connections.map((id) => (
        <Stream key={id} streamId={id} userMedia={userMedia} displayMedia={displayMedia} />
      ))}
    </>
  );
};

function Stream({ streamId, userMedia, displayMedia }: { streamId: string; userMedia: MediaStream; displayMedia: MediaStream }) {
  const onMessage = (message: IncomingMessage) => {
    switch (message.type) {
      case 'camera_stream_answer':
        void rtc.answerReceived(message.answer);
        break;
      case 'proctor_ice_candidate':
        void rtc.candidateReceived(new RTCIceCandidate(message.candidate));
        break;
    }
  };

  const { sendJsonMessage } = useProctorWebsocket({ onMessage });
  const rtc = useWebRTC({
    name: 'candidate',
    sendAnswer(_: RTCSessionDescriptionInit): void {
      console.log('unsupported answer by candidate');
    },
    sendCandidate(candidate: RTCIceCandidate): void {
      sendJsonMessage({
        type: 'ice_candidate',
        id: streamId,
        candidate: candidate.toJSON(),
      });
    },
    sendOffer(offer: RTCSessionDescriptionInit): void {
      sendJsonMessage({
        type: 'camera_stream_offer',
        id: streamId,
        offer: offer,
      });
    },
  });

  useEffect(() => {
    for (const track of userMedia.getTracks()) {
      console.log('adding track');
      rtc.connection().addTrack(track, userMedia);
    }
    for (const track of displayMedia.getTracks()) {
      rtc.connection().addTrack(track, displayMedia);
    }
  }, []);

  return <>{streamId}</>;
}

export default Exam;
