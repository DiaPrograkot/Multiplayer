import { selfId, sendRole, peerNames, blockShipButton, sendPlayerState } from './init.js';
import { updateCursor, cursors, peerRoles, addCursor, updateCursorName, showCursor, shapes } from './cursors.js';
import {posCenter} from './gameLoop.js'

let playerName = localStorage.getItem("name")?.trim();
let playerRole = null;
let roleSelected = false;
let roleMenuHidden = false;
let keysPressed = {}; // Объект, который отслеживает, какие клавиши нажаты.
let keyboardInput = { x: 0, y: 0 }; // Объект, который хранит текущие значения ввода с клавиатуры по осям x и y.
let shipPos = { x: innerWidth / 2, y: 10 }; // Начальная позиция корабля
const shipSpeed = 60; // Скорость корабля при нажатии клавиш
let isPlayerDestroyed = false;

export function destroyPlayer() {
  if (!isPlayerDestroyed) {
    isPlayerDestroyed = true;
    const cursor = cursors[selfId];
    if (cursor) {
      cursor.style.display = 'none';
    }
    sendPlayerState({ peerId: selfId, isDestroyed: true });
    setTimeout(respawnPlayer, 5000);
  }
}

export function respawnPlayer() {
  if (isPlayerDestroyed) {
    isPlayerDestroyed = false;
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    playerRole = randomShape;
    updateCursor(selfId, playerRole);
    const cursor = cursors[selfId];
    if (cursor) {
      cursor.style.display = 'block';
    }
    posCenter()
    sendPlayerState({ peerId: selfId, isDestroyed: false, newShape: playerRole });
  }
}

export { playerName, playerRole, roleSelected, roleMenuHidden, keysPressed, keyboardInput, shipPos, shipSpeed };

export function handleRoleSelection(role) {
  if (role === 'asteroid') {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    playerRole = randomShape;
  } else {
    playerRole = role;
  }
  roleSelected = true;
  updateCursor(selfId, playerRole);

  const startgame = document.querySelector(".startgame");
  if (startgame) {
    startgame.style.display = "none";
    roleMenuHidden = true;
    notifyRoleSelected();
  }

  // Отображение курсоров других игроков после выбора роли
  Object.keys(peerNames).forEach(peerId => {
    if (peerRoles[peerId]) {
      addCursor(peerId, false);
      updateCursor(peerId, peerRoles[peerId]);
      updateCursorName(peerId, peerNames[peerId]);
      showCursor(peerId);
    }
  });

  // Отображение курсора текущего игрока после выбора роли
  const cursor = cursors[selfId];
  if (cursor) cursor.style.display = 'block';

  // Блокируем кнопку выбора роли "ship", если роль "ship" выбрана
  if (role === "ship") {
    blockShipButton();
  }
}

export function notifyRoleSelected() {
  if (roleSelected && roleMenuHidden) {
    sendRole(playerRole);
  }
}

export function handleKeyDown(event) {
  switch (event.key) {
    case 'ArrowLeft':
      keyboardInput.x = -1; // Движение влево для астероидов
      if (playerRole === 'ship') {
        shipPos.x = Math.max(0, shipPos.x - shipSpeed); // Ограничение движения влево
      }
      break;
    case 'ArrowRight':
      keyboardInput.x = 1; // Движение вправо для астероидов
      if (playerRole === 'ship') {
        shipPos.x = Math.min(innerWidth - 150, shipPos.x + shipSpeed); // Ограничение движения вправо
      }
      break;
    case 'ArrowUp':
      keyboardInput.y = -1; // Движение вверх для астероидов
      break;
    case 'ArrowDown':
      keyboardInput.y = 1; // Движение вниз для астероидов
      break;
  }
}

export function handleKeyUp(event) {
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowRight':
      keyboardInput.x = 0; // Остановка по горизонтали для астероидов
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      keyboardInput.y = 0; // Остановка по вертикали для астероидов
      break;
  }
}
export function updateKeyboardInput(key, isPressed) {
  switch (key) {
    case 'ArrowUp':
      keyboardInput.y = isPressed ? -1 : 0;
      break;
    case 'ArrowDown':
      keyboardInput.y = isPressed ? 1 : 0;
      break;
    case 'ArrowLeft':
      keyboardInput.x = isPressed ? -1 : 0;
      break;
    case 'ArrowRight':
      keyboardInput.x = isPressed ? 1 : 0;
      break;
  }
}

export function switchRoles(asteroidId) {
  if (playerRole == 'ship'){
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    posCenter()
    peerRoles[selfId] = randomShape;
    playerRole = randomShape;
    updateCursor(selfId, randomShape);
    sendRole(randomShape);
  }
  if (selfId === asteroidId) {
  playerRole = 'ship';
  peerRoles[asteroidId] = 'ship' 
  updateCursor(asteroidId, 'ship');
  sendRole(playerRole);
  }
}
