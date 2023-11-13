package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import se.su.dsv.proctoring.services.Candidate;
import se.su.dsv.proctoring.services.Exam;
import se.su.dsv.proctoring.services.ExamId;
import se.su.dsv.proctoring.services.ProctoringService;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

public class ProctorWebSocketHandler extends TextWebSocketHandler {
    private static final WebSocketMessage<?> ACCESS_DENIED = new TextMessage("{\"type\":\"access_denied\"}");
    private static final WebSocketMessage<?> INVALID_MESSAGE = new TextMessage("{\"type\":\"invalid_message\"}");

    private final ProctoringService proctoringService;
    private final ObjectMapper objectMapper;

    private Map<ExamId, Collection<WebSocketSession>> proctors = new ConcurrentHashMap<>();

    public ProctorWebSocketHandler(final ProctoringService proctoringService, ObjectMapper objectMapper) {
        this.proctoringService = proctoringService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(final WebSocketSession session) throws Exception {
        if (session.getPrincipal() == null) {
            // only authenticated users can open a websocket connection
            session.close(CloseStatus.POLICY_VIOLATION);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        for (Collection<WebSocketSession> proctors : proctors.values()) {
            proctors.remove(session);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage)
            throws IOException
    {
        String payload = textMessage.getPayload();
        try {
            InboundMessage inboundMessage = objectMapper.readValue(payload, InboundMessage.class);
            handleInboundMessage(session, inboundMessage);
        } catch (JsonProcessingException e) {
            session.sendMessage(INVALID_MESSAGE);
        }
    }

    private void handleInboundMessage(WebSocketSession session, InboundMessage inboundMessage)
            throws IOException
    {
        switch (inboundMessage) {
            case InboundMessage.ProctorExamination(String examId) -> {
                Optional<Exam> maybeExam = proctoringService.getProctorableExam(new ExamId(examId), session.getPrincipal());
                if (maybeExam.isPresent()) {
                    Message message = new Message.ExamInfo(maybeExam.get().title());
                    sendJsonMessage(session, message);
                    List<Candidate> candidates = proctoringService.getCandidates(
                            maybeExam.get(),
                            session.getPrincipal());
                    for (Candidate candidate : candidates) {
                        sendJsonMessage(session, new Message.Candidate(candidate.username().principalName()));
                    }
                    proctors.putIfAbsent(new ExamId(examId), new ConcurrentLinkedQueue<>());
                    proctors.get(new ExamId(examId)).add(session);
                }
                else {
                    session.sendMessage(ACCESS_DENIED);
                }
            }
            case InboundMessage.CandidateJoined(String examId, RTCSessionDescription offer) -> {
                Collection<WebSocketSession> proctors = this.proctors.getOrDefault(new ExamId(examId), List.of());
                // TODO: get only the correct proctor
                for (WebSocketSession proctor : proctors) {
                    sendJsonMessage(proctor, new Message.CandidateRTCOffer(session.getPrincipal().getName(), offer));
                }
            }
        }
    }

    private void sendJsonMessage(WebSocketSession session, Message message)
            throws IOException
    {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        }
    }
}
