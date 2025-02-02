import { playerName } from './player.js';

const cursors = {};
const peerNames = {};
const peerRoles = {};
export { cursors, peerNames, peerRoles };

// Обновляет позицию курсора на экране
export function moveCursor([x, y], id) { //[x, y] — нормализованные координаты (от 0 до 1)
  const el = cursors[id];
  if (el) {
    el.style.left = `${x * innerWidth}px`;
    el.style.top = `${y * innerHeight}px`;
  }
}

export function addCursor(id, isSelf) {
  const name = isSelf ? playerName : peerNames[id];
  if (!name) {
  return;
  }
  if (!cursors[id]) {
    const el = document.createElement("div");
    const img = document.createElement("img");
    const txt = document.createElement("p");

    el.className = `cursor${isSelf ? " self" : ""}`;
    el.dataset.id = id; // data-id используется для хранения данных, связанных с элементом, которые не обязательно должны быть уникальными
    el.style.position = 'absolute';
    el.style.left = `${innerWidth / 2}px`;
    el.style.top = `${innerHeight / 2}px`;
    el.style.display = 'none';
    txt.innerText = name;
    el.appendChild(img);
    el.appendChild(txt);
    document.body.appendChild(el);
    cursors[id] = el;
  }
}

export function removeCursor(id) {
  console.log(`Removing cursor for ${id}`);
  const el = cursors[id];
  if (el) {
    document.body.removeChild(el);
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
        img.src = "img/murka3.png";
        img.style.width = "150px";
        img.style.height = "150px";
      } else if (shapes.includes(role)) {
        img.src = role;
        img.style.width = "100px";
        img.style.height = "100px";
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