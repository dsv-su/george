package se.su.dsv.proctoring.prototype;

import se.su.dsv.proctoring.services.Exam;
import se.su.dsv.proctoring.services.ProctoringService;

import java.security.Principal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

public class FakeData implements ProctoringService {
    private static final ZoneId DSV_TIMEZONE = ZoneId.of("Europe/Stockholm");

    @Override
    public List<Exam> examsToProctor(final Principal principal) {
        return List.of(
                new Exam(
                        "123-abc-456-def",
                        "Take home exam",
                        ZonedDateTime.of(LocalDateTime.of(2023, Month.SEPTEMBER, 29, 14, 0), DSV_TIMEZONE),
                        Duration.ofHours(4)),
                new Exam(
                        "123-abc-456-def",
                        "Take home re-exam",
                        ZonedDateTime.of(LocalDateTime.of(2023, Month.NOVEMBER, 11, 10, 0), DSV_TIMEZONE),
                        Duration.ofHours(4))
        );
    }
}
