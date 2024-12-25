import { room, sendMove, selfId } from './init.js'; // Импорт room и sendMove из init.js
import { moveCursor } from './cursors.js'; // Импорт moveCursor из cursors.js
import { playerRole } from './player.js'; 

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
    // Проверяем, что роль игрока — корабль
    if (playerRole !== 'ship') {
        console.log('Только корабль может стрелять!');
        return; // Прерываем выполнение функции
    }

    console.log('Creating local laser at position:', position);
    let container = document.querySelector(".container");
    let laser = document.createElement("img");
    laser.classList.add("laser");
    laser.setAttribute("src", "img/bullet.svg");
    container.append(laser);
    laser.style.visibility = "visible";
    laser.className = 'laser';
    laser.style.left = `${position.x + 60}px`;
    laser.style.top = `${position.y + 80}px`;
    document.body.appendChild(laser); // Добавляем лазер в body
    console.log('Лазер добавлен в DOM:', laser); // Логируем добавление лазера

// Отправляем данные о выстреле другим игрокам
sendLaser([position.x / innerWidth, position.y / innerHeight]); // Нормализуем координаты
console.log('Данные о выстреле отправлены другим игрокам:', [position.x / innerWidth, position.y / innerHeight]);

    // Удаляем лазер через 3 секунды (увеличиваем время)
    setTimeout(() => {
        console.log('Удаляем лазер');
        document.body.removeChild(laser);
    }, 3000); // Удаляем лазер через 3 секунды

    // Двигаем лазер вниз с постоянной скоростью
    const moveLaser = () => {
        const currentTop = parseInt(laser.style.top, 10);
        const screenHeight = window.innerHeight;
        const speed = 10; // Скорость движения лазера (пикселей в кадр)

        if (currentTop < screenHeight) {
            laser.style.top = `${currentTop + speed}px`; // Увеличиваем top на постоянную скорость
            requestAnimationFrame(moveLaser); // Продолжаем движение
        }
    };
    moveLaser(); // Запускаем движение лазера
}


// Функция для создания лазера для других игроков
function createRemoteLaser(laserData) {
    console.log('Создаем лазер для других игроков на позиции:', laserData);
    let container = document.querySelector(".container");
    let laser = document.createElement("img");
    laser.classList.add("laser");
    laser.setAttribute("src", "img/bullet.svg");
    container.append(laser);
    laser.style.visibility = "visible";
    laser.className = 'laser';
    laser.style.left = `${laserData.x + 60}px`; // Используем абсолютные координаты
    laser.style.top = `${laserData.y + 80}px`;
    document.body.appendChild(laser); // Добавляем лазер в body
    console.log('Лазер добавлен в DOM:', laser); // Логируем добавление лазера

    // Удаляем лазер через 3 секунды (увеличиваем время)
    setTimeout(() => {
        console.log('Удаляем лазер для других игроков');
        document.body.removeChild(laser);
    }, 3000); // Удаляем лазер через 3 секунды

    // Двигаем лазер вниз с постоянной скоростью
    const moveLaser = () => {
        const currentTop = parseInt(laser.style.top, 10);
        const screenHeight = window.innerHeight;
        const speed = 10; // Скорость движения лазера (пикселей в кадр)

        if (currentTop < screenHeight) {
            laser.style.top = `${currentTop + speed}px`; // Увеличиваем top на постоянную скорость
            requestAnimationFrame(moveLaser); // Продолжаем движение
        }
    };
    moveLaser(); // Запускаем движение лазера
}