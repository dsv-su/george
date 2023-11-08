package se.su.dsv.proctoring.services;

import java.security.Principal;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

public interface ProctoringService {
    List<Exam> examsToProctor(Principal principal);

    default Optional<Exam> getProctorableExam(ExamId examId, Principal principal) {
        for (Exam exam : examsToProctor(principal)) {
            if (Objects.equals(exam.id(), examId)) {
                return Optional.of(exam);
            }
        }
        return Optional.empty();
    }
}
