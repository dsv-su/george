package se.su.dsv.proctoring.web.proctor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import se.su.dsv.proctoring.services.ProctoringService;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/proctor")
public class ProctorController {
    private final ProctoringService proctoringService;

    public ProctorController(final ProctoringService proctoringService) {
        this.proctoringService = proctoringService;
    }

    @GetMapping("list")
    public List<Exam> listExamsToProctor(@AuthenticationPrincipal Principal principal) {
        return proctoringService.examsToProctor(principal)
                .stream()
                .map(this::toJsonRepresentation)
                .toList();
    }

    private Exam toJsonRepresentation(se.su.dsv.proctoring.services.Exam exam) {
        LocalTime start = exam.start().toLocalTime();
        LocalTime end = exam.start().plus(exam.length()).toLocalTime();
        LocalDate date = exam.start().toLocalDate();
        String title = "%s %s %s (%s-%s)".formatted("", date, exam.title(), start, end);
        return new Exam(exam.id().asString(), title);
    }
}
