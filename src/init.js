import { joinRoom, selfId } from "trystero";
import { playerName, playerRole, roleSelected, roleMenuHidden, destroyPlayer, switchRoles, setPlayerName } from './player.js';
import { peerNames, peerRoles, addCursor, removeCursor, updateCursorName, updateCursor, showCursor, moveCursor, cursors } from './cursors.js';
import { showNotification } from './main.js';

// Конфигурация и инициализация комнаты
const config = { appId: "your-app-id" };
const room = joinRoom(config, "room");
console.log("Комната инициализирована:", room);
let sendMove, getMove, sendName, getName, sendRole, getRole, sendCollision, getCollision, sendPlayerState, getPlayerState, sendRoleChange, getRoleChange, sendRoleChangeRequest, getRoleChangeRequest;

export function initRoom() {
  /* Функция room.makeAction (является частью библиотеки trystero) позволяет создавать действия для отправки и получения данных определенного типа.
  Она возвращает пару функций: одну для отправки данных и другую для получения данных. */
  [sendMove, getMove] = room.makeAction("mouseMove");
  [sendName, getName] = room.makeAction("playerName");
  [sendRole, getRole] = room.makeAction("playerRole");
  [sendCollision, getCollision] = room.makeAction("collision"); // Создаем действие для столкновений
  [sendRoleChange, getRoleChange] = room.makeAction("roleChange");

  room.onPeerJoin(handlePeerJoin);
  room.onPeerLeave(handlePeerLeave);
  /* Получает данные о движении курсора. При чем делает она это после того, как получена роль данного игрока и другого пользователя
  (движения которого мы получаем), видим его передвижения на экране*/
  getMove(([x, y], peerId) => {
    if (roleSelected && peerRoles[peerId]) moveCursor([x, y], peerId);
  });
  getName((name, peerId) => handlePlayerName(name, peerId));
  getRole((role, peerId) => handlePlayerRole(role, peerId));
  if (playerName) sendName(playerName);
  if (playerRole) sendRole(playerRole);

  // Создаем действие для синхронизации состояния игрока
  [sendPlayerState, getPlayerState] = room.makeAction("playerState");

  // Обработка получения состояния игрока
  getPlayerState(({ peerId, isDestroyed, newShape }, senderId) => {
    console.log(`Получено состояние игрока ${peerId}: isDestroyed = ${isDestroyed}`);
    const cursor = cursors[peerId];
    if (cursor) {
      if (isDestroyed) {
        cursor.style.display = 'none';
      } else {
        updateCursor(peerId, newShape);
        cursor.style.display = 'block';
      }
    }
  });

  // Обработка событий столкновений
  getCollision(({ asteroidId, laserPosition }, peerId) => {
    handleCollision(asteroidId, laserPosition);
  });


getRoleChange(({asteroidId}) => {
  switchRoles(asteroidId); // Вызываем функцию для смены ролей
});
}

// Функция для обработки столкновений
function handleCollision(asteroidId, laserPosition) {
  const asteroid = document.querySelector(`.cursor[data-id="${asteroidId}"]`);
  const laser = document.querySelector('.laser');
  if (laser) {
    document.body.removeChild(laser);
  }
  // Уничтожаем игрока, если это его астероид
  if (asteroidId === selfId) {
    destroyPlayer();
  }
}

// Отправляет имя, роль текущего игрока новому, создает для него курсор
export function handlePeerJoin(peerId) {
  console.log(`Игрок ${peerId} присоединился. Имя: ${peerNames[peerId] || "неизвестно"}`);
  if (peerId !== selfId && playerName) sendName(playerName);
  if (peerId !== selfId && playerRole) sendRole(playerRole);
}

// Удаляем данные, сообщаем об уходе
export function handlePeerLeave(peerId) {
  console.log(`Игрок с ID ${peerId} вышел.`);
  if (peerNames[peerId]) {
    showNotification(`${peerNames[peerId]} left`);
    delete peerNames[peerId];
  }
  removeCursor(peerId);
}

// Добавляет имя игрока в peerNames, сообщает о входе, добавляет курсор игрока на экран, если роль выбрана, не забывая имя подписать под ним.
export function handlePlayerName(name, peerId) {
  const trimmedName = name ? name.trim() : "Неизвестный игрок";
  console.log(`Получено имя для ${peerId}: ${trimmedName}`);
  if (!peerNames[peerId]) {
    peerNames[peerId] = trimmedName;
    showNotification(`${trimmedName} joined`);
  }
  updateCursorName(peerId, trimmedName);
}

// Функция для блокировки кнопки выбора роли корабля
export function blockShipButton() {
  const shipButton = document.querySelector(".ship-button");
  if (shipButton) {
    showNotification("The cat's role is taken.");
    shipButton.style.pointerEvents = "none"; // Блокируем клики
    shipButton.style.opacity = "0.5"; // Делаем кнопку неактивной (опционально)
  }
}

// Добавляет роль в объект peerRoles, сообщает роль, добавляет курсор игрока на экран, если роль выбрана.
export function handlePlayerRole(role, peerId) {
  const trimmedRole = role ? role.trim() : "Неизвестная роль";
  console.log(`Получена роль для ${peerId}: ${trimmedRole}`);
  if (!peerRoles[peerId]) {
    peerRoles[peerId] = trimmedRole;
    showNotification(`${trimmedRole} joined`);
    if (roleSelected && roleMenuHidden) {
      addCursor(peerId, false);
      updateCursor(peerId, trimmedRole);
      showCursor(peerId);
    }

    // Проверяем, если роль "ship", блокируем кнопку
    if (trimmedRole === "ship") {
      blockShipButton();
    }
  } else {
    peerRoles[peerId] = trimmedRole;
    updateCursor(peerId, trimmedRole);
    showCursor(peerId);
  }
}

export { sendRole, room, selfId, sendMove, peerNames, sendCollision, sendPlayerState, sendRoleChange, sendRoleChangeRequest, sendName };