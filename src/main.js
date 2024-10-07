import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId
console.log('Комната инициализирована:', room);

const cursors = {};
const peerNames = {};
let sendMove, getMove, sendName, getName, sendGameState, getGameState, sendMainPlayer, getMainPlayer;
let playerName = localStorage.getItem('name')?.trim();
let mouseX = 0, mouseY = 0;
let canvas = null;
let isMainPlayer = false;
let mainPlayerId = null; // ID главного игрока

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
  [sendGameState, getGameState] = room.makeAction('gameState');
  [sendMainPlayer, getMainPlayer] = room.makeAction('mainPlayer'); // Новое действие для передачи главного игрока

  room.onPeerJoin(handlePeerJoin);
  room.onPeerLeave(handlePeerLeave);

  // Получение движения курсора
  getMove(([x, y], peerId) => {
    moveCursor([x, y], peerId);
  });

  // Получение имени игроков
  getName((name, peerId) => handlePlayerName(name, peerId));

  // Получение состояния игры
  getGameState((gameState) => {
    updateGameState(gameState);
  });

  // Получение информации о главном игроке
  getMainPlayer((mainPlayerIdFromPeer) => {
    if (mainPlayerIdFromPeer && mainPlayerIdFromPeer !== selfId) {
      mainPlayerId = mainPlayerIdFromPeer; // Устанавливаем ID главного игрока
      isMainPlayer = false;
      console.log(`Главный игрок теперь: ${mainPlayerId}`);
    }
  });

  // Если после некоторого времени не получен главный игрок — устанавливаем себя
  setTimeout(() => {
    if (!mainPlayerId) {
      isMainPlayer = true;
      mainPlayerId = selfId;
      sendMainPlayer(selfId); // Сообщаем другим, что мы стали главным игроком
      console.log('Вы стали главным игроком.');
    }
  }, 2000); // Ждем 2 секунды перед назначением главного

  // Отправка имени игрока
  if (playerName) {
    sendName(playerName);
  }
}

// Обработчики событий
function handleMouseMove({ clientX, clientY }) {
  mouseX = clientX / innerWidth;
  mouseY = clientY / innerHeight;
  moveCursor([mouseX, mouseY], selfId);

  if (room) {
    sendMove([mouseX, mouseY]);
  }

  // Если текущий игрок является "главным", отправляем состояние игры
  if (isMainPlayer) {
    sendGameState(getCurrentGameState());
  }
}

function handlePeerJoin(peerId) {
  console.log('Игрок присоединился:', peerId);
  if (peerId !== selfId && playerName) {
    console.log(`Отправка имени игрока: ${playerName} для ${peerId}`);
    sendName(playerName);
  }

  // Если текущий игрок является "главным", отправляем состояние игры новому игроку
  if (isMainPlayer) {
    sendGameState(getCurrentGameState());
    sendMainPlayer(selfId); // Уведомляем новоприбывшего, что мы главный игрок
  }
}

function handlePeerLeave(peerId) {
  console.log(`Игрок с ID ${peerId} вышел.`);

  if (peerId === mainPlayerId) {
    console.log('Главный игрок покинул игру.');
    mainPlayerId = null; // Сбрасываем статус главного игрока

    // Назначаем себя главным, если никто не занят
    setTimeout(() => {
      if (!mainPlayerId && Object.keys(room.getPeers()).length > 0) {
        isMainPlayer = true;
        mainPlayerId = selfId;
        sendMainPlayer(selfId); // Уведомляем остальных, что мы теперь главный
        console.log('Вы стали главным игроком после выхода предыдущего главного.');
      }
    }, 1000);
  }

  if (peerNames[peerId]) {
    showNotification(`${peerNames[peerId]} left`);
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

// Функция для обновления состояния игры
function updateGameState(gameState) {
  // Обновляем позиции игроков
  gameState.players.forEach(player => {
    const playerElement = document.getElementById(`player-${player.id}`);
    if (playerElement) {
      playerElement.style.left = `${player.x}px`;
      playerElement.style.top = `${player.y}px`;
    }
  });

  // Обновляем позиции астероидов
  gameState.asteroids.forEach(asteroid => {
    const asteroidElement = document.getElementById(`asteroid-${asteroid.id}`);
    if (asteroidElement) {
      asteroidElement.style.left = `${asteroid.x}px`;
      asteroidElement.style.top = `${asteroid.y}px`;
    }
  });

  // Обновляем другие параметры состояния игры
}

// Функция для получения текущего состояния игры
function getCurrentGameState() {
  // Возвращаем текущее состояние игры
  return {
    players: [
      // Пример данных игроков
      { id: selfId, x: mouseX * innerWidth, y: mouseY * innerHeight }
    ],
    asteroids: [
      // Пример данных астероидов
      { id: 'asteroid1', x: 100, y: 100 }
    ]
  };
}
