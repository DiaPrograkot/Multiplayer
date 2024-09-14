import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Получаем имя игрока из localStorage или создаем временное
let playerName = localStorage.getItem('name') || `Player ${selfId.substring(0, 4)}`;

// Отправляем имя другим игрокам
const [sendName, getName] = room.makeAction('playerName');

// Создаем объект для хранения имен всех игроков
let playerNames = {};

// Отправляем свое имя сразу после присоединения
room.onPeerJoin(peerId => {
  console.log(`Peer ID ${peerId} joined`); // временно оставим для отладки
  sendName(playerName); // Отправляем свое имя при подключении
});

// Получаем имена других игроков и сохраняем их
getName((name, peerId) => {
  playerNames[peerId] = name;
  console.log(`${name} joined the game (ID: ${peerId})`);
});

// Обработка выхода игрока
room.onPeerLeave(peerId => {
  const name = playerNames[peerId] || peerId; // Если имя известно, выводим его, иначе показываем peerId
  console.log(`${name} left the game (ID: ${peerId})`);
  delete playerNames[peerId]; // Удаляем игрока из списка
});

// Выводим свое имя в консоль
console.log(`My peer ID is ${selfId}, my name is ${playerName}`);
