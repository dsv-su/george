import { useParams } from 'react-router-dom';
import { ReadyState } from 'react-use-websocket';
import { useEffect, useState } from 'react';
import Candidate from './proctor/Candidate';
import { IncomingMessage, useProctorWebsocket } from './hooks/websockets.ts';

type ExaminationInfo = string;
type Candidate = string;

const Proctor = () => {
  const { examId } = useParams();
  const { readyState, sendJsonMessage } = useProctorWebsocket({
    onMessage: (message) => {
      onMessage(message);
    },
  });
  const [examInfo, setExamInfo] = useState<ExaminationInfo>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const onMessage = (message: IncomingMessage) => {
    try {
      console.log(message);
      switch (message.type) {
        case 'exam_info':
          setExamInfo(message.title);
          break;
        case 'candidate':
          setCandidates((existing) => [...new Set([...existing, message.principal_name])]);
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
        exam_id: examId!,
      });
    }
  }, [readyState, sendJsonMessage]);

  return (
    <>
      {examId} ({examInfo})
      <br />
      {readyState}
      {candidates.map((candidate) => (
        <Candidate key={candidate} candidate={candidate} />
      ))}
    </>
  );
};

export default Proctor;
