// выбор роли + обновление курсора

import { handleKeyDown, handleKeyUp } from './player.js';
import { moveCursor } from './cursors.js';
import { handleRoleSelection } from './player.js';
import { mousePos, targetPos, isMoving, isBraking } from './gameLoop.js'; // Импорт переменных mousePos, targetPos, isMoving и isBraking
import { keysPressed } from './player.js'; // Импорт переменной keysPressed

//обновление позиции курсора и других связанных переменных
export function handleMouseMove({ clientX, clientY }) {
  mousePos.x = clientX / innerWidth;
  mousePos.y = clientY / innerHeight;
  targetPos.x = clientX;
  targetPos.y = clientY;
  isMoving.value = true; // Объект начинает двигаться
  isBraking.value = false; // Сброс флага торможения
}

export function initEventListeners() {
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  const shipButton = document.querySelector(".ship-button");
  const asteroidButton = document.querySelector(".asteroid-button");

  if (shipButton) {
    shipButton.addEventListener("click", () => {
      console.log("Ship button clicked");
      handleRoleSelection('ship');
    });
  }

  if (asteroidButton) {
    asteroidButton.addEventListener("click", () => {
      console.log("Asteroid button clicked");
      handleRoleSelection('asteroid');
    });
  }
}
