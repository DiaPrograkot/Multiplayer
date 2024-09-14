import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Получаем имя игрока из localStorage
let playerName = localStorage.getItem('name');

// Если имени нет, используем selfId как fallback
if (!playerName) {
  playerName = `Player ${selfId.substring(0, 4)}`;
  localStorage.setItem('name', playerName);
}

// Отправка имени другим игрокам
const [sendName, getName] = room.makeAction('playerName');

// Отправляем имя при подключении
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendName(playerName); // Отправляем свое имя
});

// Получение имени других игроков
getName((nameStorage, peerId) => {
  console.log(`${nameStorage} joined the game (ID: ${peerId})`);
});

// Пример использования selfId
console.log(`My peer ID is ${selfId}, my name is ${nameStorage}`);

room.onPeerJoin(peerId => {
  if (nameStorage) {
    console.log(`${nameStorage} joined`);
  } else {
    console.log(`${peerId} joined`);
  }
});

room.onPeerLeave(peerId => {
  if (nameStorage) {
    console.log(`${nameStorage} left`);
  } else {
    console.log(`${peerId} left`);
  }
});
