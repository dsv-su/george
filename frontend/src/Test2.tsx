import { useRef } from 'react';
import { useWebRTC } from './hooks/webrtc.ts';

export default function Test2() {
  const video1 = useRef<HTMLVideoElement>(null);
  const video2 = useRef<HTMLVideoElement>(null);
  const video3 = useRef<HTMLVideoElement>(null);

  const sender = useWebRTC({
    name: 'sender',
    sendAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
      return receiver.answerReceived(answer);
    },
    sendCandidate(candidate: RTCIceCandidateInit): Promise<void> {
      return receiver.candidateReceived(candidate);
    },
    sendOffer(offer: RTCSessionDescriptionInit): Promise<void> {
      return receiver.offerReceived(offer, true);
    },
  });
  const receiver = useWebRTC({
    name: 'receiver',
    sendAnswer: sender.answerReceived,
    sendCandidate: sender.candidateReceived,
    sendOffer(offer: RTCSessionDescriptionInit): Promise<void> {
      return sender.offerReceived(offer, false);
    },
  });

  const doStuff = async () => {
    const userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const displayMedia = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    const userMedia2 = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });

    video1.current!.srcObject = userMedia;

    receiver.connection().ontrack = (event) => {
      console.log('receiver ontrack', event);
      if (video2.current?.srcObject === null) {
        video2.current!.srcObject = event.streams[0];
      } else {
        video3.current!.srcObject = event.streams[0];
      }
    };

    userMedia.getTracks().forEach((track) => {
      sender.connection().addTrack(track, userMedia);
    });
    displayMedia.getTracks().forEach((track) => {
      sender.connection().addTrack(track, displayMedia);
    });

    userMedia2.getTracks().forEach((track) => {
      receiver.connection().addTrack(track, userMedia2);
    });
  };

  return (
    <>
      <video ref={video1} autoPlay />
      <video ref={video2} autoPlay />
      <video ref={video3} autoPlay />

      <button onClick={doStuff}>Do stuff</button>
    </>
  );
}
