package se.su.dsv.proctoring.web.administration;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import se.su.dsv.proctoring.services.ExamId;

import java.time.LocalDate;
import java.time.LocalTime;

public record ExaminationDetails(
        @JsonProperty(value = "id", required = true) String id,
        @JsonProperty(value = "title", required = true) String title,
        @JsonProperty(value = "date", required = true) LocalDate date,
        @JsonProperty(value = "start", required = true) LocalTime start,
        @JsonProperty(value = "end", required = true) LocalTime end)
{
}
