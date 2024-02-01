package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.UUID;

public final class CandidateMessage {
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

    /**
     * All outbound messages bound for a candidate.
     */
    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
    @JsonSubTypes({
            @JsonSubTypes.Type(value = Outbound.ConnectionRequest.class, name = "connection_request"),
    })
    public sealed interface Outbound {
        /**
         * A request for a new WebRTC connection to be established containing
         * all the streams the candidate shares.
         *
         * @param id unique identifier for this connection
         */
        record ConnectionRequest(@JsonProperty("connection_id") UUID id) implements Outbound {}
    }
}
