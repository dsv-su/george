import { useEffect, useState } from 'react';
import { IncomingMessage, useProctorWebsocket } from '../hooks/websockets.ts';
import Video from '../Video.tsx';
import { useWebRTC } from '../hooks/webrtc.ts';

type CandidateProps = {
  candidate: string;
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
    sendOffer(_: RTCSessionDescriptionInit): void | Promise<void> {
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
          await rtc.offerReceived(message.offer, true);
        }
        break;
      case 'ice_candidate':
        if (message.principal == props.candidate) {
          await rtc.candidateReceived(new RTCIceCandidate(message.candidate));
        }
        break;
    }
  }

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
