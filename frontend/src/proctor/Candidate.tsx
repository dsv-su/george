import { useEffect, useRef } from 'react';
import { IncomingMessage, useProctorWebsocket } from '../hooks/websockets.ts';

type CandidateProps = {
  candidate: string;
  signalling: Signalling;
};

type Signalling = {
  onOfferReceived: (callback: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>) => void;
};

const Candidate = (props: CandidateProps) => {
  const video1 = useRef<HTMLVideoElement>(null);
  const video2 = useRef<HTMLVideoElement>(null);
  const { sendJsonMessage } = useProctorWebsocket({
    onMessage,
  });
  const peerConnection = useRef<RTCPeerConnection>();

  const getConnection: () => RTCPeerConnection = () => {
    if (peerConnection.current !== undefined) {
      return peerConnection.current;
    }
    const conn = new RTCPeerConnection();
    peerConnection.current = conn;
    return conn;
  };

  async function onMessage(message: IncomingMessage) {
    switch (message.type) {
      case 'candidate_joined':
        if (message.principal == props.candidate) {
          const offer = await getConnection().createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await getConnection().setLocalDescription(offer);
          sendJsonMessage({
            type: 'connect_candidate',
            principal: message.principal,
            offer: offer,
          });
        }
        break;
      case 'connection_request_response':
        if (message.principal == props.candidate) {
          await getConnection().setRemoteDescription(message.answer);
        }
    }
  }

  useEffect(() => {
    const connection = getConnection();
    props.signalling.onOfferReceived(async (offer) => {
      await connection.setRemoteDescription(offer);
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      return answer;
    });
    connection.addEventListener('connectionstatechange', (event) => {
      console.log('connectionstatechange', event);
    });
    connection.addEventListener('datachannel', (event) => {
      console.log('datachannel', event);
    });
    connection.addEventListener('icecandidate', (event) => {
      console.log('icecandidate', event);
    });
    connection.addEventListener('icecandidateerror', (event) => {
      console.log('icecandidateerror', event);
    });
    connection.addEventListener('iceconnectionstatechange', (event) => {
      console.log('iceconnectionstatechange', event);
    });
    connection.addEventListener('icegatheringstatechange', (event) => {
      console.log('icegatheringstatechange', event);
    });
    connection.addEventListener('negotiationneeded', (event) => {
      console.log('negotationneeded', event);
    });
    connection.addEventListener('signalingstatechange', (event) => {
      console.log('signalingstatechange', event);
      let connection = event.target as RTCPeerConnection;
      let signalingState = connection.signalingState;
      console.log(signalingState);
      let receivers = connection.getReceivers();
      console.log(receivers);
      console.log(connection.connectionState);
      console.log(connection.currentRemoteDescription);
      console.log(connection.currentLocalDescription);
    });
    connection.addEventListener('track', (event) => {
      console.log('track', event);
    });
    // TODO remove listeners on cleanup or they're doubled up
  }, []);

  return (
    <h1>
      {props.candidate}
      <video ref={video1} autoPlay={true} style={{ maxWidth: '1600px' }}></video>
      <video ref={video2} autoPlay={true} style={{ maxWidth: '1600px' }}></video>
    </h1>
  );
};

export default Candidate;
export type { Signalling };
