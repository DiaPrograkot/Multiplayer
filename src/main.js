import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Элементы интерфейса
const canvas = document.getElementById('canvas');
const messageBox = document.querySelector('.messages');
const peerInfo = document.getElementById('peer-info'); 
const playerNameContainer = document.getElementById('player-name-container');
const playerInput = document.getElementById('player-input');

// Массив с изображениями астероидов
const shapes = [
  'img/asteroid-purple.svg',
  'img/green-asteroid.svg',
  'img/orange-meteorite.svg',
  'img/asteroid-black.svg',
  'img/rock.svg',
  'img/meteorite-white.svg',
  'img/lightorange-asteroid.svg',
  'img/rocky-asteroid.svg',
  'img/purple-asteroid.svg',
];

// Выбираем случайный астероид для игрока
function getRandomAsteroid() {
  const randomIndex = Math.floor(Math.random() * shapes.length);
  return shapes[randomIndex];
}

let playerName = localStorage.getItem('name');
if (!playerName) {
  playerNameContainer.style.display = 'flex';
  playerInput.addEventListener('change', (event) => {
    playerName = event.target.value;
    localStorage.setItem('name', playerName); // Сохраняем имя в localStorage
  });
}

const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Отправка и получение данных игрока
const [sendName, getName] = room.makeAction('playerName');
const [sendMousePos, getMousePos] = room.makeAction('mousePos');
const [sendAsteroid, getAsteroid] = room.makeAction('asteroid');

// Создание и отображение сообщений
function addMessage(message) {
  const newMessage = document.createElement('div');
  newMessage.textContent = message;
  messageBox.appendChild(newMessage); 
  setTimeout(() => {
    messageBox.removeChild(newMessage);
  }, 5000);
}

// Логика подключения и отключения игроков
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendName(playerName); // Отправляем свое имя другим игрокам
  addCursor(peerId); // Добавляем курсор для нового игрока
});

room.onPeerLeave(peerId => {
  console.log(`${peerId} left`);
  addMessage(`${playerName} left the game`);
  removeCursor(peerId); // Удаляем курсор, когда игрок выходит
});

getName((name, peerId) => {
  console.log(`${name} joined the game (ID: ${peerId})`);
  addMessage(`${name} joined the game`);
});

// Пример использования selfId
console.log(`My information (${playerName}, ${selfId})`);

// Курсоры игроков
const cursors = {};
let playerAsteroid = getRandomAsteroid(); // Случайный астероид для текущего игрока

// Добавляем курсор (астероид) на экран
function addCursor(peerId) {
  const el = document.createElement('div');
  const img = document.createElement('img');
  const txt = document.createElement('p');

  el.className = `cursor`;
  el.style.left = el.style.top = '-99px'; // Начальное положение
  img.src = peerId === selfId ? playerAsteroid : 'shapes'; // Используем собственный астероид для себя
  txt.innerText = peerId === selfId ? 'you' : peerId.slice(0, 4); // Подпись курсора

  el.appendChild(img);
  el.appendChild(txt);
  canvas.appendChild(el); // Добавляем курсор на канвас
  cursors[peerId] = el;

  // Отправляем информацию о своем астероиде другим игрокам
  if (peerId === selfId) {
    sendAsteroid(playerAsteroid);
  }
}

// Удаляем курсор игрока
function removeCursor(peerId) {
  if (cursors[peerId]) {
    canvas.removeChild(cursors[peerId]);
    delete cursors[peerId];
  }
}

// Движение курсора
document.addEventListener('mousemove', (event) => {
  const mousePos = { x: event.clientX / innerWidth, y: event.clientY / innerHeight };
  if (cursors[selfId]) {
    cursors[selfId].style.left = `${mousePos.x * innerWidth}px`;
    cursors[selfId].style.top = `${mousePos.y * innerHeight}px`;
  }
  sendMousePos(mousePos); // Отправляем позицию мыши другим игрокам
});

// Получение движения мыши от других игроков
getMousePos((mousePos, peerId) => {
  const cursor = cursors[peerId];
  if (cursor) {
    cursor.style.left = `${mousePos.x * innerWidth}px`;
    cursor.style.top = `${mousePos.y * innerHeight}px`;
  }
});

// Получение астероидов от других игроков
getAsteroid((asteroid, peerId) => {
  const cursor = cursors[peerId];
  if (cursor) {
    cursor.querySelector('img').src = asteroid; // Меняем изображение астероида
  }
});

// Обновление информации о пирах
function updatePeerInfo() {
  const count = Object.keys(room.getPeers()).length;
  peerInfo.innerHTML = count
    ? `Right now <em>${count}</em> other peer${count === 1 ? ' is' : 's are'} connected with you.`
    : 'No peers connected.';
}
