import { joinRoom } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

console.log('Инициализация комнаты...');
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId
console.log('Комната инициализирована:', room);

// Получаем ID текущего игрока
const myId = room.selfId;
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
    } else {
      console.error('Имя игрока не введено.');
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

// Отправка имени при подключении
room.onPeerJoin((peerId) => {
  console.log('Игрок присоединился:', peerId);
  // Отправляем своё имя при первом подключении, если это не ты сам
  if (peerId !== myId && playerName) {
    sendName(playerName);
  }
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
});

// Запрос имени у нового игрока
room.onPeerJoin((peerId) => {
  if (peerId !== myId) {
    sendName(playerName);
  }
});

