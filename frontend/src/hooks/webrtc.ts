import { useEffect, useRef } from 'react';

type WebRTCOptions = RTCConfiguration & {
  sendOffer: (offer: RTCSessionDescriptionInit) => void | Promise<void>;
  sendAnswer: (answer: RTCSessionDescriptionInit) => void | Promise<void>;
  sendCandidate: (candidate: RTCIceCandidate) => void | Promise<void>;
  name?: string;
};

type WebRTCHook = {
  connection: RTCPeerConnection;
  offerReceived: (offer: RTCSessionDescriptionInit, polite: boolean) => Promise<void>;
  answerReceived: (answer: RTCSessionDescriptionInit) => Promise<void>;
  candidateReceived: (candidate: RTCIceCandidate) => Promise<void>;
};

export function useWebRTC(options: WebRTCOptions): WebRTCHook {
  // used for the "Perfect negotiation" pattern (https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation)
  const makingOffer = useRef(false);

  const connectionRef = useRef<RTCPeerConnection>(null);
  if (connectionRef.current === null) {
    connectionRef.current = new RTCPeerConnection(options);
  }

  const offerReceived = async (offer: RTCSessionDescriptionInit, polite: boolean) => {
    const connection = connectionRef.current!;
    if (!polite && (makingOffer.current || connection.signalingState !== 'stable')) {
      return;
    }
    await connection.setRemoteDescription(offer);
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    await options.sendAnswer(answer);
  };

  const answerReceived = async (answer: RTCSessionDescriptionInit) => {
    const connection = connectionRef.current!;
    await connection.setRemoteDescription(answer);
  };

  const candidateReceived = async (candidate: RTCIceCandidate) => {
    const connection = connectionRef.current!;
    if (connection.remoteDescription) {
      await connection.addIceCandidate(candidate);
    }
  };

  useEffect(() => {
    const connection = connectionRef.current!;

    const onnegotiationneeded = async () => {
      try {
        console.log('onnegotiationneeded', connection.getSenders());
        makingOffer.current = true;
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        await options.sendOffer(offer);
      } finally {
        makingOffer.current = false;
      }
    };

    const onicecandidate = async (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        await options.sendCandidate(event.candidate);
      }
    };

    connection.addEventListener('negotiationneeded', onnegotiationneeded);
    connection.addEventListener('icecandidate', onicecandidate);
    return () => {
      connection.removeEventListener('negotiationneeded', onnegotiationneeded);
      connection.removeEventListener('icecandidate', onicecandidate);
    };
  }, []);

  return {
    connection: connectionRef.current,
    offerReceived,
    answerReceived,
    candidateReceived,
  };
}
