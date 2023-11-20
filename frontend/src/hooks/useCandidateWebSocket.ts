import useWebSocket, { Options } from 'react-use-websocket';
import { useCallback } from 'react';
import { RTCMessage } from './rtcmessage.ts';

type ConnectionRequest = {
  type: 'connection_request';
  connection_id: string;
};
export type InboundMessage = RTCMessage | ConnectionRequest;

type Joined = {
  type: 'candidate_joined';
  exam_id: string;
};
export type OutboundMessage = RTCMessage | Joined;

export default function useCandidateWebSocket({ onMessage }: { onMessage: (message: InboundMessage) => void }) {
  const origin = window.location.origin.replace('http', 'ws');

  const opts: Options = {
    share: true,
    onMessage: (event) => {
      try {
        const message = JSON.parse(event.data) as InboundMessage;
        onMessage(message);
      } catch (e) {
        console.log('Invalid message', event.data, e);
      }
    },
    onReconnectStop: () => false,
    shouldReconnect: () => true,
  };

  const path = 'ws/candidate';
  const { readyState, sendJsonMessage } = useWebSocket(`${origin}${import.meta.env.BASE_URL}${path}`, opts);

  const sendMessage = useCallback(
    (outboundMessage: OutboundMessage) => {
      sendJsonMessage(outboundMessage);
    },
    [sendJsonMessage],
  );

  return { readyState: readyState, sendJsonMessage: sendMessage };
}
