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
}npx

 // Удаляем сообщение через 5 секунд
 setTimeout(() => {
  messageBox.removeChild(newMessage);
}, 5000); // 5000 миллисекунд = 5 секунд

// Проверяем наличие имени в localStorage и запрашиваем, если его нет
let playerName = localStorage.getItem('name');
if (!playerName) {
  playerName = prompt("Введите ваше имя:"); // Запрашиваем имя у игрока
  while (!playerName) { // Убедимся, что имя введено
    playerName = prompt("Имя не может быть пустым. Введите ваше имя:");
  }
  localStorage.setItem('name', playerName); // Сохраняем имя в localStorage
}

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Отправка имени другим игрокам
const [sendName, getName] = room.makeAction('playerName');

// Отправляем имя при подключении
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendName(playerName); // Отправляем свое имя
  addMessage(`${playerName} has joined the game`);
});

// Обработка выхода других игроков
room.onPeerLeave(peerId => {
  console.log(`${peerId} left`);
  addMessage(`Player ${peerId.substring(0, 4)} has left the game`);
});

// Получение имени других игроков
getName((name, peerId) => {
  console.log(`${name} joined the game (ID: ${peerId})`);
  addMessage(`${name} joined the game (ID: ${peerId.substring(0, 4)})`);
});

// Пример использования selfId
console.log(`My peer ID is ${selfId}, my name is ${playerName}`);
