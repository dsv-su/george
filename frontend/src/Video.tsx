import { useEffect, useRef } from 'react';

export default function Video({ stream }: { stream: MediaStream }) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video.current !== null && video.current.srcObject !== stream) {
      video.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (video.current !== null && video.current.paused) {
        void video.current.play();
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return <video ref={video} autoPlay></video>;
}
