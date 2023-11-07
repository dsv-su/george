package se.su.dsv.proctoring;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
        properties = {
                "spring.security.oauth2.client.provider.su.authorization-uri=http://localhost/authorize",
                "spring.security.oauth2.client.provider.su.token-uri=http://localhost/token",
                "spring.security.oauth2.client.provider.su.user-info-uri=http://localhost/userinfo",
                "spring.security.oauth2.client.provider.su.user-name-attribute=sub",
                "spring.security.oauth2.client.registration.su.client-id=client-id",
                "spring.security.oauth2.client.registration.su.client-secret=client-secret",
        }
)
class SpringBootProctoringApplicationTests {

    @Test
    void contextLoads() {
    }

}
