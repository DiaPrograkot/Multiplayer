/*
- сохраняет выбранную роль, меняет курсор, отправляет данные
- отображает курсоры других игроков
- как происходит движение с помощью клавиатуры
*/

import { selfId, sendRole, peerNames, blockShipButton, sendPlayerState } from './init.js'; // Импорт selfId, sendRole и peerNames
import { updateCursor, cursors, peerRoles, addCursor, updateCursorName, showCursor, shapes } from './cursors.js'; // Импорт функции updateCursor, peerRoles, addCursor, updateCursorName и showCursor

let playerName = localStorage.getItem("name")?.trim();
let playerRole = null; // Изначально роль не выбрана
let roleSelected = false; // Указывает, выбрана ли роль игрока.
let roleMenuHidden = false; // Указывает, скрыто ли меню выбора роли.
let keysPressed = {}; // Объект, который отслеживает, какие клавиши нажаты.
let keyboardInput = { x: 0, y: 0 }; // Объект, который хранит текущие значения ввода с клавиатуры по осям x и y.
let shipPos = { x: innerWidth / 2, y: 10 }; // Начальная позиция корабля
const shipSpeed = 60; // Скорость корабля при нажатии клавиш

// Добавляем переменную для отслеживания состояния игрока
let isPlayerDestroyed = false;

// Функция для уничтожения игрока
export function destroyPlayer() {
  if (!isPlayerDestroyed) {
      console.log("Игрок уничтожен!");
      isPlayerDestroyed = true;
      // Скрываем курсор игрока
      const cursor = cursors[selfId];
      if (cursor) {
          cursor.style.display = 'none';
      }
      // Отправляем состояние игрока (уничтожен)
      sendPlayerState({ peerId: selfId, isDestroyed: true });
      // Запускаем таймер для восстановления игрока через 3 секунды
      setTimeout(respawnPlayer, 5000);
  }
}

// Функция для восстановления игрока
export function respawnPlayer() {
  if (isPlayerDestroyed) {
      console.log("Игрок восстановлен!");
      isPlayerDestroyed = false;

      // Восстанавливаем игрока на стартовую позицию
      shipPos.x = innerWidth / 2; // Центр экрана по горизонтали
      shipPos.y = 10; // Фиксированная позиция по вертикали

      // Выбираем случайную картинку для астероида
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      playerRole = randomShape; // Обновляем роль игрока на новую картинку

      // Обновляем курсор с новой картинкой
      updateCursor(selfId, playerRole);

      // Делаем курсор игрока видимым
      const cursor = cursors[selfId];
      if (cursor) {
          cursor.style.display = 'block';
      }
      // Отправляем состояние игрока (восстановлен) и новую картинку
      sendPlayerState({ peerId: selfId, isDestroyed: false, newShape: playerRole });
  }
}

export { playerName, playerRole, roleSelected, roleMenuHidden, keysPressed, keyboardInput, shipPos, shipSpeed };

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

  // Блокируем кнопку выбора роли "ship", если роль "ship" выбрана
  if (role === "ship") {
    blockShipButton();
  }
}

export function notifyRoleSelected() {
  if (roleSelected && roleMenuHidden) {
    sendRole(playerRole); // Отправляем выбранную роль (или картинку для астероида)
  }
}

export function handleKeyDown(event) {
  console.log(`Key down: ${event.key}`);
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
  console.log(`Key up: ${event.key}`);
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