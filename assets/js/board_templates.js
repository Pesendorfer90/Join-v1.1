/**
 * Returns the appropriate HTML template for drop containers based on the window width.
 *
 * @param {string} columnId - The unique ID of the column.
 * @param {number} currentColumnTaskCount - The number of tasks in the current column.
 * @returns {string} - The HTML string for either desktop or mobile view.
 *
 * The function checks the window width. If it's greater than 700 pixels, it returns the
 * desktop template by calling `htmlTemplateDropContainersDesktop`. Otherwise, it returns
 * the mobile template by calling `htmlTemplateDropContainersMobile`.
 */
function returnTemplateForDropContainers(columnId, currentColumnTaskCount) {
    const windowWidth = window.innerWidth;

    if (windowWidth > 700) {

        return htmlTemplateDropContainersDesktop(columnId, currentColumnTaskCount);
        
    } else {

        return htmlTemplateDropContainersMobile(columnId, currentColumnTaskCount);
    }
}


/**
 * Generates the HTML template for drop containers in the desktop view.
 *
 * @param {string} columnId - The unique ID of the column.
 * @param {number} currentColumnTaskCount - The number of tasks in the current column.
 * @returns {string} - The HTML string for the drop containers.
 *
 * The function loops through the tasks in the column, creating containers and drop targets
 * with specific styles for the first container and target.
 */

function htmlTemplateDropContainersDesktop(columnId, currentColumnTaskCount) {

    let firstContainerSpecialStyle = ' style="height:253px"';
    let firstTargetSpecialStyle = ' style="margin:0"';
    let html = '';

    for (let i = 0; i < (currentColumnTaskCount + 1); i++) {

        const containerId = `${columnId}-drop-container-${i}`;
        const targetId = `${columnId}-drop-target-${i}`;

        html += /*html*/ `

        <div id="${containerId}" class="board-drop-container"${firstContainerSpecialStyle}>
            <div id="${targetId}" class="board-drop-target board-display-none"${firstTargetSpecialStyle}></div>
        </div>
        `;

        firstContainerSpecialStyle = '';
        firstTargetSpecialStyle = '';
    }
    return html;
}

/**
 * Generates the HTML template for drop containers in the mobile view.
 *
 * @param {string} columnId - The unique ID of the column.
 * @param {number} currentColumnTaskCount - The number of tasks in the current column.
 * @returns {string} - The HTML string for the drop containers.
 *
 * The function creates containers and drop targets for each task, with special styling for the
 * first container. It also appends an extra container at the end with a different height.
 */

function htmlTemplateDropContainersMobile(columnId, currentColumnTaskCount) {

    let firstContainerSpecialStyle = ' style="height:253px"';
    let firstTargetSpecialStyle = 'margin:0;';
    let html = '';
    let containerId = `${columnId}-drop-container-0`;
    let targetId = `${columnId}-drop-target-0`;


    for (let i = 0; i < (currentColumnTaskCount); i++) {


        html += /*html*/ `
        <div id="${containerId}" class="board-drop-container"${firstContainerSpecialStyle}>
            <div id="${targetId}" class="board-drop-target board-display-none" style="${firstTargetSpecialStyle}"></div>
        </div>
        `;
        
        containerId = `${columnId}-drop-container-${i + 1}`;
        targetId = `${columnId}-drop-target-${i + 1}`;
        firstContainerSpecialStyle = '';
        firstTargetSpecialStyle = '';
    }

    html += /*html*/ `
    <div id="${containerId}" class="board-drop-container" style="height:80px">
        <div id="${targetId}" class="board-drop-target board-display-none" style="height:76px; ${firstTargetSpecialStyle}"></div>
    </div>
    `;

    return html;
}

/**
 * Renders a placeholder in the column if it is empty and no search is active.
 *
 * @param {string} id - The unique ID for the placeholder.
 * @param {HTMLElement} container - The DOM element where the placeholder will be rendered.
 * @param {boolean} columnEmpty - A flag indicating if the column is empty.
 * @param {boolean} newBoardSearch - A flag indicating if a new search is active.
 *
 * If the column is empty and no search is active, a "No tasks to do" placeholder is added to the column.
 */

function boardRenderColumnPlaceholder(id, container, columnEmpty, newBoardSearch) {

    if (columnEmpty == true && newBoardSearch != true) {

        container.innerHTML += /*html*/ `
        <div id="${id}-placeholder" class="board-kanban-column-placeholder">No tasks to do</div> `;
    }
}