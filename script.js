let gameRunning = false;
let dropMaker;
let score = 0;
let timer = 30;
let countdown;

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("quit-btn").addEventListener("click", quitGame);

function startGame() {
  if (gameRunning) return;
  gameRunning = true;

  // UI updates
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-ui").style.display = "block";

  // Start score + timer
  score = 0;
  timer = 30;
  updateScore();
  updateTimer();

  // Start countdown + drop creation
  countdown = setInterval(() => {
    timer--;
    updateTimer();
    if (timer <= 0) endGame();
  }, 1000);

  dropMaker = setInterval(createDrop, 1200);
}

function quitGame() {
  endGame(true);
}

function endGame(quit = false) {
  clearInterval(dropMaker);
  clearInterval(countdown);
  gameRunning = false;

  document.getElementById("game-ui").style.display = "none";
  document.getElementById("start-screen").style.display = "block";

  const learnMore = "\nLearn More: https://www.charitywater.org";
  const message = quit
    ? "Game ended early."
    : score >= 30
    ? "Level 3 complete! Well done!"
    : score >= 20
    ? "Level 2 complete!"
    : score >= 10
    ? "Level 1 complete!"
    : "Try again!";

  if (!quit && score >= 30) {
    launchConfetti();
  }

  alert(`Game Over! ${message} Your final score: ${score}${learnMore}`);
}

function updateScore() {
  document.getElementById("score").textContent = score;
}

function updateTimer() {
  document.getElementById("time").textContent = timer;
}

function createDrop() {
  const drop = document.createElement("div");
  drop.classList.add("water-drop");

  // Random type
  const types = ["clean", "dirty1", "dirty2", "dirty3"];
  const type = types[Math.floor(Math.random() * types.length)];
  drop.classList.add(type);
  drop.setAttribute("draggable", true);
  drop.dataset.type = type;

  // Random size + position
  const size = 60 * (Math.random() * 0.8 + 0.5);
  drop.style.width = drop.style.height = `${size}px`;

  const gameWidth = document.getElementById("drop-zone").offsetWidth;
  drop.style.left = Math.random() * (gameWidth - 60) + "px";

  // Animate fall
  drop.style.animationDuration = "4s";

  // Add drop to game
  document.getElementById("drop-zone").appendChild(drop);

  // Drag & Drop listeners
  drop.addEventListener("dragstart", dragStart);
  drop.addEventListener("touchstart", touchStart, { passive: true });

  drop.addEventListener("animationend", () => {
    drop.remove();
    score -= 10;
    updateScore();
    showFeedback("Wrong!");
  });
}

function dragStart(e) {
  e.dataTransfer.setData("type", e.target.dataset.type);
  e.dataTransfer.setData("elementId", e.target.id);
}

// Mobile touch support
let draggedElement = null;

function touchStart(e) {
  draggedElement = e.target;
  document.addEventListener("touchmove", touchMove);
  document.addEventListener("touchend", touchEnd);
}

function touchMove(e) {
  const touch = e.touches[0];
  draggedElement.style.position = "absolute";
  draggedElement.style.left = touch.pageX - 30 + "px";
  draggedElement.style.top = touch.pageY - 30 + "px";
}

function touchEnd(e) {
  const bins = document.querySelectorAll(".bin");
  bins.forEach((bin) => {
    const rect = bin.getBoundingClientRect();
    const touch = e.changedTouches[0];

    if (
      touch.pageX >= rect.left &&
      touch.pageX <= rect.right &&
      touch.pageY >= rect.top &&
      touch.pageY <= rect.bottom
    ) {
      const dropType = draggedElement.dataset.type;
      const target = bin.dataset.filter;

      if (draggedElement) draggedElement.remove();

      if (
        (dropType === "clean" && target === "clean") ||
        ((dropType === "dirty1" ||
          dropType === "dirty2" ||
          dropType === "dirty3") &&
          target === "level3")
      ) {
        score += 10;
        showFeedback("Filtered!");
      } else {
        score -= 10;
        showFeedback("Wrong!");
      }

      updateScore();
    }
  });

  document.removeEventListener("touchmove", touchMove);
  document.removeEventListener("touchend", touchEnd);
  draggedElement = null;
}

const bins = document.querySelectorAll(".bin");
bins.forEach((bin) => {
  bin.addEventListener("dragover", (e) => e.preventDefault());

  bin.addEventListener("drop", (e) => {
    const dropType = e.dataTransfer.getData("type");
    const dropEl = document.querySelector(`[data-type="${dropType}"]`);
    const target = e.currentTarget.dataset.filter;

    if (dropEl) dropEl.remove();

    if (
      (dropType === "clean" && target === "clean") ||
      ((dropType === "dirty1" ||
        dropType === "dirty2" ||
        dropType === "dirty3") &&
        target === "level3")
    ) {
      score += 10;
      showFeedback("Filtered!");
    } else {
      score -= 10;
      showFeedback("Wrong!");
    }

    updateScore();
  });
});

function showFeedback(text) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = text;
  feedback.style.opacity = 1;
  setTimeout(() => {
    feedback.style.opacity = 0;
  }, 1000);
}

function launchConfetti() {
  const duration = 3 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

