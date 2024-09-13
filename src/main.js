import { joinRoom, selfId } from 'trystero';

// Конфигурация для инициализации библиотеки
const config = {
  appId: 'your-app-id', // Замените 'your-app-id' на ваш реальный appId
  // Другие конфигурационные параметры, если они требуются
};

const channel = makeChannel(config);

let playerName;

// Получаем имя игрока при подключении
document.getElementById('playerPlay').addEventListener('click', () => {
  playerName = document.getElementById('playerNameInput').value || 'Player';

  // Отправляем информацию о подключении другим игрокам
  channel.send({ type: 'join', name: playerName });

  console.log(`${playerName} joined the game`);

  // Запуск игры или выполнение других действий
});

// Получение сообщений от других игроков
channel.on('data', (data) => {
  if (data.type === 'join') {
    console.log(`${data.name} joined the game`);
  }
});