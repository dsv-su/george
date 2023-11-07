package se.su.dsv.proctoring.web.proctor;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.PingMessage;
import org.springframework.web.socket.PongMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import se.su.dsv.proctoring.services.ProctoringService;

public class ProctorWebSocketHandler implements WebSocketHandler {
    private final ProctoringService proctoringService;

    public ProctorWebSocketHandler(final ProctoringService proctoringService) {
        this.proctoringService = proctoringService;
    }

    @Override
    public void afterConnectionEstablished(final WebSocketSession session) throws Exception {
        if (session.getPrincipal() == null) {
            // only authenticated users can open a websocket connection
            session.close(CloseStatus.POLICY_VIOLATION);
        }
    }

    @Override
    public void handleMessage(final WebSocketSession session, final WebSocketMessage<?> message) throws Exception {
        if (message instanceof PingMessage pingMessage) {
            session.sendMessage(new PongMessage(pingMessage.getPayload()));
        }
    }

    @Override
    public void handleTransportError(final WebSocketSession session, final Throwable exception) throws Exception {
    }

    @Override
    public void afterConnectionClosed(final WebSocketSession session, final CloseStatus closeStatus) throws Exception {
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }
}
