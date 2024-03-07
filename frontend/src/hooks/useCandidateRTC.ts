import { useWebRTC } from './webrtc.ts';
import useCandidateWebSocket, { InboundMessage } from './useCandidateWebSocket.ts';

export default function useCandidateRTC({ id }: { id: string }) {
  const onMessage = (message: InboundMessage) => {
    switch (message.type) {
      case 'rtc_offer':
        if (message.id === id) {
          void rtc.offerReceived(message.offer, true);
        }
        break;
      case 'rtc_answer':
        if (message.id === id) {
          void rtc.answerReceived(message.answer);
        }
        break;
      case 'rtc_ice_candidate':
        if (message.id === id) {
          void rtc.candidateReceived(new RTCIceCandidate(message.candidate));
        }
        break;
    }
  };

  const { sendJsonMessage } = useCandidateWebSocket({ onMessage });

  const rtc = useWebRTC({
    sendAnswer(answer: RTCSessionDescriptionInit): void | Promise<void> {
      sendJsonMessage({
        type: 'rtc_answer',
        id: id,
        answer: answer,
      });
    },
    sendCandidate(candidate: RTCIceCandidateInit): void | Promise<void> {
      sendJsonMessage({
        type: 'rtc_ice_candidate',
        id: id,
        candidate: candidate,
      });
    },
    sendOffer(offer: RTCSessionDescriptionInit): void | Promise<void> {
      sendJsonMessage({
        type: 'rtc_offer',
        id: id,
        offer: offer,
      });
    },
  });

  return { connection: rtc.connection };
}
