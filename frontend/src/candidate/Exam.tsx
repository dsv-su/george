import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IncomingMessage, useProctorWebsocket } from '../hooks/websockets.ts';

type PeerConnections = {
  camera?: RTCPeerConnection;
  screens: Record<string, RTCPeerConnection>;
};

const Exam = () => {
  const [userMedia, setUserMedia] = useState<MediaStream>();
  const [displayMedia, setDisplayMedia] = useState<MediaStream>();

  const userVideo = useRef<HTMLVideoElement>(null);
  const displayVideo = useRef<HTMLVideoElement>(null);

  const connections = useRef<Record<string, PeerConnections>>({});

  const { examId } = useParams();

  async function onMessage(message: IncomingMessage) {
    console.log(message);
    switch (message.type) {
      case 'connection_request':
        connections.current[message.id] = { camera: undefined, screens: {} };
        const conn = new RTCPeerConnection();
        conn.onicecandidate = (event) => {
          if (event.candidate !== null) {
            sendJsonMessage({
              type: 'ice_candidate',
              id: message.id,
              candidate: event.candidate.toJSON(),
            });
          }
        };
        userMedia?.getTracks().forEach((track) => {
          console.log('adding track', track);
          conn.addTrack(track, userMedia);
        });
        const offer = await conn.createOffer({
          offerToReceiveAudio: true,
        });
        await conn.setLocalDescription(offer);
        connections.current[message.id].camera = conn;
        sendJsonMessage({
          type: 'camera_stream_offer',
          id: message.id,
          offer: offer,
        });

        for (const sharedStream of [displayMedia!]) {
          const share = new RTCPeerConnection();
          sharedStream.getTracks().forEach((track) => share.addTrack(track, sharedStream));
          const shareOffer = await share.createOffer();
          await share.setLocalDescription(shareOffer);
          sendJsonMessage({
            type: 'screen_stream_offer',
            id: message.id,
            stream_id: sharedStream.id,
            offer: shareOffer,
          });
          connections.current[message.id].screens[sharedStream.id] = share;
        }
        // TODO listeners to stream/track/connection
        // TODO ICE candidates
        break;
      case 'camera_stream_answer':
        const connection = connections.current[message.id].camera;
        if (connection !== undefined) {
          await connection.setRemoteDescription(message.answer);
        }
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
    sendJsonMessage({ type: 'candidate_joined', exam_id: examId! });
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
