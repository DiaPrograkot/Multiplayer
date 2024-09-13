import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
  // Другие конфигурационные параметры, если они требуются
};

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Пример использования функции joinRoom
room.onPeerJoin(peerId => console.log(`${peerId} joined`));
room.onPeerLeave(peerId => console.log(`${peerId} left`));
room.onPeerStream((stream, peerId) => {
  const video = document.createElement('video');
  video.srcObject = stream;
  video.autoplay = true;
  document.body.appendChild(video);
});

// Пример использования пользовательских действий
const [sendMessage, getMessage] = room.makeAction('message');

// Отправка сообщения
sendMessage('Hello, world!');

// Получение сообщения
getMessage((message, peerId) => {
  console.log(`Received message from ${peerId}: ${message}`);
});

// Пример использования selfId
console.log(`My peer ID is ${selfId}`);