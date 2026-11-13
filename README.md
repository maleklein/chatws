# Chat WebSocket - Guía para Alumnos

Este proyecto implementa un sistema de chat en tiempo real utilizando **WebSocket** y el protocolo **STOMP** con Spring Boot. A continuación se explica el flujo completo de funcionamiento y los conceptos clave.

## 📝 Descripción del Proyecto

ChatWS es una aplicación de chat en tiempo real que permite a múltiples usuarios conectarse, enviar mensajes y recibir actualizaciones instantáneas sin necesidad de recargar la página. Utiliza una arquitectura basada en eventos donde los mensajes se propagan automáticamente a todos los clientes conectados.

**Tecnologías principales:**
- Spring Boot 4.1.1
- WebSocket para comunicación bidireccional
- STOMP como protocolo de mensajería
- SockJS para compatibilidad con navegadores antiguos
- Jackson para serialización JSON

---

## 🏗️ Arquitectura y Flujo

### Diagrama de Arquitectura

```
┌─────────────────┐         WebSocket          ┌──────────────────┐
│   Cliente Web   │ ◄────────────────────────► │   Servidor       │
│  (Navegador)    │     (ws://localhost:8080)  │   Spring Boot    │
└─────────────────┘                            └──────────────────┘
       │                                                 │
       │ 1. Conexión WebSocket                          │
       │ 2. Suscripción a /topic/public                 │
       │ 3. Envío a /app/chat.sendMessage               │
       │                                                 │
       │                                                 │
       │ 4. Recepción de mensajes                       │
       │    (broadcast desde /topic/public)             │
```

### Flujo Completo de un Mensaje

1. **Conexión:** El cliente web establece una conexión WebSocket con el servidor
2. **Suscripción:** El cliente se suscribe al canal `/topic/public` para recibir mensajes
3. **Envío:** El cliente envía un mensaje a `/app/chat.sendMessage`
4. **Procesamiento:** El `ChatController` recibe el mensaje
5. **Broadcast:** El mensaje se reenvía a todos los suscriptores de `/topic/public`
6. **Recepción:** Todos los clientes conectados reciben el mensaje simultáneamente


---

## 🐇 Migración a RabbitMQ

El broker en memoria (`enableSimpleBroker`) se reemplazó por un **STOMP broker relay** hacia RabbitMQ (`enableStompBrokerRelay` en `WebSocketConfig.java`).

### Cambios realizados

1. **pom.xml:** se agregó `spring-boot-starter-amqp` (y `reactor-netty`, que es el cliente TCP que usa el relay para hablar con RabbitMQ).
2. **WebSocketConfig.java:** `enableSimpleBroker(TOPIC, "/queue")` → `enableStompBrokerRelay(TOPIC, "/queue").setRelayHost("localhost").setRelayPort(61613)`.
3. **application.yaml:** configuración `spring.rabbitmq` (host, puerto 5672, usuario y contraseña `guest`).
4. **RabbitMQ:** se levanta con Docker (`docker-compose.yml`) habilitando el plugin `rabbitmq_stomp`.

### Ventajas frente al broker en memoria

- **Escalabilidad horizontal:** varias instancias de la app comparten los mensajes.
- **Persistencia:** los mensajes no se pierden si se cae el servidor de la app.
- **Alta concurrencia:** mejor rendimiento con muchos usuarios.
- **Features avanzadas:** DLQ, TTL, routing keys, etc.

### Cómo levantarlo

1. Levantar RabbitMQ con el plugin STOMP (requiere Docker):
   ```bash
   docker compose up -d
   ```
   Panel de administración: http://localhost:15672 (usuario `guest`, contraseña `guest`).
2. Levantar la app:
   ```bash
   ./mvnw spring-boot:run
   ```
3. Abrir http://localhost:8080 en dos pestañas y chatear.

### Puertos

| Puerto | Uso |
|--------|-----|
| 5672   | AMQP (`spring-boot-starter-amqp`) |
| 61613  | STOMP, usado por el relay de Spring |
| 15672  | Panel web de RabbitMQ |
