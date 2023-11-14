import { useEffect, useRef, useState } from 'react';
import { IncomingMessage, useProctorWebsocket } from '../hooks/websockets.ts';
import Video from '../Video.tsx';

type CandidateProps = {
  candidate: string;
  signalling: Signalling;
};

type Signalling = {
  onOfferReceived: (callback: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>) => void;
};

const Candidate = (props: CandidateProps) => {
  const { sendJsonMessage } = useProctorWebsocket({
    onMessage,
  });
  const peerConnection = useRef<RTCPeerConnection>();
  const [streams, setStreams] = useState<MediaStream[]>([]);

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
      console.log('connectionstatechange', connection.connectionState);
    });
    connection.addEventListener('datachannel', (event) => {
      console.log('datachannel', event);
    });
    connection.addEventListener('icecandidate', (event) => {
      console.log('icecandidate', event, event.candidate);
    });
    connection.addEventListener('icecandidateerror', (event) => {
      console.log('icecandidateerror', event);
    });
    connection.addEventListener('iceconnectionstatechange', (event) => {
      console.log('iceconnectionstatechange', connection.iceConnectionState);
    });
    connection.addEventListener('icegatheringstatechange', (event) => {
      console.log('icegatheringstatechange', connection.iceGatheringState);
    });
    connection.addEventListener('negotiationneeded', (event) => {
      console.log('negotationneeded', event);
    });
    connection.addEventListener('signalingstatechange', (event) => {
      console.log('signalingstatechange', connection.signalingState);
    });
    let onTrack = (event: RTCTrackEvent) => {
      for (const eventStream of event.streams) {
        setStreams((existing) => {
          for (const stream of existing) {
            if (stream.id === eventStream.id) {
              return existing;
            }
          }
          return [...existing, eventStream];
        });
      }
      console.log('track', event);
    };
    connection.addEventListener('track', onTrack);
    // TODO remove listeners on cleanup or they're doubled up
    return () => {
      connection.removeEventListener('track', onTrack);
    };
  }, []);

  return (
    <h1>
      {props.candidate}
      {streams.map((stream) => {
        return <Video key={stream.id} stream={stream} />;
      })}
    </h1>
  );
};

export default Candidate;
export type { Signalling };
