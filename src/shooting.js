import { room, selfId, sendCollision } from './init.js';
import { playerRole, roleSelected, shipPos, destroyPlayer } from './player.js';

let sendLaser, getLaser;

// Инициализация стрельбы
export function initShooting() {
  // Создаем действие для отправки данных о выстреле
  [sendLaser, getLaser] = room.makeAction('laserShot');

  // Обработка получения данных о выстреле от других игроков
  getLaser(([normalizedX, normalizedY], peerId) => {
    const x = normalizedX * innerWidth; // Преобразуем нормализованные координаты в пиксели
    const y = normalizedY * innerHeight;
    createRemoteLaser({ x, y }); // Создаем лазер для других игроков
  });
}

// Функция для создания лазера на клиенте
export function createLocalLaser(position) {
  if (playerRole !== 'ship') return;
  const container = document.querySelector(".container");
  const laser = document.createElement("img");
  laser.classList.add("laser");
  laser.setAttribute("src", "img/bullet.svg");
  container.append(laser);
  laser.className = 'laser';

  // Используем shipPos для позиции лазера
  laser.style.left = `${shipPos.x + 60}px`;
  laser.style.top = `${shipPos.y + 80}px`;
  document.body.appendChild(laser);

  sendLaser([shipPos.x / innerWidth, shipPos.y / innerHeight]);

  const moveLaser = () => {
    const laserRect = laser.getBoundingClientRect(); // Получаем границы лазера
    const screenHeight = window.innerHeight; // Высота экрана
    const speed = 150; // Скорость движения лазера

    // Проверяем, вышел ли лазер за пределы экрана
    if (laserRect.bottom < screenHeight) {
      laser.style.top = `${laserRect.top + speed}px`; // Двигаем лазер вниз

      // Проверяем столкновения с астероидами
      const asteroids = document.querySelectorAll('.cursor:not(.self)');
      asteroids.forEach(asteroid => {
        if (checkCollision(asteroid, laser)) {
          const asteroidId = asteroid.dataset.id;
          document.body.removeChild(laser);
          sendCollision({ asteroidId, laserPosition: [laserRect.left / innerWidth, laserRect.top / innerHeight] });

          // Уничтожаем игрока, если это его астероид
          if (asteroidId === selfId) {
            destroyPlayer();
          }
          return;
        }
      });
      requestAnimationFrame(moveLaser); // Продолжаем движение
    } else {
      document.body.removeChild(laser);
    }
  };

  if (roleSelected) {
    laser.style.visibility = "visible";
    moveLaser();
  }
}

// Функция для создания лазера для других игроков
function createRemoteLaser(laserData) {
  if (!roleSelected) return; // Если роль не выбрана, лазер не создается
  const container = document.querySelector(".container");
  const laser = document.createElement("img");
  laser.classList.add("laser");
  laser.setAttribute("src", "img/bullet.svg");
  container.append(laser);
  laser.style.visibility = "visible";
  laser.className = 'laser';
  laser.style.left = `${laserData.x + 60}px`;
  laser.style.top = `${laserData.y + 80}px`;
  document.body.appendChild(laser);

  const moveLaser = () => {
    const laserRect = laser.getBoundingClientRect(); // Получаем границы лазера
    const screenHeight = window.innerHeight; // Высота экрана
    const speed = 150; // Скорость движения лазера

    // Проверяем, вышел ли лазер за пределы экрана
    if (laserRect.bottom < screenHeight) {
      laser.style.top = `${laserRect.top + speed}px`;
      requestAnimationFrame(moveLaser);
    } else {
      document.body.removeChild(laser);
    }
  };
  moveLaser();
}

// Функция для проверки столкновения между двумя элементами
function checkCollision(element1, element2) {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();

  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}
