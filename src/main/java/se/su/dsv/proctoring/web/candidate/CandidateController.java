package se.su.dsv.proctoring.web.candidate;

import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import se.su.dsv.proctoring.services.CandidateService;

import java.security.Principal;
import java.util.List;

/**
 * API endpoints for candidate related functionality.
 */
@RestController
@Tag(name = "Candidates")
@ApiResponse(
        responseCode = "400",
        description = "Something is wrong with the request, needs fixing before sending again.",
        content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
@ApiResponse(
        responseCode = "500",
        description = "The request was fine, there was just a problem handling it.",
        content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
@RequestMapping("/api/candidate")
public class CandidateController {
    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    /**
     * Returns the exams the given principal should take.
     * @param principal the currently logged-in user
     * @return the exams the given principal should take.
     */
    @GetMapping(value = "list", produces = "application/json")
    @ApiResponse(
            responseCode = "200",
            description = "The exams the given candidate should take.",
            content = @Content(
                    array = @ArraySchema(schema = @Schema(implementation = Exam.class))))
    public List<Exam> listExamsToTake(Principal principal) {
        return candidateService.examsToTake(principal)
                .stream()
                .map(this::toJsonRepresentation)
                .toList();
    }

    private Exam toJsonRepresentation(se.su.dsv.proctoring.services.Exam exam) {
        return new Exam(exam.id().asString(), exam.title());
    }
}
