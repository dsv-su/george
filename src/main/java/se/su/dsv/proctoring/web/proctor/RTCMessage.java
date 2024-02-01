package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.UUID;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = RTCMessage.Answer.class, name = "rtc_answer"),
        @JsonSubTypes.Type(value = RTCMessage.ICECandidate.class, name = "rtc_ice_candidate"),
        @JsonSubTypes.Type(value = RTCMessage.Offer.class, name = "rtc_offer"),
})
public interface RTCMessage {
    /**
     * The unique identifier for the connection this message is bound for.
     * @return the connection id
     */
    UUID connectionId();

    record Offer(
            @JsonProperty("id") UUID connectionId,
            @JsonProperty("offer") RTCSessionDescription offer)
            implements RTCMessage, CandidateMessage.Inbound, InboundMessage
    {}

    record Answer(
            @JsonProperty("id") UUID connectionId,
            @JsonProperty("answer") RTCSessionDescription answer)
            implements RTCMessage, CandidateMessage.Inbound, InboundMessage
    {}

    record ICECandidate(
            @JsonProperty("id") UUID connectionId,
            @JsonProperty("candidate") RTCIceCandidate candidate)
            implements RTCMessage, CandidateMessage.Inbound, InboundMessage
    {}
}
