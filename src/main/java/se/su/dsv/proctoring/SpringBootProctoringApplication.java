package se.su.dsv.proctoring;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import se.su.dsv.proctoring.prototype.FakeData;
import se.su.dsv.proctoring.services.ProctoringService;
import se.su.dsv.proctoring.web.proctor.ProctorWebSocketHandler;

@SpringBootApplication
@EnableWebSocket
public class SpringBootProctoringApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootProctoringApplication.class, args);
    }

    /**
     * Require OAuth2 login for the entire application.
     *
     * @param http Spring configuration object
     * @return security filter that requires an authenticated OAuth2 session for
     * all endpoints
     * @throws Exception if configuration fails
     */
    @Bean
    public SecurityFilterChain security(HttpSecurity http)
            throws Exception
    {
        http.oauth2Login(Customizer.withDefaults());
        http.authorizeHttpRequests(authorization -> authorization
                .anyRequest().authenticated());
        return http.build();
    }

    @Bean
    public ProctoringService proctoringService() {
        return new FakeData();
    }

    @Bean
    public ProctorWebSocketHandler proctorWebSocketHandler(
            ProctoringService proctoringService,
            ObjectMapper objectMapper)
    {
        return new ProctorWebSocketHandler(proctoringService, objectMapper);
    }

    @Bean
    public WebSocketConfigurer proctorWS(ProctorWebSocketHandler proctorWebSocketHandler) {
        return registry -> registry.addHandler(proctorWebSocketHandler, "/ws/proctor");
    }
}
