/*
-сохраняет выбранную роль, меняет курсор, отправляет данные
-отображает курсоры других игроков
-как происходит движение с помощью клавиатуры
*/

import { selfId, sendRole, peerNames } from './init.js'; // Импорт selfId, sendRole и peerNames
import { updateCursor, cursors } from './cursors.js'; // Импорт функции updateCursor

let playerName = localStorage.getItem("name")?.trim();
let playerRole = localStorage.getItem("role")?.trim();
let roleSelected = false; // Указывает, выбрана ли роль игрока.
let keysPressed = {}; // Объект, который отслеживает, какие клавиши нажаты.
let keyboardInput = { x: 0, y: 0 }; // Объект, который хранит текущие значения ввода с клавиатуры по осям x и y.

export { playerName, playerRole, roleSelected, keysPressed, keyboardInput };

export function handleRoleSelection(role) {
  console.log(`Role selected: ${role}`);
  localStorage.setItem('role', role);
  playerRole = role;
  roleSelected = true; // Устанавливаем флаг выбора роли
  updateCursor(selfId, role);
  sendRole(playerRole);

  const startgame = document.querySelector(".startgame");
  if (startgame) startgame.style.display = "none";

  // Отображение курсоров других игроков после выбора роли
  Object.keys(peerNames).forEach(peerId => {
    if (peerRoles[peerId]) {
      addCursor(peerId, false);
      updateCursor(peerId, peerRoles[peerId]); // Обновляем курсор для каждого игрока
      updateCursorName(peerId, peerNames[peerId]); // Обновляем имя под курсором
    }
  });

  // Отображение курсора текущего игрока после выбора роли
  const cursor = cursors[selfId];
  if (cursor) cursor.style.display = 'block'; // Делаем курсор видимым
}


export function handleKeyDown(event) {
  keysPressed[event.key] = true;
  updateKeyboardInput(event.key, true);
}

export function handleKeyUp(event) {
  keysPressed[event.key] = false;
  updateKeyboardInput(event.key, false);
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
