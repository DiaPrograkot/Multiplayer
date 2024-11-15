import { joinRoom, selfId } from "trystero";

const config = {
  appId: "your-app-id", // Замените 'your-app-id' на ваш реальный appId
};

const room = joinRoom(config, "room-id"); // Замените 'room-id' на ваш реальный roomId
console.log("Комната инициализирована:", room);

const cursors = {};
const peerNames = {};
const peerRoles = {};
let sendMove, getMove, sendName, getName, sendRole, getRole, sendGameState, getGameState;
let playerName = localStorage.getItem("name")?.trim();
let playerRole = localStorage.getItem("role")?.trim();
let mouseX = 0, mouseY = 0;
let canvas = null;
let roleSelected = false; // Флаг для отслеживания выбора роли

document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("canvas");
  if (canvas) {
    initRoom();
    addCursor(selfId, true);
    document.documentElement.className = "ready";
    document.addEventListener("mousemove", handleMouseMove);

    const shipButton = document.querySelector(".ship-button");
    const asteroidButton = document.querySelector(".asteroid-button");

    if (shipButton) {
      shipButton.addEventListener("click", () => handleRoleSelection('ship'));
    } else {
      console.warn("Кнопка выбора роли корабля не найдена.");
    }

    if (asteroidButton) {
      asteroidButton.addEventListener("click", () => handleRoleSelection('asteroid'));
    } else {
      console.warn("Кнопка выбора роли астероида не найдена.");
    }
  }
});

function initRoom() {
  [sendMove, getMove] = room.makeAction("mouseMove");
  [sendName, getName] = room.makeAction("playerName");
  [sendRole, getRole] = room.makeAction("playerRole");
  [sendGameState, getGameState] = room.makeAction("gameState");
  room.onPeerJoin(handlePeerJoin);
  room.onPeerLeave(handlePeerLeave);

  getMove(([x, y], peerId) => {
    console.log(`Получено движение курсора от ${peerId}: [${x}, ${y}]`);
    if (roleSelected && peerRoles[peerId]) {
      moveCursor([x, y], peerId);
    } else {
      console.warn(`Роль для ${peerId} не установлена или не выбрана.`);
    }
  });
  getName((name, peerId) => handlePlayerName(name, peerId));
  getRole((role, peerId) => handlePlayerRole(role, peerId));
  getGameState((gameState) => updateGameState(gameState));

  if (playerName) {
    sendName(playerName);
  }
  if (playerRole) {
    sendRole(playerRole);
  }
}

function handleMouseMove({ clientX, clientY }) {
  mouseX = clientX / innerWidth;
  mouseY = clientY / innerHeight;
  moveCursor([mouseX, mouseY], selfId);
  if (room && roleSelected) {
    console.log(`Отправка движения курсора: [${mouseX}, ${mouseY}]`);
    sendMove([mouseX, mouseY]);
  }
}

function handlePeerJoin(peerId) {
  console.log("Игрок присоединился:", peerId);
  if (peerId !== selfId && playerName) {
    sendName(playerName);
  }
  if (peerId !== selfId && playerRole) {
    sendRole(playerRole);
  }
  if (roleSelected) {
    addCursor(peerId, false);
  }
}

function handlePeerLeave(peerId) {
  console.log(`Игрок с ID ${peerId} вышел.`);
  if (peerNames[peerId]) {
    showNotification(`${peerNames[peerId]} left`);
    delete peerNames[peerId];
  }
  removeCursor(peerId);
}

function handlePlayerName(name, peerId) {
  const trimmedName = name ? name.trim() : "Неизвестный игрок";
  console.log(`Получено имя для ${peerId}: ${trimmedName}`);

  if (!peerNames[peerId]) {
    peerNames[peerId] = trimmedName;
    showNotification(`${trimmedName} joined`);
    if (roleSelected && peerRoles[peerId]) {
      console.log(`Добавление курсора для ${peerId}`);
      addCursor(peerId, false);
    }
  }

  updateCursorName(peerId, trimmedName); // Обновляем имя под курсором
}

function handlePlayerRole(role, peerId) {
  const trimmedRole = role ? role.trim() : "Неизвестная роль";
  console.log(`Получена роль для ${peerId}: ${trimmedRole}`);

  if (!peerRoles[peerId]) {
    peerRoles[peerId] = trimmedRole;
    showNotification(`${trimmedRole} joined`);
    if (roleSelected) {
      console.log(`Добавление курсора для ${peerId}`);
      addCursor(peerId, false);
    }
  }

  updateCursor(peerId, trimmedRole);
}

function moveCursor([x, y], id) {
  const el = cursors[id];
  if (el) {
    el.style.left = `${x * innerWidth}px`;
    el.style.top = `${y * innerHeight}px`;
    console.log(`Курсор перемещен для ${id}: [${x * innerWidth}, ${y * innerHeight}]`);
  } else {
    console.warn(`Курсор для ${id} не найден при попытке перемещения.`);
  }
}

function addCursor(id, isSelf) {
  if (!cursors[id]) {
    const el = document.createElement("div");
    const img = document.createElement("img");
    const txt = document.createElement("p");

    el.className = `cursor${isSelf ? " self" : ""}`;
    el.style.left = el.style.top = "-99px";
    img.src = "src/img/hand.png";

    txt.innerText = isSelf ? playerName : peerNames[id] || "Неизвестный игрок";
    el.appendChild(img);
    el.appendChild(txt);
    canvas.appendChild(el);
    cursors[id] = el;

    console.log(`Курсор добавлен для ${id}:`, el);
  } else {
    console.log(`Курсор уже существует для ${id}`);
  }
}

function removeCursor(id) {
  const el = cursors[id];
  if (el) {
    canvas.removeChild(el);
    delete cursors[id];
    console.log(`Курсор ${id} удалён.`);
  } else {
    console.warn(`Не удалось удалить курсор, так как он не найден для ID: ${id}`);
  }
}

function updateCursor(id, role) {
  const el = cursors[id];
  if (el) {
    const img = el.querySelector("img");
    if (img) {
      img.src = role === 'ship' ? "img/murka3.png" : "img/lightorange-asteroid.svg";
      el.style.display = role === 'ship' ? "none" : "block";
      if (role === 'asteroid') {
        img.style.width = "100px";
        img.style.height = "100px";
      }
      console.log(`Курсор обновлен для ${id} с ролью ${role}`);
    } else {
      console.warn(`Не удалось найти элемент img для курсора ${id}`);
    }
  } else {
    console.warn(`Не удалось найти курсор для ID: ${id}`);
  }
}

function updateCursorName(id, name) {
  const el = cursors[id];
  if (el) {
    const txt = el.querySelector("p");
    if (txt) {
      txt.innerText = name;
      console.log(`Имя под курсором обновлено для ${id}: ${name}`);
    } else {
      console.warn(`Не удалось найти элемент p для курсора ${id}`);
    }
  } else {
    console.warn(`Не удалось найти курсор для ID: ${id}`);
  }
}

function showNotification(message) {
  console.log("Уведомление:", message);
  const notifications = document.getElementById("notifications");
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notifications.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = 0;
    setTimeout(() => {
      notifications.removeChild(notification);
    }, 500);
  }, 3000);
}

if (!playerName) {
  const playerNameContainer = document.querySelector(".playerNameContainer");
  const playerInput = document.querySelector(".playerInput");
  const playerPlay = document.querySelector(".playerPlay");

  playerNameContainer.style.display = "flex";
  playerPlay.addEventListener("click", () => {
    playerName = playerInput.value.trim();
    if (playerName) {
      localStorage.setItem("name", playerName);
      playerNameContainer.style.display = "none";
      sendName(playerName);
      addCursor(selfId, true);
      console.log(`Имя игрока установлено: ${playerName}`);
    } else {
      console.warn("Имя игрока не может быть пустым.");
    }
  });
}

function updateGameState(gameState) {
  gameState.players.forEach((player) => {
    const playerElement = document.getElementById(`player-${player.id}`);
    if (playerElement) {
      playerElement.style.left = `${player.x}px`;
      playerElement.style.top = `${player.y}px`;
    }
  });

  gameState.asteroids.forEach((asteroid) => {
    const asteroidElement = document.getElementById(`asteroid-${asteroid.id}`);
    if (asteroidElement) {
      asteroidElement.style.left = `${asteroid.x}px`;
      asteroidElement.style.top = `${asteroid.y}px`;
    }
  });
}

function getCurrentGameState() {
  return {
    players: [
      { id: selfId, x: mouseX * innerWidth, y: mouseY * innerHeight },
    ],
    asteroids: [
      { id: "asteroid1", x: 100, y: 100 },
    ],
  };
}

function handleRoleSelection(role) {
  console.log(`Playing as ${role.charAt(0).toUpperCase() + role.slice(1)}`);
  localStorage.setItem('role', role);
  playerRole = role;
  roleSelected = true; // Устанавливаем флаг выбора роли
  updateCursor(selfId, role);
  console.log(`Отправка роли: ${playerRole}`);
  sendRole(playerRole);
  startNewGame();

  const startgame = document.querySelector(".startgame");
  if (startgame) {
    startgame.style.display = "none";
  } else {
    console.warn("Элемент startgame не найден.");
  }

  // Отображение курсоров других игроков после выбора роли
  Object.keys(peerNames).forEach(peerId => {
    if (peerRoles[peerId]) {
      addCursor(peerId, false);
      updateCursor(peerId, peerRoles[peerId]); // Обновляем курсор для каждого игрока
      updateCursorName(peerId, peerNames[peerId]); // Обновляем имя под курсором
    }
  });
}

function startNewGame() {
  // Функция для начала новой игры
  console.log("Новая игра началась");
  // Дополнительные действия для начала новой игры
}