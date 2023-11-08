package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = ProctorMessage.ProctorExamination.class, name = "proctor_examination"),
})
public sealed interface ProctorMessage {
    record ProctorExamination(@JsonProperty("exam_id") String examId) implements ProctorMessage {}
}
