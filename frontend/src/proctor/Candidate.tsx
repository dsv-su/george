import { useEffect, useRef, useState } from 'react';
import Video from '../Video.tsx';
import useProctorRTC from '../hooks/useProctorRTC.ts';
import useProctorWebSocket, { InboundMessage } from '../hooks/useProctorWebSocket.ts';

type CandidateProps = {
  candidate: string;
  streamSize: number;
  microphone?: MediaStreamTrack;
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

function LiveView({ id, size, microphone }: { id: string; size: number; microphone?: MediaStreamTrack }) {
  const { connection } = useProctorRTC({ id });
  const [streams, setStreams] = useState<MediaStream[]>([]);
  const localMicrophone = useRef<RTCRtpSender>();
  const globalMicrophone = useRef<RTCRtpSender>();

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

  useEffect(() => {
    if (microphone) {
      if (localMicrophone.current) {
        debug('has microphone');
        if (localMicrophone.current.track !== microphone) {
          debug('replacing microphone');
          const oldLocal = localMicrophone.current.track;
          const oldGlobal = globalMicrophone.current?.track;
          void localMicrophone.current.replaceTrack(microphone.clone()); // todo error handling
          void globalMicrophone.current?.replaceTrack(microphone); // todo error handling
          if (oldLocal) oldLocal.stop();
          if (oldGlobal) oldGlobal.stop();
        }
      } else {
        debug('adding microphone');
        globalMicrophone.current = connection().addTrack(microphone);
        localMicrophone.current = connection().addTrack(microphone.clone());
      }
    } else {
      debug('removing microphone');
      if (localMicrophone.current) {
        connection().removeTrack(localMicrophone.current);
        localMicrophone.current = undefined;
      }
      if (globalMicrophone.current) {
        connection().removeTrack(globalMicrophone.current);
        globalMicrophone.current = undefined;
      }
    }
    return () => {
      localMicrophone.current?.track?.stop();
    };
  }, [connection, microphone]);

  return (
    <div>
      {connection()?.connectionState}
      {streams.map((stream) => {
        return <Video key={stream.id} stream={stream} size={size} />;
      })}
    </div>
  );
}

function debug(message: string) {
  console.log(message);
}

export default Candidate;
