CREATE TABLE IF NOT EXISTS `exams` (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start DATETIME NOT NULL,
    end DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS `proctors` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    principal VARCHAR(255) NOT NULL,
    UNIQUE KEY U_proctor_principal (principal)
);

CREATE TABLE IF NOT EXISTS `exam_proctor` (
    exam_id CHAR(36) NOT NULL,
    proctor_id INT NOT NULL,
    PRIMARY KEY (exam_id, proctor_id),
    FOREIGN KEY FK_exam_proctor_exam (exam_id) REFERENCES exams(id),
    FOREIGN KEY FK_exam_proctor_proctor (proctor_id) REFERENCES proctors(id)
);
