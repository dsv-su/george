import { useRef } from 'react';

export default function Test() {
  const video1 = useRef<HTMLVideoElement>(null);
  const video2 = useRef<HTMLVideoElement>(null);
  const video3 = useRef<HTMLVideoElement>(null);

  const doStuff = async () => {
    const sender = new RTCPeerConnection();
    const receiver = new RTCPeerConnection();

    sender.onnegotiationneeded = async () => {
      console.log('sender negotiation needed');
      const offer = await sender.createOffer();
      await sender.setLocalDescription(offer);
      await receiver.setRemoteDescription(offer);
      const answer = await receiver.createAnswer();
      await receiver.setLocalDescription(answer);
      await sender.setRemoteDescription(answer);
    };

    receiver.onnegotiationneeded = () => {
      console.log('receiver negotiation needed');
    };

    sender.onicegatheringstatechange = () => {
      console.log('sender ice gathering state', sender.iceGatheringState);
    };
    sender.onconnectionstatechange = () => {
      console.log('sender connection state', sender.connectionState);
    };

    sender.onicecandidate = (event) => {
      console.log('sender onicecandidate', event.candidate);
      if (event.candidate !== null) {
        receiver.addIceCandidate(event.candidate);
      }
    };
    receiver.onicecandidate = (event) => {
      console.log('receiver onicecandidate', event.candidate);
      if (event.candidate !== null) {
        sender.addIceCandidate(event.candidate);
      }
    };

    const userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const displayMedia = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    const userMedia2 = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });

    video1.current!.srcObject = userMedia;

    receiver.ontrack = (event) => {
      console.log('receiver ontrack', event);
      if (video2.current?.srcObject === null) {
        video2.current!.srcObject = event.streams[0];
      } else {
        video3.current!.srcObject = event.streams[0];
      }
    };

    userMedia.getTracks().forEach((track) => {
      sender.addTrack(track, userMedia);
    });
    displayMedia.getTracks().forEach((track) => {
      sender.addTrack(track, displayMedia);
    });

    userMedia2.getTracks().forEach((track) => {
      receiver.addTrack(track, userMedia2);
    });

    // const offer = await sender.createOffer();
    // await sender.setLocalDescription(offer);
    // await receiver.setRemoteDescription(offer);
    // const answer = await receiver.createAnswer();
    // await receiver.setLocalDescription(answer);
    // await sender.setRemoteDescription(answer);
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
