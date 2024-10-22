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
        changeHeight();
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

/**
 * Resets the global variables used during the drag-and-drop process.
 *
 * This function clears the `boardDropTargetColumn`, `boardDropTargetContainer`,
 * and `tasksInCurrentColumn`, and sets `draggedOverTask` to `-1`, preparing
 * the state for a new drag-and-drop interaction.
 */
function boardResetVariablesForDragging() {
    boardDropTargetColumn = '';
    boardDropTargetContainer = '';
    tasksInCurrentColumn = [];
    draggedOverTask = -1;
}

/**
 * Updates the visibility of all drop targets in the board during a drag operation.
 *
 * This function iterates over all columns and their respective drop targets, hiding
 * the drop targets (`board-display-none` class) except for the current drop target,
 * which is stored in `boardDropTargetContainer`.
 *
 * If `boardDropTargetContainer` is set, its corresponding drop target is made visible.
 */
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

/**
 * Rotates or resets the rotation of a task card during drag-and-drop.
 *
 * @param {HTMLElement} boardDragElement - The task card element being dragged.
 * @param {boolean} rotate - A flag indicating whether to rotate the task card or reset the rotation.
 *
 * If `rotate` is `true`, the function adds a CSS class to rotate the task card.
 * If `rotate` is `false`, the rotation is removed.
 */
function rotateTaskCard(boardDragElement, rotate) {
    if (rotate == true) {
        boardDragElement.classList.add('board-task-card-rotated');
    } else {
        boardDragElement.classList.remove('board-task-card-rotated');
    }
}

/**
 * Checks if the dragged element is overlapping with any board column and adjusts placeholders.
 *
 * @param {HTMLElement} boardDragElement - The task card element being dragged.
 * @param {number} taskNumber - The index of the task being dragged.
 *
 * The function loops through all columns, calling `isDraggedElementOverBoardColumn` to check
 * for overlap with each column. If the element is over a column, it hides the placeholder for that column.
 * Otherwise, it shows the placeholder.
 */
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

/**
 * Determines if the dragged element is over a specific board column.
 *
 * @param {string} columnId - The unique ID of the board column.
 * @param {HTMLElement} boardDragElement - The task card element being dragged.
 * @param {number} i - The index of the column.
 * @param {number} taskNumber - The index of the task being dragged.
 * @returns {boolean} - Returns `true` if the dragged element is over the column, `false` otherwise.
 *
 * The function calculates the center of the dragged element and checks if it is within the bounds
 * of the specified board column. If true, it calls `checkDraggingOverDropContainer` for further handling.
 */
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

/**
 * Checks if the dragged element is over a valid drop container within the specified column.
 *
 * @param {string} columnId - The ID of the column being checked.
 * @param {number} centerX - The X-coordinate of the center of the dragged element.
 * @param {number} centerY - The Y-coordinate of the center of the dragged element.
 * @param {number} index - The index of the current column being checked.
 * @param {number} taskNumber - The task number of the element being dragged.
 *
 * The function iterates over the drop containers in the specified column and checks
 * if the dragged element's center is inside any container. If a match is found, it
 * updates `boardDropTargetContainer` and `draggedOverTask`.
 */
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

/**
 * Resets the top position of all tasks in all columns except the currently dragged task.
 *
 * @param {number} draggingTask - The task number of the element being dragged.
 *
 * The function loops through all tasks in all columns and sets their position based
 * on their order in the column. The dragged task is skipped to avoid updating its position.
 */
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

/**
 * Opens a gap in the column where the dragged task is being hovered, adjusting task positions.
 *
 * @param {number} draggingTask - The task number of the element being dragged.
 *
 * The function identifies the position of the task being dragged over and shifts the tasks
 * in the column to make space for the dragged task. It updates the top position of each task
 * accordingly.
 */
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

/**
 * Displays the placeholder for the specified column.
 *
 * @param {string} columnId - The ID of the column for which the placeholder should be shown.
 *
 * The function removes the `board-display-none` class from the column's placeholder to make it visible.
 */
function boardShowPlaceholder(columnId) {
    try {
        let id = `${columnId}-placeholder`;
        let placeholder = document.getElementById(id);
        placeholder.classList.remove('board-display-none');
    } catch (error) {
        return;
    }
}

/**
 * Hides the placeholder for the specified column.
 *
 * @param {string} columnId - The ID of the column for which the placeholder should be hidden.
 *
 * The function adds the `board-display-none` class to the column's placeholder to hide it.
 */
function boardHidePlaceholder(columnId) {
    try {
        let id = `${columnId}-placeholder`;
        let placeholder = document.getElementById(id);
        placeholder.classList.add('board-display-none');
    } catch (error) {
        return;
    }
}

/**
 * Handles the logic when the drag-and-drop operation is completed (on mouse release).
 *
 * @param {number} i - The index of the task being dropped.
 *
 * This function disables the mouse event listeners, determines if a search is active to update
 * the correct task, and shows task details if not dragging. It also updates the task's progress
 * and validates the current search input.
 */
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
    boardDropTargetColumn = '';
}

/**
 * Retrieves the column identifier from the global `boardDropTargetColumn` variable.
 *
 * @returns {string} - The substring from the 20th character onwards of `boardDropTargetColumn`,
 * representing the column ID where the drop target is located, or undefined if no target is set.
 */
function boardColumnRouter() {
    if (boardDropTargetColumn) {
        return boardDropTargetColumn.substring(20);
    }
}

/**
 * Handles tasks when the window is resized by rerendering task cards and adjusting the layout.
 *
 * This function calls multiple methods to re-render task cards, switch between responsive modes,
 * set column Y offsets, and recreate event listeners to adjust the layout accordingly.
 */
function boardHandleWindowResize() {
    renderAllTaskCards();
    boardSwitchResponsiveMode();
    columnSetOffsetY();
    boardCreateAllEventListeners();
}

/**
 * Sets the maximum description length for task cards based on the current window width.
 *
 * The function uses specific window width ranges to determine the appropriate
 * `boardMaximumDescriptionLength`, which defines the maximum characters allowed for task descriptions.
 */
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

/**
 * Renders all task cards in their respective board columns.
 *
 * @param {boolean} newBoardSearch - A flag indicating whether the board should be rendered
 * using search results or the entire database.
 *
 * The function first sets the maximum description length, retrieves the appropriate data (search results
 * or database), clears previous task data, and renders each board column by calling `renderBoardColumn`.
 */
function renderAllTaskCards(newBoardSearch) {
    boardSetMaximumDescriptionLength();
    const dataForBoard = boardUseSearchResults(newBoardSearch);
    tasksInColumn = [[], [], [], []];
    taskCountPerColumn = [];
    renderBoardColumn('board-kanban-column-todo', 'todo', newBoardSearch, dataForBoard, 0);
    renderBoardColumn('board-kanban-column-in-progress', 'in-progress', newBoardSearch, dataForBoard, 1);
    renderBoardColumn('board-kanban-column-awaiting-feedback', 'awaiting-feedback', newBoardSearch, dataForBoard, 2);
    renderBoardColumn('board-kanban-column-done', 'done', newBoardSearch, dataForBoard, 3);
}

/**
 * Returns the appropriate data source for rendering the board.
 *
 * @param {boolean} newBoardSearch - A flag indicating whether a new search is active.
 * @returns {Object} - Returns search results if a search is active; otherwise, returns the database.
 */
function boardUseSearchResults(newBoardSearch) {
    if (newBoardSearch == true || boardActiveSearch == true) {
        return searchResults;
    }
    return database;
}

/**
 * Renders a specific board column with task cards and drop containers.
 *
 * @param {string} id - The DOM ID of the column to render.
 * @param {string} progress - The progress status of the tasks to render in this column.
 * @param {boolean} newBoardSearch - Flag indicating if search results should be used.
 * @param {Object} dataForBoard - The data source (either search results or the full database).
 * @param {number} columnPosition - The index of the column in the `tasksInColumn` array.
 *
 * The function renders tasks that match the column's progress, adds drop containers,
 * and displays a placeholder if the column is empty.
 */
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

/**
 * Adjusts the board layout based on the window width for responsive behavior.
 *
 * For window widths 700 pixels or smaller, it sets the columns to absolute positioning;
 * for larger widths, it switches to flexbox layout. Each column's parent node is styled accordingly.
 */
function boardSwitchResponsiveMode() {
    const windowWidth = window.innerWidth;
    let columnStyle = '';

    if (windowWidth <= 700) {
        document.getElementById('board-kanban').style = 'position: relative';
        columnStyle = 'position: absolute';
    } else { document.getElementById('board-kanban').style = 'display: flex'; }
    for (let i = 0; i < columnIds.length; i++) {
        const column = columnIds[i];
        document.getElementById(column).parentNode.style = `${columnStyle}`;
    }
}

/**
 * Sets the vertical offset (`top` position) for each column based on its content.
 *
 * The function loops through all columns and adjusts their top position
 * based on the number of tasks they contain, using the `boardComputeOffsetY` function.
 */
function columnSetOffsetY() {
    let offsetY = 0;
    for (let i = 0; i < columnIds.length; i++) {
        const columnId = columnIds[i];
        const column = document.getElementById(columnId).parentNode;
        column.style = `top: ${offsetY}px`;
        offsetY = boardComputeOffsetY(offsetY, i);
    }
}

/**
 * Computes the Y-offset for a column based on the number of tasks it contains.
 *
 * @param {number} offsetY - The current offset value.
 * @param {number} i - The index of the column.
 * @returns {number} - The updated offset Y value, accounting for task and container heights.
 */
function boardComputeOffsetY(offsetY, i) {
    if (taskCountPerColumn[i] == 0) {
        return offsetY + 264
    } else {
        return offsetY + (260 * (taskCountPerColumn[i] - 1)) + 253;
    }
}

/**
 * Changes the height of all elements with the class 'board-drop-container' to 260px.
 *
 * The function selects all elements with the class and applies a uniform height of 260px.
 */
function changeHeight() {
    let divs = document.querySelectorAll('.board-drop-container');
    divs.forEach(function (container) {
        container.style.height = '260px';
    });
}