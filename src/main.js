import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id',
};

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id');

// Храним информацию об игроках и их курсорах
let peers = {};
let cursors = {};
const gameState = { roles: { cat: null } };

// Создаем действия
const [sendPlayerName, receivePlayerName] = room.makeAction('playerName');
const [sendNameUpdate, receiveNameUpdate] = room.makeAction('nameUpdate');
const [sendCursorPosition, receiveCursorPosition] = room.makeAction('move');
const [sendRoleChoice, receiveRoleChoice] = room.makeAction('roleChoice');

// Функция для показа уведомления
function showNotification(message) {
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
}

// Функция для создания курсора
function createCursor(peerId, name, isSelf = false) {
  const cursorElement = document.createElement('div');
  cursorElement.className = isSelf ? 'self-cursor' : 'peer-cursor';
  cursorElement.id = isSelf ? 'self-cursor' : `cursor-${peerId}`;
  cursorElement.innerHTML = `<div class="cursor-name">${name}</div>`;
  document.body.appendChild(cursorElement);
  return cursorElement;
}

// Обработка подключения других пользователей
function handlePeerJoin(peerId) {
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
}

// Обработка отключения пользователей
function handlePeerLeave(peerId) {
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
}

// Обработка получения никнейма от других пользователей
function handleReceivePlayerName(name, peerId) {
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
}

// Обработка выбора ролей
function handleRoleSelection() {
  const catImage = document.querySelector('.role-cat');
  const asteroidImage = document.querySelector('.role-asteroid');

  // Обработка выбора роли "Кот"
  catImage.addEventListener('click', () => {
    if (gameState.roles.cat !== selfId) {
      if (!gameState.roles.cat) {
        // Игрок выбирает роль кота
        gameState.roles.cat = selfId;
        sendRoleChoice({ role: 'cat', peerId: selfId });
        console.log(`Игрок ${selfId} выбрал роль кота`);
        showNotification('Вы выбрали роль кота');
      } else {
        // Роль кота уже занята
        console.warn('Роль кота уже занята');
        showNotification('Роль кота уже занята, выберите другую роль');
      }
    }
  });

  // Обработка выбора роли "Астероид"
  asteroidImage.addEventListener('click', () => {
    if (gameState.roles.cat === selfId) {
      // Если игрок был котом, но хочет стать астероидом
      console.log('Игрок отказался быть котом и стал астероидом');
      showNotification('Вы отказались от роли кота и стали астероидом');
      gameState.roles.cat = null; // Освобождаем роль кота
      sendRoleChoice({ role: 'leaveCat', peerId: selfId });
    }  else if (gameState.roles[selfId] !== 'asteroid') {
      // Игрок становится астероидом (если еще не был астероидом)
      gameState.roles[selfId] = 'asteroid';
      sendRoleChoice({ role: 'asteroid', peerId: selfId });
      console.log(`Игрок ${selfId} выбрал роль астероида`);
      showNotification('Вы выбрали роль астероида');
    }
  });
}

// Обработка получения выбора ролей от других участников
function handleReceiveRoleChoice(data) {
  const { role, peerId } = data;

  if (role === 'cat') {
    gameState.roles.cat = peerId;
    console.log(`Игрок ${peerId} выбрал роль кота`);
    showNotification(`Игрок ${peerId} выбрал роль кота`);
  } else if (role === 'leaveCat') {
    gameState.roles.cat = null;
    console.log(`Игрок ${peerId} отказался от роли кота`);
    showNotification(`Игрок ${peerId} отказался от роли кота. Роль кота теперь свободна`);
  } else if (role === 'asteroid') {
    gameState.roles[peerId] = 'asteroid';
    console.log(`Игрок ${peerId} выбрал роль астероида`);
    showNotification(`Игрок ${peerId} выбрал роль астероида`);
  }
}


// Основной код
room.onPeerJoin(handlePeerJoin);
room.onPeerLeave(handlePeerLeave);
receivePlayerName(handleReceivePlayerName);
receiveRoleChoice(handleReceiveRoleChoice);

// Создаем элемент для отображения собственного курсора
document.addEventListener('DOMContentLoaded', () => {
  const selfCursorElement = createCursor(selfId, localStorage.getItem('name') || 'You', true);

  // Отслеживание движения мыши и обновление позиции собственного курсора
  document.addEventListener('mousemove', (e) => {
    selfCursorElement.style.left = `${e.clientX}px`;
    selfCursorElement.style.top = `${e.clientY}px`;
    sendCursorPosition({ x: e.clientX, y: e.clientY });
  });

  handleRoleSelection();

  // Обработка получения координат курсора от других пользователей
  receiveCursorPosition((position, peerId) => {
    if (cursors[peerId]) {
      cursors[peerId].style.left = `${position.x}px`;
      cursors[peerId].style.top = `${position.y}px`;
    }
  });

  // Отправка никнейма после подтверждения
  const confirmButton = document.querySelector('.confirm-button');
  if (confirmButton) {
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
  }
});
