import { joinRoom, selfId } from "trystero";
import { playerName, playerRole, roleSelected, roleMenuHidden, notifyRoleSelected } from './player.js';
import { peerNames, peerRoles, addCursor, removeCursor, updateCursorName, updateCursor, showCursor, moveCursor } from './cursors.js';
import { showNotification } from './main.js';

// Конфигурация и инициализация комнаты
const config = { appId: "your-app-id" };
const room = joinRoom(config, "room");
console.log("Комната инициализирована:", room);
// Переменные для отправки и получения данных (передвижения, имя, роль игрока)
let sendMove, getMove, sendName, getName, sendRole, getRole;

export function initRoom() {
  /* Функция room.makeAction (является частью библиотеки trystero) позволяет создавать действия для отправки и получения данных определенного типа.
  Она возвращает пару функций: одну для отправки данных и другую для получения данных. */
  [sendMove, getMove] = room.makeAction("mouseMove");
  [sendName, getName] = room.makeAction("playerName");
  [sendRole, getRole] = room.makeAction("playerRole");
  room.onPeerJoin(handlePeerJoin);
  room.onPeerLeave(handlePeerLeave);
  /* Получает данные о движении курсора. При чем делает она это после того, как получена роль данного игрока и другого пользователя
  (движения которого мы получаем), видим его передвижения на экране*/
  getMove(([x, y], peerId) => {
    if (roleSelected && peerRoles[peerId]) moveCursor([x, y], peerId);
  });
  // Получаем роль и имя -> обрабатываем их, обновляем данные
  getName((name, peerId) => handlePlayerName(name, peerId));
  getRole((role, peerId) => handlePlayerRole(role, peerId));
  // Отправляем свои
  if (playerName) sendName(playerName);
  if (playerRole) sendRole(playerRole);
}

// Отправляет имя, роль текущего игрока новому, создает для него курсор
export function handlePeerJoin(peerId) {
  console.log("Игрок присоединился:", peerId);
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

// Добавляет роль в объект peerRoles, сообщает роль, добавляет курсор игрока на экран, если роль выбрана.
export function handlePlayerRole(role, peerId) {
  const trimmedRole = role ? role.trim() : "Неизвестная роль";
  console.log(`Получена роль для ${peerId}: ${trimmedRole}`);
  if (!peerRoles[peerId]) {
    peerRoles[peerId] = trimmedRole;
    showNotification(`${trimmedRole} joined`);
    if (roleSelected && roleMenuHidden) {
      addCursor(peerId, false);
      updateCursor(peerId, trimmedRole); // Обновляем курсор с учетом роли или картинки
      showCursor(peerId); // Делаем курсор видимым
    }
  } else {
    updateCursor(peerId, trimmedRole);
    showCursor(peerId); // Делаем курсор видимым
  }
}

export { sendRole, room, selfId, sendMove, peerNames }; // Экспорт функции sendRole, переменной room, selfId, sendMove и peerNames