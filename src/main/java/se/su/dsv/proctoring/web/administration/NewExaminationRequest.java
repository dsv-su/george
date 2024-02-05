package se.su.dsv.proctoring.web.administration;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalTime;

public record NewExaminationRequest(
        @JsonProperty(value = "title", required = true) String title,
        @JsonProperty(value = "date", required = true) LocalDate date,
        @JsonProperty(value = "start", required = true) LocalTime start,
        @JsonProperty(value = "end", required = true) LocalTime end)
{
}
