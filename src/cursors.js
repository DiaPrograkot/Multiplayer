// Создание и удаление курсора, обновление его позиции. Картинка от роли, подпись снизу по имени.
import { playerName } from './player.js';

const cursors = {};
const peerNames = {};
const peerRoles = {};

export { cursors, peerNames, peerRoles };

//Обновляет позицию курсора на экране
export function moveCursor([x, y], id) {
  const el = cursors[id];
  if (el) {
    el.style.left = `${x * innerWidth}px`;
    el.style.top = `${y * innerHeight}px`;
  }
}

export function addCursor(id, isSelf) {
  if (!cursors[id]) {
    const el = document.createElement("div");
    const img = document.createElement("img");
    const txt = document.createElement("p");

    el.className = `cursor${isSelf ? " self" : ""}`;
    el.style.left = `${innerWidth / 2}px`; // Устанавливаем начальную горизонтальную позицию в центре экрана
    el.style.top = `${innerHeight / 2}px`; // Устанавливаем начальную вертикальную позицию в центре экрана
    el.style.display = 'none'; // Изначально скрываем курсор
    img.src = "src/img/hand.png";

    txt.innerText = isSelf ? playerName : peerNames[id] || "Неизвестный игрок";
    el.appendChild(img);
    el.appendChild(txt);
    canvas.appendChild(el);
    cursors[id] = el;
  }
}



export function removeCursor(id) {
  const el = cursors[id];
  if (el) {
    canvas.removeChild(el);
    delete cursors[id];
  }
}

export function updateCursor(id, role) {
  const el = cursors[id];
  if (el) {
    const img = el.querySelector("img");
    if (img) {
      img.src = role === 'ship' ? "img/murka3.png" : "img/lightorange-asteroid.svg";
      if (role === 'asteroid') {
        img.style.width = "100px";
        img.style.height = "100px";
      }
    }
  }
}

export function updateCursorName(id, name) {
  const el = cursors[id];
  if (el) {
    const txt = el.querySelector("p");
    if (txt) {
      txt.innerText = name;
    }
  }
}
