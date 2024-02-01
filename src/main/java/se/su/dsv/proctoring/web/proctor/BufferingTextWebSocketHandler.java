package se.su.dsv.proctoring.web.proctor;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * A {@link TextWebSocketHandler} that buffers messages until the last message in a series of messages is received.
 * This is to support very large messages that are split into multiple parts.
 */
public class BufferingTextWebSocketHandler extends TextWebSocketHandler {

    private Map<WebSocketSession, StringBuffer> textBuffers = new ConcurrentHashMap<>();

    /**
     * Check if the message is a TextMessage, if it is, check if it is the last message in a series of messages.
     * If it is not the last message, add the message to the buffer. If it is the last message, remove the buffer
     * and handle the message.
     *
     * @param session {@inheritDoc}
     * @param message {@inheritDoc}
     * @throws Exception {@inheritDoc}
     */
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

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean supportsPartialMessages() {
        return true;
    }
}
