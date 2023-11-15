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
  // ICE candidates are potentially generated and sent before the remote description is set,
  // so we store them in a queue until the remote description is set
  const pendingCandidates = useRef<RTCIceCandidate[]>([]);
  // used for the "Perfect negotiation" pattern (https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation)
  const makingOffer = useRef(false);

  const connectionRef = useRef<RTCPeerConnection>(null);
  if (connectionRef.current === null) {
    console.log(options.name, 'creating RTCPeerConnection');
    connectionRef.current = new RTCPeerConnection(options);
  }

  const setRemoteDescription = async (connection: RTCPeerConnection, offer: RTCSessionDescriptionInit) => {
    await connection.setRemoteDescription(offer);
    pendingCandidates.current.forEach((candidate) => connection.addIceCandidate(candidate));
    pendingCandidates.current = [];
  };

  const offerReceived = async (offer: RTCSessionDescriptionInit, polite: boolean) => {
    const connection = connectionRef.current!;
    if (!polite && (makingOffer.current || connection.signalingState !== 'stable')) {
      return;
    }
    await setRemoteDescription(connection, offer);
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    await options.sendAnswer(answer);
  };

  const answerReceived = async (answer: RTCSessionDescriptionInit) => {
    const connection = connectionRef.current!;
    await setRemoteDescription(connection, answer);
  };

  const candidateReceived = async (candidate: RTCIceCandidate) => {
    const connection = connectionRef.current!;
    if (connection.remoteDescription) {
      await connection.addIceCandidate(candidate);
    } else {
      pendingCandidates.current.push(candidate);
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
