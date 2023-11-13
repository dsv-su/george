import { useParams } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useEffect, useRef, useState } from 'react';
import Candidate, { Signalling } from './proctor/Candidate';

type Message =
  | {
      type: 'exam_info';
      title: string;
    }
  | {
      type: 'candidate';
      principal_name: string;
    }
  | {
      type: 'candidate_rtc_offer';
      principal_name: string;
      offer: RTCSessionDescriptionInit;
    };

type ExaminationInfo = string;
type Candidate = string;
type Principal = string;

class SignallingServer {
  private offerCallbacks: Record<Principal, (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>> = {};
  private awaitingOffers: Record<Principal, RTCSessionDescriptionInit> = {};

  public registerCallback(principal: Principal, callback: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>) {
    this.offerCallbacks[principal] = callback;
    const awaitingOffer = this.awaitingOffers[principal];
    if (awaitingOffer !== undefined) {
      delete this.awaitingOffers[principal];
      void callback(awaitingOffer);
    }
  }

  public async handleOffer(principal: Principal, offer: RTCSessionDescriptionInit) {
    if (this.offerCallbacks[principal] === undefined) {
      this.awaitingOffers[principal] = offer;
      return;
    }
    await this.offerCallbacks[principal](offer);
  }
}

const Proctor = () => {
  const { examId } = useParams();
  const origin = window.location.origin.replace('http', 'ws');
  const { readyState, sendJsonMessage } = useWebSocket(`${origin}/ws/proctor`, {
    onReconnectStop: (_) => false,
    shouldReconnect: (_) => true,
    onMessage: (message) => {
      onMessage(message);
    },
  });
  const [examInfo, setExamInfo] = useState<ExaminationInfo>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const signallingServer = useRef(new SignallingServer());

  const onMessage = (event: MessageEvent<any>) => {
    try {
      const message: Message = JSON.parse(event.data);
      console.log(message);
      switch (message.type) {
        case 'exam_info':
          setExamInfo(message.title);
          break;
        case 'candidate':
          setCandidates((existing) => [...existing, message.principal_name]);
          break;
        case 'candidate_rtc_offer':
          void signallingServer.current.handleOffer(message.principal_name, message.offer);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (readyState == ReadyState.OPEN) {
      sendJsonMessage({
        type: 'proctor_examination',
        exam_id: examId,
      });
    }
  }, [readyState, sendJsonMessage]);

  const buildSignallingForCandidate = (candidate: Candidate): Signalling => {
    return {
      onOfferReceived: signallingServer.current.registerCallback.bind(signallingServer.current, candidate),
    };
  };

  return (
    <>
      {examId} ({examInfo})
      <br />
      {readyState}
      {candidates.map((candidate) => (
        <Candidate key={candidate} candidate={candidate} signalling={buildSignallingForCandidate(candidate)} />
      ))}
    </>
  );
};

export default Proctor;
