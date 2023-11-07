import { useEffect, useRef, useState } from 'react';

type SignallingServer = {
  sendOffer: (sessionDescription: RTCSessionDescription) => Promise<void>;
  sendCandidate: (candidate: RTCIceCandidate) => Promise<void>;
  onOfferReceived: (presentOffer: (sdp: RTCSessionDescriptionInit, polite: boolean) => Promise<void>) => void;
  onCandidateReceived: (candidateReceived: (candidate: RTCIceCandidate) => Promise<void>) => void;
};

export function useWebRTC({ rtcConfiguration, signalling }: { rtcConfiguration?: RTCConfiguration; signalling: SignallingServer }) {
  const connectionRef = useRef<RTCPeerConnection>();
  const [tracks, setTracks] = useState<MediaStreamTrack[]>([]);

  const offerReceived = async (sdp: RTCSessionDescriptionInit, polite: boolean) => {
    if (!polite) return;

    await connectionRef.current?.setRemoteDescription(sdp);
  };

  const candidateReceived = async (candidate: RTCIceCandidate) => {
    connectionRef.current?.addIceCandidate(candidate);
  };

  useEffect(() => {
    const connection = new RTCPeerConnection(rtcConfiguration);
    connectionRef.current = connection;

    async function start() {
      await connection.setLocalDescription();
      await signalling.sendOffer(connection.localDescription!);
    }

    function cleanUp() {
      connection.close();
    }

    connection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        void signalling.sendCandidate(event.candidate);
      }
    });

    connection.addEventListener('track', (event) => {
      setTracks((tracks) => [...tracks, event.track]);
    });

    signalling.onOfferReceived(offerReceived);
    signalling.onCandidateReceived(candidateReceived);

    void start();

    return () => cleanUp();
  }, []);

  return {
    tracks,
  };
}
