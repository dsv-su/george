package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(name = "proctor.ExaminationDetails")
public record ExaminationDetails(
        @JsonProperty(value = "id", required = true) String id,
        @JsonProperty(value = "title", required = true) String title,
        @JsonProperty(value = "candidates", required = true) List<Candidate> candidates)
{
    public record Candidate(@JsonProperty(value = "principal", required = true) String principalName) {
    }
}
