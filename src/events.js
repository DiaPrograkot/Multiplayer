// выбор роли + обновление курсора
import { handleKeyDown, handleKeyUp, playerRole } from './player.js';
import { handleRoleSelection } from './player.js';
import { mousePos, targetPos, isMoving, isBraking } from './gameLoop.js'; // Импорт переменных mousePos, targetPos, isMoving и isBraking
import { keysPressed } from './player.js'; // Импорт переменной keysPressed
import { createLocalLaser } from './shooting.js'; // Импорт функции createLocalLaser
import { objectPos } from './gameLoop.js'; // Импорт objectPos из gameLoop.js
import { shipPos } from './player.js';
import { moveCursor } from './cursors.js';

// Обработка стрельбы
document.addEventListener("keydown", (event) => {
  if (event.key === " ") { // Проверяем, что нажата клавиша пробела
    console.log("Пробел нажат, стреляем!");

    // Используем objectPos для получения позиции курсора
    const laserPosition = {
      x: objectPos.x, // Позиция лазера по горизонтали
      y: objectPos.y // Позиция лазера по вертикали
    };
    createLocalLaser(laserPosition); // Создаем лазер
  }
});

//обновление позиции курсора и других связанных переменных
export function handleMouseMove({ clientX, clientY }) {
  if (playerRole === 'ship') {
    // Ограничиваем движение корабля границами экрана
    shipPos.x = Math.max(0, Math.min(clientX - 75, innerWidth - 150)); // 150 — ширина корабля
  } else {
    // Логика для астероидов
    mousePos.x = clientX / innerWidth;
    mousePos.y = clientY / innerHeight;
    targetPos.x = clientX;
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
          x: objectPos.x, // Используем позицию корабля по X
          y: objectPos.y  // Используем позицию корабля по Y
      };
      createLocalLaser(laserPosition); // Создаем лазер
  }
});