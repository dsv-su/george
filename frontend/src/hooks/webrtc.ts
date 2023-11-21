import { useCallback, useEffect, useRef } from 'react';

type WebRTCOptions = RTCConfiguration & {
  sendOffer: (offer: RTCSessionDescriptionInit) => void | Promise<void>;
  sendAnswer: (answer: RTCSessionDescriptionInit) => void | Promise<void>;
  sendCandidate: (candidate: RTCIceCandidateInit) => void | Promise<void>;
  name?: string;
};

type WebRTCHook = {
  connection: () => RTCPeerConnection;
  offerReceived: (offer: RTCSessionDescriptionInit, polite: boolean) => Promise<void>;
  answerReceived: (answer: RTCSessionDescriptionInit) => Promise<void>;
  candidateReceived: (candidate: RTCIceCandidateInit) => Promise<void>;
};

export function useWebRTC(options: WebRTCOptions): WebRTCHook {
  // used for the "Perfect negotiation" pattern (https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation)
  const makingOffer = useRef(false);

  const connectionRef = useRef<RTCPeerConnection | null>(null);

  const getConnection = useCallback(() => {
    return connectionRef.current!;
  }, []);

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

  const candidateReceived = async (candidate: RTCIceCandidateInit) => {
    const connection = connectionRef.current!;
    if (connection.remoteDescription) {
      await connection.addIceCandidate(candidate);
    }
  };

  useEffect(() => {
    const connection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'stun:stun3.l.google.com:19305',
        },
      ],
    });
    connectionRef.current = connection;

    const onnegotiationneeded = async () => {
      try {
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
        await options.sendCandidate(event.candidate.toJSON());
      }
    };

    connection.addEventListener('negotiationneeded', onnegotiationneeded);
    connection.addEventListener('icecandidate', onicecandidate);
    return () => {
      connection.removeEventListener('negotiationneeded', onnegotiationneeded);
      connection.removeEventListener('icecandidate', onicecandidate);
      connection.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    connection: getConnection,
    offerReceived,
    answerReceived,
    candidateReceived,
  };
}
