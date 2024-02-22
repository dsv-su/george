package se.su.dsv.proctoring.common;

import javax.security.auth.Subject;
import java.security.Principal;

public record SimplePrincipal(String principalName) implements Principal {
    @Override
    public String getName() {
        return principalName;
    }
}
