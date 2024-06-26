package se.su.dsv.proctoring;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.models.media.Schema;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import se.su.dsv.proctoring.services.ProctoringService;
import se.su.dsv.proctoring.services.Services;
import se.su.dsv.proctoring.web.proctor.ProctorWebSocketHandler;

import javax.sql.DataSource;
import java.time.LocalTime;

@SpringBootApplication
@EnableWebSocket
public class SpringBootProctoringApplication {
    /**
     * Used by Spring Boot Maven plugin ({@code spring-boot:run}) to start the application.
     * @param args
     */
    public static void main(String[] args) {
        SpringApplication.run(SpringBootProctoringApplication.class, args);
    }

    static {
        SpringDocUtils config = SpringDocUtils.getConfig();
        // Configure OpenAPI to use a string format (ISO 8601) for LocalTime
        config.replaceWithSchema(LocalTime.class, new Schema<>()
                .type("string")
                .format("time")
                .description("ISO 8601 format")
                .example("14:00:00"));
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
                .requestMatchers("/v3/api-docs").permitAll()
                .anyRequest().authenticated());
        http.csrf(csrf -> csrf.disable()); // Rely on session cookie SameSite attribute
        return http.build();
    }

    @Bean
    public Services proctoringService(DataSource dataSource) {
        return new Services(dataSource);
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
        return registry -> {
            registry.addHandler(proctorWebSocketHandler, "/ws/proctor");
            registry.addHandler(proctorWebSocketHandler.new CandidateHandler(), "/ws/candidate");
        };
    }
}
