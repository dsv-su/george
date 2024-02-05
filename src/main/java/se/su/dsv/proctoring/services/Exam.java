package se.su.dsv.proctoring.services;

import java.time.Instant;

public record Exam(ExamId id, String title, Instant start, Instant end) {
}
