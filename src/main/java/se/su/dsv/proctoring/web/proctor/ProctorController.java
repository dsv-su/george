package se.su.dsv.proctoring.web.proctor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import se.su.dsv.proctoring.services.ProctoringService;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/proctor")
public final class ProctorController {
    private final ProctoringService proctoringService;

    public ProctorController(final ProctoringService proctoringService) {
        this.proctoringService = proctoringService;
    }

    /**
     * Returns the exams the given principal should proctor.
     * @param principal the currently logged-in user
     * @return the exams the given principal should proctor.
     */
    @GetMapping("list")
    public List<Exam> listExamsToProctor(Principal principal) {
        return proctoringService.examsToProctor(principal)
                .stream()
                .map(this::toJsonRepresentation)
                .toList();
    }

    private Exam toJsonRepresentation(se.su.dsv.proctoring.services.Exam exam) {
        ZonedDateTime startTimestamp = exam.start().atZone(ZoneId.systemDefault());
        LocalTime start = startTimestamp.toLocalTime();
        LocalTime end = exam.end().atZone(ZoneId.systemDefault()).toLocalTime();
        LocalDate date = startTimestamp.toLocalDate();
        String title = "%s %s %s (%s-%s)".formatted("", date, exam.title(), start, end);
        return new Exam(exam.id().asString(), title);
    }
}
