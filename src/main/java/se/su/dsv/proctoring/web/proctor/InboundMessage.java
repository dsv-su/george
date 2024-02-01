package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = InboundMessage.ProctorExamination.class, name = "proctor_examination"),
        @JsonSubTypes.Type(value = InboundMessage.ConnectCandidate.class, name = "connect_candidate"),
        @JsonSubTypes.Type(value = RTCMessage.Answer.class, name = "rtc_answer"),
        @JsonSubTypes.Type(value = RTCMessage.ICECandidate.class, name = "rtc_ice_candidate"),
        @JsonSubTypes.Type(value = RTCMessage.Offer.class, name = "rtc_offer"),
})
public sealed interface InboundMessage
        permits
        InboundMessage.ProctorExamination,
        InboundMessage.ConnectCandidate,
        RTCMessage.Answer,
        RTCMessage.ICECandidate,
        RTCMessage.Offer
{
    record ProctorExamination(@JsonProperty("exam_id") String examId) implements InboundMessage {}

    /**
     * The proctor wants to connect to a candidate.
     * @param principalName the candidate to connect to
     */
    record ConnectCandidate(
            @JsonProperty("principal") String principalName)
            implements InboundMessage {}
}
