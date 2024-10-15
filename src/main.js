import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id',
};

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id');

// Храним никнеймы и курсоры других пользователей
let peers = {};
let cursors = {};

// Создаем действия для обмена никнеймами
const [sendPlayerName, receivePlayerName] = room.makeAction('playerName');
// Создаем действия для уведомления об изменении имени
const [sendNameUpdate, receiveNameUpdate] = room.makeAction('nameUpdate');
// Создаем действия для обмена координатами курсора (имя сокращено)
const [sendCursorPosition, receiveCursorPosition] = room.makeAction('move');

// Функция для показа уведомления
const showNotification = (message) => {
  const notificationContainer = document.querySelector('.notificationContainer');
  if (notificationContainer) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
};

// Обработка подключения других пользователей
room.onPeerJoin(peerId => {
  console.log(`Peer joined: ${peerId}`);
  let nameStorage = localStorage.getItem('name');

  // Отправляем имя, если оно уже введено
  if (nameStorage) {
    console.log(`Отправляем имя: ${nameStorage} новому пользователю`);
    sendPlayerName(nameStorage);
  } else {
    console.warn('Имя пользователя отсутствует в localStorage');
  }

  // Создаем HTML элемент для отображения курсора нового участника
  const cursorElement = document.createElement('div');
  cursorElement.className = 'peer-cursor';
  cursorElement.id = `cursor-${peerId}`;
  cursorElement.innerHTML = `<div class="cursor-name">${peers[peerId] || 'Unknown'}</div>`;
  document.body.appendChild(cursorElement);
  cursors[peerId] = cursorElement;
});

// Обработка отключения пользователей
room.onPeerLeave(peerId => {
  let name = peers[peerId];
  if (name) {
    showNotification(`${name} вышел из игры`);
    delete peers[peerId]; // Удаляем никнейм из списка
    console.log(`Пользователь ${peerId} (${name}) вышел`);
  }
  
  // Удаляем HTML элемент для курсора отключившегося участника
  if (cursors[peerId]) {
    cursors[peerId].remove();
    delete cursors[peerId];
  }
});

// Обработка получения никнейма от других пользователей
receivePlayerName((name, peerId) => {
  if (!peers[peerId]) {
    peers[peerId] = name; // Сохраняем никнейм пользователя
    console.log(`Новый пользователь: ${name}, ID: ${peerId}`);
    showNotification(`${name} вошел в игру`);
  } else {
    console.log(`Обновление имени для пользователя с ID: ${peerId}`);
    showNotification(`Пользователь ${peers[peerId]} изменил имя на ${name}`);
    peers[peerId] = name; // Обновляем имя
  }

  // Обновляем имя на отображаемом курсоре
  if (cursors[peerId]) {
    cursors[peerId].querySelector('.cursor-name').textContent = name;
  }
});

// Обработка получения обновленного имени
receiveNameUpdate((newName, peerId) => {
  if (peers[peerId]) {
    const oldName = peers[peerId];
    peers[peerId] = newName;
    console.log(`Пользователь с ID ${peerId} изменил имя с "${oldName}" на "${newName}"`);
    showNotification(`${oldName} изменил имя на ${newName}`);

    // Обновляем имя на отображаемом курсоре
    if (cursors[peerId]) {
      cursors[peerId].querySelector('.cursor-name').textContent = newName;
    }
  }
});

// Отправка никнейма после подтверждения
document.addEventListener('DOMContentLoaded', () => {
  const confirmButton = document.querySelector('.confirm-button');
  if (!confirmButton) {
    console.warn("Кнопка подтверждения имени не найдена в DOM");
    return; // Остановка выполнения кода, так как элемента нет
  }

  confirmButton.addEventListener('click', () => {
    let name = document.querySelector('.playerInput').value; // Получаем введённое имя из поля ввода
    if (name) {
      const previousName = localStorage.getItem('name');
      localStorage.setItem('name', name);
      console.log(`Отправляем своё имя: ${name}`);
      sendPlayerName(name);

      // Если имя изменилось, отправляем уведомление об обновлении имени
      if (previousName && previousName !== name) {
        sendNameUpdate(name);
      }
    } else {
      console.warn('Имя пользователя не введено');
    }
  });

  // Отслеживание движения мыши
  document.addEventListener('mousemove', (e) => {
    console.log(`Отправка координат курсора: (${e.clientX}, ${e.clientY})`);
    sendCursorPosition({ x: e.clientX, y: e.clientY });
  });
});

// Обработка получения координат курсора от других пользователей
receiveCursorPosition((position, peerId) => {
  console.log(`Получены координаты курсора от ${peerId}: (${position.x}, ${position.y})`);
  if (cursors[peerId]) {
    cursors[peerId].style.left = `${position.x}px`;
    cursors[peerId].style.top = `${position.y}px`;
  }
});

// Пример использования selfId
console.log(`My peer ID is ${selfId}`);
