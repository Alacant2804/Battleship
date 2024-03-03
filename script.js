const toggleButton = document.getElementById('toggleButton');
const placementDisplay = document.querySelector('.placementDisplay');
const doneButton = document.querySelector('.doneButton');
const modulo = document.querySelector('.modulo');

let currentShip = null;
let currentOrientation = 'horizontal';


toggleButton.addEventListener('click', () => {
    if (placementDisplay.textContent === 'Horizontal') {
        placementDisplay.textContent = 'Vertical';
    } else {
        placementDisplay.textContent = 'Horizontal';
    }
});

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

    for (let i = 0; i < size; i++) {
        const row = document.createElement('div');
        row.classList.add('row');

        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            cell.setAttribute('data-row', i);
            cell.setAttribute('data-col', j);

            row.appendChild(cell);
        }

        container.appendChild(row);
    }

    return container;
}

//Create boards
document.addEventListener('DOMContentLoaded', function() {
    const userGameboard = createBoard('userGameboard', 10); 
    const computerGameboard = createBoard('computerGameboard', 10);
    const moduloGameboard = createBoard('moduloGameboard', 10);

    // Add event listeners to the cells
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('mouseover', handleCellHover);
        cell.addEventListener('click', handleCellClick);
    });
});

function handleCellHover(event) {
    const cell = event.target;
    if (currentShip) {
        indicatePotentialPlacement(cell);
    }
}

function handleCellClick(event) {
    const cell = event.target;
    if (currentShip) {
        const success = placeShip(cell);
        if (success) {
            currentShip = null;
        }
    } else {
        if (ships.length > 0) {
            currentShip = ships.shift(); // Remove the first ship from the array
            currentOrientation = 'horizontal'; // Start with horizontal placement
            // Optionally, update the UI to reflect the current ship being placed
        }
    }
}

function placeShip(cell) {
    // Logic to place the ship on the board based on its current orientation
    // This will involve checking if the ship fits in the current orientation and position
    // Return true if the ship was successfully placed, false otherwise
}

function clearPotentialPlacement() {
    // Reset the background color of all cells to their original state
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.style.backgroundColor = ''; // Reset background color
    });
}

function resetPotentialPlacement() {
    // Logic to reset the visual indication of where the ship would be placed
    // This could involve resetting the background color of the cells or removing temporary ship elements
}
