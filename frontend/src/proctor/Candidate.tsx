import { useEffect, useState } from 'react';
import Video from '../Video.tsx';
import useProctorRTC from '../hooks/useProctorRTC.ts';
import useProctorWebSocket, { InboundMessage } from '../hooks/useProctorWebSocket.ts';

type CandidateProps = {
  candidate: string;
  streamSize: number;
  microphone: MediaStreamTrack;
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

  useEffect(() => {
    sendJsonMessage({
      type: 'connect_candidate',
      principal: props.candidate,
    });
  }, [props.candidate, sendJsonMessage]);

  return (
    <div className="candidate">
      <h1>{props.candidate}</h1>
      {!connectionId && <p>Not connected yet</p>}
      <div className="media">
        {connectionId && <LiveView key={connectionId} id={connectionId} size={props.streamSize} microphone={props.microphone} />}
      </div>
    </div>
  );
};

function LiveView({ id, size }: { id: string; size: number; microphone: MediaStreamTrack }) {
  const { connection } = useProctorRTC({ id });
  const [streams, setStreams] = useState<MediaStream[]>([]);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');

  useEffect(() => {
    const onconnectionstatechange = () => {
      setConnectionState(connection().connectionState);
    };
    connection().addEventListener('connectionstatechange', onconnectionstatechange);
    return () => {
      connection().removeEventListener('connectionstatechange', onconnectionstatechange);
    };
  }, [connection, connectionState]);

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
      <RTCConnectionState connectionState={connectionState} />
      {streams.map((stream) => {
        return <Video key={stream.id} stream={stream} size={size} />;
      })}
    </div>
  );
}

function RTCConnectionState({ connectionState }: { connectionState: RTCPeerConnectionState }) {
  return <div>{connectionState}</div>;
}

export default Candidate;
