import { playerRole, roleSelected, keyboardInput, shipPos, switchRoles } from './player.js';
import { moveCursor, peerRoles } from './cursors.js';
import { selfId, room, sendMove, sendRoleChange } from './init.js';

let targetPos = { x: innerWidth / 2, y: innerHeight / 2 }; // Целевая позиция, к которой должен двигаться астероид (позиция курсора мыши).
let objectVel = { x: 0, y: 0 }; // Текущая скорость
const objectMass = 0.5; // Масса объекта, мной подобранная для использования в коде (нужна в формуле ускорения)
let isMoving = { value: false }; // Флаг, указывающий, движется ли астероид в данный момент.
let isBraking = { value: false }; // Флаг, указывающий, тормозит ли астероид в данный момент.
const inertiaCoefficient = Math.random() * 0.19 + 0.8; // Случайный коэффициент инерции от 0.8 до 0.99
let lastTime = 0; // Хранит время последнего кадра анимации.
let mousePos = { x: 0, y: 0 }; // координаты для масштабирования

export { mousePos, targetPos, isMoving, isBraking };
export let objectPos = { x: innerWidth / 2, y: 10 };

export function updateAsteroidPosition(dt) {
  if (playerRole && roleSelected) {
    if (playerRole === 'ship') {
      // Для корабля обновляем позицию мгновенно
      objectPos.x = shipPos.x;
      objectPos.y = 10; // Фиксируем вертикальное положение на 10px
    } else {
      // Логика для астероидов
      // Вычисление расстояния от астероида до курсора
      const dx = targetPos.x - objectPos.x;
      const dy = targetPos.y - objectPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Если объект достиг курсора, начинаем торможение
      if (distance < 10) {
        isBraking.value = true;
      }

      if (isBraking.value) {
        // Применяем торможение с учетом коэффициента инерции
        objectVel.x *= inertiaCoefficient; // Замедление
        objectVel.y *= inertiaCoefficient; // Замедление
        if (Math.abs(objectVel.x) < 0.1 && Math.abs(objectVel.y) < 0.1) {
          objectVel.x = 0;
          objectVel.y = 0;
          isMoving.value = false; // Объект останавливается
          isBraking.value = false; // Торможение завершено
        }
      } else {
        const forceMagnitude = 7000; // Величина силы (тоже подобранное мной значение)
        const force = {  // Рассчет силы в конкретной ситуации
          x: (dx / distance) * forceMagnitude,
          y: (dy / distance) * forceMagnitude
        };
        const acceleration = calculateAcceleration(force, objectMass); // Вычисление ускорения
        // Обновление скорости
        objectVel.x = acceleration.x * dt;
        objectVel.y = acceleration.y * dt;
      }
      // Обновление позиции, только если объект движется
      if (isMoving.value) {
        objectPos.x += objectVel.x * dt;
        objectPos.y += objectVel.y * dt;
      }
      // Проверяем, достиг ли астероид y = 10
      if (objectPos.y <= 10) {
        sendRoleChange(selfId)
        switchRoles(selfId)
      }
    }

    // Учитываем ввод с клавиатуры
    if (keyboardInput.x !== 0 || keyboardInput.y !== 0) {
      objectVel.x += keyboardInput.x * dt * 1000; // Увеличение скорости
      objectVel.y += keyboardInput.y * dt * 1000; // Увеличение скорости
      isMoving.value = true; // Объект начинает двигаться
    }

    // Проверка границ экрана
    const canvasWidth = innerWidth;
    const canvasHeight = innerHeight;
    const objectSize = 100; // Размер астероида

    if (objectPos.x < 0) {
      objectPos.x = 0;
      objectVel.x = 0; // Останавливаем движение по оси X
    }
    if (objectPos.x + objectSize > canvasWidth) {
      objectPos.x = canvasWidth - objectSize;
      objectVel.x = 0; // Останавливаем движение по оси X
    }
    if (objectPos.y < 0) {
      objectPos.y = 0;
      objectVel.y = 0; // Останавливаем движение по оси Y
    }
    if (objectPos.y + objectSize > canvasHeight) {
      objectPos.y = canvasHeight - objectSize;
      objectVel.y = 0; // Останавливаем движение по оси Y
    }

    moveCursor([objectPos.x / innerWidth, objectPos.y / innerHeight], selfId);
    if (room && roleSelected) sendMove([objectPos.x / innerWidth, objectPos.y / innerHeight]);
  }
}

// Функция для вычисления ускорения
function calculateAcceleration(force, mass) {
  return {
    x: force.x / mass,
    y: force.y / mass
  };
}

export function gameLoop(timestamp) {
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (playerRole === 'ship') {
    // Если игрок — корабль, обновляем позицию корабля
    moveCursor([shipPos.x / innerWidth, shipPos.y / innerHeight], selfId);
    sendMove([shipPos.x / innerWidth, shipPos.y / innerHeight]);
  } else {
    // Если игрок — астероид, обновляем позицию астероида
    updateAsteroidPosition(dt);
  }
  requestAnimationFrame(gameLoop);
}

export function posCenter (){
  objectPos = { x: innerWidth / 2, y: innerHeight / 2 };
}