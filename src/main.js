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

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('canvas');
  init();
  document.documentElement.className = 'ready';
  addCursor(myId, true);

  addEventListener('mousemove', ({ clientX, clientY }) => {
    mouseX = clientX / innerWidth;
    mouseY = clientY / innerHeight;
    moveCursor([mouseX, mouseY], myId);
    if (room) {
      sendMove([mouseX, mouseY]);
    }
  });
});

function init() {
  let getMove;
  ;[sendMove, getMove] = room.makeAction('mouseMove');
  room.onPeerJoin(addCursor);
  room.onPeerLeave(removeCursor);
  getMove(([x, y], peerId) => {
    moveCursor([x, y], peerId);
  });
}

function moveCursor([x, y], id) {
  const el = cursors[id];
  if (el && typeof x === 'number' && typeof y === 'number') {
    el.style.left = x * innerWidth + 'px';
    el.style.top = y * innerHeight + 'px';
  }
}

function addCursor(id, isSelf) {
  const el = document.createElement('div');
  const img = document.createElement('img');
  const txt = document.createElement('p');
  el.className = `cursor${isSelf ? ' self' : ''}`;
  el.style.left = el.style.top = '-99px'; // Скрываем курсор по умолчанию
  img.src = 'src/img/hand.png';

  // Устанавливаем имя
  txt.innerText = isSelf ? playerName : ''; // Имя для текущего игрока
  el.appendChild(img);
  el.appendChild(txt);
  canvas.appendChild(el);
  cursors[id] = el;

  // Если это не текущий игрок, обновляем текст
  if (!isSelf) {
    updateCursorName(id); // Вызываем функцию для установки имени
  }

  return el;
}

function removeCursor(id) {
  if (cursors[id]) {
    canvas.removeChild(cursors[id]);
    delete cursors[id]; // Удаляем курсор из объекта cursors
  }
  updatePeerInfo();
}

function updatePeerInfo() {
  const count = Object.keys(room.getPeers()).length;
  if (peerInfo) {
    peerInfo.innerHTML = count
      ? `Right now <em>${count}</em> other peer${
          count === 1 ? ' is' : 's are'
        } connected with you.`
      : noPeersCopy;
  }
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

if (!playerName) {
  const playerNameContainer = document.querySelector(".playerNameContainer");
  const playerInput = document.querySelector(".playerInput");
  const playerPlay = document.querySelector(".playerPlay");
  playerNameContainer.style.display = 'flex';
  playerPlay.addEventListener('click', () => {
    playerName = playerInput.value.trim();
    // Сохраняем имя в localStorage
    if (playerName) {
      localStorage.setItem('name', playerName);
      playerNameContainer.style.display = 'none'; // Скрываем контейнер после ввода имени
      // Отправляем имя, если оно установлено
      sendName(playerName);
      addCursor(myId, true);
    } 
  });
}

// Объект для хранения имен игроков
const peerNames = {};
const [sendName, getName] = room.makeAction('playerName');

// Функция для отображения уведомления
const showNotification = (message) => {
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
};

// Подписка на событие присоединения пиров
room.onPeerJoin((peerId) => {
  console.log('Игрок присоединился:', peerId);
  // Отправляем своё имя при первом подключении, если это не ты сам
  if (peerId !== myId && playerName) {
    console.log(`Отправляем имя ${playerName} для игрока ${peerId}`);
    sendName(playerName);
  }
});

// Подписка на событие выхода пиров
room.onPeerLeave((peerId) => {
  console.log('Событие выхода пира с ID:', peerId);  // Отладка события выхода
  // Если имя найдено, показываем уведомление и удаляем игрока
  if (peerNames[peerId]) {
    showNotification(`${peerNames[peerId]} left`);
    delete peerNames[peerId]; // Удаляем игрока из списка
  }
  
  // Удаляем курсор игрока
  removeCursor(peerId);
});

// Получение имени других игроков
getName((name, peerId) => {
  const trimmedName = name ? name.trim() : ''; // Значение по умолчанию
  console.log('Получено имя игрока:', trimmedName, 'ID:', peerId);
  
  // Проверяем, изменилось ли имя или оно уже сохранено
  if (peerNames[peerId] !== trimmedName) {
    peerNames[peerId] = trimmedName; // Сохраняем имя в объекте
    console.log(`Сохраняем имя для игрока ${peerId}: ${trimmedName}`);
    showNotification(`${trimmedName} joined`);
    
    // Если курсор уже существует, обновляем текст
    updateCursorName(peerId); // Обновляем имя курсора
  } 
});

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

// Логируем изменения имен
room.onPeerLeave(peerId => {
  console.log(`Игрок с ID ${peerId} вышел.`);
});
