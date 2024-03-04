package se.su.dsv.proctoring.web.candidate;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * @param id unique identifier for this exam
 * @param title human-readable title that uniquely identifies this exam on the date of the exam
 */
@Schema(name = "candidate.Exam")
public record Exam(
        @JsonProperty(value = "id", required = true) String id,
        @JsonProperty(value = "title", required = true) String title)
{
}
