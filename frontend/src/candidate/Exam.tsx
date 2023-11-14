import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IncomingMessage, useProctorWebsocket } from '../hooks/websockets.ts';

const Exam = () => {
  const [userMedia, setUserMedia] = useState<MediaStream>();
  const [displayMedia, setDisplayMedia] = useState<MediaStream>();

  const userVideo = useRef<HTMLVideoElement>(null);
  const displayVideo = useRef<HTMLVideoElement>(null);

  const connection = useRef<Record<string, RTCPeerConnection>>({});

  const { examId } = useParams();

  async function onMessage(message: IncomingMessage) {
    console.log(message);
    switch (message.type) {
      case 'connection_request':
        const conn = new RTCPeerConnection();
        console.log(userMedia?.getTracks());
        userMedia?.getTracks().forEach((track) => conn.addTrack(track, userMedia));
        displayMedia?.getTracks().forEach((track) => conn.addTrack(track, displayMedia));
        await conn.setRemoteDescription(message.offer);
        let answer = await conn.createAnswer();
        await conn.setLocalDescription(answer);
        connection.current[message.id] = conn;
        sendJsonMessage({
          type: 'connection_request_response',
          id: message.id,
          answer: answer,
        });
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
