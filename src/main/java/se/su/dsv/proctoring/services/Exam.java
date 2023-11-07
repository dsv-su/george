package se.su.dsv.proctoring.services;

import java.time.Duration;
import java.time.ZonedDateTime;

public record Exam(ExamId id, String title, ZonedDateTime start, Duration length) {
}
