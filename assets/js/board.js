let boardDropTargetColumn = ''; 
let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0; 

let taskCountPerColumn = []; 

let tasksInColumn = [[], [], [], []];

let boardDropTargetContainer = '';

let tasksInCurrentColumn;
let draggedOverTask;
let currentlyDragging = false;
let boardMaximumDescriptionLength = 35;


let boardCurrentTaskInDetailView = '';
let searchResults = {};
const columnIds = ['board-kanban-column-todo', 'board-kanban-column-in-progress', 'board-kanban-column-awaiting-feedback', 'board-kanban-column-done'];
let boardActiveSearch = false;

let taskEditorSelectedPrio = '';
let searchResultsDatabaseIndexes = [];


/**
 * Initializes the board subpage.
 */
async function boardInit() {
    await init();

    window.addEventListener('resize', boardHandleWindowResize);
    boardHandleWindowResize();

    tasks = database.tasks;
    contacts = database.contacts;
    categories = database.categories;
    datePicker();
}


/*-------------------------------------------------
event listeners
-------------------------------------------------*/

/**
 * Creates drag-and-drop event listeners for mouse and touch applications for every task card rendered on the board.
 * @param {boolean} newBoardSearch true = the function should target tasks that are in the searchResults array; false = the function should target all tasks in the database
 */
function boardCreateAllEventListeners(newBoardSearch) {

    let dataForBoard = boardUseSearchResults(newBoardSearch);

    for (let i = 0; i < dataForBoard.tasks.length; i++) {

        const taskId = `task${i}`;
        let boardDragElement = document.getElementById(taskId);

        boardCreateEventListenerMouse(boardDragElement, i);
        boardCreateEventListenerTouch(boardDragElement, i);
    }
}

/**
 * Creates event listeners for a drag-and-drop function on a click device for the boardDragElement.
 * @param {object} boardDragElement a html task card
 * @param {number} i the index of the task in the database or searchResults array
 */
function boardCreateEventListenerMouse(boardDragElement, i) {
    boardDragElement.onmousedown = function (e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        changeHeight();

        document.onmouseup = function () {
            handleDropping(i);
        }

        document.onmousemove = function (e) {
            e.preventDefault();
            boardUpdateCoordinates(e);
            boardHandleDragging(boardDragElement, i);
        }
    }
}

/**
 * Updates the position coordinates of the dragging element.
 * @param {object} e a mousemove or touchmove event
 */
function boardUpdateCoordinates(e) {
    currentlyDragging = true;
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
}


/**
 * Creates event listeners for a drag-and-drop function on a touch device for the boardDragElement.
 * @param {object} boardDragElement a html task card
 * @param {number} i the index of the task in the database or searchResults array
 */
function boardCreateEventListenerTouch(boardDragElement, i) {
    boardDragElement.addEventListener('touchstart', handleStart, { passive: false });

    function handleStart(e) {
        e.preventDefault();
        e = e.changedTouches[0];
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.addEventListener('touchend', handleEnd);
        document.addEventListener('touchmove', handleMove, { passive: false });

        function handleEnd() {
            document.removeEventListener('touchend', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            handleDropping(i);
        }

        function handleMove(e) {
            e.preventDefault();
            e = e.changedTouches[0];
            boardUpdateCoordinates(e);
            boardHandleDragging(boardDragElement, i);
        }
    }
}



/*-------------------------------------------------
dragging
-------------------------------------------------*/


/**
 * Handles all process that need to be done, when a currently dragging task card is moved. This includes setting the position coordinates of the boardDragElement as its style.
 * @param {object} boardDragElement a html task card
 * @param {number} i the index of the task in the database or searchResults array
 */
function boardHandleDragging(boardDragElement, i) {

    boardResetVariablesForDragging();

    rotateTaskCard(boardDragElement, true);

    boardDragElement.style.top = (boardDragElement.offsetTop - pos2) + "px";
    boardDragElement.style.left = (boardDragElement.offsetLeft - pos1) + "px";

    checkDragOverlapping(boardDragElement, i);
    boardSetDropTargets();

    resetAllGapsInColumns(i);
    openGapInTaskColumn(i);
}


function boardResetVariablesForDragging() {

    boardDropTargetColumn = '';
    boardDropTargetContainer = '';
    tasksInCurrentColumn = [];
    draggedOverTask = -1;
}


function boardSetDropTargets() {

    for (let i = 0; i < columnIds.length; i++) {
        const columnId = columnIds[i];

        for (let j = 0; j < (taskCountPerColumn[i] + 1); j++) {

            const targetId = `${columnId}-drop-target-${j}`;

            if (boardDropTargetContainer != targetId) {

                try {
                    document.getElementById(targetId).classList.add('board-display-none');
                } catch (error) { }
            }
        }
    }

    if (boardDropTargetContainer) {
        document.getElementById(boardDropTargetContainer).classList.remove('board-display-none');
    }
}


function rotateTaskCard(boardDragElement, rotate) {

    if (rotate == true) {
        boardDragElement.classList.add('board-task-card-rotated');

    } else {
        boardDragElement.classList.remove('board-task-card-rotated');
    }
}


function checkDragOverlapping(boardDragElement, taskNumber) {

    for (let i = 0; i < columnIds.length; i++) {
        const columnId = columnIds[i];

        if (isDraggedElementOverBoardColumn(columnId, boardDragElement, i, taskNumber)) {

            boardDropTargetColumn = columnId;

            boardHidePlaceholder(columnId);

        } else {
            boardShowPlaceholder(columnId);
        }
    }
}


function isDraggedElementOverBoardColumn(columnId, boardDragElement, i, taskNumber) {

    let container = document.getElementById(columnId);

    let containerRect = container.getBoundingClientRect();
    let elementRect = boardDragElement.getBoundingClientRect();

    const width = elementRect.width;
    const height = elementRect.height;

    const centerX = elementRect.left + (width / 2);
    const centerY = elementRect.top + (height / 2);

    if (
        centerX <= containerRect.right &&
        centerX >= containerRect.left &&
        centerY <= containerRect.bottom &&
        centerY >= containerRect.top
    ) {
        checkDraggingOverDropContainer(columnId, centerX, centerY, i, taskNumber);
        return true;
    } else {
        return false;
    }
}


function checkDraggingOverDropContainer(columnId, centerX, centerY, index, taskNumber) {

    tasksInCurrentColumn = tasksInColumn[index];
    let stopCheckingForDropContainers = tasksInCurrentColumn.length + 1;
    let numberOfLastDropContainer = tasksInCurrentColumn.length;

    if (tasksInCurrentColumn.includes(taskNumber)) {
        stopCheckingForDropContainers = stopCheckingForDropContainers - 1;
        numberOfLastDropContainer = numberOfLastDropContainer - 1;
    }

    for (let i = 0; i < stopCheckingForDropContainers; i++) {

        const id = `${columnId}-drop-container-${i}`;
        const containerRect = document.getElementById(id).getBoundingClientRect();

        if (
            centerX <= containerRect.right &&
            centerX >= containerRect.left &&
            centerY <= containerRect.bottom &&
            centerY >= containerRect.top
        ) {
            boardDropTargetContainer = `${columnId}-drop-target-${i}`;
            draggedOverTask = tasksInCurrentColumn[i];
            return;

        } else {
            boardDropTargetContainer = `${columnId}-drop-target-${numberOfLastDropContainer}`;
        }
    }
}


function resetAllGapsInColumns(draggingTask) {

    for (let i = 0; i < 4; i++) {
        const column = tasksInColumn[i];

        for (let j = 0; j < column.length; j++) {

            if (draggingTask != column[j]) {

                const taskId = `task${column[j]}`;
                const topPosition = 260 * j;

                const task = document.getElementById(taskId);
                task.style = `top:${topPosition}px`;
            }
        }
    }
}

function openGapInTaskColumn(draggingTask) {

    const positionOfDraggedOverTask = tasksInCurrentColumn.indexOf(draggedOverTask);

    if (draggedOverTask >= 0 && draggedOverTask != draggingTask) {

        const taskNumberPositionCurrentColumn = tasksInCurrentColumn.indexOf(draggingTask);

        if (taskNumberPositionCurrentColumn != -1) {
            tasksInCurrentColumn.splice(taskNumberPositionCurrentColumn, 1);
        }

        for (let i = 0; i < tasksInCurrentColumn.length; i++) {

            const taskId = `task${tasksInCurrentColumn[i]}`;

            let newTopPosition = 260 * i;

            if (i >= positionOfDraggedOverTask) {
                newTopPosition = newTopPosition + 260;
            }

            const task = document.getElementById(taskId);
            task.style = `top:${newTopPosition}px`;
        }
    }
}


function boardShowPlaceholder(columnId) {

    try {
        let id = `${columnId}-placeholder`;
        let placeholder = document.getElementById(id);
        placeholder.classList.remove('board-display-none');

    } catch (error) {
        return;
    }
}


function boardHidePlaceholder(columnId) {

    try {
        let id = `${columnId}-placeholder`;
        let placeholder = document.getElementById(id);
        placeholder.classList.add('board-display-none');

    } catch (error) {
        return;
    }
}


/*-------------------------------------------------
dropping
-------------------------------------------------*/


function handleDropping(i) {
    document.onmouseup = null;
    document.onmousemove = null;
    let index = i;

    if (boardActiveSearch == true) {
        index = searchResultsDatabaseIndexes[i];
    }

    if (!currentlyDragging) {
        boardShowTaskDetails(index);
    }
    currentlyDragging = false;
    const newProgress = boardColumnRouter();

    if (newProgress) {
        database.tasks[index].progress = newProgress;
        setItem('database', database);
    }

    boardValidateSearchInput();
    // renderAllTaskCards();
    boardDropTargetColumn = '';
    // boardCreateAllEventListeners();
}



function boardColumnRouter() {

    if (boardDropTargetColumn) {

        return boardDropTargetColumn.substring(20);
    }
}



/*-------------------------------------------------
render task cards
-------------------------------------------------*/

function boardHandleWindowResize() {
    renderAllTaskCards();
    boardSwitchResponsiveMode();
    columnSetOffsetY();
    boardCreateAllEventListeners();
}




function boardSetMaximumDescriptionLength() {

    const windowWidth = window.innerWidth;

    if (windowWidth > 1500 || (windowWidth < 700 && windowWidth > 370)) {
        boardMaximumDescriptionLength = 90;

    } else if ((windowWidth < 950 && windowWidth > 900) || (windowWidth < 750 && windowWidth > 700)) {
        boardMaximumDescriptionLength = 25;

    } else if (windowWidth > 280) {
        boardMaximumDescriptionLength = 40;

    } else {
        boardMaximumDescriptionLength = 25;
    }
}


function renderAllTaskCards(newBoardSearch) {

    // if (boardActiveSearch == true) {
    //     newBoardSearch = true;        
    // }

    boardSetMaximumDescriptionLength();
    const dataForBoard = boardUseSearchResults(newBoardSearch);
    tasksInColumn = [[], [], [], []];
    taskCountPerColumn = [];

    renderBoardColumn('board-kanban-column-todo', 'todo', newBoardSearch, dataForBoard, 0);
    renderBoardColumn('board-kanban-column-in-progress', 'in-progress', newBoardSearch, dataForBoard, 1);
    renderBoardColumn('board-kanban-column-awaiting-feedback', 'awaiting-feedback', newBoardSearch, dataForBoard, 2);
    renderBoardColumn('board-kanban-column-done', 'done', newBoardSearch, dataForBoard, 3);
}


function boardUseSearchResults(newBoardSearch) {

    if (newBoardSearch == true || boardActiveSearch == true) {

        return searchResults;
    }
    return database;
}


function renderBoardColumn(id, progress, newBoardSearch, dataForBoard, columnPosition) {

    let currentColumnTaskCount = 0;
    let container = document.getElementById(id);
    container.innerHTML = '';
    let columnEmpty = true;

    for (let i = 0; i < dataForBoard.tasks.length; i++) {

        const task = dataForBoard.tasks[i];

        if (task.progress == progress) {
            columnEmpty = false;
            container.innerHTML += htmlTemplateTaskCard(i, task, currentColumnTaskCount);
            currentColumnTaskCount++;
            tasksInColumn[columnPosition].push(i);
        }
    }
    container.innerHTML += returnTemplateForDropContainers(id, currentColumnTaskCount);
    boardRenderColumnPlaceholder(id, container, columnEmpty, newBoardSearch);
    taskCountPerColumn.push(currentColumnTaskCount);
}


function boardSwitchResponsiveMode() {

    const windowWidth = window.innerWidth;
    let columnStyle = '';

    if (windowWidth <= 700) {
        document.getElementById('board-kanban').style = 'position: relative';
        columnStyle = 'position: absolute';

    } else {

        document.getElementById('board-kanban').style = 'display: flex';
    }

    for (let i = 0; i < columnIds.length; i++) {
        const column = columnIds[i];
        document.getElementById(column).parentNode.style = `${columnStyle}`;
    }
}


function columnSetOffsetY() {

    let offsetY = 0;

    for (let i = 0; i < columnIds.length; i++) {
        const columnId = columnIds[i];

        const column = document.getElementById(columnId).parentNode;

        column.style = `top: ${offsetY}px`;

        offsetY = boardComputeOffsetY(offsetY, i);
    }
}


function boardComputeOffsetY(offsetY, i) {

    if (taskCountPerColumn[i] == 0) {

        return offsetY + 264

    } else {

        return offsetY + (260 * (taskCountPerColumn[i] - 1)) + 253;
    }
}

function changeHeight() {
    let divs = document.querySelectorAll('.board-drop-container');
    divs.forEach(function(container) {
        container.style.height = '260px';
    });
}