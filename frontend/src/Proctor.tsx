import { useParams } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useEffect, useState } from 'react';

type ExaminationInfo = {
  type: 'exam_info';
  title: string;
};

type Message = ExaminationInfo;

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
  const [examInfo, setExamInfo] = useState<string>();

  const onMessage = (event: MessageEvent<any>) => {
    try {
      const message: Message = JSON.parse(event.data);
      switch (message.type) {
        case 'exam_info':
          setExamInfo(message.title);
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
    </>
  );
};

export default Proctor;
