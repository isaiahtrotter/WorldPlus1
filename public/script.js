let targetWord = ""; // Initialize an empty target word
let wordList = []; // Initialize an empty word list
let currentAttempt = 0;
let guess = new Array(6).fill(""); // Array to hold the current guess

// Fetch the word of the day and word list from the server
const fetchWord = () => {
  return fetch("/word")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!data.word || !data.wordList) {
        throw new Error("No word or word list returned from server");
      }
      console.log("New word:", data.word);
      console.log("Word list received:", data.wordList);
      targetWord = data.word.toUpperCase(); // Set the word of the day
      wordList = data.wordList.map((word) => word.toUpperCase()); // Set the word list and ensure all words are uppercase
    })
    .catch((error) => {
      console.error("Error fetching new word:", error);
      return null; // Return null if there's an error
    });
};

document.addEventListener("DOMContentLoaded", async () => {
  await fetchWord(); // Fetch the word and word list when the document is loaded
  if (!targetWord || wordList.length === 0) {
    console.error("Failed to fetch the target word or word list. Game cannot start.");
    return;
  }
  createBoard();
  document.getElementById("enter-btn").addEventListener("click", handleGuess);
  document.getElementById("delete-btn").addEventListener("click", handleDelete);
  document.querySelectorAll("#keyboard .key").forEach((key) => {
    key.addEventListener("click", handleKeyboardInput);
  });
  document.addEventListener("keydown", handleKeyPress);
  updateEnterButton();
});

function createBoard() {
  const board = document.getElementById("board");
  for (let i = 0; i < 7; i++) {
    // Assuming you have 7 attempts
    const row = document.createElement("div");
    row.className = "row";
    row.setAttribute("id", `row-${i}`);
    for (let j = 0; j < 6; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.setAttribute("id", `cell-${i}-${j}`);
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
}

function handleKeyPress(e) {
  if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
    handleInput(e.key.toUpperCase());
  } else if (e.key === "Backspace") {
    handleDelete();
  } else if (e.key === "Enter") {
    handleGuess();
  }
}

function handleKeyboardInput(e) {
  const key = e.target.textContent;
  if (key === "Enter") {
    handleGuess();
  } else if (key === "Del") {
    handleDelete();
  } else {
    handleInput(key.toUpperCase());
  }
}

function handleInput(letter) {
  if (letter.length === 1 && /^[A-Z]$/.test(letter)) {
    const currentRow = document.getElementById(`row-${currentAttempt}`);
    if (!currentRow) {
      console.error(`Row with ID row-${currentAttempt} not found.`);
      return;
    }
    const cells = Array.from(currentRow.children);
    const emptyIndex = cells.findIndex((cell) => cell.textContent === "");
    if (emptyIndex !== -1) {
      cells[emptyIndex].textContent = letter;
      guess[emptyIndex] = letter;
      updateEnterButton();
    }
  }
}

function handleDelete() {
  const currentRow = document.getElementById(`row-${currentAttempt}`);
  const cells = Array.from(currentRow.children);
  const lastFilledIndex = cells
    .slice()
    .reverse()
    .findIndex((cell) => cell.textContent !== "");
  if (lastFilledIndex !== -1) {
    const index = cells.length - 1 - lastFilledIndex;
    cells[index].textContent = "";
    guess[index] = "";
    updateEnterButton();
  }
}

function handleGuess() {
  const currentGuess = guess.join("");
  if (currentGuess.length !== 6) {
    // Removed the alert for incomplete word
    return;
  }

  // Check if the guess is in the word list
  if (!wordList.includes(currentGuess.toUpperCase())) {
    animateInvalidRow(currentAttempt);
    return;
  }

  const feedback = getFeedback(currentGuess.toUpperCase(), targetWord);
  displayFeedback(currentAttempt, feedback);

  if (currentGuess.toUpperCase() === targetWord) {
    alert(`Congratulations! You've guessed the word '${targetWord}' correctly!`);
    document.getElementById("enter-btn").disabled = true;
    document.removeEventListener("keydown", handleKeyPress);
  } else {
    currentAttempt += 1;
    if (currentAttempt === 7) {
      alert(`Game Over! The correct word was '${targetWord}'.`);
      document.getElementById("enter-btn").disabled = true;
      document.removeEventListener("keydown", handleKeyPress);
    } else {
      guess = new Array(6).fill("");
      updateBoard();
      updateEnterButton();
    }
  }
}

function getFeedback(guess, target) {
  let feedback = new Array(6).fill("gray");
  let targetCopy = target.split("");

  // First pass: Check for correct letters in the correct position (green)
  for (let i = 0; i < 6; i++) {
    if (guess[i] === target[i]) {
      feedback[i] = "green";
      targetCopy[i] = null; // Remove the letter from the copy
    }
  }

  // Second pass: Check for correct letters in the wrong position (yellow)
  for (let i = 0; i < 6; i++) {
    if (feedback[i] !== "green" && targetCopy.includes(guess[i])) {
      feedback[i] = "yellow";
      targetCopy[targetCopy.indexOf(guess[i])] = null; // Remove the letter from the copy
    }
  }

  return feedback;
}

function displayFeedback(row, feedback) {
  const cells = document.querySelectorAll(`#row-${row} .cell`);
  const keys = document.querySelectorAll("#keyboard .key");

  cells.forEach((cell, index) => {
    if (feedback[index] === "green") {
      cell.style.backgroundColor = "#538d4e";
    } else if (feedback[index] === "yellow") {
      cell.style.backgroundColor = "#b59f3b";
    } else if (feedback[index] === "gray") {
      cell.style.backgroundColor = "#3a3a3c";
    }

    // Update keyboard keys based on feedback
    keys.forEach((key) => {
      if (key.textContent === cell.textContent && feedback[index] === "gray") {
        key.style.backgroundColor = "#3a3a3c";
        key.style.opacity = "0.5"; // Gray out the key with reduced opacity
      }
    });
  });
}

function updateBoard() {
  const cells = document.querySelectorAll(`#row-${currentAttempt} .cell`);
  cells.forEach((cell, index) => {
    cell.textContent = guess[index] || "";
  });
}

function updateEnterButton() {
  const enterButton = document.getElementById("enter-btn");
  const isEnabled = guess.every((letter) => letter.length > 0);
  enterButton.disabled = !isEnabled;
}

function animateInvalidRow(row) {
  const cells = document.querySelectorAll(`#row-${row} .cell`);
  cells.forEach((cell) => {
    cell.style.backgroundColor = "red";
  });
  setTimeout(() => {
    cells.forEach((cell) => {
      cell.style.backgroundColor = "#121212";
    });
  }, 200);
}
