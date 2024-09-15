import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
  // Другие конфигурационные параметры, если они требуются
};

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Извлечение имени игрока из localStorage
const nameStorage = localStorage.getItem("name");

// Объект для хранения имен игроков
const peerNames = {};

// Обработчик для события присоединения нового пира
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
});

// Обработчик для события ухода пира
room.onPeerLeave(peerId => {
  console.log(`${peerNames[peerId] || peerId} left`);
});

// Обработчик для события получения потока от пира
room.onPeerStream((stream, peerId) => {
  const video = document.createElement('video');
  video.srcObject = stream;
  video.autoplay = true;
  document.body.appendChild(video);
});

// Пример использования пользовательских действий
const [sendMessage, getMessage] = room.makeAction('message');
const [sendName, getName] = room.makeAction('name');

// Отправка имени при подключении
if (nameStorage) {
  sendName(nameStorage);
  console.log(`Sent name: ${nameStorage}`);
} else {
  console.error('Name not found in localStorage');
}

// Получение имени
getName((name, peerId) => {
  peerNames[peerId] = name;
  console.log(`Received name: ${name} from ${peerId}`);
  console.log(`${name} joined`);
});

// Отправка сообщения
sendMessage('Hello, world!');

// Получение сообщения
getMessage((message, peerId) => {
  console.log(`Received message from ${peerNames[peerId] || peerId}: ${message}`);
});

// Пример использования selfId
console.log(`My peer ID is ${selfId}`);
