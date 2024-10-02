import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId
console.log('Комната инициализирована:', room);

const cursors = {};
const peerNames = {};
let sendMove, getMove, sendName, getName;
let playerName = localStorage.getItem('name')?.trim();
let mouseX = 0, mouseY = 0;
let canvas = null;
const peerInfo = document.getElementById('peer-info');
const noPeersCopy = peerInfo ? peerInfo.innerText : 'No peers connected';

// Инициализация комнаты и событий
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('canvas');
  if (canvas) {
    initRoom();
    addCursor(selfId, true);
    document.documentElement.className = 'ready';

    // Отслеживание движения мыши
    document.addEventListener('mousemove', handleMouseMove);
  }
});

// Функция инициализации комнаты
function initRoom() {
  [sendMove, getMove] = room.makeAction('mouseMove');
  [sendName, getName] = room.makeAction('playerName');

  room.onPeerJoin(handlePeerJoin);
  room.onPeerLeave(handlePeerLeave);

  // Обработка движения курсора
  getMove(([x, y], peerId) => {
  moveCursor([x, y], peerId);
  });

  // Получение имени других игроков
  getName((name, peerId) => handlePlayerName(name, peerId));

  // Периодическая проверка пиров
  setInterval(checkPeers, 5000);
}

// Обработчики событий
function handleMouseMove({ clientX, clientY }) {
  mouseX = clientX / innerWidth;
  mouseY = clientY / innerHeight;
  moveCursor([mouseX, mouseY], selfId);

  if (room) {
    sendMove([mouseX, mouseY]);
  }
}

function handlePeerJoin(peerId) {
  console.log('Игрок присоединился:', peerId);
  if (peerId !== selfId && playerName) {
    console.log(`Отправка имени игрока: ${playerName} для ${peerId}`);
    sendName(playerName);
  }
}

function handlePeerLeave(peerId) {
  console.log(`Игрок с ID ${peerId} вышел.`);
  if (peerNames[peerId]) {
    showNotification(`${peerNames[peerId]} покинул игру`);
    delete peerNames[peerId];
  }
  removeCursor(peerId);
}

function handlePlayerName(name, peerId) {
  const trimmedName = name ? name.trim() : 'Неизвестный игрок';
  console.log(`Получено имя для ${peerId}: ${trimmedName}`);

  if (!peerNames[peerId]) {  // Проверка на существование имени
    peerNames[peerId] = trimmedName;
    showNotification(`${trimmedName} joined`);
    addCursor(peerId, false); // Создаем курсор для нового игрока
  } else {
    console.log(`Имя для ${peerId} уже сохранено: ${peerNames[peerId]}`);
  }
}

// Функции работы с курсорами
function moveCursor([x, y], id) {
  const el = cursors[id];
  if (el) {
    el.style.left = `${x * innerWidth}px`;
    el.style.top = `${y * innerHeight}px`;
  }
}

function addCursor(id, isSelf) {
  const el = document.createElement('div');
  const img = document.createElement('img');
  const txt = document.createElement('p');

  el.className = `cursor${isSelf ? ' self' : ''}`;
  el.style.left = el.style.top = '-99px'; // скрываем по умолчанию

  img.src = 'src/img/hand.png';
  txt.innerText = isSelf ? playerName : peerNames[id] || 'Неизвестный игрок';
  el.appendChild(img);
  el.appendChild(txt);
  canvas.appendChild(el);
  cursors[id] = el;

  console.log(`Курсор добавлен для ${id}:`, el);
}

function removeCursor(id) {
  const el = cursors[id];
  if (el) {
    canvas.removeChild(el);
    delete cursors[id];
    console.log(`Курсор ${id} удалён.`);
  } else {
    console.warn(`Не удалось удалить курсор, так как он не найден для ID: ${id}`);
  }
  updatePeerInfo();
}

function updateCursorName(peerId) {
  const cursor = cursors[peerId];
  if (cursor) {
    const txt = cursor.querySelector('p');
    if (txt) {
      txt.innerText = peerNames[peerId] || 'Неизвестный игрок';
      console.log(`Обновлено имя курсора для ${peerId}: ${txt.innerText}`);
    }
  } else {
    console.warn(`Не удалось обновить имя курсора, так как курсор не найден для ${peerId}`);
  }
}

// Функция для проверки текущих пиров
function checkPeers() {
  const peers = room.getPeers();
  Object.keys(peerNames).forEach(peerId => {
    if (!peers[peerId]) {
      const name = peerNames[peerId];
      if (name) {
        showNotification(`${name} left`);
        delete peerNames[peerId];
        removeCursor(peerId);
      }
    }
  });
}

// Обновление информации о пирах
function updatePeerInfo() {
  const count = Object.keys(room.getPeers()).length;
  if (peerInfo) {
    peerInfo.innerHTML = count
      ? `Сейчас с вами <em>${count}</em> другой игрок${count === 1 ? ' подключён' : 'и подключены'}.`
      : noPeersCopy;
    console.log(`Количество подключённых пиров: ${count}`);
  }
}

// Уведомления
function showNotification(message) {
  console.log('Уведомление:', message);
  const notifications = document.getElementById('notifications');
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  notifications.appendChild(notification);

  // Удаление уведомления через 3 секунды
  setTimeout(() => {
    notification.style.opacity = 0;
    setTimeout(() => {
      notifications.removeChild(notification);
    }, 500);
  }, 3000);
}

// Проверка имени игрока
if (!playerName) {
  const playerNameContainer = document.querySelector('.playerNameContainer');
  const playerInput = document.querySelector('.playerInput');
  const playerPlay = document.querySelector('.playerPlay');

  playerNameContainer.style.display = 'flex';
  playerPlay.addEventListener('click', () => {
    playerName = playerInput.value.trim();
    if (playerName) {
      localStorage.setItem('name', playerName);
      playerNameContainer.style.display = 'none';
      sendName(playerName);
      addCursor(selfId, true);
      console.log(`Имя игрока установлено: ${playerName}`);
    } else {
      console.warn('Имя игрока не может быть пустым.');
    }
  });
}