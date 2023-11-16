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
};
export type CameraStreamOffer = {
  type: 'camera_stream_offer';
  id: string;
  offer: RTCSessionDescriptionInit;
};
export type ScreenStreamOffer = {
  type: 'screen_stream_offer';
  id: string;
  stream_id: string;
  offer: RTCSessionDescriptionInit;
};
export type CandidateJoinedOutbound = {
  type: 'candidate_joined';
  exam_id: string;
};
export type CameraStreamAnswer = {
  type: 'camera_stream_answer';
  principal: Principal;
  answer: RTCSessionDescriptionInit;
};
export type IceCandidate = {
  type: 'ice_candidate';
  id: string;
  candidate: RTCIceCandidateInit;
};
export type ProctorIceCandidate = {
  type: 'proctor_ice_candidate';
  principal: Principal;
  candidate: RTCIceCandidateInit;
};
export type OutboundMessage =
  | ProctorExamination
  | ConnectCandidate
  | CameraStreamOffer
  | ScreenStreamOffer
  | CandidateJoinedOutbound
  | CameraStreamAnswer
  | IceCandidate
  | ProctorIceCandidate;

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
};
export type IncomingCameraStreamOffer = {
  type: 'camera_stream_offer';
  principal: Principal;
  offer: RTCSessionDescriptionInit;
};
export type IncomingScreenStreamOffer = {
  type: 'screen_stream_offer';
  principal: Principal;
  stream_id: string;
  offer: RTCSessionDescriptionInit;
};
export type IncomingCameraStreamAnswer = {
  type: 'camera_stream_answer';
  id: string;
  answer: RTCSessionDescriptionInit;
};
export type IncomingIceCandidate = {
  type: 'ice_candidate';
  principal: Principal;
  candidate: RTCIceCandidateInit;
};
export type IncomingProctoreIceCandidate = {
  type: 'proctor_ice_candidate';
  id: string;
  candidate: RTCIceCandidateInit;
};
export type IncomingMessage =
  | CandidateJoined
  | ExamInfo
  | ExamCandidate
  | ConnectionRequest
  | IncomingCameraStreamOffer
  | IncomingScreenStreamOffer
  | IncomingCameraStreamAnswer
  | IncomingIceCandidate
  | IncomingProctoreIceCandidate;

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
