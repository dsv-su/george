package se.su.dsv.proctoring;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.MariaDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

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
@Testcontainers
class SpringBootProctoringApplicationTests {

    @ServiceConnection
    @Container
    private static MariaDBContainer<?> mariaDB = new MariaDBContainer<>("mariadb:latest");

    @Test
    void contextLoads() {
    }

}
