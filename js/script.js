// Определение переменных
let container = document.querySelector(".container");
let playerNameContainer = document.querySelector(".playerNameContainer");
let playerInput = document.querySelector(".playerInput");
let playerName = "";
let playerPlay = document.querySelector(".playerPlay");
let playerLabel = document.querySelector(".playerLabel");
let ship = document.querySelector(".ship");
let startgame = document.querySelector(".startgame");
let audio = document.querySelector(".audio");
let lasersound = document.querySelector(".lasersound");
let crash = document.querySelector(".crash");
let toggleMusic = document.querySelector(".toggleMusic");
let muteSpeaker = toggleMusic.querySelector(".muteSpeaker");
let musicButton = toggleMusic.querySelector(".musicButton");
let play = document.querySelector(".play");
let startplay = document.querySelector(".startplay");
let earth = document.querySelector(".earthImg");
let mars = document.querySelector(".marsImg");
let space = document.querySelector(".spaceImg");
let videoContainer = document.querySelector(".videoContainer");
let videoSource = videoContainer.querySelector("source");

let isPaused = false;
let loss = false;
let isPlayingAsShip = false;

// Переменные состояния
let moveLeft = false;
let moveRight = false;
let isSpacePressed = false;
let canShoot = true;
let isLaserPlaying = false;

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
          }
        }
        clearInterval(laserInterval); // Прекратить движение лазера после попадания
      }
    });
  }, 50);
};

// Создание лазера
let createLaser = () => {
  let laser = document.createElement("img");
  laser.classList.add("laser");
  laser.setAttribute("src", "img/bullet.svg");
  container.append(laser);
  laser.style.left = `${ship.offsetLeft + 46}px`;
  laser.style.visibility = "visible";
  laserMovement(laser);
};

// Обработка стрельбы
let laserShot = () => {
  if (canShoot & !isPaused) {
    createLaser();
    removeLasers();
    laserSound();
    canShoot = false;
    setTimeout(() => {
      canShoot = true;
    }, 1); // через 1 мс игрок сможет снова стрелять
  }
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

// Анимация
function animate() {
  const rect = ship.getBoundingClientRect();
  if (!isPaused && isPlayingAsShip) {
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
  if (!isPaused && isPlayingAsShip) {
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

// Начало новой игры
let startNewGame = () => {
  loss = false;  
  if(isPlayingAsShip){
    ship.style.visibility = "visible";
  }
  if (isPlayingAsShip) {
    document.addEventListener("click", laserShot);
    document.addEventListener("keydown", handleLaserShotKey);
    document.addEventListener("keyup", handleLaserShotKey);
  }
};

// Начальная заставка
let startgameFunc = () => {
  startgame.style.display = "flex";
};

// Проверка имени игрока и запуск игры
let nameStorage = localStorage.getItem('name');

if (nameStorage && nameStorage !== 'undefined') {
  playerLabel.textContent = nameStorage;
  startgameFunc();
} else {
  playerNameContainer.style.display = 'flex';

  // Добавляем обработчик нажатия на кнопку "Play"
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
  startgame.style.display = 'none'; // Скрываем стартовое меню

  // Добавляем обработчик нажатия на кнопку "Play" для сохранения нового имени
  playerPlay.addEventListener('click', () => {
    let playerName = playerInput.value.trim();

    if (playerName) {
      localStorage.setItem('name', playerName);
      playerLabel.textContent = playerName;
      playerNameContainer.style.display = 'none';
      playerLabel.style.display = 'block';

      // Восстанавливаем стартовое меню
      if (startgame.style.display === 'none') {
        startgame.style.display = 'flex'; // Показываем стартовое меню
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
// Обработка выбора роли
const shipButton = document.querySelector(".ship-button");
const asteroidButton = document.querySelector(".asteroid-button");

shipButton.addEventListener("click", () => {
  // Логика для игры за корабль
  console.log("Playing as Ship");
  localStorage.setItem('role', 'ship'); // Сохраняем роль в localStorage
  isPlayingAsShip = true;
  startNewGame();
  startgame.style.display = "none"; // Скрываем стартовое меню
});

asteroidButton.addEventListener("click", () => {
  // Логика для игры за астероиды
  console.log("Playing as Asteroid");
  localStorage.setItem('role', 'asteroid'); // Сохраняем роль в localStorage
  isPlayingAsShip = false;
  startNewGame();
  startgame.style.display = "none"; // Скрываем стартовое меню
});
