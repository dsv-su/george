import { useEffect, useRef } from 'react';

export default function Video({ stream }: { stream: MediaStream }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video.current !== null && video.current.srcObject !== stream) {
      video.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={video} controls></video>;
}
