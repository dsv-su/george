package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.UUID;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = InboundMessage.ProctorExamination.class, name = "proctor_examination"),
        @JsonSubTypes.Type(value = InboundMessage.CandidateJoined.class, name = "candidate_joined"),
        @JsonSubTypes.Type(value = InboundMessage.ConnectCandidate.class, name = "connect_candidate"),
        @JsonSubTypes.Type(value = InboundMessage.ConnectionRequestResponse.class, name = "connection_request_response"),
})
public sealed interface InboundMessage {
    record ProctorExamination(@JsonProperty("exam_id") String examId) implements InboundMessage {}
    record CandidateJoined(@JsonProperty("exam_id") String examId, RTCSessionDescription offer) implements InboundMessage {}

    /**
     * The proctor wants to connect to a candidate.
     * @param principalName the candidate to connect to
     * @param offer the proctor's WebRTC offer
     */
    record ConnectCandidate(
            @JsonProperty("principal") String principalName,
            @JsonProperty("offer") RTCSessionDescription offer)
            implements InboundMessage {}

    record ConnectionRequestResponse(
            @JsonProperty("id") UUID id,
            @JsonProperty("answer") RTCSessionDescription answer)
            implements InboundMessage {}
}
