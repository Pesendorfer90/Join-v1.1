/*-------------------------------------------------
html templates
-------------------------------------------------*/

function returnTemplateForDropContainers(columnId, currentColumnTaskCount) {
    const windowWidth = window.innerWidth;

    if (windowWidth > 700) {

        return htmlTemplateDropContainersDesktop(columnId, currentColumnTaskCount);
        
    } else {

        return htmlTemplateDropContainersMobile(columnId, currentColumnTaskCount);
    }
}

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

function boardRenderColumnPlaceholder(id, container, columnEmpty, newBoardSearch) {

    if (columnEmpty == true && newBoardSearch != true) {

        container.innerHTML += /*html*/ `
        <div id="${id}-placeholder" class="board-kanban-column-placeholder">No tasks to do</div> `;
    }
}