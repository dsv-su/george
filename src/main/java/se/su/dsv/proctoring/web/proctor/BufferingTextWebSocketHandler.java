package se.su.dsv.proctoring.web.proctor;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class BufferingTextWebSocketHandler extends TextWebSocketHandler {

    private Map<WebSocketSession, StringBuffer> textBuffers = new ConcurrentHashMap<>();

    @Override
    public void handleMessage(final WebSocketSession session, final WebSocketMessage<?> message) throws Exception {
        if (message instanceof TextMessage textMessage) {
            if (textMessage.isLast()) {
                StringBuffer buffer = textBuffers.remove(session);
                if (buffer != null) {
                    buffer.append(textMessage.getPayload());
                    handleTextMessage(session, new TextMessage(buffer.toString()));
                } else {
                    handleTextMessage(session, textMessage);
                }
            } else {
                textBuffers.merge(session, new StringBuffer(textMessage.getPayload()), StringBuffer::append);
            }
        } else {
            super.handleMessage(session, message);
        }
    }

    @Override
    public boolean supportsPartialMessages() {
        return true;
    }
}
