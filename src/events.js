import { handleKeyDown, handleKeyUp, playerRole, handleRoleSelection, shipPos } from './player.js';
import { mousePos, targetPos, isMoving, isBraking, objectPos } from './gameLoop.js';
import { createLocalLaser } from './shooting.js';

// Обработка стрельбы
document.addEventListener("keydown", (event) => {
  if (event.key === " ") {
    console.log("Пробел нажат, стреляем!");
    // Используем objectPos для получения позиции корабля
    const laserPosition = {
      x: objectPos.x,
      y: objectPos.y
    };
    createLocalLaser(laserPosition); // Создаем лазер
  }
});

//Нормализует координаты мыши для синхронизации между игроками, обновляет целевые координаты для движения астероида, активирует движение и отключает торможение при движении мыши
export function handleMouseMove({ clientX, clientY }) {
  if (playerRole === 'ship') {
    // Ограничиваем движение корабля границами экрана
    shipPos.x = Math.max(0, Math.min(clientX - 75, innerWidth - 150)); // Math.max(0, ...) — не позволяет кораблю выйти за л. гр., Math.min(..., innerWidth - 150) — за пр. гр., clientX - 75 — центрирует корабль относительно курсора мыши (75 — половина ширины корабля).
  } else {
    mousePos.x = clientX / innerWidth; //Используются для синхронизации позиции курсора между игроками
    mousePos.y = clientY / innerHeight;
    targetPos.x = clientX; //Используются для расчета движения астероида
    targetPos.y = clientY;
    isMoving.value = true;
    isBraking.value = false;
  }
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

// Обработка стрельбы мышью
document.addEventListener("click", (event) => {
  if (playerRole === 'ship') { // Проверяем, что роль игрока — корабль
      const laserPosition = {
          x: objectPos.x, // Используем позицию корабля
          y: objectPos.y 
      };
      createLocalLaser(laserPosition);
  }
});