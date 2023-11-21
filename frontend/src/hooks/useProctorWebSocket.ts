import useWebSocket, { Options } from 'react-use-websocket';
import { useCallback } from 'react';
import { RTCMessage } from './rtcmessage.ts';

export type Principal = UsernameAtRealm;
type UsernameAtRealm = string;

export type ExamInfo = {
  type: 'exam_info';
  title: string;
};
export type ExamCandidate = {
  type: 'candidate';
  principal_name: Principal;
};
export type CandidateJoined = {
  type: 'candidate_joined';
  principal: Principal;
};
export type ConnectionEstablished = {
  type: 'connection_established';
  principal: Principal;
  connection_id: string;
};
export type InboundMessage = RTCMessage | ExamInfo | ExamCandidate | CandidateJoined | ConnectionEstablished;

export type ProctorExamination = {
  type: 'proctor_examination';
  exam_id: string;
};
export type ConnectCandidate = {
  type: 'connect_candidate';
  principal: Principal;
};
export type OutboundMessage = RTCMessage | ProctorExamination | ConnectCandidate;

export default function useProctorWebSocket({ onMessage }: { onMessage: (message: InboundMessage) => void }) {
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

  const path = 'ws/proctor';
  let ws = useWebSocket(`${origin}${import.meta.env.BASE_URL}${path}`, opts);

  const sendMessage = useCallback(
    (outboundMessage: OutboundMessage) => {
      ws.sendJsonMessage(outboundMessage);
    },
    [ws.sendJsonMessage],
  );

  return { readyState: ws.readyState, sendJsonMessage: sendMessage };
}
