import { room, sendMove, selfId } from './init.js'; // Импорт room и sendMove из init.js
import { moveCursor } from './cursors.js'; // Импорт moveCursor из cursors.js
import { playerRole } from './player.js'; 
import { roleSelected } from './player.js'; // Импортируем roleSelected
import { shipPos } from './player.js';

// Переменные для стрельбы
let sendLaser, getLaser;

// Инициализация стрельбы
export function initShooting() {
    // Создаем действие для отправки данных о выстреле
    [sendLaser, getLaser] = room.makeAction('laserShot');

    // Обработка получения данных о выстреле от других игроков
    getLaser(([normalizedX, normalizedY], peerId) => {
        console.log(`Получены данные о выстреле от ${peerId}:`, { normalizedX, normalizedY });
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
      requestAnimationFrame(moveLaser); // Продолжаем движение
    } else {
      // Если лазер вышел за пределы экрана, удаляем его
      document.body.removeChild(laser);
    }
  };

  // Проверяем, выбрана ли роль у игрока
  if (roleSelected) {
    laser.style.visibility = "visible"; // Делаем лазер видимым
    moveLaser(); // Запускаем движение лазера
  }
}


// Функция для создания лазера для других игроков
function createRemoteLaser(laserData) {
  // Проверяем, выбрана ли роль у текущего игрока
  if (!roleSelected) return; // Если роль не выбрана, лазер не создается

  const container = document.querySelector(".container");
  const laser = document.createElement("img");
  laser.classList.add("laser");
  laser.setAttribute("src", "img/bullet.svg");
  container.append(laser);
  laser.style.visibility = "visible"; // Лазер видимый
  laser.className = 'laser';
  laser.style.left = `${laserData.x + 60}px`; // Используем абсолютные координаты
  laser.style.top = `${laserData.y + 80}px`;
  document.body.appendChild(laser); // Добавляем лазер в body

  const moveLaser = () => {
    const laserRect = laser.getBoundingClientRect(); // Получаем границы лазера
    const screenHeight = window.innerHeight; // Высота экрана
    const speed = 150; // Скорость движения лазера

    // Проверяем, вышел ли лазер за пределы экрана
    if (laserRect.bottom < screenHeight) {
      laser.style.top = `${laserRect.top + speed}px`; // Двигаем лазер вниз
      requestAnimationFrame(moveLaser); // Продолжаем движение
    } else {
      // Если лазер вышел за пределы экрана, удаляем его
      document.body.removeChild(laser);
    }
  };

  moveLaser(); // Запускаем движение лазера
}