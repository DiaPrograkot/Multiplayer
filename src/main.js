import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Получаем имя игрока из localStorage
let playerName = localStorage.getItem('name') || `Player ${selfId.substring(0, 4)}`;

// Отправляем имя другим игрокам
const [sendName, getName] = room.makeAction('playerName');

// Отправляем имя сразу после присоединения
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`); // временно оставим для проверки
  sendName(playerName); // отправляем свое имя при подключении
});

// Получаем имена других игроков при их присоединении
getName((name, peerId) => {
  console.log(`${name} joined the game (ID: ${peerId})`);
});

// Выводим свое имя в консоль
console.log(`My peer ID is ${selfId}, my name is ${playerName}`);
