package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import se.su.dsv.proctoring.services.Candidate;
import se.su.dsv.proctoring.services.CandidateService;
import se.su.dsv.proctoring.services.Exam;
import se.su.dsv.proctoring.services.ExamId;
import se.su.dsv.proctoring.services.PrincipalName;
import se.su.dsv.proctoring.services.ProctoringService;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

public class WebSocketsHandler {
    private static final WebSocketMessage<?> ACCESS_DENIED = new TextMessage("{\"type\":\"access_denied\"}");
    private static final WebSocketMessage<?> INVALID_MESSAGE = new TextMessage("{\"type\":\"invalid_message\"}");

    private final ProctoringService proctoringService;
    private final CandidateService candidateService;
    private final ObjectMapper objectMapper;

    private Map<ExamId, Collection<WebSocketSession>> proctorsPerExam = new ConcurrentHashMap<>();

    private Map<PrincipalName, WebSocketSession> connectedProctors = new ConcurrentHashMap<>();
    private Map<PrincipalName, WebSocketSession> connectedCandidates = new ConcurrentHashMap<>();

    private Map<UUID, RTCConnection> rtcConnections = new ConcurrentHashMap<>();
    record RTCConnection(WebSocketSession proctor, WebSocketSession candidate) { }

    public WebSocketsHandler(
            ObjectMapper objectMapper,
            ProctoringService proctoringService,
            CandidateService candidateService)
    {
        this.objectMapper = objectMapper;
        this.proctoringService = proctoringService;
        this.candidateService = candidateService;
    }

    public class ProctorHandler extends JsonMessageWebSocketHandler<InboundMessage> {
        public ProctorHandler() {
            super(objectMapper, InboundMessage.class);
        }

        @Override
        public void afterConnectionEstablished(final WebSocketSession session)
                throws Exception
        {
            if (session.getPrincipal() == null) {
                // only authenticated users can open a websocket connection
                session.close(CloseStatus.POLICY_VIOLATION);
                return;
            }
            connectedProctors.put(new PrincipalName(session.getPrincipal().getName()), session);
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
            for (Collection<WebSocketSession> proctors : proctorsPerExam.values()) {
                proctors.remove(session);
            }
            if (session.getPrincipal() != null) {
                connectedProctors.remove(new PrincipalName(session.getPrincipal().getName()));
            }
        }

        @Override
        protected void onInvalidMessage(WebSocketSession session, JacksonException exception, TextMessage message)
                throws Exception
        {
            session.sendMessage(INVALID_MESSAGE);
        }

        @Override
        protected void handleJsonMessage(WebSocketSession session, InboundMessage inboundMessage)
                throws Exception
        {
            assert session.getPrincipal() != null; // type hint for IntelliJ
            switch (inboundMessage) {
                case InboundMessage.ProctorExamination(String examIdAsString) -> {
                    ExamId examId = new ExamId(examIdAsString);
                    Optional<Exam> maybeExam = proctoringService.getProctorableExam(examId, session.getPrincipal());
                    if (maybeExam.isPresent()) {
                        Message message = new Message.ExamInfo(maybeExam.get().title());
                        sendJsonMessage(session, message);
                        List<Candidate> candidates = proctoringService.getCandidates(
                                maybeExam.get(),
                                session.getPrincipal());
                        for (Candidate candidate : candidates) {
                            sendJsonMessage(session, new Message.Candidate(candidate.principal().getName()));
                        }
                        proctorsPerExam.putIfAbsent(examId, new ConcurrentLinkedQueue<>());
                        proctorsPerExam.get(examId).add(session);
                    }
                    else {
                        session.sendMessage(ACCESS_DENIED);
                    }
                }
                case InboundMessage.ConnectCandidate(String principalName) -> {
                    WebSocketSession candidate = connectedCandidates.get(new PrincipalName(principalName));
                    if (candidate != null) {
                        UUID connectionId = UUID.randomUUID();
                        rtcConnections.put(connectionId, new RTCConnection(session, candidate));
                        sendJsonMessage(session, new Message.ConnectionEstablished(connectionId, principalName));
                        sendJsonMessage(candidate, new CandidateMessage.Outbound.ConnectionRequest(connectionId));
                    }
                }
                case RTCMessage rtcMessage -> {
                    RTCConnection rtcConnection = rtcConnections.get(rtcMessage.connectionId());
                    if (rtcConnection != null) {
                        sendJsonMessage(rtcConnection.candidate(), rtcMessage);
                    }
                }
            }
        }
    }

    public class CandidateHandler extends JsonMessageWebSocketHandler<CandidateMessage.Inbound> {
        public CandidateHandler() {
            super(objectMapper, CandidateMessage.Inbound.class);
        }

        @Override
        public void afterConnectionEstablished(WebSocketSession session)
                throws Exception
        {
            if (session.getPrincipal() == null) {
                session.close(CloseStatus.POLICY_VIOLATION);
            }
            connectedCandidates.put(new PrincipalName(session.getPrincipal().getName()), session);
        }

        @Override
        public void afterConnectionClosed(final WebSocketSession session, final CloseStatus status) {
            if (session.getPrincipal() != null) {
                connectedCandidates.remove(new PrincipalName(session.getPrincipal().getName()));
            }
        }

        @Override
        protected void onInvalidMessage(WebSocketSession session, JacksonException exception, TextMessage message)
                throws Exception
        {
            session.sendMessage(INVALID_MESSAGE);
        }

        @Override
        protected void handleJsonMessage(WebSocketSession session, CandidateMessage.Inbound inboundMessage)
                throws IOException
        {
            assert session.getPrincipal() != null; // type hint for IntelliJ, enforced on connection opened
            switch (inboundMessage) {
                case CandidateMessage.Inbound.Joined(String examIdAsString) -> {
                    ExamId examId = new ExamId(examIdAsString);
                    if (candidateService.canTake(examId, session.getPrincipal())) {
                        Collection<WebSocketSession> proctors =
                                WebSocketsHandler.this.proctorsPerExam.getOrDefault(examId, List.of());
                        // TODO: get only the correct proctor
                        for (WebSocketSession proctor : proctors) {
                            sendJsonMessage(proctor, new Message.CandidateJoined(session.getPrincipal().getName()));
                        }
                    }
                }
                case RTCMessage rtcMessage -> {
                    RTCConnection rtcConnection = rtcConnections.get(rtcMessage.connectionId());
                    if (rtcConnection != null) {
                        sendJsonMessage(rtcConnection.proctor(), rtcMessage);
                    }
                }
            }
        }
    }
}
