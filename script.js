const toggleButton = document.getElementById('toggleButton');
const placementDisplay = document.querySelector('.placementDisplay');
const startButton = document.querySelector('.startButton');
const modulo = document.querySelector('.modulo');

let playerTurn = true;
let currentShip = null;
let currentOrientation = 'horizontal';
const boardSize = 10;

class Ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;
        this.placed = false; 
        this.orientation = null; 
        this.startIndex = null;
    }
}

const ships = [
    new Ship('destroyer', 2),
    new Ship('submarine', 3),
    new Ship('cruiser', 3),
    new Ship('battleship', 4),
    new Ship('carrier', 5)
];

function createBoard(containerId, size) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);

        if (containerId === 'moduloGameboard') {
            cell.addEventListener('mouseover', (e) => showShipPreview(e, currentShip, currentOrientation));
            cell.addEventListener('mouseout', (e) => clearShipPreview(e, currentShip, currentOrientation));
        }

        container.appendChild(cell);
    }

    return container;
}

function showShipPreview(e, ship, orientation) {
    if (!ship) return;

    const index = parseInt(e.target.getAttribute('data-index'), 10);
    const moduloGameboard = document.getElementById('moduloGameboard').children;

    for (let i = 0; i < ship.length; i++) {
        let cellIndex = orientation === 'horizontal' ? index + i : index + i * boardSize;
        if (cellIndex >= moduloGameboard.length || (orientation === 'horizontal' && Math.floor(cellIndex / boardSize) !== Math.floor(index / boardSize))) {
            continue;
        }

        if (canPlaceShip(index, ship.length, orientation, moduloGameboard, boardSize)) {
            moduloGameboard[cellIndex].classList.add('preview');
        } else {
            moduloGameboard[cellIndex].classList.add('invalid');
        }
    }
}

function clearShipPreview(e, ship, orientation) {
    const moduloGameboard = document.getElementById('moduloGameboard').children;

    Array.from(moduloGameboard).forEach(cell => {
        cell.classList.remove('preview');
        cell.classList.remove('invalid');
    });
}

function isSurroundingCellEmpty(cellIndex, board, boardSize) {
    const row = Math.floor(cellIndex / boardSize);
    const col = cellIndex % boardSize;

    for (let dRow = -1; dRow <= 1; dRow++) {
        for (let dCol = -1; dCol <= 1; dCol++) {
            const checkRow = row + dRow;
            const checkCol = col + dCol;

            if (checkRow < 0 || checkRow >= boardSize || checkCol < 0 || checkCol >= boardSize) continue;

            const surroundingCellIndex = checkRow * boardSize + checkCol;

            if (board[surroundingCellIndex].classList.contains('ship')) {
                return false; 
            }
        }
    }
    return true; 
}

function canPlaceShip(startIndex, shipLength, orientation, board, boardSize) {
    for (let i = 0; i < shipLength; i++) {
        let cellIndex = orientation === 'horizontal' ? startIndex + i : startIndex + i * boardSize;
        
        if (orientation === 'horizontal' && Math.floor(cellIndex / boardSize) !== Math.floor(startIndex / boardSize)) {
            return false;
        }

        if (orientation === 'vertical' && cellIndex >= board.length) {
            return false;
        }

        if (!board[cellIndex] || board[cellIndex].classList.contains('ship')) {
            return false;
        }

        if (!isSurroundingCellEmpty(cellIndex, board, boardSize)) {
            return false;
        }
    }
    return true;
}

function placeShip(cell, ship, orientation) {
    const index = parseInt(cell.getAttribute('data-index'), 10);
    const moduloGameboard = document.getElementById('moduloGameboard').children;

    if (canPlaceShip(index, ship.length, orientation, moduloGameboard, boardSize)) {
        for (let i = 0; i < ship.length; i++) {
            const offset = orientation === 'horizontal' ? i : i * boardSize;
            moduloGameboard[index + offset].classList.add('ship');
        }
        ship.placed = true;
        ship.orientation = orientation;
        ship.startIndex = index;
        updateStartButtonStatus();
        return true;
    } else {
            return false;
    }
}

function updateStartButtonStatus() {
    const allPlaced = ships.every(ship => ship.placed);
    startButton.disabled = !allPlaced;
}

function placeComputerShips() {
    const computerGameboard = document.getElementById('computerGameboard').children;
    ships.forEach(ship => {
        let placed = false;
        while (!placed) {
            const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            const startIndex = Math.floor(Math.random() * computerGameboard.length);
            if (canPlaceShip(startIndex, ship.length, orientation, computerGameboard, boardSize)) {
                for (let i = 0; i < ship.length; i++) {
                    const offset = orientation === 'horizontal' ? i : i * boardSize;
                    const index = startIndex + offset;
                    if (index < computerGameboard.length) {
                        computerGameboard[index].classList.add('ship');
                    }
                }
                placed = true;
            }
        }
    });
}

function setupPlayerAttack() {
    const computerCells = document.getElementById('computerGameboard').querySelectorAll('.cell');
    computerCells.forEach(cell => {
        cell.addEventListener('click', function(event) {
            if (!playerTurn || cell.classList.contains('hit') || cell.classList.contains('miss')) {
                return;
            }

            if (cell.classList.contains('ship')) {
                cell.classList.add('hit');
            } else {
                cell.classList.add('miss');
            }

            checkForWin(); 

            playerTurn = false;
            setTimeout(computerAttack, 1000);
        });
    });
}

function computerAttack() {
    const userCells = document.getElementById('userGameboard').querySelectorAll('.cell');
    let attackMade = false;

    while (!attackMade) {
        const index = Math.floor(Math.random() * userCells.length);
        const cell = userCells[index];

        if (!cell.classList.contains('hit') && !cell.classList.contains('miss')) {
            if (cell.classList.contains('ship')) {
                cell.classList.add('hit');
            } else {
                cell.classList.add('miss');
            }
            attackMade = true; 
        }
    }

    checkComputerWin();

    playerTurn = true;
}

function checkForWin() {
    const hits = document.querySelectorAll('#computerGameboard .ship.hit').length;
    const totalShips = document.querySelectorAll('#computerGameboard .ship').length;
    if (hits === totalShips) {
        alert("You win!");
    }
}

function checkComputerWin() {
    const hits = document.querySelectorAll('#userGameboard .ship.hit').length;
    const totalShips = document.querySelectorAll('#userGameboard .ship').length;
    if (hits === totalShips) {
        alert("Computer wins!");
    }
}

function handleCellClick(event) {
    const cell = event.target;
    if (currentShip) {
        const success = placeShip(cell, currentShip, currentOrientation);
        if (success) {
            let currentIndex = ships.indexOf(currentShip);
            currentShip = currentIndex + 1 < ships.length ? ships[currentIndex + 1] : null;
            if (!currentShip) {
                console.log('All ships placed');
            }
        }
    }
}

function transferShipsToMainBoard() {
    const userGameboard = document.getElementById('userGameboard').children;
    ships.forEach(ship => {
        if (ship.placed) {
            for (let i = 0; i < ship.length; i++) {
                const offset = ship.orientation === 'horizontal' ? i : i * boardSize;
                const cellIndex = ship.startIndex + offset;
                if (userGameboard[cellIndex]) {
                    userGameboard[cellIndex].classList.add('ship');
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const userGameboard = createBoard('userGameboard', 10); 
    const computerGameboard = createBoard('computerGameboard', 10);
    const moduloGameboard = createBoard('moduloGameboard', 10);
    placeComputerShips();

    currentShip = ships[0]; 

    const cells = moduloGameboard.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    toggleButton.addEventListener('click', () => {
        placementDisplay.textContent = placementDisplay.textContent === 'Horizontal' ? 'Vertical' : 'Horizontal';
        currentOrientation = placementDisplay.textContent.toLowerCase();
    });

    startButton.addEventListener('click', () => {
        if (ships.every(ship => ship.placed)) {
            transferShipsToMainBoard();
            modulo.style.display = 'none';
            setupPlayerAttack();
        } else {
            alert("You must place all ships before starting the game.");
        }
    });
    
});


