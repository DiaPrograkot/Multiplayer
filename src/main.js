import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id',
};

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id');

// Получаем имя игрока из localStorage или создаем временное
let playerName = localStorage.getItem('name') || `Player ${selfId.substring(0, 4)}`;
console.log(`My name is: ${playerName}`);

// Отправляем имя другим игрокам
const [sendName, getName] = room.makeAction('playerName');

// Хранилище имен игроков
let playerNames = {};

// Когда игрок присоединяется
room.onPeerJoin(name, peerId => {
  console.log(`Received name "${name}" from peer ID: ${peerId}`);

  // Отправляем своё имя сразу после присоединения
  sendName(playerName);
});

// Получаем имена других игроков
getName((name, peerId) => {
  console.log(`Received name "${name}" from peer ID: ${peerId}`);
  playerNames[peerId] = name;
});

// Когда игрок выходит
room.onPeerLeave(peerId => {
  const name = playerNames[peerId] || peerId;
  console.log(`${name} left the game`);
  delete playerNames[peerId];
});

// Выводим своё имя и ID в консоль
console.log(`My peer ID is ${selfId}, my name is ${playerName}`);

