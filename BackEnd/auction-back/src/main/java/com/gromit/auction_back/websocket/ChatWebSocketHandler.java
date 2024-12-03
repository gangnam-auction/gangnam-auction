package com.gromit.auction_back.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.time.LocalDateTime;
import java.util.*;

public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final Set<WebSocketSession> sessions = Collections.synchronizedSet(new HashSet<>());
    private static final ObjectMapper mapper = new ObjectMapper(); // For mapping JSON to Message object

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("Connected: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        System.out.println("Received: " + message.getPayload());
        String payload = message.getPayload();
        Message msg = mapper.registerModule(new JavaTimeModule()).readValue(payload, Message.class);

        if ("admin".equals(msg.getType()) && "ban".equals(msg.getAction()))
        {
            // Ban action - Suspend the user for 7 days
            String nickname = msg.getTarget();
            LocalDateTime isSuspended = msg.getIsSuspended();

            // Update the user's suspension in the database
            updateUserSuspension(nickname, isSuspended);
            System.out.println(nickname + isSuspended);

        }
        else if ("admin".equals(msg.getType()) && "unban".equals(msg.getAction()))
        {
            // Ban action - Suspend the user for 7 days
            String nickname = msg.getTarget();

            // Update the user's suspension in the database
            updateUserSuspension(nickname, null);
        }
        synchronized (session) {
            for (WebSocketSession session2 : sessions) {
                if (!session2.equals(session)) {
                    if ("join".equals(msg.getType())) {
                        session2.sendMessage(new TextMessage("Joined: " + msg.getNickname()));
                    } else if ("leave".equals(msg.getType())) {
                        session2.sendMessage(new TextMessage("Left: " + msg.getNickname()));
                    } else if ("message".equals(msg.getType())) {
                        session2.sendMessage(new TextMessage(msg.getNickname() + ": " + msg.getMessage()));
                    }
                }
            }
        }
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private void updateUserSuspension(String nickname, LocalDateTime suspensionEndTime) {
        String sql = "UPDATE users SET isSuspended = ? WHERE nickname = ?";

        // Log the query and parameters to confirm
        System.out.println("Executing query: " + sql);
        System.out.println("With parameters: " + suspensionEndTime + ", " + nickname);

        try {
            int rowsAffected = jdbcTemplate.update(sql, suspensionEndTime, nickname);
            System.out.println("Rows affected: " + rowsAffected); // Should be 1 if successful
        } catch (Exception e) {
            System.out.println("Error executing update: " + e.getMessage());
            e.printStackTrace();
        }
    }


    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.out.println("Error: " + session.getId());
        exception.printStackTrace();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        System.out.println("Disconnected: " + session.getId());
    }
}
