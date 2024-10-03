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
const cursors = {};
const players = {};
console.log(`My information (${playerName}, ${selfId})`);

// Обработка новых игроков
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendName(playerName); // Отправляем свое имя
});

// Обработка выхода игроков
room.onPeerLeave(peerId => {
  const player = players[peerId]; // Находим игрока по peerId
  if (player) {
    console.log(`${player.name} left`); // Показываем имя игрока, который вышел
    addMessage(`${player.name} left the game`); // Показываем сообщение с именем игрока
    removeCursor(peerId); // Удаляем курсор игрока
    delete players[peerId]; // Удаляем игрока из списка
  }
}); 

getName((name, peerId) => {
  if (!players[peerId]) {
    players[peerId] = { name }; // Сохраняем имя игрока
    console.log(`${name} joined`); // Показываем имя игрока в консоли
    addMessage(`${name} joined the game`); // Выводим сообщение о входе игрока
    
    // Если это ваш идентификатор, используем ваше имя
    if (peerId === selfId) {
      createCursor(peerId, playerName); // Создаем курсор с текстом "you" для себя
    } else {
      createCursor(peerId, name); // Создаем курсор для других игроков с их именем
    }
  }
});

function createCursor(peerId, playerName) {
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  cursor.id = `cursor`;

  const nameTag = document.createElement('div');
  nameTag.classList.add('cursor-name');
  nameTag.textContent = (peerId === selfId) ? 'Ты' : playerName; // Если это вы, показываем "Ты", иначе - имя игрока

  // Убедитесь, что имя добавляется в курсор
  cursor.appendChild(nameTag);
  document.body.appendChild(cursor);
  cursors[peerId] = cursor; // Сохраняем курсор в объект cursors
}

// Функция работы с курсорами
function moveCursor([x, y], id) {
  const el = cursors[id];
  if (el) {
    el.style.left = `${x * innerWidth}px`;
    el.style.top = `${y * innerHeight}px`;
  }
}

// Отправляем текущие координаты курсора
document.addEventListener('mousemove', (event) => {
  const { clientX, clientY } = event;
  const x = clientX / innerWidth; // Нормализуем координату X
  const y = clientY / innerHeight; // Нормализуем координату Y
  sendCursor({ x, y });
  moveCursor([x, y], selfId); // Обновляем только свой курсор
});

// Получаем координаты курсоров других игроков
getCursor(({ x, y }, peerId) => {
  moveCursor([x, y], peerId); // Обновляем курсоры других игроков
}); 

// Функция для удаления курсора
function removeCursor(peerId) {
  const cursor = cursors[peerId]; // Находим курсор по peerId
  if (cursor) {
    document.body.removeChild(cursor); // Удаляем курсор из DOM
    delete cursors[peerId]; // Удаляем курсор из объекта cursors
  }
}
