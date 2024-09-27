import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

// Элементы интерфейса
const canvas = document.getElementById('canvas');
const messageBox = document.querySelector('.messages');
const peerInfo = document.getElementById('peer-info'); 
const playerNameContainer = document.getElementById('player-name-container');
const playerInput = document.getElementById('player-input');
const noPeersCopy = peerInfo ? peerInfo.innerText : 'No peers connected'




let playerName = localStorage.getItem('name');
if (!playerName) {
  playerNameContainer.style.display = 'flex';
  playerInput.addEventListener('change', (event) => {
    playerName = event.target.value;
    localStorage.setItem('name', playerName); // Сохраняем имя в localStorage
  });
}

const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Отправка и получение данных игрока
const [sendName, getName] = room.makeAction('playerName');
const [sendMousePos, getMousePos] = room.makeAction('mousePos');
const [sendAsteroid, getAsteroid] = room.makeAction('asteroid');

// Создание и отображение сообщений
function addMessage(message) {
  const newMessage = document.createElement('div');
  newMessage.textContent = message;
  messageBox.appendChild(newMessage); 
  setTimeout(() => {
    messageBox.removeChild(newMessage);
  }, 5000);
}

// Логика подключения и отключения игроков
room.onPeerJoin(peerId => {
  console.log(`${peerId} joined`);
  sendName(playerName); // Отправляем свое имя другим игрокам
  addCursor(peerId); // Добавляем курсор для нового игрока
});

room.onPeerLeave(peerId => {
  console.log(`${peerId} left`);
  addMessage(`${playerName} left the game`);
  removeCursor(peerId); // Удаляем курсор, когда игрок выходит
});

getName((name, peerId) => {
  console.log(`${name} joined the game (ID: ${peerId})`);
  addMessage(`${name} joined the game`);
});

// Пример использования selfId
console.log(`My information (${playerName}, ${selfId})`);

let mouseX = 0; // Позиция курсора по оси X
let mouseY = 0; // Позиция курсора по оси Y
let sendMove; // Функция для отправки движения курсора

document.addEventListener('DOMContentLoaded', () => {
  // Находим элемент canvas после загрузки DOM
  canvas = document.getElementById('canvas');
  
  if (canvas) {
    init(); // Инициализируем функционал
    document.documentElement.className = 'ready'; // Обозначаем, что всё готово
    addCursor(selfId, true); // Добавляем собственный курсор

    // Обработчик движения мыши
    document.addEventListener('mousemove', ({ clientX, clientY }) => {
      // Нормализуем координаты курсора
      mouseX = clientX / innerWidth;
      mouseY = clientY / innerHeight;
      moveCursor([mouseX, mouseY], myId); // Перемещаем собственный курсор

      if (room) {
        sendMove([mouseX, mouseY]); // Отправляем координаты другим пользователям
      }
    });
  }
});

// Функция инициализации
function init() {
  // Получаем функции для отправки и получения движений курсора
  [sendMove] = room.makeAction('mouseMove');
  
  // Обработчики событий для присоединения и отключения пиров
  room.onPeerJoin(addCursor);
  room.onPeerLeave(removeCursor);
  
  // Получаем движения курсора от других пользователей
  room.getMove(([x, y], peerId) => {
    moveCursor([x, y], peerId); // Перемещаем курсор другого пользователя
  });
}

// Функция перемещения курсора
function moveCursor([x, y], id) {
  const el = cursors[id]; // Получаем элемент курсора по id

  if (el) {
    // Корректируем положение курсора
    const cursorWidth = 35;
    const cursorHeight = 45;
    el.style.left = (x * innerWidth - cursorWidth / 2) + 'px';
    el.style.top = (y * innerHeight - cursorHeight / 2) + 'px';
  }
}

// Функция добавления нового курсора
function addCursor(id, isSelf) {
  const el = document.createElement('div'); // Создаём элемент для курсора
  const img = document.createElement('img'); // Создаём элемент изображения
  const txt = document.createElement('p'); // Создаём элемент для текста

  el.className = `cursor${isSelf ? ' self' : ''}`; // Назначаем класс
  el.style.left = el.style.top = '-99px'; // Скрываем курсор вне экрана
  img.src = 'src/img/hand.png'; // Устанавливаем изображение курсора
  txt.innerText = isSelf ? playerName : ''; // Устанавливаем имя игрока
  el.appendChild(img); // Добавляем изображение в элемент курсора
  el.appendChild(txt); // Добавляем текст в элемент курсора
  canvas.appendChild(el); // Добавляем курсор на канвас
  cursors[id] = el; // Сохраняем курсор в объекте cursors
}

// Функция удаления курсора
function removeCursor(id) {
  if (cursors[id]) {
    canvas.removeChild(cursors[id]); // Удаляем курсор с канваса
    delete cursors[id]; // Удаляем курсор из объекта cursors
  }
  updatePeerInfo(); // Обновляем информацию о пирах
}

// Функция обновления имени курсора
function updateCursorName(id, name) {
  const el = cursors[id];
  if (el) {
    const txt = el.querySelector('p'); // Находим элемент текста
    if (txt) {
      txt.innerText = name; // Обновляем текст
    }
  }
}

// Функция обновления информации о пирах
function updatePeerInfo() {
  const count = Object.keys(room.getPeers()).length; // Получаем количество пиров
  if (peerInfo) {
    peerInfo.innerHTML = count
      ? `Right now <em>${count}</em> other peer${count === 1 ? ' is' : 's are'} connected with you.`
      : noPeersCopy; // Обновляем текст информации
  }
}