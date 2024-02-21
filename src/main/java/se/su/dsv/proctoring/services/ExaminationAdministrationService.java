package se.su.dsv.proctoring.services;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface ExaminationAdministrationService {
    record NewExamination(String name, Instant start, Instant end) {}

    /**
     * Schedule a new examination.
     * @param newExamination details of the new examination
     * @return the scheduled examination
     */
    Exam scheduleNewExamination(NewExamination newExamination);

    Optional<Exam> lookupExamination(String examinationId);

    /**
     * List all examinations.
     * @return a list of all examinations
     */
    List<Exam> listExaminations();
}
