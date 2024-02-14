package se.su.dsv.proctoring.web.administration;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import se.su.dsv.proctoring.services.Exam;
import se.su.dsv.proctoring.services.ExaminationAdministrationService;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@RestController
@ApiResponse(
        responseCode = "400",
        description = "Something is wrong with the request, needs fixing before sending again.",
        content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
@ApiResponse(
        responseCode = "500",
        description = "The request was fine, there was just a problem handling it.",
        content = @Content(schema = @Schema(implementation = ProblemDetail.class)))
@RequestMapping(path = "/api/administration", produces = "application/json", consumes = "application/json")
public class AdministrationController {
    private final ExaminationAdministrationService examinationAdministrationService;

    public AdministrationController(ExaminationAdministrationService examinationAdministrationService) {
        this.examinationAdministrationService = examinationAdministrationService;
    }

    /**
     * Schedule a new examination.
     *
     * @param newExaminationRequest details about the new examination
     * @return the newly scheduled examination
     */
    @PostMapping("/examination")
    @ApiResponse(
            responseCode = "201",
            description = "The examination was successfully scheduled.",
            content = @Content(schema = @Schema(implementation = ExaminationDetails.class)))
    public ExaminationDetails scheduleNewExamination(@RequestBody NewExaminationRequest newExaminationRequest) {
        var newExamination = new ExaminationAdministrationService.NewExamination(
                newExaminationRequest.title(),
                toInstantInDefaultZone(newExaminationRequest.date(), newExaminationRequest.start()),
                toInstantInDefaultZone(newExaminationRequest.date(), newExaminationRequest.end())
        );
        Exam exam = examinationAdministrationService.scheduleNewExamination(newExamination);
        ZonedDateTime zonedDateTime = exam.start().atZone(ZoneId.systemDefault());
        LocalDate date = zonedDateTime.toLocalDate();
        LocalTime start = zonedDateTime.toLocalTime();
        LocalTime end = exam.end().atZone(ZoneId.systemDefault()).toLocalTime();
        return new ExaminationDetails(exam.id().asString(), exam.title(), date, start, end);
    }

    private static Instant toInstantInDefaultZone(LocalDate date, LocalTime time) {
        return time.atDate(date).atZone(ZoneId.systemDefault()).toInstant();
    }
}
