// Определение переменных
let container = document.querySelector(".container");
let playerNameContainer = document.querySelector(".playerNameContainer");
let playerInput = document.querySelector(".playerInput");
let playerName = "";
let playerPlay = document.querySelector(".playerPlay");
let playerLabel = document.querySelector(".playerLabel");
let ship = document.querySelector(".ship");
let gameover = document.querySelector(".gameover");
let startgame = document.querySelector(".startgame");
let audio = document.querySelector(".audio");
let lasersound = document.querySelector(".lasersound");
let crash = document.querySelector(".crash");
let counter = document.querySelector(".counter");
let toggleMusic = document.querySelector(".toggleMusic");
let muteSpeaker = toggleMusic.querySelector(".muteSpeaker");
let musicButton = toggleMusic.querySelector(".musicButton");
let play = document.querySelector(".play");
let startplay = document.querySelector(".startplay");
let startplay1 = document.querySelector(".startplay1");
let earth = document.querySelector(".earthImg");
let mars = document.querySelector(".marsImg");
let space = document.querySelector(".spaceImg");

let videoContainer = document.querySelector(".videoContainer");
let videoSource = videoContainer.querySelector("source");
let star;

let isPaused = false;

let loss = false;
// Переменные состояния
let moveLeft = false;
let moveRight = false;
let isSpacePressed = false;
let canShoot = true;
let isLaserPlaying = false;


let difficulty = "medium"; // Значение по умолчанию
let asteroidSpeed = 4; // Инициализация скорости астероида




// Воспроизведение звука лазера
let laserSound = async () => {
  if (isLaserPlaying) return;

  isLaserPlaying = true;
  try {
    if (!lasersound.paused) {
      lasersound.pause();
      lasersound.currentTime = 0;
    }
    lasersound.volume = 0.1;
    await lasersound.play();
  } catch (error) {
    console.error("Ошибка воспроизведения лазера:", error);
  } finally {
    isLaserPlaying = false;
  }
};


// Удаление лазера
let removeLaser = (laser) => {
  if (laser && laser.parentNode === container) {
    container.removeChild(laser);
  }
};

// Удаление лазеров внизу окна
let removeLasers = () => {
  document.querySelectorAll(".laser").forEach((laser) => {
    if (laser.getBoundingClientRect().top >= window.innerHeight) {
      removeLaser(laser);
    }
  });
};

// Движение лазера
let laserMovement = (laser) => {
  laser.style.top = window.innerHeight + "px";
  let laserInterval = setInterval(() => {
    let asteroids = document.querySelectorAll(".asteroid");

    asteroids.forEach((currentAsteroid) => {
      if (
        laser.offsetTop <=
          currentAsteroid.offsetTop + currentAsteroid.offsetHeight - 10 &&
        laser.offsetTop >= currentAsteroid.offsetTop &&
        laser.offsetLeft >
          currentAsteroid.offsetLeft - currentAsteroid.offsetWidth / 2 &&
        laser.offsetLeft <
          currentAsteroid.offsetLeft + currentAsteroid.offsetWidth
      ) {
        removeLaser(laser);
        if (container.contains(currentAsteroid)) {
          if (currentAsteroid.offsetWidth > 80) {
            currentAsteroid.style.width =
              currentAsteroid.offsetWidth - 40 + "px";
            currentAsteroid.style.height =
              currentAsteroid.offsetHeight - 40 + "px";
          } else {
            crash.play();
            crash.volume = 0.1;
            container.removeChild(currentAsteroid);
            
            asteroidFunction();
          }
        }
        clearInterval(laserInterval); // Прекратить движение лазера после попадания
      }
    });
  }, 50);
};


// Обработка стрельбы
let laserShot = () => {
  if (canShoot & !isPaused) {
    let asteroidId = document
      .querySelector(".asteroid")
      ?.getAttribute("data-id");
    if (asteroidId) {
      createLaser(asteroidId);
      removeLasers();
      laserSound();
      canShoot = false;
      setTimeout(() => {
        canShoot = true;
      }, 1); 
    }
  }
};

let moveAsteroid = (asteroid) => {
  const animate = () => {
    if (!isPaused) {
      asteroid.style.top = parseInt(asteroid.style.top) - asteroidSpeed + "px"; // Используйте глобальную переменную asteroidSpeed
    }
    if (parseInt(asteroid.style.top) <= -asteroid.offsetHeight) {
      if (asteroid.parentNode) {
        asteroid.remove(); // Удаляем астероид, если он все еще находится в DOM
       
        asteroidFunction();
      }
    } else {
      requestAnimationFrame(animate);
    }
  };
  asteroid.style.top = window.innerHeight + "px";
  animate();
};



// Установка формы астероида
let setAsteroidShape = (asteroid) => {
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
  let size = Math.floor(Math.random() * 16) + 4;
  let shape = shapes[Math.floor(Math.random() * shapes.length)];
  asteroid.setAttribute("src", shape);
  asteroid.style.height = `${size}rem`;
  asteroid.style.width = `${size}rem`;
};

// Обработка клавиатуры для стрельбы
const handleLaserShotKey = () => {
  document.addEventListener("keydown", (event) => {
    if (event.key === " " && !isSpacePressed) {
      isSpacePressed = !isSpacePressed;
    }
  });
  document.addEventListener("keyup", (event) => {
    if (event.key === " ") {
      laserShot();
    }
  });
};

document.addEventListener("keydown", (event) => {
  if (event.target.matches('input')) {
    return;
  }
  event.preventDefault(); // Это предотвращает стандартное поведение клавиши пробела
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    moveLeft = true;
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    moveRight = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.target.matches('input')) {
    return;
  }
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    moveLeft = false;
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    moveRight = false;
  }
});

const handleKeyDown = (event) => {
  if (event.target.matches('input')) {
    return;
  }
}

// Анимация
function animate() {
  const rect = ship.getBoundingClientRect();
  if (!isPaused) {
    if (moveLeft && rect.left > 0) {
      ship.style.left = ship.offsetLeft - 9 + "px";
    }
    if (moveRight && rect.right < window.innerWidth) {
      ship.style.left = ship.offsetLeft + 9 + "px";
    }
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// Движение корабля мышью
const moveShip = (clientX) => {
  if (!isPaused) {
    const containerRect = container.getBoundingClientRect();
    const shipRect = ship.getBoundingClientRect();
    let newLeft = clientX - 60;
    if (newLeft < 0) newLeft = 0;
    else if (newLeft + shipRect.width > containerRect.width)
      newLeft = containerRect.width - shipRect.width;
    ship.style.left = newLeft + "px";
  }
};

document.addEventListener("mousemove", (event) => moveShip(event.clientX));
ship.addEventListener("touchmove", (event) =>
  moveShip(event.touches[0].clientX)
);

// Изменение фона видео
earth.addEventListener("click", (event) => {
  event.stopPropagation();
  videoSource.setAttribute("src", "video/earth.mp4");
  videoContainer.load();
});

mars.addEventListener("click", (event) => {
  event.stopPropagation();
  videoSource.setAttribute("src", "video/mars.mp4");
  videoContainer.load();
});

space.addEventListener("click", (event) => {
  event.stopPropagation();
  videoSource.setAttribute("src", "video/galaxy.mp4");
  videoContainer.load();
});



// Функция тайм-аута для астероида
let timeoutFunc = (asteroid) => {
  if (asteroid.offsetTop <= -80) {
    if (container.contains(asteroid)) {
      container.removeChild(asteroid);
     
      asteroidFunction();
    }
  } else {
    setTimeout(() => timeoutFunc(asteroid), 1000);
  }
};



// Создание астероида
let createAsteroid = () => {
  let asteroidElement = document.createElement("img");
  asteroidElement.classList.add("asteroid");
  asteroidElement.setAttribute("draggable", "false");
  return asteroidElement;
};


// Начало игры
let startGame = () => {
  ship.style.visibility = "visible";
  asteroidFunction();
  document.addEventListener("click", laserShot);
  document.addEventListener("keydown", handleLaserShotKey);
  document.addEventListener("keyup", handleLaserShotKey);
};

// Начало новой игры
let startNewGame = () => {
  loss = false;
  
  document
    .querySelectorAll(".asteroid")
    .forEach((asteroid) => asteroid.remove());
  ship.style.visibility = "visible";
  counter.textContent = "0";
  gameover.style.display = "none";
  isSpacePressed = false;
  canShoot = true;
  document.addEventListener("click", laserShot);
  document.addEventListener("keydown", handleLaserShotKey);
  document.addEventListener("keyup", handleLaserShotKey);
  initializeCatControls()
};

// Начало новой игры
let startNewGame1 = () => {
  loss = false;
  initializeAsteroidControls()
  document
    .querySelectorAll(".asteroid")
    .forEach((asteroid) => asteroid.remove());
  ship.style.visibility = "visible";
  counter.textContent = "0";
  gameover.style.display = "none";
  isSpacePressed = false;
  canShoot = true;
  document.addEventListener("click", laserShot);
  document.addEventListener("keydown", handleLaserShotKey);
  document.addEventListener("keyup", handleLaserShotKey);
}; 


let startgameFunc = () => {

  startgame.style.display = "flex";
  

  // Функция для отображения сообщения
  const displayMessage = (message) => {
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    messageElement.style.position = "fixed";
    messageElement.style.top = "30%";
    messageElement.style.left = "50%";
    messageElement.style.transform = "translate(-50%, -50%)";
    messageElement.style.fontSize = "7rem";
    messageElement.style.fontWeight = "bold";
    messageElement.style.color = "yellow";
    messageElement.style.fontfamily= 'HalfTone';
    document.body.appendChild(messageElement);

    // Удалить сообщение через 3 секунды
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 2000);
  };


  startplay.addEventListener("click", () => {
    startgame.style.display = "none";
    displayMessage("Ты играешь за кота");
    startNewGame()
    
  });

  startplay1.addEventListener("click", () => {
    startgame.style.display = "none";
    displayMessage("Ты играешь за астероид");
startNewGame1()
    initializeAsteroidControls()
  });
};



let nameStorage = localStorage.getItem('name');

if (nameStorage && nameStorage !== 'undefined') {
  playerLabel.textContent = nameStorage;
  startgameFunc();
} else {
  playerNameContainer.style.display = 'flex';
  playerPlay.addEventListener('click', () => {
    let playerName = playerInput.value.trim();

    if (playerName) {
      localStorage.setItem('name', playerName);
      playerLabel.textContent = playerName;
      playerNameContainer.style.display = 'none';
      startgameFunc();
    }
  });
}

// Добавляем обработчик нажатия на playerLabel для изменения имени
playerLabel.addEventListener('click', () => {
  playerNameContainer.style.display = 'flex';
  playerInput.value = playerLabel.textContent;
  playerLabel.style.display = 'none';
  startgame.style.display = 'none'; 
  gameover.style.display = 'none'; // 

  // Добавляем обработчик нажатия на кнопку "Play" для сохранения нового имени
  playerPlay.addEventListener('click', () => {
    let playerName = playerInput.value.trim();

    if (playerName) {
      localStorage.setItem('name', playerName);
      playerLabel.textContent = playerName;
      playerNameContainer.style.display = 'none';
      playerLabel.style.display = 'block';

      // Восстанавливаем стартовое меню или меню проигрыша
      if (startgame.style.display === 'none' && gameover.style.display === 'none') {
        if (loss) {
          gameover.style.display = 'flex'; 
        } else {
          startgame.style.display = 'flex'; 
        }
      }
    }
  });
});


// Управление музыкой
let musicPlay = () => {
  document.addEventListener(
    "click",
    () => {
      audio.play();
    },
    { once: true }
  );
};
setTimeout(musicPlay, 3000);

toggleMusic.addEventListener("click", (event) => {
  event.stopPropagation();
  if (audio.paused) {
    muteSpeaker.style.opacity = "0";
    audio
      .play()
      .then(() => {
        audio.volume = 0.1;
      })
      .catch((error) => {
        console.error("Ошибка воспроизведения музыки:", error);
      });
  } else {
    audio.pause();
    muteSpeaker.style.opacity = "1";
  }
});


function initializeCatControls() { 
  
  document.addEventListener("mousemove", moveShip); 
  document.addEventListener("keydown", handleLaserShotKey); 
  document.addEventListener("keyup", handleLaserShotKey);
} 

function initializeAsteroidControls() {
  const asteroid = createAsteroid();
  setAsteroidShape(asteroid);
  asteroid.style.position = "absolute";
  asteroid.style.pointerEvents = "none";
  container.append(asteroid);

  // Массив с вариантами
  const movementProfiles = [
    { speed: 0.008, overshootMultiplier: 2.5, inertia: 0.07 },
    { speed: 0.012, overshootMultiplier: 1.8, inertia: 0.05 },
    { speed: 0.006, overshootMultiplier: 3.0, inertia: 0.09 },
    { speed: 0.010, overshootMultiplier: 2.2, inertia: 0.06 },
    { speed: 0.004, overshootMultiplier: 3.5, inertia: 0.08 }
  ];
  const selectedProfile = movementProfiles[Math.floor(Math.random() * movementProfiles.length)];
  let asteroidX = window.innerWidth / 2;
  let asteroidY = window.innerHeight / 2;
  let lastMouseX = asteroidX;
  let lastMouseY = asteroidY;
  let targetX = asteroidX;
  let targetY = asteroidY;

  // Движение от изначальной позиции
  const speed = selectedProfile.speed;
  const overshootMultiplier = selectedProfile.overshootMultiplier;
  const inertia = selectedProfile.inertia;
  let overshootX = 0;
  let overshootY = 0;

  // Мышко-движение
  document.addEventListener("mousemove", (event) => {
    const containerRect = container.getBoundingClientRect();
    lastMouseX = event.clientX - containerRect.left - asteroid.offsetWidth / 2;
    lastMouseY = event.clientY - containerRect.top - asteroid.offsetHeight / 2;

    setTimeout(() => {
      targetX = lastMouseX;
      targetY = lastMouseY;
      overshootX = (targetX - asteroidX) * overshootMultiplier;
      overshootY = (targetY - asteroidY) * overshootMultiplier;
    }, 100);
  });
  function animateAsteroid() {
    if (!isPaused) {
      asteroidX += (targetX - asteroidX) * speed;
      asteroidY += (targetY - asteroidY) * speed;

      if (Math.abs(targetX - asteroidX) < 1 && Math.abs(targetY - asteroidY) < 1) {
        overshootX *= 0.95;
        overshootY *= 0.95;
        targetX += overshootX * inertia;
        targetY += overshootY * inertia;
      }

      asteroid.style.left = `${asteroidX}px`;
      asteroid.style.top = `${asteroidY}px`;
    }

    requestAnimationFrame(animateAsteroid);
  }

  animateAsteroid();
}