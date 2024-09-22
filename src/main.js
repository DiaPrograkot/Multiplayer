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

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Отправка имени другим игрокам
const [sendName, getName] = room.makeAction('playerName');

// Список подключенных игроков
const connectedPlayers = new Set();

// Отправляем имя при подключении
room.onPeerJoin(peerId => {
  if (!connectedPlayers.has(peerId)) { // Проверяем, что игрок еще не в списке
    connectedPlayers.add(peerId); // Добавляем нового игрока в список
    if (peerId !== selfId) { // Проверка, что это не сам игрок
      console.log(`${peerId} joined`);
      sendName(playerName); // Отправляем свое имя
      addMessage(`${playerName} has joined the game`);
    }
  }
});

// Обработка выхода других игроков
room.onPeerLeave(peerId => {
  if (connectedPlayers.has(peerId)) { // Проверяем, что игрок есть в списке
    connectedPlayers.delete(peerId); // Удаляем игрока из списка
    console.log(`${peerId} left`);
    addMessage(`Player ${peerId} has left the game`);
  }
});

// Получение имени других игроков
getName((name, peerId) => {
  if (!connectedPlayers.has(peerId)) { // Проверяем, что игрок еще не в списке
    connectedPlayers.add(peerId); // Добавляем нового игрока в список
    if (peerId !== selfId) { // Проверка, что это не сам игрок
      console.log(`${name} joined the game (ID: ${peerId})`);
      addMessage(`${name} joined the game`);
    }
  }
});

// Пример использования selfId
console.log(`My peer ID is ${selfId}, my name is ${playerName}`);
