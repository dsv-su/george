package se.su.dsv.proctoring.web.administration;

import com.fasterxml.jackson.annotation.JsonProperty;

public record Candidate(
        @JsonProperty(value = "principal", required = true) String principalName)
{
}
