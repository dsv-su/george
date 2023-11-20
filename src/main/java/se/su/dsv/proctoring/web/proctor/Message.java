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
        @JsonSubTypes.Type(value = Message.CameraStreamOffer.class, name = "camera_stream_offer"),
        @JsonSubTypes.Type(value = Message.ScreenStreamOffer.class, name = "screen_stream_offer"),
        @JsonSubTypes.Type(value = Message.CameraStreamAnswer.class, name = "camera_stream_answer"),
        @JsonSubTypes.Type(value = Message.IceCandidate.class, name = "ice_candidate"),
        @JsonSubTypes.Type(value = Message.ProctorIceCandidate.class, name = "proctor_ice_candidate"),
        @JsonSubTypes.Type(value = Message.ConnectionEstablished.class, name = "connection_established"),
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
            @JsonProperty("connection_id") UUID id)
            implements Message {}

    /**
     * An offer to share a camera stream.
     * @param principalName the candidate whose camera stream is offered
     * @param offer the WebRTC offer (SDP) from the candidate
     */
    record CameraStreamOffer(
            @JsonProperty("principal") String principalName,
            @JsonProperty("offer") RTCSessionDescription offer)
            implements Message {}

    /**
     * An offer to share a screen stream.
     * @param principalName the candidate whose screen stream is offered
     * @param streamId unique identifier for the stream
     * @param offer the WebRTC offer (SDP) from the candidate
     */
    record ScreenStreamOffer(
            @JsonProperty("principal") String principalName,
            @JsonProperty("stream_id") String streamId,
            @JsonProperty("offer") RTCSessionDescription offer)
            implements Message {}

    /**
     * An answer to a {@link se.su.dsv.proctoring.web.proctor.InboundMessage.CameraStreamOffer} message.
     *
     * @param peerConnectionId unique identifier for this peer connection
     * @param answer the WebRTC answer (SDP) from the proctor
     */
    record CameraStreamAnswer(
            @JsonProperty("id") UUID peerConnectionId,
            @JsonProperty("answer") RTCSessionDescription answer)
            implements Message {}

    record IceCandidate(
            @JsonProperty("principal") String principalName,
            @JsonProperty("candidate") RTCIceCandidate iceCandidate)
            implements Message {}

    record ProctorIceCandidate(
            @JsonProperty("id") UUID peerConnectionId,
            @JsonProperty("candidate") RTCIceCandidate iceCandidate)
            implements Message {}

    record ConnectionEstablished(
            @JsonProperty("connection_id") UUID peerConnectionId,
            @JsonProperty("principal") String principalName)
            implements Message {}
}
