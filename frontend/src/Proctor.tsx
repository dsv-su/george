import { useParams } from 'react-router-dom';
import { ReadyState } from 'react-use-websocket';
import { useEffect, useRef, useState } from 'react';
import Candidate, { Signalling } from './proctor/Candidate';
import { useProctorWebsocket } from './hooks/websockets.ts';

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
  private awaitingOffers: Record<Principal, { offer: RTCSessionDescriptionInit; resolve: (offer: RTCSessionDescriptionInit) => void }> = {};

  public registerCallback(principal: Principal, callback: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>) {
    this.offerCallbacks[principal] = callback;
    const awaitingOffer = this.awaitingOffers[principal];
    if (awaitingOffer !== undefined) {
      delete this.awaitingOffers[principal];
      callback(awaitingOffer.offer).then((answer) => awaitingOffer.resolve(answer));
    }
  }

  public async handleOffer(principal: Principal, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (this.offerCallbacks[principal] === undefined) {
      return new Promise((resolve) => {
        this.awaitingOffers[principal] = { offer, resolve };
      });
    }
    return await this.offerCallbacks[principal](offer);
  }
}

const Proctor = () => {
  const { examId } = useParams();
  const { readyState, sendJsonMessage } = useProctorWebsocket({
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
          const answer = signallingServer.current.handleOffer(message.principal_name, message.offer);
          answer.then((answer) => {
            console.log('answer to candidate offer', answer);
          });
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
