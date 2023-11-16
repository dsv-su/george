import { useEffect, useState } from 'react';
import { IncomingMessage, useProctorWebsocket } from '../hooks/websockets.ts';
import Video from '../Video.tsx';
import { useWebRTC } from '../hooks/webrtc.ts';

type CandidateProps = {
  candidate: string;
  signalling: Signalling;
};

type Signalling = {
  onOfferReceived: (callback: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>) => void;
};

type PeerConnections = {
  camera: RTCPeerConnection;
  screens: RTCPeerConnection[];
};

const Candidate = (props: CandidateProps) => {
  const { sendJsonMessage } = useProctorWebsocket({
    onMessage,
  });
  const rtc = useWebRTC({
    name: props.candidate,
    sendAnswer(answer: RTCSessionDescriptionInit): void | Promise<void> {
      sendJsonMessage({
        type: 'camera_stream_answer',
        principal: props.candidate,
        answer: answer,
      });
    },
    sendCandidate(candidate: RTCIceCandidate): void | Promise<void> {
      sendJsonMessage({
        type: 'proctor_ice_candidate',
        principal: props.candidate,
        candidate: candidate.toJSON(),
      });
    },
    sendOffer(offer: RTCSessionDescriptionInit): void | Promise<void> {
      console.log('unsupported offer from proctor');
    },
  });
  const [streams, setStreams] = useState<MediaStream[]>([]);

  useEffect(() => {
    const ontrack = (event: RTCTrackEvent) => {
      console.log('ontrack', event);
      setStreams((existing) => {
        for (const stream of existing) {
          if (stream.id === event.streams[0].id) {
            return [...existing];
          }
        }
        return [...existing, event.streams[0]];
      });
    };
    rtc.connection().addEventListener('track', ontrack);
    return () => {
      rtc.connection().removeEventListener('track', ontrack);
    };
  }, []);

  async function onMessage(message: IncomingMessage) {
    switch (message.type) {
      case 'candidate_joined':
        if (message.principal == props.candidate) {
          sendJsonMessage({
            type: 'connect_candidate',
            principal: message.principal,
          });
        }
        break;
      case 'camera_stream_offer':
        if (message.principal == props.candidate) {
          const conn = rtc.connection();
          await rtc.offerReceived(message.offer, true);
          conn.onconnectionstatechange = (ev) => {
            console.log('onconnectionstatechange', conn.connectionState, conn.getSenders(), conn.getReceivers(), conn.getTransceivers());
          };
        }
        break;
      case 'ice_candidate':
        if (message.principal == props.candidate) {
          await rtc.candidateReceived(new RTCIceCandidate(message.candidate));
        }
        break;
    }
  }

  // useEffect(() => {
  //   const connection = getConnection();
  //   props.signalling.onOfferReceived(async (offer) => {
  //     await connection.setRemoteDescription(offer);
  //     const answer = await connection.createAnswer();
  //     await connection.setLocalDescription(answer);
  //     return answer;
  //   });
  //   connection.addEventListener('connectionstatechange', (event) => {
  //     console.log('connectionstatechange', connection.connectionState);
  //   });
  //   connection.addEventListener('datachannel', (event) => {
  //     console.log('datachannel', event);
  //   });
  //   connection.addEventListener('icecandidate', (event) => {
  //     console.log('icecandidate', event, event.candidate);
  //   });
  //   connection.addEventListener('icecandidateerror', (event) => {
  //     console.log('icecandidateerror', event);
  //   });
  //   connection.addEventListener('iceconnectionstatechange', (event) => {
  //     console.log('iceconnectionstatechange', connection.iceConnectionState);
  //   });
  //   connection.addEventListener('icegatheringstatechange', (event) => {
  //     console.log('icegatheringstatechange', connection.iceGatheringState);
  //   });
  //   connection.addEventListener('negotiationneeded', (event) => {
  //     console.log('negotationneeded', event);
  //   });
  //   connection.addEventListener('signalingstatechange', (event) => {
  //     console.log('signalingstatechange', connection.signalingState);
  //   });
  //   let onTrack = (event: RTCTrackEvent) => {
  //     for (const eventStream of event.streams) {
  //       setStreams((existing) => {
  //         for (const stream of existing) {
  //           if (stream.id === eventStream.id) {
  //             return existing;
  //           }
  //         }
  //         return [...existing, eventStream];
  //       });
  //     }
  //     console.log('track', event);
  //   };
  //   connection.addEventListener('track', onTrack);
  //   // TODO remove listeners on cleanup or they're doubled up
  //   return () => {
  //     connection.removeEventListener('track', onTrack);
  //   };
  // }, []);

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
