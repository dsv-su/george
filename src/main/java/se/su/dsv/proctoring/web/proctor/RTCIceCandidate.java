package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RTCIceCandidate(
        @JsonProperty("candidate") String candidate,
        @JsonProperty("sdpMid") String sdpMid,
        @JsonProperty("sdpMLineIndex") int sdpMLineIndex,
        @JsonProperty("usernameFragment") String usernameFragment)
{
}
