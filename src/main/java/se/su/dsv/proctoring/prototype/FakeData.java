package se.su.dsv.proctoring.prototype;

import se.su.dsv.proctoring.services.Candidate;
import se.su.dsv.proctoring.services.Exam;
import se.su.dsv.proctoring.services.ExamId;
import se.su.dsv.proctoring.services.PrincipalName;
import se.su.dsv.proctoring.services.ProctoringService;

import java.security.Principal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;

public class FakeData implements ProctoringService {
    private static final ZoneId DSV_TIMEZONE = ZoneId.of("Europe/Stockholm");
    private static final ExamId ORIGINAL_EXAM_ID = new ExamId("123-abc-456-def");
    private static final ExamId RE_EXAM_ID = new ExamId("789-aoeu-123");

    @Override
    public List<Exam> examsToProctor(final Principal principal) {
        return List.of(
                new Exam(
                        ORIGINAL_EXAM_ID,
                        "Take home exam",
                        ZonedDateTime.of(LocalDateTime.of(2023, Month.SEPTEMBER, 29, 14, 0), DSV_TIMEZONE),
                        Duration.ofHours(4)),
                new Exam(
                        RE_EXAM_ID,
                        "Take home re-exam",
                        ZonedDateTime.of(LocalDateTime.of(2023, Month.NOVEMBER, 11, 10, 0), DSV_TIMEZONE),
                        Duration.ofHours(4))
        );
    }

    @Override
    public List<Candidate> getCandidates(Exam exam, Principal principal) {
        if (Objects.equals(exam.id(), ORIGINAL_EXAM_ID)) {
            return List.of(
                    new Candidate(new PrincipalName("candidate1")),
                    new Candidate(new PrincipalName("candidate2")),
                    new Candidate(new PrincipalName("candidate3")),
                    new Candidate(new PrincipalName("candidate4")),
                    new Candidate(new PrincipalName("candidate5")),
                    new Candidate(new PrincipalName("candidate6")),
                    new Candidate(new PrincipalName("candidate7")),
                    new Candidate(new PrincipalName("candidate8")));
        }
        else if (Objects.equals(exam.id(), RE_EXAM_ID)) {
            return List.of(
                    new Candidate(new PrincipalName("candidate1")),
                    new Candidate(new PrincipalName("candidate2")),
                    new Candidate(new PrincipalName("candidate7")));
        }
        return List.of();
    }
}
