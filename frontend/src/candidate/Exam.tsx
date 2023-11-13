import { useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { useParams } from 'react-router-dom';

const Exam = () => {
  const [userMedia, setUserMedia] = useState<MediaStream>();
  const [displayMedia, setDisplayMedia] = useState<MediaStream>();

  const userVideo = useRef<HTMLVideoElement>(null);
  const displayVideo = useRef<HTMLVideoElement>(null);

  const origin = window.location.origin.replace('http', 'ws');

  const { examId } = useParams();

  function onMessage(message: MessageEvent<any>) {
    console.log(message);
  }

  const { sendJsonMessage } = useWebSocket(`${origin}/ws/candidate`, {
    onReconnectStop: (_) => false,
    shouldReconnect: (_) => true,
    onMessage,
  });

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
    const connection = new RTCPeerConnection();
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    sendJsonMessage({ type: 'candidate_joined', exam_id: examId, offer: offer });
  };

  return (
    <>
      <button onClick={join}>Join exam</button>
      <video ref={userVideo} autoPlay={true} style={{ maxWidth: '1600px' }}></video>
      <video ref={displayVideo} autoPlay={true} style={{ maxWidth: '1600px' }}></video>
    </>
  );
};

export default Exam;
