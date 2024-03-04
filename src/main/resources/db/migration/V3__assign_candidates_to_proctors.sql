ALTER TABLE exam_candidates
    ADD COLUMN proctor_id INTEGER;
ALTER TABLE exam_candidates
    ADD CONSTRAINT `FK_exam_candidates_proctor`
        FOREIGN KEY (`proctor_id`, `exam_id`)
            REFERENCES `exam_proctor` (`proctor_id`, `exam_id`);
