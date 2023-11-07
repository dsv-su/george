package se.su.dsv.springbootviteauth.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Support using path based routing for the single page application (SPA) by
 * always serving {@code /(index.html)} for all paths that are not explicitly
 * mapped by other controllers.
 */
@Controller
public class SinglePageApplicationController {
    /**
     * @implSpec this should map to all paths used by the React part
     * @return always serve {@code /}
     */
    @RequestMapping({
            "/{path:[^.]*}",
            "/{path:[^.]*}/{path2:[^.]*}",
            "/{path:[^.]*}/{path2:[^.]*}/{*rest}"
    })
    public String serveIndexHtml() {
        return "forward:/";
    }
}
