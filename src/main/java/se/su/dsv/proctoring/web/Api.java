package se.su.dsv.proctoring.web;

import org.springframework.security.core.AuthenticatedPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping("/api")
public final class Api {
    /**
     * Serve the Swagger UI documentation on requests to /api.
     * @return redirect to the Swagger UI documentation
     */
    @GetMapping({"/", ""}) // So both /api and /api/ work
    public ModelAndView documentation() {
        // Have to use a ModelAndView object since we're in a @RestController
        return new ModelAndView("redirect:/swagger-ui/index.html");
    }

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
