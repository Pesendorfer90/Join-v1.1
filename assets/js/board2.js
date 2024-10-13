/*-------------------------------------------------
search function
-------------------------------------------------*/

function boardValidateSearchInput() {

    let inputField;
    searchResultsDatabaseIndexes = [];


    if (window.innerWidth > 700) {

        inputField = document.getElementById('board-search-input-desktop');
    } else {
        inputField = document.getElementById('board-search-input-mobile');
    }

    const userInput = inputField.value.trim();

    if (userInput.length == 0) {
        boardActiveSearch = false;
        renderAllTaskCards();
        boardCreateAllEventListeners();

    } else {
        boardActiveSearch = true;
        boardSearch(userInput);
    }
}


function boardSearch(userInput) {

    searchResults = { "tasks": [] };

    for (let i = 0; i < database.tasks.length; i++) {
        const task = database.tasks[i];

        boardSearchTask(task, userInput, i);
    }
    renderAllTaskCards(true);
    boardCreateAllEventListeners(true);
}

function boardSearchTask(task, userInput, databaseIndex) {

    if (boardFieldIncludes(task.title, userInput) ||
        boardFieldIncludes(task.description, userInput) ||
        boardFieldIncludes(task.category, userInput)) {

        boardSaveSearchResults(task);
        searchResultsDatabaseIndexes.push(databaseIndex);
        return;
    }

    for (let i = 0; i < task.assigned_to.length; i++) {
        const assignee = task.assigned_to[i];

        if (boardFieldIncludes(assignee, userInput)) {

            boardSaveSearchResults(task);
            searchResultsDatabaseIndexes.push(databaseIndex);
            return;
        }
    }
}

function boardFieldIncludes(field, userInput) {
    const fieldLowerCase = field.toLowerCase();
    const userInputLowerCase = userInput.toLowerCase();

    if (fieldLowerCase.includes(userInputLowerCase)) {
        return true;
    }
}

function boardSaveSearchResults(task) {

    const taskAsString = JSON.stringify(task);
    let searchResultsAsString = JSON.stringify(searchResults);

    searchResultsAsString = searchResultsAsString.slice(0, -2);

    if (searchResultsAsString.length > 20) {

        searchResultsAsString = searchResultsAsString + ',' + taskAsString;

    } else {
        searchResultsAsString = searchResultsAsString + taskAsString;

    }
    searchResultsAsString = searchResultsAsString + ']}';
    searchResults = JSON.parse(searchResultsAsString);
}


/*-------------------------------------------------
detail view
-------------------------------------------------*/

function boardShowTaskDetails(i) {

    boardRenderDetailView(i);
    document.getElementById('board-detail-view').parentNode.classList.remove('board-display-none');
    document.getElementById('board-detail-view').classList.remove('board-display-none');
    boardCurrentTaskInDetailView = i;

    document.getElementById('board-kanban').classList.add('board-display-none-700px');
}

function boardHideTaskDetails() {

    document.getElementById('board-detail-view').parentNode.classList.add('board-display-none');
    document.getElementById('board-detail-view').classList.add('board-display-none');
    document.getElementById('board-kanban').classList.remove('board-display-none-700px');
    boardCreateAllEventListeners();
}

function boardRenderDetailView(i) {
    const task = database.tasks[i];

    boardDetailViewCategory(task);
    boardDetailViewTitle(task);
    boardDetailViewDescription(task);
    boardDetailViewDueDate(task);
    boardDetailViewPriorityTag(task);
    boardDetailViewAssignees(task);
    boardRenderSubtasks(task.subtasks, 'board-detail-view-subtasks');
}

function boardDetailViewCategory(task) {

    let container = document.getElementById('board-detail-view-category-tag');

    container.innerHTML = /*html*/ `${task.category}`;
    container.style.backgroundColor = `${getCategoryColor(task.category)}`;
}

function boardDetailViewTitle(task) {
    let container = document.getElementById('board-detail-view-title');
    container.innerHTML = `${task.title}`;
}

function boardDetailViewDescription(task) {
    let container = document.getElementById('board-detail-view-description');
    container.innerHTML = `${task.description}`;
}

function boardDetailViewDueDate(task) {
    let container = document.getElementById('board-detail-view-due-date');
    container.innerHTML = /*html*/ `
    Due date: <div>${task.due_date}</div>`;
}

function boardDetailViewPriorityTag(task) {

    let container = document.getElementById('board-detail-view-priority-tag');
    container.innerHTML = /*html*/ `
    ${getTaskPrioBoard(task)} <img src="./assets/img/board/prio_${task.prio}_white.svg" alt="prio-icon">`;

    container.style.backgroundColor = `${boardGetPrioColor(task.prio)}`;
}

function boardDetailViewSubtasks(task) {

    if (task.subtasks.name) {

        const container = document.getElementById('board-detail-view-subtasks');
        
        let html = /*html*/ `Subtasks:
        <ul>`;

        for (let i = 0; i < task.subtasks.name.length; i++) {
            const subtaskName = task.subtasks.name[i];

            html += `<li>${subtaskName}</li>`;
        }

        html += '</ul>';
        container.innerHTML = html;
    }
}

function boardGetPrioColor(taskPrio) {

    if (taskPrio == 'low') {
        return 'rgba(122, 226, 41, 1)';

    } else if (taskPrio == 'medium') {
        return 'rgba(255, 168, 0, 1)';

    } else {
        return 'rgba(255, 61, 0, 1)';
    }
}

function boardDetailViewAssignees(task) {

    let container = document.getElementById('board-detail-view-assignees');
    container.innerHTML = 'Assigned to:';

    for (let i = 0; i < task.assigned_to.length; i++) {
        const assignee = task.assigned_to[i];

        container.innerHTML += /*html*/ `
        
        <div>
            ${htmlTemplateAssigneeIcon(assignee)}
            ${assignee}
        </div> `;
    }
}

function boardDeleteTask() {
 
    database.tasks.splice(boardCurrentTaskInDetailView, 1);

    boardHideTaskDetails();
    renderAllTaskCards();
    boardCreateAllEventListeners();
    setItem('database', database);  
}

/*-------------------------------------------------
render assignees on board
-------------------------------------------------*/

function htmlTemplateAllAssignees(task) {

    if (task.assigned_to.length < 4) {

        return htmlTemplateUpTo3Assignees(task);

    } else {
        return htmlTemplateMoreThan3Assignees(task);

    }
}

function htmlTemplateUpTo3Assignees(task) {
    let html = '';

    for (let i = 0; i < task.assigned_to.length; i++) {

        const assignee = task.assigned_to[i];

        html += htmlTemplateAssigneeIcon(assignee);
    }
    return html;
}

function htmlTemplateMoreThan3Assignees(task) {
    let html = '';

    for (let i = 0; i < 2; i++) {

        const assignee = task.assigned_to[i];

        html += htmlTemplateAssigneeIcon(assignee);
    }

    html += /*html*/ `
    <div style="background-color:rgb(42, 54, 71)">+${task.assigned_to.length - 2}</div> `;

    return html;
}


function htmlTemplateAssigneeIcon(assignee) {

    const firstInitial = assignee.substring(0, assignee.indexOf(' ')).charAt(0);
    const secondInitial = assignee.substring(assignee.indexOf(' ') + 1).charAt(0);
    const initials = firstInitial + secondInitial;

    return /*html*/ `
    <div style="background-color:${getAssigneeColor(assignee)}">${initials}</div> `;
}

function getAssigneeColor(assignee) {

    const firstname = assignee.substring(0, assignee.indexOf(' '));
    const lastname = assignee.substring(assignee.indexOf(' ') + 1);


    for (let i = 0; i < database.contacts.length; i++) {
        const contact = database.contacts[i];

        if (firstname == contact.firstname && lastname == contact.lastname) {
            return contact.color;
        }
    }
}


/*-------------------------------------------------
render functions
-------------------------------------------------*/


function htmlTemplateTaskCard(i, task, currentColumnTaskCount) {

    let topPosition = 260 * currentColumnTaskCount;

    let html = /*html*/ `

        <div id="task${i}" class="board-kanban-task-card board-cursor-pointer board-draggable" style="top:${topPosition}px">

            <div class="board-department-tag" style="background-color:${getCategoryColor(task.category)}">${task.category}</div>
            <h4>${task.title}</h4>
            <p class="board-task-description">${boardGetShortenedDescription(task.description)}</p>

                <div class="board-kanban-task-card-progress-bar" style="${boardCheckForSubtasks(task)}" >
                    ${boardSubtasksProgress(task)}
                </div>

                <div class="board-kanban-task-card-footer">
                    <div id="task${i}-assignees" class="board-kanban-task-card-footer-assignees">

                        ${htmlTemplateAllAssignees(task)}
                    </div>
                    <img src="./assets/img/board/prio_${task.prio}.svg" alt="prio-icon">
                </div>

            </div>
        `;
    return html;
}

function boardGetShortenedDescription(description) {

    if (description.length > boardMaximumDescriptionLength) {

        let shortened = description.substring(0, boardMaximumDescriptionLength);
        const lastWhitespace = shortened.lastIndexOf(' ');

        shortened = description.substring(0, lastWhitespace).trim() + '...';
        return shortened;
    }

    return description;
}

/*-------------------------------------------------
render Subtask Status
-------------------------------------------------*/

function boardCheckForSubtasks(task) {

    if (task.subtasks.name.length == 0) {
        return "display:none";
    }
}

function boardSubtasksProgress(task) {
    let html = '';
    const subtasksCount = task.subtasks.name.length


    if (subtasksCount == 0) {
        return;

    } else {
        const subtasksProgress = determineSubtasksProgress(task);
        const subtasksProgressAsFraction = subtasksProgress / subtasksCount;

        html += /*html*/ `
        <div class="board-kanban-task-card-progress-bar-grey"></div>
        <div class="board-kanban-task-card-progress-bar-blue" style="width:calc((100% - 40px) * ${subtasksProgressAsFraction})"></div>
        <p>${subtasksProgress}/${subtasksCount}</p> `;
    }
    return html;
}

function determineSubtasksProgress(task) {
    let subtasksProgress = 0;

    for (let i = 0; i < task.subtasks.status.length; i++) {
        const subtask = task.subtasks.status[i];

        if (subtask == "true") {
            subtasksProgress++;
        }
    }
    return subtasksProgress;
}


/*-------------------------------------------------
render priority icon
-------------------------------------------------*/

function getTaskPrioBoard(task) {

    if (task.prio == 'low') {
        return 'Low';

    } else if (task.prio == 'medium') {
        return 'Medium';

    } else {
        return 'Urgent';
    }
}


/*-------------------------------------------------
render categories board
-------------------------------------------------*/

function getCategoryColor(taskCategory) {

    for (let i = 0; i < database.categories.length; i++) {
        const category = database.categories[i];

        if (category.name == taskCategory) {
            return category.color;
        }
    }
}