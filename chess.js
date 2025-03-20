class ChessGame {
  constructor() {
    this.board = [];
    this.selectedPiece = null;
    this.currentPlayer = 'w';  // white starts
    this.gameOver = false;
    this.initBoard();
  }

  initBoard() {
    this.board = [
      ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
      ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
      ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
    ];
    this.renderBoard();
  }

  renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    this.board.forEach((row, rowIndex) => {
      row.forEach((piece, colIndex) => {
        const square = document.createElement('div');
        square.className = `square ${(rowIndex + colIndex) % 2 ? 'white' : 'black'}`;
        square.dataset.row = rowIndex;
        square.dataset.col = colIndex;
        square.addEventListener('click', () => this.handleMove(rowIndex, colIndex));
        if (piece) {
          const pieceElement = document.createElement('div');
          pieceElement.className = `piece ${piece[0] === 'w' ? 'white' : 'black'}`;
          pieceElement.innerHTML = this.getPieceSymbol(piece);
          square.appendChild(pieceElement);
        }
        boardElement.appendChild(square);
      });
    });
  }

  getPieceSymbol(piece) {
    const symbols = {
      'wr': '♖', 'wn': '♘', 'wb': '♗', 'wq': '♕', 'wk': '♔', 'wp': '♙',
      'br': '♜', 'bn': '♞', 'bb': '♝', 'bq': '♛', 'bk': '♚', 'bp': '♟'
    };
    return symbols[piece];
  }

  handleMove(row, col) {
    if (this.gameOver) return; // If the game is over, ignore further moves.

    if (this.selectedPiece) {
      const [selectedRow, selectedCol] = this.selectedPiece;
      if (this.isValidMove(selectedRow, selectedCol, row, col)) {
        this.board[row][col] = this.board[selectedRow][selectedCol];
        this.board[selectedRow][selectedCol] = null;
        this.selectedPiece = null;
        this.currentPlayer = this.currentPlayer === 'w' ? 'b' : 'w';
        this.renderBoard();
        this.animateMove(selectedRow, selectedCol, row, col);  // Adding animation for the move
        if (this.isCheckmate()) {
          alert(`${this.currentPlayer === 'w' ? 'Black' : 'White'} wins by checkmate!`);
          this.gameOver = true; // End the game on checkmate.
        } else if (this.isStalemate()) {
          alert('The game is a stalemate!');
          this.gameOver = true;
        }
      } else {
        this.selectedPiece = null;
      }
    } else if (this.board[row][col] && this.board[row][col][0] === this.currentPlayer) {
      this.selectedPiece = [row, col];
    }
  }

  // Animation for the move
  animateMove(oldRow, oldCol, newRow, newCol) {
    const oldSquare = document.querySelector(`.square[data-row="${oldRow}"][data-col="${oldCol}"]`);
    const newSquare = document.querySelector(`.square[data-row="${newRow}"][data-col="${newCol}"]`);
    const pieceElement = oldSquare.querySelector('.piece');

    pieceElement.style.transition = 'transform 0.5s ease';  // Add transition for animation
    pieceElement.style.transform = `translate(${newSquare.offsetLeft - oldSquare.offsetLeft}px, ${newSquare.offsetTop - oldSquare.offsetTop}px)`;

    // Once animation ends, move the piece element visually
    pieceElement.addEventListener('transitionend', () => {
      newSquare.appendChild(pieceElement);
      pieceElement.style.transition = '';  // Reset transition
      pieceElement.style.transform = '';  // Reset transform
    });
  }

  isValidMove(oldRow, oldCol, newRow, newCol) {
    const piece = this.board[oldRow][oldCol];
    if (!piece || piece[0] !== this.currentPlayer) return false;

    const dx = newCol - oldCol;
    const dy = newRow - oldRow;
    const type = piece[1];

    switch (type) {
      case 'p': return this.isValidPawnMove(oldRow, oldCol, newRow, newCol);
      case 'r': return this.isValidRookMove(oldRow, oldCol, newRow, newCol);
      case 'n': return this.isValidKnightMove(dx, dy);
      case 'b': return this.isValidBishopMove(oldRow, oldCol, newRow, newCol);
      case 'q': return this.isValidQueenMove(oldRow, oldCol, newRow, newCol); // Queen move logic
      case 'k': return this.isValidKingMove(oldRow, oldCol, newRow, newCol);
    }
    return false;
  }

  isValidPawnMove(oldRow, oldCol, newRow, newCol) {
    const piece = this.board[oldRow][oldCol];
    const direction = piece[0] === 'w' ? -1 : 1;
    if (newCol === oldCol && !this.board[newRow][newCol]) {
      if (newRow - oldRow === direction) return true;
      if ((oldRow === 6 && piece[0] === 'w') || (oldRow === 1 && piece[0] === 'b')) {
        if (newRow - oldRow === 2 * direction && !this.board[oldRow + direction][oldCol]) return true;
      }
    }
    if (Math.abs(newCol - oldCol) === 1 && newRow - oldRow === direction && this.board[newRow][newCol]) return true;
    return false;
  }

  isValidRookMove(oldRow, oldCol, newRow, newCol) {
    return (oldRow === newRow || oldCol === newCol) && this.isPathClear(oldRow, oldCol, newRow, newCol);
  }

  isValidKnightMove(dx, dy) {
    return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
  }

  isValidBishopMove(oldRow, oldCol, newRow, newCol) {
    return Math.abs(newRow - oldRow) === Math.abs(newCol - oldCol) && this.isPathClear(oldRow, oldCol, newRow, newCol);
  }

  isValidQueenMove(oldRow, oldCol, newRow, newCol) {
    // Queen can move as a Rook or a Bishop
    return this.isValidRookMove(oldRow, oldCol, newRow, newCol) || this.isValidBishopMove(oldRow, oldCol, newRow, newCol);
  }

  isValidKingMove(oldRow, oldCol, newRow, newCol) {
    return Math.abs(newRow - oldRow) <= 1 && Math.abs(newCol - oldCol) <= 1;
  }

  isPathClear(oldRow, oldCol, newRow, newCol) {
    let dx = Math.sign(newCol - oldCol);
    let dy = Math.sign(newRow - oldRow);
    let x = oldCol + dx, y = oldRow + dy;
    while (x !== newCol || y !== newRow) {
      if (this.board[y][x]) return false;
      x += dx;
      y += dy;
    }
    return true;
  }

  isCheckmate() {
    const kingPosition = this.findKingPosition(this.currentPlayer);
    if (!kingPosition) return false;

    const opponentPieces = this.getOpponentPieces();

    if (this.isKingInCheck(kingPosition, opponentPieces)) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const newRow = kingPosition.row + dx;
          const newCol = kingPosition.col + dy;

          if (this.isValidKingMove(kingPosition.row, kingPosition.col, newRow, newCol) &&
            !this.isKingInCheck({ row: newRow, col: newCol }, opponentPieces)) {
            return false;  // King has a valid move, so it's not checkmate
          }
        }
      }
      return true;  // No valid moves for the king, it's checkmate
    }
    return false;  // King is not in check, so it's not checkmate
  }

  isStalemate() {
    const kingPosition = this.findKingPosition(this.currentPlayer);
    if (!kingPosition || this.isKingInCheck(kingPosition, this.getOpponentPieces())) {
      return false; // If the king is in check, it's not stalemate
    }

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] && this.board[row][col][0] === this.currentPlayer) {
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              const newRow = row + dx;
              const newCol = col + dy;
              if (this.isValidMove(row, col, newRow, newCol)) {
                return false;  // Found a valid move, so it's not stalemate
              }
            }
          }
        }
      }
    }
    return true;  // No valid moves left, it's stalemate
  }

  findKingPosition(player) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] === `${player}k`) {
          return { row, col };
        }
      }
    }
    return null;
  }

  getOpponentPieces() {
    const opponent = this.currentPlayer === 'w' ? 'b' : 'w';
    let opponentPieces = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] && this.board[row][col][0] === opponent) {
          opponentPieces.push({ row, col, piece: this.board[row][col] });
        }
      }
    }
    return opponentPieces;
  }

  isKingInCheck(kingPosition, opponentPieces) {
    for (const piece of opponentPieces) {
      if (this.isValidMove(piece.row, piece.col, kingPosition.row, kingPosition.col)) {
        return true;
      }
    }
    return false;
  }
}

// **Game Start**
const game = new ChessGame();
document.getElementById('new-game').addEventListener('click', () => game.initBoard());