package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.UUID;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Message.ExamInfo.class, name = "exam_info"),
        @JsonSubTypes.Type(value = Message.Candidate.class, name = "candidate"),
        @JsonSubTypes.Type(value = Message.CandidateJoined.class, name = "candidate_joined"),
        @JsonSubTypes.Type(value = Message.ConnectionRequest.class, name = "connection_request"),
        @JsonSubTypes.Type(value = Message.ConnectionRequestResponse.class, name = "connection_request_response"),
})
public sealed interface Message {
    record ExamInfo(@JsonProperty("title") String title) implements Message {}
    record Candidate(@JsonProperty("principal_name") String principalName) implements Message {}
    record CandidateJoined(@JsonProperty("principal") String principalName) implements Message {}

    /**
     * A request for connection.
     * @param id unique identifier for this connection
     * @param offer the WebRTC offer from the remote peer
     */
    record ConnectionRequest(
            @JsonProperty("id") UUID id,
            @JsonProperty("offer") RTCSessionDescription offer)
            implements Message {}

    /**
     * A response to a connection request.
     * @param principalName the candidate answering the request
     * @param answer the WebRTC answer from the remote peer
     */
    record ConnectionRequestResponse(
            @JsonProperty("principal") String principalName,
            @JsonProperty("answer") RTCSessionDescription answer)
            implements Message {}
}
