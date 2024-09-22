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
if (!playerName) {
  playerNameContainer.style.display = 'flex';
  // Обрабатываем ввод имени
  playerInput.addEventListener('change', (event) => {
    playerName = event.target.value;
    localStorage.setItem('name', playerName); // Сохраняем имя в localStorage
  });
}

// Обработка присоединения к комнате и синхронизации с игроками
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Отправка имени другим игрокам
const [sendName, getName] = room.makeAction('playerName');

// Список уже полученных игроков
const receivedPlayers = new Set();

// Отправляем имя новым игрокам при их подключении
room.onPeerJoin(peerId => {
  if (peerId !== selfId) {
    sendName(playerName); // Отправляем свое имя новому игроку
    console.log(`${peerId} joined`);
    addMessage(`A new player has joined the game.`);
  }
});

// Обрабатываем выход игроков
room.onPeerLeave(peerId => {
  if (receivedPlayers.has(peerId)) {
    receivedPlayers.delete(peerId); // Удаляем игрока из списка
    addMessage(`Player ${peerId} has left the game`);
  }
});

// Получение имени от других игроков
getName((name, peerId) => {
  if (!receivedPlayers.has(peerId) && peerId !== selfId) { // Проверяем, что это новый игрок
    receivedPlayers.add(peerId); // Добавляем игрока в список
    console.log(`${name} joined the game (ID: ${peerId})`);
    addMessage(`${name} joined the game`);
  }
});

// Пример использования selfId
console.log(`My peer ID is ${selfId}, my name is ${playerName}`);
