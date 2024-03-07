import React, { useCallback, useEffect, useRef, useState } from 'react';
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
        {connectionId && (
          <WithLocalMicrophone microphone={props.microphone}>
            {(localMicrophone) => (
              <LiveView
                id={connectionId}
                size={props.streamSize}
                localMicrophoneTrack={localMicrophone}
                globalMicrophoneTrack={props.microphone}
              />
            )}
          </WithLocalMicrophone>
        )}
      </div>
    </div>
  );
};

function WithLocalMicrophone({
  microphone,
  children,
}: {
  microphone: MediaStreamTrack;
  children: (microphone: MediaStreamTrack) => React.JSX.Element;
}) {
  const [localMicrophone, setLocalMicrophone] = useState<MediaStreamTrack>();
  useEffect(() => {
    if (localMicrophone) {
      localMicrophone.stop();
    }
    setLocalMicrophone(microphone.clone());
  }, [microphone]);

  if (localMicrophone) return children(localMicrophone!);
  else return 'Connecting microphone ...';
}

type LiveViewProps = {
  id: string;
  size: number;
  localMicrophoneTrack: MediaStreamTrack;
  globalMicrophoneTrack: MediaStreamTrack;
};
function LiveView({ id, size, localMicrophoneTrack, globalMicrophoneTrack }: LiveViewProps) {
  const { connection } = useProctorRTC({ id });
  const [streams, setStreams] = useState<MediaStream[]>([]);
  useMicrophone(connection, globalMicrophoneTrack);
  const localMicrophone = useMicrophone(connection, localMicrophoneTrack);
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
      <div>
        Local microphone: {localMicrophone.muted && 'muted'}
        <button onClick={localMicrophone.muted ? localMicrophone.unmute : localMicrophone.mute}>Toggle mute</button>
      </div>
      {streams.map((stream) => {
        return <Video key={stream.id} stream={stream} size={size} />;
      })}
    </div>
  );
}

function useMicrophone(connection: () => RTCPeerConnection, microphone: MediaStreamTrack) {
  const senderRef = useRef<RTCRtpSender>();
  const connectionRef = useRef(connection);
  const [muted, setMuted] = useState<boolean>(!microphone.enabled);

  useEffect(() => {
    if (senderRef.current && connectionRef.current === connection) {
      void senderRef.current.replaceTrack(microphone);
    } else {
      senderRef.current = connection().addTrack(microphone);
    }
  }, [connection, microphone]);

  const mute = useCallback(() => {
    microphone.enabled = false;
    setMuted(true);
  }, [microphone, setMuted]);

  const unmute = useCallback(() => {
    microphone.enabled = true;
    setMuted(false);
  }, [microphone, setMuted]);

  return { muted, mute, unmute };
}

function RTCConnectionState({ connectionState }: { connectionState: RTCPeerConnectionState }) {
  return <div>{connectionState}</div>;
}

export default Candidate;
