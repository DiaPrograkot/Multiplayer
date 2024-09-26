import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

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


// Проверяем наличие имени в localStorage и запрашиваем, если его нет
let playerName = localStorage.getItem('name');
if (!playerName) {
  playerNameContainer.style.display = 'flex';
// Обрабатываем ввод имени
  playerInput.addEventListener('change', (event) => {
    playerName = event.target.value;
  localStorage.setItem('name', playerName); // Сохраняем имя в localStorage
  })
}
// Инициализация и присоединение к комнате
const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Отправка имени другим игрокам
const [sendName, getName] = room.makeAction('playerName');

// Отправляем имя при подключении
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendName(playerName); // Отправляем свое имя
  });

// Обработка выхода других игроков
room.onPeerLeave(peerId => {
  console.log(`${peerId} left`);
  addMessage(`${playerName} left the game`)
  sendAsteroid(playerAsteroid); // Отправляем свой астероид новому игроку
});

// Получение имени других игроков
getName((name, peerId) => {
  console.log(`${name} joined the game (ID: ${peerId})`);
  addMessage(`${name} joined the game)`);
})

// Пример использования selfId
console.log(`My information (${playerName},${selfId})`);


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