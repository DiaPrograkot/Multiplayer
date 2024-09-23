import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

console.log('Инициализация комнаты...');
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId
console.log('Комната инициализирована:', room);

// Получаем ID текущего игрока
const myId = selfId;

if (!myId) {
  console.error('selfId is not defined.');
  console.log('Room object:', room); // Вывод объекта room в консоль для диагностики
  // Дополнительные действия, такие как повторная попытка инициализации или уведомление пользователя
} else {
  console.log('Текущий игрок имеет ID:', myId);
}

// Получаем имя игрока из localStorage
let playerName = localStorage.getItem('name')?.trim();
console.log('Имя игрока из localStorage:', playerName);

if (!playerName) {
  // Запрашиваем имя игрока (например, через ввод пользователя)
  const playerNameContainer = document.querySelector(".playerNameContainer");
  const playerInput = document.querySelector(".playerInput");
  const playerPlay = document.querySelector(".playerPlay");

  if (playerNameContainer && playerInput && playerPlay) {
    playerNameContainer.style.display = 'flex';
    playerPlay.addEventListener('click', () => {
      playerName = playerInput.value.trim();
      // Сохраняем имя в localStorage
      if (playerName) {
        localStorage.setItem('name', playerName);
        playerNameContainer.style.display = 'none'; // Скрываем контейнер после ввода имени
        // Отправляем имя, если оно установлено
        sendName(playerName);
      } else {
        console.error('Имя игрока не введено.');
      }
    });
  } else {
    console.error('Один или несколько элементов не найдены в DOM.');
  }
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

// Отправка имени при подключении
room.onPeerJoin((peerId) => {
  console.log('Игрок присоединился:', peerId);
  // Отправляем своё имя при первом подключении, если это не ты сам
  if (peerId !== myId && playerName) {
    sendName(playerName);
  }
  showNotification(`${peerId} joined`);
});

// Получение имени других игроков
getName((name, peerId) => {
  const trimmedName = name ? name.trim() : ''; // Значение по умолчанию
  console.log('Получено имя игрока:', trimmedName, 'ID:', peerId);

  // Проверяем, изменилось ли имя или оно уже сохранено
  if (peerNames[peerId] !== trimmedName) {
    peerNames[peerId] = trimmedName;
    showNotification(`${trimmedName} joined`);
  }
});

// Обработчик для события ухода пира
room.onPeerLeave((peerId) => {
  const name = peerNames[peerId];

  // Проверяем, что это не ты сам
  if (peerId !== myId && name) {
    showNotification(`${name} left`);
    delete peerNames[peerId]; // Удаляем из списка
  }
  showNotification(`${peerId} left`);
});

// Запрос имени у нового игрока
room.onPeerJoin((peerId) => {
  if (peerId !== myId) {
    sendName(playerName);
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
  if (!canvas) {
    console.error('Canvas element not found.');
    return;
  }

  init();
  document.documentElement.className = 'ready';
  addCursor(myId, true);

  addEventListener('mousemove', ({ clientX, clientY }) => {
    mouseX = clientX / innerWidth;
    mouseY = clientY / innerHeight;
    console.log('Mouse moved:', mouseX, mouseY);
    moveCursor([mouseX, mouseY], myId);
    if (room) {
      sendMove([mouseX, mouseY]);
    }
  });
});

function init() {
  let getMove;

  ;[sendMove, getMove] = room.makeAction('mouseMove');
  console.log('Registered mouseMove action.');

  room.onPeerJoin(addCursor);
  room.onPeerLeave(removeCursor);
  getMove(([x, y], peerId) => {
    console.log('Received mouseMove:', x, y, 'from', peerId);
    moveCursor([x, y], peerId);
  });
}

function moveCursor([x, y], id) {
  const el = cursors[id];

  if (el && typeof x === 'number' && typeof y === 'number') {
    console.log('Moving cursor:', id, x, y);
    el.style.left = x * innerWidth + 'px';
    el.style.top = y * innerHeight + 'px';
  }
}

function addCursor(id, isSelf) {
  if (!canvas) {
    console.error('Canvas element not found.');
    return;
  }

  const el = document.createElement('div');
  const img = document.createElement('img');
  const txt = document.createElement('p');

  el.className = `cursor${isSelf ? ' self' : ''}`;
  el.style.left = el.style.top = '-99px';
  img.src = 'src/img/hand.png';
  txt.innerText = isSelf ? 'you' : id.slice(0, 4);
  el.appendChild(img);
  el.appendChild(txt);
  canvas.appendChild(el);
  cursors[id] = el;

  if (!isSelf) {
    sendMove([Math.random() * 0.93, Math.random() * 0.93], id);
    updatePeerInfo();
  }

  return el;
}

function removeCursor(id) {
  if (cursors[id]) {
    canvas.removeChild(cursors[id]);
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
