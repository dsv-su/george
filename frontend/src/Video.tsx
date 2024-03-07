import { useEffect, useRef } from 'react';

export default function Video({ stream, size }: { stream: MediaStream; size: number }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video.current !== null && video.current.srcObject !== stream) {
      video.current.srcObject = stream;
    }
  }, [stream]);

  const width = (1024 * size) / 100;

  return <video ref={video} controls autoPlay style={{ width: width + 'px' }}></video>;
}
