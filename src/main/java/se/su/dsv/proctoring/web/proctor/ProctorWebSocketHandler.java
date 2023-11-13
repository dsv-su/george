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
import java.util.List;
import java.util.Optional;

public class ProctorWebSocketHandler extends TextWebSocketHandler {
    private static final WebSocketMessage<?> ACCESS_DENIED = new TextMessage("{\"type\":\"access_denied\"}");
    private static final WebSocketMessage<?> INVALID_MESSAGE = new TextMessage("{\"type\":\"invalid_message\"}");

    private final ProctoringService proctoringService;
    private final ObjectMapper objectMapper;

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
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage)
            throws IOException
    {
        String payload = textMessage.getPayload();
        try {
            ProctorMessage proctorMessage = objectMapper.readValue(payload, ProctorMessage.class);
            handleProctor(session, proctorMessage);
        } catch (JsonProcessingException e) {
            session.sendMessage(INVALID_MESSAGE);
        }
    }

    private void handleProctor(WebSocketSession session, ProctorMessage proctorMessage)
            throws IOException
    {
        switch (proctorMessage) {
            case ProctorMessage.ProctorExamination(String examId) -> {
                Optional<Exam> maybeExam = proctoringService.getProctorableExam(new ExamId(examId), session.getPrincipal());
                if (maybeExam.isPresent()) {
                    Message message = new Message.ExamInfo(maybeExam.get().title());
                    sendJsonMessage(session, message);
                    List<Candidate> candidates = proctoringService.getCandidates(
                            maybeExam.get(),
                            session.getPrincipal());
                    for (Candidate candidate : candidates) {
                        sendJsonMessage(session, new Message.Candidate(candidate.username().principalName()));
                        sendJsonMessage(session, new Message.CandidateRTCOffer(
                                candidate.username().principalName(),
                                new Message.RTCSessionDescription("offer", "sdp")));
                    }
                }
                else {
                    session.sendMessage(ACCESS_DENIED);
                }
            }
        }
    }

    private void sendJsonMessage(WebSocketSession session, Message message)
            throws IOException
    {
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
    }
}
