import { joinRoom } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

console.log('Инициализация комнаты...');
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId
console.log('Комната инициализирована:', room);

// Получаем ID текущего игрока (заменяем selfId)
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
  
  // Проверяем, что это не ты сам
  if (peerId !== myId) {
    // Отправляем своё имя только новому игроку
    if (playerName) {
      sendName(playerName); 
    }

    // Если у нас уже есть имя этого пира, не отправляем повторное уведомление
    if (!peerNames[peerId]) {
      peerNames[peerId] = 'Unnamed Player'; // Устанавливаем значение по умолчанию
      showNotification(`${peerNames[peerId]} joined`); // Показываем уведомление о новом игроке
    }
  } else {
    // Отправляем своё имя при первом подключении
    if (playerName) {
      sendName(playerName);
    }
  }
});


// Обработчик для события ухода пира
room.onPeerLeave((peerId) => {
  const name = peerNames[peerId];
  
  // Проверяем, что это не ты сам
  if (peerId !== myId) {
    if (name) {
      showNotification(`${name} left`);
      delete peerNames[peerId];
    }
  }
});

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
  
  // Показываем уведомление только если игрок не ты сам
  if (peerId !== myId) {
    showNotification(`${peerNames[peerId]} joined`);
  }
});
