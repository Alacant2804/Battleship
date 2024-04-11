const toggleButton = document.getElementById('toggleButton');
const placementDisplay = document.querySelector('.placementDisplay');
const doneButton = document.querySelector('.doneButton');
const modulo = document.querySelector('.modulo');

let currentShip = null;
let currentOrientation = 'horizontal';

doneButton.addEventListener('click', () => {
    modulo.style.display = 'none';
})

class Ship {
    constructor(name, length) {
        this.name = name
        this.length = length;
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
        if (cellIndex < moduloGameboard.length) {
            moduloGameboard[cellIndex].classList.add('preview');
        }
    }
}

function clearShipPreview(e, ship, orientation) {
    const moduloGameboard = document.getElementById('moduloGameboard').children;

    Array.from(moduloGameboard).forEach(cell => {
        cell.classList.remove('preview');
    });
}

function canPlaceShip(startIndex, shipLength, orientation, boardSize) {
    const moduloGameboard = document.getElementById('moduloGameboard').children;
    
    if (orientation === 'horizontal') {
        const startRow = Math.floor(startIndex / boardSize);
        const endRow = Math.floor((startIndex + shipLength - 1) / boardSize);
        
        if (endRow > startRow) return false;
        
        for (let i = 0; i < shipLength; i++) {
            if (moduloGameboard[startIndex + i].classList.contains('ship')) return false;
        }
    }
    else {
        if (Math.floor(startIndex / boardSize) + shipLength > boardSize) return false;
        for (let i = 0; i < shipLength; i++) {
            if (moduloGameboard[startIndex + i * boardSize].classList.contains('ship')) return false;
        }
    }
    
    return true; 
}

function placeShip(cell, ship, orientation) {
    const index = parseInt(cell.getAttribute('data-index'), 10);
    const moduloGameboard = document.getElementById('moduloGameboard').children;
    const boardSize = 10;
    
    if (canPlaceShip(index, ship.length, orientation, boardSize)) {
        for (let i = 0; i < ship.length; i++) {
            if (orientation === 'horizontal') {
                moduloGameboard[index + i].classList.add('ship');
            } else {
                moduloGameboard[index + i * boardSize].classList.add('ship');
            }
        }
        return true;
    } else {
        alert('Invalid placement');
        return false;
    }
}

function handleCellClick(event) {
    const cell = event.target;
    if (currentShip) {
        const success = placeShip(cell, currentShip, placementDisplay.textContent.toLowerCase());
        if (success) {
            currentShip = ships.length > 0 ? ships.shift() : null; 
            if (!currentShip) {
                console.log('All ships placed');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const userGameboard = createBoard('userGameboard', 10); 
    const computerGameboard = createBoard('computerGameboard', 10);
    const moduloGameboard = createBoard('moduloGameboard', 10);

    const cells = moduloGameboard.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    toggleButton.addEventListener('click', () => {
        console.log("Toggle button clicked");
        placementDisplay.textContent = placementDisplay.textContent === 'Horizontal' ? 'Vertical' : 'Horizontal';
    });

    currentShip = ships.shift();
});




