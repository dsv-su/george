import { useRef, useState } from 'react';
import { IncomingMessage, useProctorWebsocket } from '../hooks/websockets.ts';
import Video from '../Video.tsx';

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
  const connections = useRef<PeerConnections>({ camera: new RTCPeerConnection(), screens: [] });
  const [streams, setStreams] = useState<MediaStream[]>([]);

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
          const conn = connections.current.camera;
          conn.onconnectionstatechange = (event) => {
            console.log('connectionstatechange', conn.connectionState);
          };
          await conn.setRemoteDescription(message.offer);
          conn.addTransceiver('video', { direction: 'recvonly' });
          conn.addTransceiver('audio', { direction: 'recvonly' });
          const answer = await conn.createAnswer();
          await conn.setLocalDescription(answer);
          sendJsonMessage({
            type: 'camera_stream_answer',
            principal: message.principal,
            answer: answer,
          });
          //connections.current.camera = conn;
          conn.ontrack = (ev) => {
            // there will only ever be one stream
            console.log('ontrack', ev);
            //setStreams((existing) => [...existing, streams[0]]);
          };
        }
        break;
      case 'ice_candidate':
        if (message.principal == props.candidate) {
          await connections.current.camera?.addIceCandidate(message.candidate);
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
