package se.su.dsv.proctoring.services;

import java.time.Instant;

public interface ExaminationAdministrationService {
    record NewExamination(String name, Instant start, Instant end) {}

    /**
     * Schedule a new examination.
     * @param newExamination details of the new examination
     * @return the scheduled examination
     */
    Exam scheduleNewExamination(NewExamination newExamination);
}
