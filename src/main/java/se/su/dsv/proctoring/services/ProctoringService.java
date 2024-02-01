package se.su.dsv.proctoring.services;

import java.security.Principal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

public interface ProctoringService {
    /**
     * Returns the exams the given principal should proctor.
     * @param principal the proctor
     * @return the exams the given principal should proctor.
     */
    List<Exam> examsToProctor(Principal principal);

    /**
     * Returns the exam with the given id if the given principal should proctor it.
     * @param examId the exam id
     * @param principal the proctor
     * @return the exam with the given id if the given principal should proctor it.
     */
    default Optional<Exam> getProctorableExam(ExamId examId, Principal principal) {
        for (Exam exam : examsToProctor(principal)) {
            if (Objects.equals(exam.id(), examId)) {
                return Optional.of(exam);
            }
        }
        return Optional.empty();
    }

    /**
     * @param exam exam to proctor
     * @param principal the proctor
     * @return the candidates the given principal should proctor on the given exam.
     */
    List<Candidate> getCandidates(Exam exam, Principal principal);
}
