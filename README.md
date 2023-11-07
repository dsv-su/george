# Skeleton for Spring Boot backend with a React frontend using Vite
* Configured with OAuth2 login
* Packages everything as a bundled up WAR

## Development
Requires Java 21.

Copy `src/main/resources/application-local.yml.example` to `application-local.yml` and fill in the missing properties.

Run backend with `mvnw spring-boot:run` and frontend with `cd frontend && npm run dev`.

To login you first have to browse to `http://localhost:8080` and authenticate
to initialise the Spring session, after you can go access the frontend at `http://localhost:5173`.
