import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
};

const room = joinRoom(config, 'room-id'); // Замените 'room-id' на ваш реальный roomId

// Получаем имя игрока из localStorage
let playerName = localStorage.getItem('name')?.trim()

// Сохраняем имя, если оно отсутствовало в localStorage
if (!localStorage.getItem('name')) {
  localStorage.setItem('name', playerName);
}

// Объект для хранения имен игроков
const peerNames = {};
const [sendName, getName] = room.makeAction('playerName');

// Функция логирования
const logMessage = (message) => console.log(message);

// Отправка имени при подключении
room.onPeerJoin(() => {
  sendName(playerName); // Уже обработали trim выше
});

// Обработчик для события ухода пира
room.onPeerLeave(peerId => {
  const name = peerNames[peerId];
  if (name) {
    logMessage(`${name} left`);
    delete peerNames[peerId]; // Очищаем запись, если пир ушел
  }
});

// Получение имени других игроков
getName((name, peerId) => {
  const trimmedName = name.trim(); // Обрезаем лишние пробелы
  peerNames[peerId] = trimmedName;
  logMessage(`${trimmedName} joined`);
});
