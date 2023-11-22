import { useEffect, useState } from 'react';
import Video from '../Video.tsx';
import useProctorRTC from '../hooks/useProctorRTC.ts';
import useProctorWebSocket, { InboundMessage } from '../hooks/useProctorWebSocket.ts';

type CandidateProps = {
  candidate: string;
};

const Candidate = (props: CandidateProps) => {
  const { sendJsonMessage } = useProctorWebSocket({
    onMessage,
  });

  const [connectionId, setConnectionId] = useState<string | undefined>();

  async function onMessage(message: InboundMessage) {
    switch (message.type) {
      case 'candidate_joined':
        if (message.principal == props.candidate) {
          sendJsonMessage({
            type: 'connect_candidate',
            principal: message.principal,
          });
        }
        break;
      case 'connection_established':
        if (message.principal == props.candidate) {
          setConnectionId(message.connection_id);
        }
        break;
    }
  }

  return (
    <div className="candidate">
      <h1>{props.candidate}</h1>
      <div className="media">{connectionId && <LiveView key={connectionId} id={connectionId} />}</div>
    </div>
  );
};

function LiveView({ id }: { id: string }) {
  const { connection } = useProctorRTC({ id });
  const [streams, setStreams] = useState<MediaStream[]>([]);

  useEffect(() => {
    const ontrack = (event: RTCTrackEvent) => {
      console.log('ontrack', event);
      setStreams((existing) => {
        for (const stream of existing) {
          if (stream.id === event.streams[0].id) {
            return [...existing];
          }
        }
        return [...existing, event.streams[0]];
      });
    };
    connection().addEventListener('track', ontrack);
    return () => {
      connection().removeEventListener('track', ontrack);
    };
  }, [connection]);

  return (
    <div>
      {streams.map((stream) => {
        return <Video key={stream.id} stream={stream} />;
      })}
    </div>
  );
}

export default Candidate;
