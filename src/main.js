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

// Функция для отображения никнейма
const showPeerName = (peerId) => {
  // Проверяем, что окошко startgame уже появилось
  if (document.querySelector('.startgame').style.display === 'flex') {
    console.log(`${peers[peerId] || peerId} joined`);
  }
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
  console.log(`${peerId} joined`);

  // Отправляем свой ник новому пользователю только после старта игры
  let nameStorage = localStorage.getItem('name');
  if (nameStorage && document.querySelector('.startgame').style.display === 'flex') {
    sendPlayerName(nameStorage); // Отправляем своё имя новому пользователю
  } else {
    // Подписываемся на событие, когда никнейм будет введен
    window.addEventListener('storage', sendNameAfterInput);
  }

});

// Обработка отключения пользователей
room.onPeerLeave(peerId => {
  console.log(`${peers[peerId] || peerId} left`);
  delete peers[peerId]; // Удаляем никнейм из списка
});

// Получаем никнеймы других пользователей
receivePlayerName((name, peerId) => {
  if (!peers[peerId]) {
    peers[peerId] = name; // Сохраняем никнейм пользователя
    showPeerName(peerId); // Показываем никнейм в консоли
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