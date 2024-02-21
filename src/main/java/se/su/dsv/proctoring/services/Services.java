package se.su.dsv.proctoring.services;

import org.springframework.jdbc.core.simple.JdbcClient;

import javax.sql.DataSource;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class Services implements ExaminationAdministrationService, ProctoringService {
    private final JdbcClient jdbc;

    public Services(DataSource dataSource) {
        jdbc = JdbcClient.create(dataSource);
    }

    @Override
    public List<Exam> examsToProctor(Principal principal) {
        return jdbc.sql("""
                SELECT *
                FROM exams
                  INNER JOIN exam_proctor ON exams.id = exam_proctor.exam_id
                  INNER JOIN proctors ON exam_proctor.proctor_id = proctors.id
                WHERE proctors.principal = :proctor
                """)
                .param("proctor", principal.getName())
                .query((rs, rowNum) -> {
                    var id = new ExamId(rs.getString("id"));
                    var name = rs.getString("name");
                    var start = rs.getTimestamp("start").toInstant();
                    var end = rs.getTimestamp("end").toInstant();
                    return new Exam(id, name, start, end);
                })
                .list();
    }

    @Override
    public List<Candidate> getCandidates(Exam exam, Principal principal) {
        return List.of();
    }

    @Override
    public Exam scheduleNewExamination(NewExamination newExamination) {
        UUID id = UUID.randomUUID();
        jdbc.sql("""
                INSERT INTO exams (id, name, start, end)
                VALUES (:id, :name, :start, :end)
                """)
                .param("id", id.toString())
                .param("name", newExamination.name())
                .param("start", newExamination.start())
                .param("end", newExamination.end())
                .update();
        return new Exam(new ExamId(id.toString()), newExamination.name(), newExamination.start(), newExamination.end());
    }

    @Override
    public Optional<Exam> lookupExamination(String examinationId) {
        return jdbc.sql("""
                SELECT *
                FROM exams
                WHERE id = :id
                """)
                .param("id", examinationId)
                .query((rs, rowNum) -> {
                    var id = new ExamId(rs.getString("id"));
                    var name = rs.getString("name");
                    var start = rs.getTimestamp("start").toInstant();
                    var end = rs.getTimestamp("end").toInstant();
                    return new Exam(id, name, start, end);
                })
                .optional();
    }
}
