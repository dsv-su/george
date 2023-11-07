package se.su.dsv.springbootviteauth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@SpringBootApplication
public class SpringBootViteAuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootViteAuthApplication.class, args);
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
}
