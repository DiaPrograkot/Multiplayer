import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Функция для отображения сообщений на экране и их удаления через 5 секунд
function addMessage(message) {
  const messageBox = document.querySelector('.messages'); // Элемент с классом "messages"
  const newMessage = document.createElement('div');
  newMessage.textContent = message;
  messageBox.appendChild(newMessage);

  // Удаляем сообщение через 5 секунд
  setTimeout(() => {
    messageBox.removeChild(newMessage);
  }, 5000);
}

// Проверяем наличие имени в localStorage и запрашиваем, если его нет
let playerName = localStorage.getItem('name');

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Отправка имени другим игрокам
const [sendName, getName] = room.makeAction('playerName');

// Обработка события присоединения другого игрока
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  if (playerName) {
    sendName(playerName); // Отправляем свое имя другим игрокам
  }
});

// Обработка выхода других игроков
room.onPeerLeave(peerId => {
  console.log(`${peerId} left`);
  addMessage(`${playerName} left the game`); // Сообщение о выходе игрока
});

// Получение имени других игроков
getName((name, peerId) => {
  console.log(`${name} joined the game (ID: ${peerId})`);
  addMessage(`${name} joined the game`); // Сообщение о входе игрока
});

// Обрабатываем ввод имени только после инициализации комнаты
if (!playerName) {
  playerNameContainer.style.display = 'flex';
  playerInput.addEventListener('change', (event) => {
    playerName = event.target.value;
    localStorage.setItem('name', playerName); // Сохраняем имя в localStorage
    playerNameContainer.style.display = 'none';
    sendName(playerName); // Отправляем имя после его ввода
  });
} else {
  sendName(playerName); // Если имя уже есть, отправляем его сразу
}

// Пример использования selfId
const personalId = selfId; // Переносим личный идентификатор после его определения
console.log(`My information (${playerName}, ${personalId})`);



