let stompClient = null;

function connect() {
    const serverIp = document.getElementById('serverIp').value;

    // Si ya había una conexión abierta, la cerramos para no suscribirnos dos veces
    if (stompClient !== null) {
        stompClient.disconnect();
        stompClient = null;
    }

    const socket = new SockJS('http://' + serverIp + ':8080/chat');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/public', function (message) {
            showMessage(JSON.parse(message.body));
        });
    }, function (error) {
        console.error('Error de conexion: ' + error);
        setConnected(false);
    });
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
        stompClient = null;
    }
    setConnected(false);
    console.log("Disconnected");
}

function setConnected(connected) {
    const status = document.getElementById('status');
    if (connected) {
        status.className = 'connected';
        status.textContent = 'Conectado';
    } else {
        status.className = 'disconnected';
        status.textContent = 'Desconectado';
    }
    document.getElementById('message').disabled = !connected;
}

function sendMessage() {
    const username = document.getElementById('username').value;
    const content = document.getElementById('message').value;
    
    if (content.trim() === '') return;
    
    if (stompClient === null || !stompClient.connected) return;

    stompClient.send('/app/chat.sendMessage', {}, JSON.stringify({
        usuario: username,
        contenido: content
    }));

    document.getElementById('message').value = '';
}

function showMessage(message) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    const user = document.createElement('strong');
    user.textContent = message.usuario + ': ';
    messageDiv.appendChild(user);
    messageDiv.appendChild(document.createTextNode(message.contenido));
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Allow sending message with Enter key
document.getElementById('message').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
