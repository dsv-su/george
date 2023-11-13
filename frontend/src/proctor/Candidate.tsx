import { useEffect, useRef } from 'react';

type CandidateProps = {
  candidate: string;
  signalling: Signalling;
};

type Signalling = {
  onOfferReceived: (callback: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>) => void;
};

const Candidate = (props: CandidateProps) => {
  const peerConnection = useRef<RTCPeerConnection>();

  const getConnection: () => RTCPeerConnection = () => {
    if (peerConnection.current !== undefined) {
      return peerConnection.current;
    }
    const conn = new RTCPeerConnection();
    peerConnection.current = conn;
    return conn;
  };

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
    });
    connection.addEventListener('track', (event) => {
      console.log('track', event);
    });
  }, []);

  return <h1>{props.candidate}</h1>;
};

export default Candidate;
export type { Signalling };
