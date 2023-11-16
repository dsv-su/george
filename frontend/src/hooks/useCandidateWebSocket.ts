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
        let message = JSON.parse(event.data) as InboundMessage;
        onMessage(message);
      } catch (e) {
        console.log('Invalid message', event.data, e);
      }
    },
    onReconnectStop: (_) => false,
    shouldReconnect: (_) => true,
  };

  let ws = useWebSocket(`${origin}/ws/candidate`, opts);

  const sendMessage = useCallback(
    (outboundMessage: OutboundMessage) => {
      ws.sendJsonMessage(outboundMessage);
    },
    [ws.sendJsonMessage],
  );

  return { readyState: ws.readyState, sendJsonMessage: sendMessage };
}
