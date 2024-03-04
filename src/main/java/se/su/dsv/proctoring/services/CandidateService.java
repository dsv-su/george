package se.su.dsv.proctoring.services;

import java.security.Principal;
import java.util.List;

public interface CandidateService {
    /**
     * Returns the exams the given principal should take.
     * @param candidate the candidate
     * @return the exams the given principal should take.
     */
    List<Exam> examsToTake(Principal candidate);
}
