FROM debian:trixie
RUN apt-get update && apt-get install openjdk-21-jdk-headless -y --no-install-recommends

RUN whereis java

WORKDIR /george
COPY pom.xml pom.xml
COPY mvnw mvnw
COPY .mvn/ .mvn/
RUN ./mvnw -B dependency:go-offline

COPY src/ src/
CMD exec ./mvnw spring-boot:run \
    -Pdocker \
    -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:8000"
