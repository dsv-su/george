import useWebSocket, { Options } from 'react-use-websocket';
import { useCallback } from 'react';

export type Principal = UsernameAtRealm;
type UsernameAtRealm = string;

export type ProctorExamination = {
  type: 'proctor_examination';
  exam_id: string;
};
export type ConnectCandidate = {
  type: 'connect_candidate';
  principal: Principal;
  offer: RTCSessionDescriptionInit;
};
export type ConnectionRequestResponse = {
  type: 'connection_request_response';
  id: string;
  answer: RTCSessionDescriptionInit;
};
export type OutboundMessage = ProctorExamination | ConnectCandidate | ConnectionRequestResponse;

export type CandidateJoined = {
  type: 'candidate_joined';
  principal: Principal;
};
export type ExamInfo = {
  type: 'exam_info';
  title: string;
};
export type ExamCandidate = {
  type: 'candidate';
  principal_name: Principal;
};
export type ConnectionRequest = {
  type: 'connection_request';
  id: string;
  offer: RTCSessionDescriptionInit;
};
export type IncomingConnectionRequestResponse = {
  type: 'connection_request_response';
  principal: Principal;
  answer: RTCSessionDescriptionInit;
};
export type IncomingMessage = CandidateJoined | ExamInfo | ExamCandidate | ConnectionRequest | IncomingConnectionRequestResponse;

export function useProctorWebsocket({ onMessage }: { onMessage: (arg0: IncomingMessage) => void }) {
  const origin = window.location.origin.replace('http', 'ws');

  const opts: Options = {
    share: true,
    onMessage: (event) => {
      try {
        let message = JSON.parse(event.data) as IncomingMessage;
        onMessage(message);
      } catch (e) {
        console.log('Invalid message', event.data, e);
      }
    },
    onReconnectStop: (_) => false,
    shouldReconnect: (_) => true,
  };

  let ws = useWebSocket(`${origin}/ws/proctor`, opts);

  const sendMessage = useCallback(
    (outboundMessage: OutboundMessage) => {
      ws.sendJsonMessage(outboundMessage);
    },
    [ws.sendJsonMessage],
  );

  return { readyState: ws.readyState, sendJsonMessage: sendMessage };
}
