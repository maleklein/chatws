package org.example.chatws.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final String TOPIC = "/topic";
    private static final String QUEUE = "/queue";
    private static final String APP = "/app";
    private static final String ENDPOINT = "/chat";

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Antes: broker en memoria
        // config.enableSimpleBroker(TOPIC, QUEUE);

        // Ahora: RabbitMQ (plugin STOMP en el puerto 61613) hace de broker externo
        config.enableStompBrokerRelay(TOPIC, QUEUE)
                .setRelayHost("localhost")
                .setRelayPort(61613);
        // Mensajes del cliente a /app/* van a los @MessageMapping del controller
        config.setApplicationDestinationPrefixes(APP);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Punto de conexión WebSocket, con SockJS como fallback
        registry.addEndpoint(ENDPOINT).setAllowedOriginPatterns("*").withSockJS();
    }
}
