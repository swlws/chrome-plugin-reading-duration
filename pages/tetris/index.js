const gameBoard = document.getElementById('game-board');
const nextPieceBoard = document.getElementById('next-piece');
const linesClearedDisplay = document.getElementById('lines-cleared');
const boardWidth = 10;
const boardHeight = 20;
const board = [];
let currentPiece;
let currentPiecePosition = { x: 4, y: 0 };
let nextPiece;
const pieces = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T
  [
    [1, 0, 0],
    [1, 1, 1],
  ], // L
  [
    [0, 0, 1],
    [1, 1, 1],
  ], // J
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // S
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // Z
];
const cellSize = 30;
let linesCleared = 0; // 新增变量来跟踪已消掉的行数

function initBoard() {
  for (let y = 0; y < boardHeight; y++) {
    const row = [];
    for (let x = 0; x < boardWidth; x++) {
      row.push(false);
    }
    board.push(row);
  }
  drawBoard();
}

function drawBoard() {
  const ctx = gameBoard.getContext('2d');
  ctx.clearRect(0, 0, gameBoard.width, gameBoard.height);
  for (let y = 0; y < boardHeight; y++) {
    for (let x = 0; x < boardWidth; x++) {
      if (board[y][x]) {
        ctx.fillStyle = '#0f0';
      } else {
        ctx.fillStyle = '#f0f0f0';
      }
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      ctx.strokeStyle = '#ddd';
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

function drawPiece() {
  const ctx = gameBoard.getContext('2d');
  currentPiece.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        ctx.fillStyle = '#000'; // 修改颜色为黑色
        ctx.fillRect(
          (currentPiecePosition.x + x) * cellSize,
          (currentPiecePosition.y + y) * cellSize,
          cellSize,
          cellSize
        );
        ctx.strokeStyle = '#ddd';
        ctx.strokeRect(
          (currentPiecePosition.x + x) * cellSize,
          (currentPiecePosition.y + y) * cellSize,
          cellSize,
          cellSize
        );
      }
    });
  });
}

function clearPiece() {
  const ctx = gameBoard.getContext('2d');
  currentPiece.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(
          (currentPiecePosition.x + x) * cellSize,
          (currentPiecePosition.y + y) * cellSize,
          cellSize,
          cellSize
        );
        ctx.strokeStyle = '#ddd';
        ctx.strokeRect(
          (currentPiecePosition.x + x) * cellSize,
          (currentPiecePosition.y + y) * cellSize,
          cellSize,
          cellSize
        );
      }
    });
  });
}

function movePiece(dx, dy) {
  const newX = currentPiecePosition.x + dx;
  const newY = currentPiecePosition.y + dy;

  // Check if the new position is valid
  if (isValidPosition(newX, newY, currentPiece)) {
    clearPiece();
    currentPiecePosition.x = newX;
    currentPiecePosition.y = newY;
    drawPiece();
  } else if (dy === 1) {
    // If the piece cannot move down, fix it to the board and create a new piece
    fixPieceToBoard();
    clearLines();
    newPiece();
  }
}

function isValidPosition(x, y, piece) {
  for (let py = 0; py < piece.length; py++) {
    for (let px = 0; px < piece[py].length; px++) {
      if (piece[py][px]) {
        const newX = x + px;
        const newY = y + py;
        if (
          newX < 0 ||
          newX >= boardWidth ||
          newY >= boardHeight ||
          (newY >= 0 && board[newY][newX])
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

function rotatePiece() {
  const newPiece = currentPiece[0].map((_, x) =>
    currentPiece.map((row) => row[x]).reverse()
  );
  clearPiece();
  currentPiece = newPiece;
  drawPiece();
}

function newPiece() {
  currentPiece = nextPiece;
  nextPiece = pieces[Math.floor(Math.random() * pieces.length)];
  currentPiecePosition = { x: 4, y: 0 };
  drawPiece();
  drawNextPiece();
}

function gameLoop() {
  movePiece(0, 1);
  setTimeout(gameLoop, 500);
}

function drawNextPiece() {
  const ctx = nextPieceBoard.getContext('2d');
  ctx.clearRect(0, 0, nextPieceBoard.width, nextPieceBoard.height);
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      if (nextPiece[y] && nextPiece[y][x]) {
        ctx.fillStyle = '#000'; // 修改颜色为黑色
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        ctx.strokeStyle = '#ddd';
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
  }
}

function fixPieceToBoard() {
  currentPiece.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        board[currentPiecePosition.y + y][currentPiecePosition.x + x] = true; // 修改: 将方块固定到游戏板时，使用黑色填充
      }
    });
  });
}

function clearLines() {
  let linesRemoved = 0; // 新增变量来跟踪本次清除的行数
  for (let y = boardHeight - 1; y >= 0; y--) {
    if (board[y].every((cell) => cell)) {
      board.splice(y, 1);
      board.unshift(new Array(boardWidth).fill(false));
      linesRemoved++;
      y++; // Check the same line again after clearing
    }
  }
  linesCleared += linesRemoved; // 更新已消掉的行数
  linesClearedDisplay.textContent = `Lines Cleared: ${linesCleared}`; // 更新显示
  drawBoard();
}

function dropPiece() {
  while (
    isValidPosition(
      currentPiecePosition.x,
      currentPiecePosition.y + 1,
      currentPiece
    )
  ) {
    movePiece(0, 1);
  }
  // If the piece cannot move down, fix it to the board and create a new piece
  fixPieceToBoard();
  clearLines();
  newPiece();
}

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      movePiece(-1, 0);
      break;
    case 'ArrowRight':
      movePiece(1, 0);
      break;
    case 'ArrowDown':
      movePiece(0, 1);
      break;
    case 'ArrowUp':
      rotatePiece();
      break;
    case ' ': // Add space key to drop the piece directly
      dropPiece();
      break;
  }
});

initBoard();
nextPiece = pieces[Math.floor(Math.random() * pieces.length)];
newPiece();
gameLoop();
