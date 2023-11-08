import { useParams } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useEffect, useState } from 'react';

type Message =
  | {
      type: 'exam_info';
      title: string;
    }
  | {
      type: 'candidate';
      principal_name: string;
    };

type ExaminationInfo = string;
type Candidate = string;

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

  return (
    <>
      {examId} ({examInfo})
      <br />
      {readyState}
      <ul>
        {candidates.map((candidate) => (
          <li key={candidate}>{candidate}</li>
        ))}
      </ul>
    </>
  );
};

export default Proctor;
