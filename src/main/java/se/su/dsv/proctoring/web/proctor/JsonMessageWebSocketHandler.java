package se.su.dsv.proctoring.web.proctor;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;

public abstract class JsonMessageWebSocketHandler<Inbound> extends BufferingTextWebSocketHandler {
    private final ObjectMapper objectMapper;
    private final Class<Inbound> inboundMessageType;

    protected JsonMessageWebSocketHandler(ObjectMapper objectMapper, Class<Inbound> inboundMessageType) {
        this.objectMapper = objectMapper;
        this.inboundMessageType = inboundMessageType;
    }

    /**
     * Attempts to parse the incoming message as JSON of type {@link Inbound} and calls
     * {@link #handleJsonMessage(WebSocketSession, Inbound)} if successful.
     * <p>
     * If parsing fails the method {@link #onInvalidMessage(WebSocketSession, JacksonException, TextMessage)}
     * is called with the error allowing customizing error handling. By default, it does nothing.
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message)
            throws Exception
    {
        try {
            Inbound inboundMessage = objectMapper.readValue(message.getPayload(), inboundMessageType);
            handleJsonMessage(session, inboundMessage);
        } catch (JacksonException e) {
            onInvalidMessage(session, e, message);
        }
    }

    protected void onInvalidMessage(WebSocketSession session, JacksonException exception, TextMessage message)
            throws Exception
    {
    }

    protected abstract void handleJsonMessage(WebSocketSession session, Inbound message) throws Exception;

    protected void sendJsonMessage(WebSocketSession session, Object message)
            throws IOException
    {
        try {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
        } catch (JacksonException e) {
            throw new IOException(e);
        }
    }
}
