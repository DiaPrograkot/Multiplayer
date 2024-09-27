import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

let nameStorage = localStorage.getItem('name'); // Получаем никнейм игрока или null, если нет
let peers = {}; // Для хранения никнеймов других участников

// Создаем действия для передачи никнеймов и сообщений
const [sendName, receiveName] = room.makeAction('setName');
const [sendMessage, getMessage] = room.makeAction('message');

// Функция отправки никнейма после его ввода
const submitNickname = () => {
  const playerName = localStorage.getItem('name'); // После сохранения имени в localStorage
  if (playerName) {
    nameStorage = playerName; // Обновляем переменную
    sendName(nameStorage); // Отправляем свое имя всем остальным
    console.log(`Your name is ${nameStorage} and was sent to others`); // Логируем факт отправки имени
  }
};

// Обработка присоединения нового участника
room.onPeerJoin(peerId => {
  if (nameStorage) {
    // Если текущий пользователь уже имеет имя, отправляем его
    sendName(nameStorage); 
  }

  console.log(`Peer ${peerId} joined. Known name: ${peers[peerId]}`); // Логируем, был ли у участника никнейм

  if (peers[peerId]) {
    // Если у участника уже есть имя, выводим его
    console.log(`${peers[peerId]} joined`);
  } else {
    // Сохраняем участника в объекте без имени и ждем его ввода
    peers[peerId] = null;
    console.log(`${peerId} joined. Waiting for them to provide their name...`);
  }
});

// Получаем никнеймы от других участников
receiveName((playerName, peerId) => {
  console.log(`Received name "${playerName}" from peer ${peerId}`); // Логируем получение никнейма

  if (playerName) {
    // Если имя получено, обновляем его в объекте и выводим
    peers[peerId] = playerName;
    console.log(`${playerName} joined`);
  } else {
    console.log(`Failed to receive name from peer ${peerId}`);
  }
});

// Обработка выхода участника
room.onPeerLeave(peerId => {
  console.log(`Peer ${peerId} is leaving. Known name: ${peers[peerId]}`); // Логируем выход участника
  // При выходе выводим никнейм, если он есть, иначе peerId
  console.log(`${peers[peerId] || peerId} left`);
  delete peers[peerId]; // Удаляем никнейм при выходе
});

// Если имени нет, ждем его ввода
if (!nameStorage) {
  // Следим за моментом, когда игрок вводит имя (например, нажатие на кнопку "Play")
  document.getElementById('playerPlay').addEventListener('click', submitNickname);
} else {
  // Если имя уже есть, сразу отправляем его при подключении
  sendName(nameStorage);
}

// Получаем сообщения от других участников
getMessage((message, peerId) => {
  console.log(`${peers[peerId] || peerId}: ${message}`);
});

// Пример использования selfId
console.log(`My peer ID is ${selfId}`);