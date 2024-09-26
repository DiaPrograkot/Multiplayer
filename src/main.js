import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Массив с изображениями астероидов
let shapes = [
  "img/asteroid-purple.svg",
  "img/green-asteroid.svg",
  "img/orange-meteorite.svg",
  "img/asteroid-black.svg",
  "img/rock.svg",
  "img/meteorite-white.svg",
  "img/lightorange-asteroid.svg",
  "img/rocky-asteroid.svg",
  "img/purple-asteroid.svg",
];

// Функция для выбора случайного астероида
function getRandomAsteroid() {
  const randomIndex = Math.floor(Math.random() * shapes.length);
  return shapes[randomIndex];
}

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Отправка и получение позиций мыши и астероида
const [sendMousePos, getMousePos] = room.makeAction('mousePos');
const [sendAsteroid, getAsteroid] = room.makeAction('asteroid');

// Присваиваем случайный астероид при входе в игру
let playerAsteroid = getRandomAsteroid();

// Создаем элемент для своего астероида
const myAsteroidElement = document.createElement('img');
myAsteroidElement.src = playerAsteroid; // Присваиваем случайное изображение
myAsteroidElement.style.position = 'absolute';
myAsteroidElement.style.pointerEvents = 'none'; // Чтобы астероид не блокировал события мыши
document.body.appendChild(myAsteroidElement);

// Следим за движением мыши и обновляем позицию астероида
document.addEventListener('mousemove', (event) => {
  const mousePos = { x: event.clientX, y: event.clientY };
  
  // Обновляем позицию своего астероида
  myAsteroidElement.style.left = `${mousePos.x}px`;
  myAsteroidElement.style.top = `${mousePos.y}px`;

  // Отправляем данные о позиции мыши и астероиде другим игрокам
  sendMousePos(mousePos);
  sendAsteroid(playerAsteroid);
});

// Обработка подключения других игроков
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendAsteroid(playerAsteroid); // Отправляем свой астероид новому игроку
});

// Получение позиций мыши и астероидов от других игроков
getMousePos((mousePos, peerId) => {
  const asteroidElement = document.getElementById(`asteroid-${peerId}`);
  if (asteroidElement) {
    asteroidElement.style.left = `${mousePos.x}px`;
    asteroidElement.style.top = `${mousePos.y}px`;
  }
});

// Получение астероида от других игроков и отображение его на экране
getAsteroid((asteroid, peerId) => {
  let asteroidElement = document.getElementById(`asteroid-${peerId}`);
  
  // Если элемент астероида для этого игрока еще не создан, создаем его
  if (!asteroidElement) {
    asteroidElement = document.createElement('img');
    asteroidElement.id = `asteroid-${peerId}`;
    asteroidElement.src = asteroid;
    asteroidElement.style.position = 'absolute';
    asteroidElement.style.pointerEvents = 'none'; // Чтобы астероид не мешал кликам
    document.body.appendChild(asteroidElement);
  }
});
