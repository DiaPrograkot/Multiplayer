import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените на ваш реальный appId
};

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id');

// Храним никнеймы других пользователей
let peers = {};

// Создаем действия для обмена никнеймами
const [sendPlayerName, receivePlayerName] = room.makeAction('playerName');

// Функция для показа уведомления
const showNotification = (message) => {
  const notificationContainer = document.querySelector('.notificationContainer');
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;

  notificationContainer.appendChild(notification);

  // Удаляем уведомление через 3 секунды
  setTimeout(() => {
    notification.remove();
  }, 3000);
};

// Добавляем функцию отправки никнейма после его ввода
const sendNameAfterInput = () => {
  let nameStorage = localStorage.getItem('name');
  if (nameStorage) {
    sendPlayerName(nameStorage); // Отправляем своё имя другим участникам
  }
};

// Обработка подключения других пользователей
room.onPeerJoin(peerId => {
  let nameStorage = localStorage.getItem('name');

  // Если никнейм уже введен, отправляем его сразу
  if (nameStorage && document.querySelector('.startgame').style.display === 'flex') {
    sendPlayerName(nameStorage); // Отправляем своё имя новому пользователю
  } else {
    // Подписываемся на событие, когда никнейм будет введен
    window.addEventListener('storage', sendNameAfterInput);
  }
});

// Обработка отключения пользователей
room.onPeerLeave(peerId => {
  let name = peers[peerId];
  if (name) {
    showNotification(`${name} вышел из игры`);
    delete peers[peerId]; // Удаляем никнейм из списка
  }
});

// Обработка получения никнейма от других пользователей
receivePlayerName((name, peerId) => {
  if (!peers[peerId]) {
    peers[peerId] = name; // Сохраняем никнейм пользователя

    // Показываем уведомление только после получения никнейма
    showNotification(`${name} вошел в игру`);
  }
});

// Отправляем никнейм только после ввода и подтверждения
window.addEventListener('storage', function(event) {
  if (event.key === 'name' && event.newValue) {
    sendPlayerName(event.newValue); // Отправляем своё имя другим участникам после сохранения в localStorage
  }
});

// Пример использования selfId
console.log(`My peer ID is ${selfId}`);