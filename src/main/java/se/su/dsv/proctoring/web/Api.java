package se.su.dsv.proctoring.web;

import org.springframework.security.core.AuthenticatedPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public final class Api {
    /**
     * Returns the currently logged-in user's profile.
     * @param principal the currently logged-in user
     * @return the currently logged-in user's principal name
     */
    @GetMapping("/profile")
    public String profile(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return principal.getName();
    }
}
