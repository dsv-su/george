CREATE TABLE IF NOT EXISTS `exam_candidates` (
    `exam_id` CHAR(36) NOT NULL,
    `candidate_principal_name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`exam_id`, `candidate_principal_name`),
    FOREIGN KEY `FK_exam_candidates_exam` (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
);
