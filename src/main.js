import { initRoom, selfId } from './init.js';
import { playerName,  } from './player.js';
import { addCursor,} from './cursors.js';
import { initEventListeners } from './events.js';
import { gameLoop } from './gameLoop.js';
import { initShooting } from './shooting.js';

document.addEventListener("DOMContentLoaded", () => {
  initShooting();
});

export function showNotification(message) {
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

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  if (canvas) {
    initRoom();
    addCursor(selfId, true);
    document.documentElement.className = "ready";
    initEventListeners();

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
        }
      });
    }

    requestAnimationFrame(gameLoop);
  }
});