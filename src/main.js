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

// Функция для отображения сообщений на экране и их удаления через 5 секунд
function addMessage(message) {
  const messageBox = document.querySelector('.messages'); // Элемент с классом "messages"
  const newMessage = document.createElement('div');
  newMessage.textContent = message;
  messageBox.appendChild(newMessage); 
  // Удаляем сообщение через 5 секунд
  setTimeout(() => {
    messageBox.removeChild(newMessage);
  }, 5000);
}

// Функция для выбора случайного астероида
function getRandomAsteroid() {
  const randomIndex = Math.floor(Math.random() * shapes.length);
  return shapes[randomIndex];
}

// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Отправка и получение позиций мыши
const [sendMousePos, getMousePos] = room.makeAction('mousePos');
const [sendAsteroid, getAsteroid] = room.makeAction('asteroid');

// Присваиваем случайный астероид при входе в игру
let playerAsteroid = getRandomAsteroid();

// Отправляем позицию мыши и астероид другим игрокам
document.addEventListener('mousemove', (event) => {
  const mousePos = { x: event.clientX, y: event.clientY };
  sendMousePos(mousePos);
  sendAsteroid(playerAsteroid);
});

// Обработка подключения других игроков
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendAsteroid(playerAsteroid); // Отправляем свой астероид новому игроку
});

// Обработка выхода других игроков
room.onPeerLeave(peerId => {
  console.log(`${peerId} left`);
  addMessage(`Player left the game`);
});

// Получение позиции мыши и астероида от других игроков
getMousePos((mousePos, peerId) => {
  const asteroidElement = document.getElementById(`asteroid-${peerId}`);
  if (asteroidElement) {
    asteroidElement.style.left = `${mousePos.x}px`;
    asteroidElement.style.top = `${mousePos.y}px`;
  }
});

// Получение астероида от других игроков
getAsteroid((asteroid, peerId) => {
  const asteroidElement = document.createElement('img');
  asteroidElement.id = `asteroid-${peerId}`;
  asteroidElement.src = asteroid;
  asteroidElement.style.position = 'absolute';
  document.body.appendChild(asteroidElement);
});

// Пример использования selfId
console.log(`My information (${playerName}, ${selfId})`);







