# Live proctoring
Both test takers and proctors connect to the system. The test takers camera
and monitor is shared with the proctor. Proctors have the ability to talk to the
test takers, but they must initiate the communication.

## Technology
It uses the [Media Capture and Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API)
to capture the camera and monitor and communicates using [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API).
Orchestrating the live communication is done via [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API).

## Development
Requires Java 21.

Copy `src/main/resources/application-local.yml.example` to `application-local.yml` and fill in the missing properties.

Run backend with `mvnw spring-boot:run` and frontend with `cd frontend && npm run dev`.

To login, you first have to browse to `http://localhost:8080` and authenticate
to initialise the Spring session, after you can go access the frontend at `http://localhost:5173`.

### API Specification
The frontend uses a generated specification from the backend's OpenAPI specification.
To update it start the application and run `cd frontend && npm run update-api`.

### Docker
To run the backend in a docker container, run `docker compose -f docker-compose.yml --profile backend up`.
To run the frontend in a docker container, use `--profile frontend up`.
To run both simply include both `--profile backend --profile frontend`.

All sources are live reloaded even when running in Docker. For the backend you will have to compile the sources for the
live reload to trigger.

## Deployment
To build a fully self-contained war file, run `mvnw clean verify -P build`.
Deploy the created war file to an application server, e.g. Tomcat.
