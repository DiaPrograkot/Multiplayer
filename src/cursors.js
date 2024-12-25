// Создание и удаление курсора, обновление его позиции. Картинка от роли, подпись снизу по имени.
import { playerName } from './player.js';

const cursors = {};
const peerNames = {};
const peerRoles = {};

export { cursors, peerNames, peerRoles };

// Обновляет позицию курсора на экране
export function moveCursor([x, y], id) {
  const el = cursors[id];
  if (el) {
    el.style.left = `${x * innerWidth}px`;
    el.style.top = `${y * innerHeight}px`;
    console.log(`Cursor ${id} moved to:`, { x, y });
  } else {
    console.error(`Cursor element for ID ${id} not found!`);
  }
}

export function addCursor(id, isSelf) {
  console.log(`Adding cursor for ${id}`);
  if (!cursors[id]) {
    const el = document.createElement("div");
    const img = document.createElement("img");
    const txt = document.createElement("p");

    el.className = `cursor${isSelf ? " self" : ""}`;
    el.style.position = 'absolute'; // Убедитесь, что позиция абсолютная
    el.style.left = `${innerWidth / 2}px`;
    el.style.top = `${innerHeight / 2}px`;
    el.style.display = 'none'; // Изначально скрываем курсор
    img.src = "src/img/hand.png";
    img.style.width = "100px"; // Увеличиваем размер астероида
    img.style.height = "100px"; // Увеличиваем размер астероида
    txt.innerText = isSelf ? playerName : peerNames[id] || "Неизвестный игрок";
    el.appendChild(img);
    el.appendChild(txt);
    document.body.appendChild(el); // Убедитесь, что курсор добавляется в DOM
    cursors[id] = el;
  }
}

export function removeCursor(id) {
  console.log(`Removing cursor for ${id}`);
  const el = cursors[id];
  if (el) {
    document.body.removeChild(el); // Убедитесь, что курсор удаляется из DOM
    delete cursors[id];
  }
}

export function updateCursor(id, role) {
  console.log(`Updating cursor for ${id} with role: ${role}`);
  const el = cursors[id];
  if (el) {
    const img = el.querySelector("img");
    if (img) {
      if (role === 'ship') {
        img.src = "img/murka3.png"; // Картинка для корабля
        img.style.width = "150px"; // Увеличиваем размер корабля
        img.style.height = "150px"; // Увеличиваем размер корабля
      } else if (role === 'asteroid') {
        img.src = "img/lightorange-asteroid.svg"; // Дефолтная картинка для астероида
      } else if (shapes.includes(role)) {
        img.src = role; // Если роль — это одна из картинок, используем её
      }
    }
  }
}

export function updateCursorName(id, name) {
  console.log(`Updating cursor name for ${id} to: ${name}`);
  const el = cursors[id];
  if (el) {
    const txt = el.querySelector("p");
    if (txt) {
      txt.innerText = name;
    }
  }
}

export function showCursor(id) {
  const el = cursors[id];
  if (el) {
    el.style.display = 'block'; // Делаем курсор видимым
  }
}

export const shapes = [
  "img/asteroid-purple.svg",
  "img/green-asteroid.svg",
  "img/orange-meteorite.svg",
  "img/asteroid-black.svg",
  "img/rock.svg",
  "img/meteorite-white.svg",
  "img/lightorange-asteroid.svg",
  "img/rocky-asteroid.svg",
  "img/purple-asteroid.svg",
];