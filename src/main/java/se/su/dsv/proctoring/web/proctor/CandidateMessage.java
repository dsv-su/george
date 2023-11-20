package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import se.su.dsv.proctoring.services.ExamId;

public class CandidateMessage {
    private CandidateMessage() {
        throw new IllegalStateException("Used as namespace");
    }

    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
    @JsonSubTypes({
            @JsonSubTypes.Type(value = CandidateMessage.Inbound.Joined.class, name = "candidate_joined"),
            @JsonSubTypes.Type(value = RTCMessage.Answer.class, name = "rtc_answer"),
            @JsonSubTypes.Type(value = RTCMessage.ICECandidate.class, name = "rtc_ice_candidate"),
            @JsonSubTypes.Type(value = RTCMessage.Offer.class, name = "rtc_offer"),
    })
    public sealed interface Inbound
            permits Inbound.Joined, RTCMessage.Answer, RTCMessage.ICECandidate, RTCMessage.Offer
    {
        record Joined(@JsonProperty("exam_id") String examId) implements Inbound {}

    }
}
