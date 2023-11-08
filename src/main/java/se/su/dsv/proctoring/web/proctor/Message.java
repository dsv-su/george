package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Message.ExamInfo.class, name = "exam_info"),
})
public sealed interface Message {
    record ExamInfo(String title) implements Message {}
}
