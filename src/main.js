import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Получаем имя игрока из localStorage
let playerName = localStorage.getItem('name');

// Если имени нет, используем selfId как временное имя
if (!playerName) {
  playerName = `Player ${selfId.substring(0, 4)}`;
}

// Отправка имени другим игрокам
const [sendName, getName] = room.makeAction('playerName');

// Функция для обновления имени и отправки другим игрокам
const updatePlayerName = (newName) => {
  playerName = newName;
  localStorage.setItem('name', newName);
  sendName(playerName); // Отправляем обновленное имя другим игрокам
  console.log(`My updated name is ${playerName}`);
};

// Отправляем временное имя при подключении
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendName(playerName); // Отправляем имя (или ID если имя не введено)
});

// Обработчик ввода имени
const playerPlay = document.getElementById('playButton'); // Кнопка для подтверждения имени
const playerInput = document.getElementById('nameInput'); // Поле для ввода имени

playerPlay.addEventListener('click', () => {
  const newPlayerName = playerInput.value.trim();
  if (newPlayerName) {
    updatePlayerName(newPlayerName); // Обновляем имя и отправляем другим игрокам
  }
});

// Получение имени других игроков
getName((name, peerId) => {
  console.log(`${name} joined the game (ID: ${peerId})`);
});

// Пример использования selfId
console.log(`My peer ID is ${selfId}, my name is ${playerName}`);
