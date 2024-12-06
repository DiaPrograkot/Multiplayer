import { joinRoom, selfId } from 'trystero';
import {
  createCursor, 
  createOrRemoveCursor,
  handlePeerJoin,
  handlePeerLeave
} from "./player.js"
import {
  selectRole,
  handleRoleSelection,
  handleReceiveRoleChoice
} from "./roles.js"
import { showNotification } from "./ui.js"

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

// Основной код
room.onPeerJoin((peerId) => handlePeerJoin(peerId, cursors, peers, sendPlayerName));
room.onPeerLeave((peerId) => handlePeerLeave(peerId, cursors, peers, showNotification));
receivePlayerName(handleReceivePlayerName);
receiveRoleChoice((data) => handleReceiveRoleChoice(data, gameState, showNotification, peers));

function updateCursorPosition(cursorElement, position){
  cursorElement.style.left = `${position.x}px`;
  cursorElement.style.top = `${position.y}px`;
}

// Создаем элемент для отображения собственного курсора
document.addEventListener('DOMContentLoaded', () => {
  const selfCursorElement = createCursor(selfId, localStorage.getItem('name') || 'You', true);

  // Отслеживание движения мыши и обновление позиции собственного курсора
  document.addEventListener('mousemove', (e) => {
    updateCursorPosition(selfCursorElement, { x: e.clientX, y: e.clientY})
    sendCursorPosition({ x: e.clientX, y: e.clientY });
  });

  handleRoleSelection(selfId, gameState, showNotification, sendRoleChoice);

  // Обработка получения координат курсора от других пользователей
  receiveCursorPosition((position, peerId) => {
    if (cursors[peerId]) {
      updateCursorPosition(cursors[peerId], position)
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
