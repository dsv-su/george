package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import se.su.dsv.proctoring.services.ExamId;

public class CandidateMessage {
    private CandidateMessage() {
        throw new IllegalStateException("Used as namespace");
    }

    public sealed interface Inbound
            permits Inbound.Joined, RTCMessage.Answer, RTCMessage.ICECandidate, RTCMessage.Offer
    {
        record Joined(@JsonUnwrapped @JsonProperty("exam_id") ExamId examId) implements Inbound {}

    }
}
