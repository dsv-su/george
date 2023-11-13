package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Message.ExamInfo.class, name = "exam_info"),
        @JsonSubTypes.Type(value = Message.Candidate.class, name = "candidate"),
        @JsonSubTypes.Type(value = Message.CandidateRTCOffer.class, name = "candidate_rtc_offer"),
})
public sealed interface Message {
    record ExamInfo(@JsonProperty("title") String title) implements Message {}
    record Candidate(@JsonProperty("principal_name") String principalName) implements Message {}

    record CandidateRTCOffer(
            @JsonProperty("principal_name") String principalName,
            @JsonProperty("offer") RTCSessionDescription sdp)
            implements Message {}

    record RTCSessionDescription(
            @JsonProperty("type") String type,
            @JsonProperty("sdp") String sdp)
            implements Message {}
}
