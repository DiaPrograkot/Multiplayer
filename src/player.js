/*
- сохраняет выбранную роль, меняет курсор, отправляет данные
- отображает курсоры других игроков
- как происходит движение с помощью клавиатуры
*/

import { selfId, sendRole, peerNames } from './init.js'; // Импорт selfId, sendRole и peerNames
import { updateCursor, cursors, peerRoles, addCursor, updateCursorName, showCursor, shapes } from './cursors.js'; // Импорт функции updateCursor, peerRoles, addCursor, updateCursorName и showCursor

let playerName = localStorage.getItem("name")?.trim();
let playerRole = null; // Изначально роль не выбрана
let roleSelected = false; // Указывает, выбрана ли роль игрока.
let roleMenuHidden = false; // Указывает, скрыто ли меню выбора роли.
let keysPressed = {}; // Объект, который отслеживает, какие клавиши нажаты.
let keyboardInput = { x: 0, y: 0 }; // Объект, который хранит текущие значения ввода с клавиатуры по осям x и y.

export { playerName, playerRole, roleSelected, roleMenuHidden, keysPressed, keyboardInput };

export function handleRoleSelection(role) {
  console.log(`Role selected: ${role}`);
  if (role === 'asteroid') {
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    playerRole = randomShape; // Сохраняем выбранную картинку как роль
  } else {
    playerRole = role; // Для других ролей просто сохраняем роль
  }

  roleSelected = true; // Устанавливаем флаг выбора роли
  updateCursor(selfId, playerRole);

  const startgame = document.querySelector(".startgame");
  if (startgame) {
    startgame.style.display = "none";
    roleMenuHidden = true; // Устанавливаем флаг, что меню выбора роли скрыто
    notifyRoleSelected(); // Уведомляем других игроков о выборе роли
  }

  // Отображение курсоров других игроков после выбора роли
  Object.keys(peerNames).forEach(peerId => {
    if (peerRoles[peerId]) {
      addCursor(peerId, false);
      updateCursor(peerId, peerRoles[peerId]); // Обновляем курсор для каждого игрока
      updateCursorName(peerId, peerNames[peerId]); // Обновляем имя под курсором
      showCursor(peerId); // Делаем курсор видимым
    }
  });

  // Отображение курсора текущего игрока после выбора роли
  const cursor = cursors[selfId];
  if (cursor) cursor.style.display = 'block'; // Делаем курсор видимым
}

export function notifyRoleSelected() {
  if (roleSelected && roleMenuHidden) {
    sendRole(playerRole); // Отправляем выбранную роль (или картинку для астероида)
  }
}

export function handleKeyDown(event) {
  console.log(`Key down: ${event.key}`);
  keysPressed[event.key] = true;
  updateKeyboardInput(event.key, true);
}

export function handleKeyUp(event) {
  console.log(`Key up: ${event.key}`);
  keysPressed[event.key] = false;
  updateKeyboardInput(event.key, false);
}

export function updateKeyboardInput(key, isPressed) {
  console.log(`Updating keyboard input for key: ${key}, isPressed: ${isPressed}`);
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
