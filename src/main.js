import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Получаем имя игрока из localStorage или создаем временное
let playerName = localStorage.getItem('name') || `Player ${selfId.substring(0, 4)}`;
console.log(`My name is: ${playerName}`);  // Проверяем, что имя получено корректно

// Отправляем имя другим игрокам
const [sendName, getName] = room.makeAction('playerName');

// Объект для хранения имен всех игроков
let playerNames = {};

// Отправляем свое имя после присоединения к комнате
room.onPeerJoin(peerId => {
  console.log(`Peer ID ${peerId} joined`);  // Временная отладка
  sendName(playerName);  // Отправляем свое имя новым игрокам
});

// Получаем имена других игроков
getName((name, peerId) => {
  playerNames[peerId] = name;
  console.log(`Received name: ${name} from peer ID: ${peerId}`);  // Проверка получения имени
});

// Обработка выхода игрока
room.onPeerLeave(peerId => {
  const name = playerNames[peerId] || peerId;  // Если имя известно, выводим его, иначе ID
  console.log(`${name} left the game (ID: ${peerId})`);
  delete playerNames[peerId];  // Удаляем игрока из списка
});

// Проверка отправки имени самого игрока
console.log(`My peer ID is ${selfId}, my name is ${playerName}`);
