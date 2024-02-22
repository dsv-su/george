package se.su.dsv.proctoring.services;

import se.su.dsv.proctoring.common.SimplePrincipal;

import java.security.Principal;
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

    /**
     * Look up an examination by its id.
     * @param examinationId the id of the examination
     * @return the examination, if found
     */
    Optional<Exam> lookupExamination(String examinationId);

    /**
     * List all examinations.
     * @return a list of all examinations
     */
    List<Exam> listExaminations();

    /**
     * Get all proctors for a specific examination.
     * @param examinationId the id of the examination
     * @return the proctors for the examination
     */
    List<Proctor> getProctors(ExamId examinationId);

    /**
     * Add a proctor to an examination.
     * @param examId the id of the examination
     * @param principal the principal of the proctor
     */
    void addProctor(ExamId examId, Principal principal);
}
