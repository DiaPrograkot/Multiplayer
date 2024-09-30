import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId
console.log('Комната инициализирована:', room);

// Получаем ID текущего игрока
const myId = selfId;
console.log('Текущий игрок имеет ID:', myId);

// Получаем имя игрока из localStorage
let playerName = localStorage.getItem('name')?.trim();
console.log('Имя игрока из localStorage:', playerName);

// Добавляем функционал для взаимодействия с курсором и перемещениями мыши
const cursors = {};
let canvas;
const peerInfo = document.getElementById('peer-info');
const noPeersCopy = peerInfo ? peerInfo.innerText : 'No peers connected';

let mouseX = 0;
let mouseY = 0;
let sendMove;

// Инициализация комнаты и событий
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('canvas');
  if (canvas) {
    initRoom();
    addCursor(myId, true);  // Создаём курсор для себя
    document.documentElement.className = 'ready';

    // Отслеживание движения мыши для текущего игрока
    document.addEventListener('mousemove', handleMouseMove);
  } else {
    console.error('Canvas element not found!');
  }
});

// Инициализация комнаты
function initRoom() {
  [sendMove, getMove] = room.makeAction('mouseMove');
  
  room.onPeerJoin(peerId => handlePeerJoin(peerId));  // Когда пир присоединяется
  room.onPeerLeave(peerId => handlePeerLeave(peerId));  // Когда пир уходит

  // Получение данных о перемещении курсоров от других игроков
  getMove(([x, y], peerId) => {
    console.log(`Получено движение курсора от ${peerId}: x=${x}, y=${y}`); // Для отладки
    moveCursor([x, y], peerId);  // Обновляем курсор другого игрока
  });

  [sendName, getName] = room.makeAction('playerName');
  getName((name, peerId) => handlePlayerName(name, peerId));
}

// Обработчик движения мыши текущего игрока
function handleMouseMove({ clientX, clientY }) {
  mouseX = clientX / innerWidth;
  mouseY = clientY / innerHeight;
  moveCursor([mouseX, mouseY], myId);  // Обновляем свой курсор на экране

  // Отправляем данные о движении курсора другим игрокам
  if (room) {
    sendMove([mouseX, mouseY]);  // Отправляем позицию курсора
    console.log(`Отправляю данные о движении курсора: x=${mouseX}, y=${mouseY}`);  // Для отладки
  }
}

// Обновление позиции курсора
function moveCursor([x, y], id) {
  const el = cursors[id];
  if (el && typeof x === 'number' && typeof y === 'number') {
    el.style.left = `${x * innerWidth}px`;
    el.style.top = `${y * innerHeight}px`;
    console.log(`Курсор ${id} перемещён: x=${x}, y=${y}`);  // Для отладки
  }
}

// Добавление курсора
function addCursor(id, isSelf) {
  if (cursors[id]) return;  // Если курсор уже существует, ничего не делаем

  const el = document.createElement('div');
  const img = document.createElement('img');
  const txt = document.createElement('p');
  el.className = `cursor${isSelf ? ' self' : ''}`;
  el.style.left = el.style.top = '-99px'; // скрываем по умолчанию

  img.src = 'src/img/hand.png';
  txt.innerText = isSelf ? playerName : 'Unknown Player';
  el.appendChild(img);
  el.appendChild(txt);
  canvas.appendChild(el);
  cursors[id] = el;

  if (!isSelf) updateCursorName(id);
  console.log(`Курсор добавлен для игрока ${id}`);  // Для отладки
}

// Удаление курсора
function removeCursor(id) {
  const el = cursors[id];
  if (el) {
    canvas.removeChild(el);
    delete cursors[id];
    console.log(`Курсор удалён для игрока ${id}`);  // Для отладки
  }
  updatePeerInfo();
}

// Объект для хранения имен игроков
const peerNames = {};

// Получение имени других игроков
function handlePlayerName(name, peerId) {
  const trimmedName = name ? name.trim() : 'Unknown Player';

  // Проверяем, изменилось ли имя или оно уже сохранено
  if (!peerNames[peerId]) {  // Убедимся, что имя для этого peerId ещё не сохранено
    peerNames[peerId] = trimmedName; // Сохраняем имя в объекте
    console.log(`Сохраняем имя для игрока ${peerId}: ${trimmedName}`);
    showNotification(`${trimmedName} joined`);  // Уведомление появляется только при новом подключении

    // Если курсор уже существует, обновляем текст
    updateCursorName(peerId); // Обновляем имя курсора
  }
}

// Функция для обновления имени курсора
function updateCursorName(peerId) {
  const cursor = cursors[peerId];
  if (cursor) {
    const txt = cursor.querySelector('p');
    if (txt) {
      txt.innerText = peerNames[peerId] || 'Unknown Player'; // Устанавливаем имя игрока на курсоре или "Unknown Player"
      console.log(`Обновляем имя курсора для игрока ${peerId}: ${txt.innerText}`);
    }
  } else {
    console.log(`Курсор для игрока ${peerId} не найден.`);
  }
}

// Функция для отображения уведомления
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

// Добавление события на подключение
function handlePeerJoin(peerId) {
  console.log('Игрок присоединился:', peerId);
  if (peerId !== myId && playerName) {
    sendName(playerName);
  }
  addCursor(peerId, false);
}

// Добавление события на выход игрока
function handlePeerLeave(peerId) {
  console.log(`Игрок с ID ${peerId} вышел.`);
  if (peerNames[peerId]) {
    showNotification(`${peerNames[peerId]} left`);
    delete peerNames[peerId];
  }
  removeCursor(peerId);
  updatePeerInfo();
}

// Функция для проверки текущих пиров
setInterval(() => {
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
}, 5000);  // Проверка каждые 5 секунд

// Если имя игрока не указано, показываем интерфейс ввода имени
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
      addCursor(myId, true);
    }
  });
}
