export type RTCOffer = {
  type: 'rtc_offer';
  id: string;
  offer: RTCSessionDescriptionInit;
};
export type RTCAnswer = {
  type: 'rtc_answer';
  id: string;
  answer: RTCSessionDescriptionInit;
};
export type RTCIceCandidate = {
  type: 'rtc_ice_candidate';
  id: string;
  candidate: RTCIceCandidateInit;
};
export type RTCMessage = RTCOffer | RTCAnswer | RTCIceCandidate;
