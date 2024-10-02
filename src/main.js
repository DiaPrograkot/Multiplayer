import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Функция для отображения сообщений на экране и их удаления через 5 секунд
function addMessage(message) {
  const messageBox = document.querySelector('.messages');
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
const playerNameContainer = document.getElementById('playerNameContainer');
const playerInput = document.getElementById('playerInput');

if (!playerName) {
  playerNameContainer.style.display = 'flex';

  // Обрабатываем ввод имени
  playerInput.addEventListener('change', (event) => {
    playerName = event.target.value;
    localStorage.setItem('name', playerName);
  });
}

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Отправка имени другим игрокам
const [sendName, getName] = room.makeAction('playerName');
const [sendCursor, getCursor] = room.makeAction('playerCursor');

// Обработка новых игроков
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendName(playerName); // Отправляем свое имя
  addMessage(`${peerId} joined the game`);
});

// Обработка выхода игроков
room.onPeerLeave(peerId => {
  console.log(`${peerId} left`);
  addMessage(`${peerId} left the game`);
  removeCursor(peerId); // Удаляем курсор игрока
});

// Получение имени других игроков
const players = {};

getName((name, peerId) => {
  console.log(`${name} joined the game (ID: ${peerId})`);
  players[peerId] = { name }; // Сохраняем имя игрока
  createCursor(peerId, name); // Создаем курсор для нового игрока
});

// Пример использования selfId
console.log(`My information (${playerName}, ${selfId})`);

// Создаем курсор для каждого игрока
function createCursor(peerId, name) {
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  cursor.id = `cursor-${peerId}`;

  const nameTag = document.createElement('div');
  nameTag.classList.add('cursor-name');
  nameTag.textContent = name;
 img.src="img/cursor-removebg-preview.png"

  cursor.appendChild(nameTag);
  document.body.appendChild(cursor);
  console.log(`Creating cursor for ${name} (ID: ${peerId})`); // Отладочный вывод
}

// Удаляем курсор игрока
function removeCursor(peerId) {
  const cursor = document.getElementById(`cursor-${peerId}`);
  if (cursor) {
    cursor.remove();
  }
}

// Обновляем позицию курсора
function updateCursor(peerId, x, y) {
  const cursor = document.getElementById(`cursor-${peerId}`);
  if (cursor) {
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  }
}

// Отправляем текущие координаты курсора
document.addEventListener('mousemove', (event) => {
  const { clientX: x, clientY: y } = event;
  sendCursor({ x, y });
  updateCursor(selfId, x, y); // Обновляем свой собственный курсор
});

// Получаем координаты курсоров других игроков
getCursor(({ x, y }, peerId) => {
  updateCursor(peerId, x, y); // Обновляем курсоры других игроков
});
// Обработчики событий
addEventListener('mousemove', ({ clientX, clientY }) => {
  const mouseX = clientX / innerWidth;
  const mouseY = clientY / innerHeight;
  createCursor([mouseX, mouseY], selfId);
  
});