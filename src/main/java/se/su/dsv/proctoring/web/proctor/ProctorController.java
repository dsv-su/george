package se.su.dsv.proctoring.web.proctor;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import se.su.dsv.proctoring.services.ExamId;
import se.su.dsv.proctoring.services.ProctoringService;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@RestController
@RequestMapping(value = "/api/proctor", produces = "application/json")
@Tag(name = "Proctors")
@ApiResponse(
        responseCode = "400",
        description = "Something is wrong with the request, needs fixing before sending again.",
        content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
@ApiResponse(
        responseCode = "500",
        description = "The request was fine, there was just a problem handling it.",
        content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
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
    @ApiResponse(
            responseCode = "200",
            description = "The exams the given proctor should proctor.",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = Exam.class))))
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

    /**
     * Returns the details of the examination with the given id.
     * @param examId the id of the examination
     * @param principal the currently logged-in user
     * @return the details of the examination with the given id.
     */
    @GetMapping("examination/{examId}")
    @ApiResponse(
            responseCode = "200",
            description = "Returns the details of the examination with the given id.")
    public ExaminationDetails getExaminationDetails(
            @PathVariable("examId") String examId,
            Principal principal)
    {
        var exam = proctoringService.getProctorableExam(new ExamId(examId), principal)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such exam"));
        List<ExaminationDetails.Candidate> candidates = proctoringService.getCandidates(exam, principal)
                .stream()
                .map(candidate -> new ExaminationDetails.Candidate(candidate.principal().getName()))
                .toList();
        return new ExaminationDetails(exam.id().asString(), exam.title(), candidates);
    }
}
