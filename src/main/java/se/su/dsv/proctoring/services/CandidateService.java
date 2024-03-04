package se.su.dsv.proctoring.services;

import se.su.dsv.proctoring.web.proctor.WebSocketsHandler;

import java.security.Principal;
import java.util.List;

public interface CandidateService {
    /**
     * Returns the exams the given principal should take.
     * @param candidate the candidate
     * @return the exams the given principal should take.
     */
    List<Exam> examsToTake(Principal candidate);

    /**
     * Returns true if the given principal is allowed to take the given exam.
     * @param examId the exam id
     * @param principal the candidate
     * @return true if the given principal is allowed to take the given exam.
     */
    default boolean canTake(ExamId examId, Principal principal) {
        return examsToTake(principal)
                .stream()
                .map(Exam::id)
                .anyMatch(examId::equals);
    }
}
