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

// Создаем действия
const [sendPlayerName, receivePlayerName] = room.makeAction('playerName');
const [sendNameUpdate, receiveNameUpdate] = room.makeAction('nameUpdate');
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

// Функция для создания курсора
const createCursor = (peerId, name, isSelf = false) => {
  const cursorElement = document.createElement('div');
  cursorElement.className = isSelf ? 'self-cursor' : 'peer-cursor';
  cursorElement.id = isSelf ? 'self-cursor' : `cursor-${peerId}`;
  cursorElement.innerHTML = `<div class="cursor-name">${name}</div>`;
  document.body.appendChild(cursorElement);
  return cursorElement;
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

  // Создаем курсор для нового участника
  cursors[peerId] = createCursor(peerId, peers[peerId] || 'Unknown');
});

// Создаем элемент для отображения собственного курсора
document.addEventListener('DOMContentLoaded', () => {
  const selfCursorElement = createCursor(selfId, localStorage.getItem('name') || 'You', true);

  // Отслеживание движения мыши и обновление позиции собственного курсора
  document.addEventListener('mousemove', (e) => {
    selfCursorElement.style.left = `${e.clientX}px`;
    selfCursorElement.style.top = `${e.clientY}px`;
    sendCursorPosition({ x: e.clientX, y: e.clientY });
  });
});

// Обработка отключения пользователей
room.onPeerLeave(peerId => {
  let name = peers[peerId];
  if (name) {
    showNotification(`${name} вышел из игры`);
    console.log(`Пользователь ${peerId} (${name}) вышел`);
  }

  // Удаляем HTML элемент для курсора отключившегося участника
  if (cursors[peerId]) {
    cursors[peerId].remove();
    delete cursors[peerId];
  }
  delete peers[peerId];
});

// Обработка получения никнейма от других пользователей
receivePlayerName((name, peerId) => {
  if (!peers[peerId]) {
    peers[peerId] = name;
    console.log(`Новый пользователь: ${name}, ID: ${peerId}`);
    showNotification(`${name} вошел в игру`);
  } else {
    console.log(`Обновление имени для пользователя с ID: ${peerId}`);
    showNotification(`Пользователь ${peers[peerId]} изменил имя на ${name}`);
    peers[peerId] = name;
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
    return;
  }

  confirmButton.addEventListener('click', () => {
    let name = document.querySelector('.playerInput').value;
    if (name) {
      const previousName = localStorage.getItem('name');
      localStorage.setItem('name', name);
      console.log(`Отправляем своё имя: ${name}`);
      sendPlayerName(name);

      if (previousName && previousName !== name) {
        sendNameUpdate(name);
      }
    } else {
      console.warn('Имя пользователя не введено');
    }
  });
});

// Обработка получения координат курсора от других пользователей
receiveCursorPosition((position, peerId) => {
  if (cursors[peerId]) {
    cursors[peerId].style.left = `${position.x}px`;
    cursors[peerId].style.top = `${position.y}px`;
  }
});