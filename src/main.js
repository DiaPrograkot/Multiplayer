import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

console.log('Инициализация комнаты...');
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId
console.log('Комната инициализирована:', room);

// Получаем имя игрока из localStorage
let playerName = localStorage.getItem('name')?.trim();
console.log('Имя игрока из localStorage:', playerName);

if (!playerName || playerName === undefined) {
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
      } else {
      console.error('Имя игрока не введено.');
    }
  });
}

// Объект для хранения имен игроков
const peerNames = {};
const [sendName, getName] = room.makeAction('playerName');

// Объект для хранения курсоров
const cursors = {};

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
room.onPeerJoin(() => {
  console.log('Игрок присоединился:', playerName);
  if (playerName) {
    sendName(playerName);
    showNotification(`${playerName} joined`);
  }
});

// Обработчик для события ухода пира
room.onPeerLeave(peerId => {
  const name = peerNames[peerId];
  if (name) {
    showNotification(`${name} left`);
    delete peerNames[peerId];
  }

  // Удаление курсора при уходе пира
  const cursor = cursors[peerId];
  if (cursor) {
    cursor.remove();
    delete cursors[peerId];
  }
});

// Получение имени других игроков
// Получение имени других игроков
getName((name, peerId) => {
  const trimmedName = name ? name.trim() : 'Unnamed Player'; // Значение по умолчанию
  console.log('Получено имя игрока:', trimmedName, 'ID:', peerId);
  
  // Убедитесь, что имя не пустое
  if (!trimmedName) {
    console.warn(`Имя игрока для ID ${peerId} отсутствует. Устанавливаем значение по умолчанию.`);
    peerNames[peerId] = 'Unnamed Player';
  } else {
    peerNames[peerId] = trimmedName;
  }
  
  showNotification(`${peerNames[peerId]} joined`);
});


// Объявление переменных mouseX и mouseY
let mouseX, mouseY;

// Определение функции sendMove
const [sendMove] = room ? room.makeAction('move') : [() => {}];

// Определение функции sendClick
const [sendClick] = room ? room.makeAction('click') : [() => {}];

addEventListener('mousemove', ({clientX, clientY}) => {
  mouseX = clientX / innerWidth;
  mouseY = clientY / innerHeight;
  moveCursor([mouseX, mouseY], selfId);
  if (room) {
    try {
      sendMove([mouseX, mouseY]);
    } catch (error) {
      console.error('Ошибка при отправке движения:', error);
    }
  }
});

addEventListener('touchstart', e => {
  const x = e.touches[0].clientX / innerWidth;
  const y = e.touches[0].clientY / innerHeight;

  moveCursor([x, y], selfId);

  if (room) {
    try {
      sendMove([x, y]);
      sendClick({ x, y });
    } catch (error) {
      console.error('Ошибка при отправке клика:', error);
    }
  }
});

function moveCursor([x, y], id) {
  const el = cursors[id];
  if (el && typeof x === 'number' && typeof y === 'number') {
    el.style.left = x * innerWidth + 'px';
    el.style.top = y * innerHeight + 'px';
    console.log(`Курсор ${id} перемещён на (${x}, ${y})`);
  }
}

function addCursor(id, isSelf) {
  const el = document.createElement('div');
  const img = document.createElement('img');
  const txt = document.createElement('p');

  el.className = `cursor${isSelf ? ' self' : ''}`;
  el.style.left = el.style.top = '-99px';
  img.src = 'img/hand.png';
  txt.innerText = isSelf ? 'you' : id.slice(0, 4);
  el.appendChild(img);
  el.appendChild(txt);
  canvas.appendChild(el);
  cursors[id] = el;

  if (!isSelf) {
    moveCursor([0.5, 0.5], id);
    console.log(`Курсор для игрока ${id} добавлен в центр`);
    updatePeerInfo();
  }

  return el;
}
