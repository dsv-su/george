package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RTCSessionDescription(
        @JsonProperty("type") String type,
        @JsonProperty("sdp") String sdp)
{}
