package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = InboundMessage.ProctorExamination.class, name = "proctor_examination"),
        @JsonSubTypes.Type(value = InboundMessage.CandidateJoined.class, name = "candidate_joined"),
})
public sealed interface InboundMessage {
    record ProctorExamination(@JsonProperty("exam_id") String examId) implements InboundMessage {}
    record CandidateJoined(@JsonProperty("exam_id") String examId, RTCSessionDescription offer) implements InboundMessage {}
}
