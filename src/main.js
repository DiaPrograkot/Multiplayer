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

if (!playerName) {
  // Запрашиваем имя игрока (например, через ввод пользователя)
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
    sendName(playerName);
  }
});

// Подписка на событие выхода пиров
room.onPeerLeave((peerId) => {
  console.log('Событие выхода пира с ID:', peerId);  // Отладка события выхода

  // Получаем имя игрока, если оно сохранено
  const name = peerNames[peerId];

  // Если имя найдено, показываем уведомление и удаляем игрока
  if (name) {
    showNotification(`${name} left`);
    console.log(`Уведомление: ${name} покинул комнату`);  // Проверка, сработало ли уведомление
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
    peerNames[peerId] = trimmedName;
    showNotification(`${trimmedName} joined`);
    updateCursorName(peerId, trimmedName); // Обновляем имя курсора
  }
});

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

    // Коррекция положения, чтобы центр изображения совпадал с реальным курсором
    const cursorWidth = 35;  // Ширина кастомного курсора
    const cursorHeight = 45; // Высота кастомного курсора
    el.style.left = (x * innerWidth - cursorWidth / 2) + 'px';
    el.style.top = (y * innerHeight - cursorHeight / 2) + 'px';
  }
}

function addCursor(id, isSelf) {
  const el = document.createElement('div');
  const img = document.createElement('img');
  const txt = document.createElement('p');

  el.className = `cursor${isSelf ? ' self' : ''}`;
  el.style.left = el.style.top = '-99px';
  img.src = 'src/img/hand.png';
  txt.innerText = isSelf ? playerName : ''; // Инициализируем пустой текст
  el.appendChild(img);
  el.appendChild(txt);
  canvas.appendChild(el);
  cursors[id] = el;
  return el;
}

function removeCursor(id) {
  if (cursors[id]) {
    canvas.removeChild(cursors[id]);
    delete cursors[id]; // Удаляем курсор из объекта cursors
  }
  updatePeerInfo();
}

function updateCursorName(id, name) {
  const el = cursors[id];
  if (el) {
    const txt = el.querySelector('p');
    if (txt) {
      txt.innerText = name;
    }
  }
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
