import { joinRoom, selfId } from 'trystero';

const config = {
  appId: 'your-app-id',
};

const room = joinRoom(config, 'room-id');
console.log('Комната инициализирована:', room);

let sendMove, getMove, sendName, getName, sendRole, getRole;
// Новые действия для игры
let sendShipPosition, getShipPosition;
let sendLaser, getLaser;
let sendAsteroid, getAsteroid;

function initRoom() {
  [sendMove, getMove] = room.makeAction('mouseMove');
  [sendName, getName] = room.makeAction('playerName');
  [sendRole, getRole] = room.makeAction('roleSelected');
}
  // Добавила новые действия 
  [sendShipPosition, getShipPosition] = room.makeAction('shipPosition');
  [sendLaser, getLaser] = room.makeAction('laser');
  [sendAsteroid, getAsteroid] = room.makeAction('asteroid');
  [sendScore, getScore] = room.makeAction('score');

  room.onPeerJoin(handlePeerJoin);
  room.onPeerLeave(handlePeerLeave);
  getMove(([x, y], peerId) => moveCursor([x, y], peerId));
  getName((name, peerId) => handlePlayerName(name, peerId));
  
  getShipPosition((position, peerId) => {
    if (peerId !== selfId && ship) {
      ship.style.left = position + "px";
    }
  });

  getLaser((laserData, peerId) => {
    if (peerId !== selfId) {
      const { x, y, asteroidId } = laserData;
      const laser = document.createElement("div");
      laser.classList.add("laser");
      laser.style.left = x + "px";
      laser.style.top = y + "px";
      container.appendChild(laser);
      laserMovement(laser);
    }
  });
  getAsteroid((asteroidData, peerId) => {
    if (peerId !== selfId) {
      const { action, id, x, y, width, height } = asteroidData;
      
      if (action === 'create') {
        const asteroid = createAsteroid();
        asteroid.setAttribute('data-id', id);
        asteroid.style.left = x + "px";
        asteroid.style.top = y + "px";
        asteroid.style.width = width + "px";
        asteroid.style.height = height + "px";
        container.appendChild(asteroid);
        moveAsteroid(asteroid);
      } else if (action === 'remove') {
        const asteroid = document.querySelector(`[data-id="${id}"]`);
        if (asteroid) {
          asteroid.remove();
        }
      }
    }
  });
function moveShip(clientX) {
  if (!isPaused) {
    const containerRect = container.getBoundingClientRect();
    const shipRect = ship.getBoundingClientRect();
    let newLeft = clientX - 60;
    
    if (newLeft < 0) newLeft = 0;
    else if (newLeft + shipRect.width > containerRect.width)
      newLeft = containerRect.width - shipRect.width;
    
    ship.style.left = newLeft + "px";
    sendShipPosition(newLeft);
  }
}
function laserShot() {
  if (canShoot && !isPaused) {
    const laser = document.createElement("div");
    laser.classList.add("laser");
    
    const shipRect = ship.getBoundingClientRect();
    const x = shipRect.left + shipRect.width / 2;
    const y = shipRect.top;
    
    laser.style.left = x + "px";
    laser.style.top = y + "px";
    container.appendChild(laser);
    sendLaser({ x, y });
    
    laserMovement(laser);
    laserSound();
    
    canShoot = false;
    setTimeout(() => {
      canShoot = true;
    }, 1);
  }
}
function asteroidFunction() {
  const asteroid = createAsteroid();
  const id = Date.now().toString();
  asteroid.setAttribute('data-id', id);
  
  const x = Math.random() * (window.innerWidth - asteroid.offsetWidth);
  asteroid.style.left = x + "px";
  
  container.appendChild(asteroid);
  moveAsteroid(asteroid);

  sendAsteroid({
    action: 'create',
    id,
    x,
    y: window.innerHeight,
    width: asteroid.offsetWidth,
    height: asteroid.offsetHeight
  });
}


document.addEventListener('DOMContentLoaded', () => {
  initRoom();
});

export {
  room,
  sendMove,
  sendName,
  sendRole,
  sendShipPosition,
  sendLaser,
  sendAsteroid,
};