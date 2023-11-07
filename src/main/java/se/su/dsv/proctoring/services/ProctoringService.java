package se.su.dsv.proctoring.services;

import java.security.Principal;
import java.util.List;

public interface ProctoringService {
    List<Exam> examsToProctor(Principal principal);
    boolean canProctor(ExamId examId, Principal principal);
}
