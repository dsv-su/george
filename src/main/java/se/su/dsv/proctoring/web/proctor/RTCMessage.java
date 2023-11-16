package se.su.dsv.proctoring.web.proctor;

import java.util.UUID;

public interface RTCMessage {
    record Offer(UUID connectionId, RTCSessionDescription offer) implements CandidateMessage.Inbound {}
    record Answer(UUID connectionId, RTCSessionDescription offer) implements CandidateMessage.Inbound {}
    record ICECandidate(UUID connectionId, RTCIceCandidate offer) implements CandidateMessage.Inbound {}
}
