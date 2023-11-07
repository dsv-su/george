import { useParams } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useEffect } from 'react';

const Proctor = () => {
  const { examId } = useParams();
  const origin = window.location.origin.replace('http', 'ws');
  const { readyState, sendJsonMessage } = useWebSocket(`${origin}/ws/proctor`, {
    onReconnectStop: (_) => false,
    shouldReconnect: (_) => true,
  });

  useEffect(() => {
    if (readyState == ReadyState.OPEN) {
      sendJsonMessage({
        type: 'proctor',
        'exam-id': examId,
      });
    }
  }, [readyState, sendJsonMessage]);

  return (
    <>
      {examId}
      <br />
      {readyState}
    </>
  );
};

export default Proctor;
