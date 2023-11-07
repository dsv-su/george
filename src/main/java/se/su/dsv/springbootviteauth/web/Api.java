package se.su.dsv.springbootviteauth.web;

import org.springframework.security.core.AuthenticatedPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api")
public class Api {
    @ResponseBody
    @GetMapping("/profile")
    public String profile(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return principal.getName();
    }
}
