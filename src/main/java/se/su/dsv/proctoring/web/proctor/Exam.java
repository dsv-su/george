package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @param id unique identifier for this exam
 * @param title human-readable title that uniquely identifies this exam
 */
public record Exam(
        @JsonProperty(value = "id", required = true) String id,
        @JsonProperty(value = "title", required = true) String title)
{
}
