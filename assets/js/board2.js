/**
 * Validates the user's search input and triggers the search or renders all tasks.
 *
 * This function checks the value of the search input field (for desktop or mobile depending on the window width).
 * If the input is empty, it deactivates the search (`boardActiveSearch = false`) and re-renders all tasks.
 * Otherwise, it activates the search and calls `boardSearch` to process the user input.
 */
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

/**
 * Searches for tasks that match the user's input across the database.
 *
 * @param {string} userInput - The search string entered by the user.
 *
 * The function initializes an empty search results object and iterates through all tasks
 * in the database. For each task, it calls `boardSearchTask` to check for matches based on the input.
 * Afterward, it renders the filtered tasks and recreates event listeners.
 */
function boardSearch(userInput) {
    searchResults = { "tasks": [] };
    for (let i = 0; i < database.tasks.length; i++) {
        const task = database.tasks[i];

        boardSearchTask(task, userInput, i);
    }
    renderAllTaskCards(true);
    boardCreateAllEventListeners(true);
}

/**
 * Searches for a match in a task's fields (title, description, category, or assigned users).
 *
 * @param {Object} task - The task object being searched.
 * @param {string} userInput - The search string entered by the user.
 * @param {number} databaseIndex - The index of the task in the database.
 *
 * The function checks if the search input matches the task's title, description, or category.
 * If no match is found, it checks the assigned users. If a match is found, the task is added
 * to the search results, and its index is saved.
 */
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

/**
 * Checks if a field contains the user's input (case-insensitive).
 *
 * @param {string} field - The field to search in (e.g., task title or description).
 * @param {string} userInput - The search string entered by the user.
 * @returns {boolean} - Returns `true` if the field contains the input, `false` otherwise.
 *
 * The function converts both the field and the user input to lowercase for a case-insensitive search.
 */
function boardFieldIncludes(field, userInput) {
    const fieldLowerCase = field.toLowerCase();
    const userInputLowerCase = userInput.toLowerCase();
    if (fieldLowerCase.includes(userInputLowerCase)) {
        return true;
    }
}

/**
 * Saves the matching task to the search results object.
 *
 * @param {Object} task - The task object to save in the search results.
 *
 * The function converts both the task and the current search results to JSON strings,
 * appends the task to the results, and then updates the `searchResults` object by parsing
 * the modified JSON string.
 */
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

/**
 * Displays the task details in the detail view pane.
 *
 * @param {number} i - The index of the task to display in detail.
 *
 * This function renders the details of the task at index `i` by calling `boardRenderDetailView`.
 * It makes the detail view visible by removing the `board-display-none` class and hides the Kanban board
 * for screens smaller than 700px.
 */
function boardShowTaskDetails(i) {
    boardRenderDetailView(i);
    document.getElementById('board-detail-view').parentNode.classList.remove('board-display-none');
    document.getElementById('board-detail-view').classList.remove('board-display-none');
    boardCurrentTaskInDetailView = i;
    document.getElementById('board-kanban').classList.add('board-display-none-700px');
}

/**
 * Hides the task detail view and shows the Kanban board.
 *
 * This function hides the task detail view by adding the `board-display-none` class to the
 * detail view elements and shows the Kanban board by removing the `board-display-none-700px` class.
 * It also recreates all event listeners.
 */
function boardHideTaskDetails() {
    document.getElementById('board-detail-view').parentNode.classList.add('board-display-none');
    document.getElementById('board-detail-view').classList.add('board-display-none');
    document.getElementById('board-kanban').classList.remove('board-display-none-700px');
    boardCreateAllEventListeners();
}

/**
 * Renders all the task details in the detail view pane.
 *
 * @param {number} i - The index of the task to render in the detail view.
 *
 * The function renders various task fields (category, title, description, due date, priority, and assignees)
 * in the task detail view and calls `boardRenderSubtasks` to display subtasks if present.
 */
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

/**
 * Renders the task's category in the detail view.
 *
 * @param {Object} task - The task object whose category is to be displayed.
 *
 * The function displays the task's category and sets the background color based on the category color.
 */
function boardDetailViewCategory(task) {
    let container = document.getElementById('board-detail-view-category-tag');
    container.innerHTML = /*html*/ `${task.category}`;
    container.style.backgroundColor = `${getCategoryColor(task.category)}`;
}

/**
 * Renders the task's title in the detail view.
 *
 * @param {Object} task - The task object whose title is to be displayed.
 *
 * The function sets the task's title in the title section of the detail view.
 */
function boardDetailViewTitle(task) {
    let container = document.getElementById('board-detail-view-title');
    container.innerHTML = `${task.title}`;
}

/**
 * Renders the task's description in the detail view.
 *
 * @param {Object} task - The task object whose description is to be displayed.
 *
 * The function sets the task's description in the description section of the detail view.
 */
function boardDetailViewDescription(task) {
    let container = document.getElementById('board-detail-view-description');
    container.innerHTML = `${task.description}`;
}

/**
 * Renders the task's due date in the detail view.
 *
 * @param {Object} task - The task object whose due date is to be displayed.
 *
 * The function formats and displays the task's due date in the due date section of the detail view.
 */
function boardDetailViewDueDate(task) {
    let container = document.getElementById('board-detail-view-due-date');
    container.innerHTML = /*html*/ `
    Due date: <div>${task.due_date}</div>`;
}

/**
 * Renders the task's priority tag and icon in the detail view.
 *
 * @param {Object} task - The task object whose priority is to be displayed.
 *
 * The function sets the priority label and icon, with the background color
 * matching the priority, in the priority section of the detail view.
 */
function boardDetailViewPriorityTag(task) {
    let container = document.getElementById('board-detail-view-priority-tag');
    container.innerHTML = /*html*/ `
    ${getTaskPrioBoard(task)} <img src="./assets/img/board/prio_${task.prio}_white.svg" alt="prio-icon">`;
    container.style.backgroundColor = `${boardGetPrioColor(task.prio)}`;
}

/**
 * Renders the task's subtasks in the detail view.
 *
 * @param {Object} task - The task object whose subtasks are to be displayed.
 *
 * If the task has subtasks, the function generates an HTML list and displays
 * the subtasks in the subtasks section of the detail view.
 */
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

/**
 * Returns the color associated with the task's priority level.
 *
 * @param {string} taskPrio - The priority of the task ('low', 'medium', or 'high').
 * @returns {string} - The color in `rgba` format corresponding to the task's priority.
 */
function boardGetPrioColor(taskPrio) {
    if (taskPrio == 'low') {
        return 'rgba(122, 226, 41, 1)';
    } else if (taskPrio == 'medium') {
        return 'rgba(255, 168, 0, 1)';
    } else {
        return 'rgba(255, 61, 0, 1)';
    }
}

/**
 * Renders the assignees of the task in the detail view.
 *
 * @param {Object} task - The task object whose assignees are to be displayed.
 *
 * The function iterates over the task's `assigned_to` array and generates HTML to display
 * each assignee's icon and name in the detail view's assignees section.
 */
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

/**
 * Deletes the current task from the database and updates the board.
 *
 * The function removes the task currently displayed in the detail view from the `database.tasks` array.
 * It hides the task detail view, re-renders all task cards, recreates event listeners, and saves the updated database.
 */
function boardDeleteTask() {
    database.tasks.splice(boardCurrentTaskInDetailView, 1);
    boardHideTaskDetails();
    renderAllTaskCards();
    boardCreateAllEventListeners();
    setItem('database', database);  
}

/**
 * Returns the appropriate HTML template for rendering task assignees on the board.
 *
 * @param {Object} task - The task object whose assignees are to be displayed.
 * @returns {string} - The HTML template for rendering up to 3 assignees, or for displaying a summary if there are more than 3.
 *
 * If the task has fewer than 4 assignees, it returns a template displaying each assignee's icon.
 * If the task has 4 or more assignees, it displays only the first 2 assignees and a summary of the remaining count.
 */
function htmlTemplateAllAssignees(task) {
    if (task.assigned_to.length < 4) {
        return htmlTemplateUpTo3Assignees(task);
    } else {
        return htmlTemplateMoreThan3Assignees(task);
    }
}

/**
 * Generates the HTML template for rendering up to 3 assignees of a task.
 *
 * @param {Object} task - The task object whose assignees are to be displayed.
 * @returns {string} - The HTML string for displaying the assignee icons.
 *
 * The function iterates over the task's `assigned_to` array and calls `htmlTemplateAssigneeIcon` to render the assignee icons.
 */
function htmlTemplateUpTo3Assignees(task) {
    let html = '';
    for (let i = 0; i < task.assigned_to.length; i++) {
        const assignee = task.assigned_to[i];
        html += htmlTemplateAssigneeIcon(assignee);
    }
    return html;
}

/**
 * Generates the HTML template for rendering more than 3 assignees of a task.
 *
 * @param {Object} task - The task object whose assignees are to be displayed.
 * @returns {string} - The HTML string for displaying the first 2 assignees and a "+X" summary for the rest.
 */
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

/**
 * Generates the HTML template for rendering an assignee's icon with their initials.
 *
 * @param {string} assignee - The full name of the assignee.
 * @returns {string} - The HTML string for the assignee's icon, including the initials and background color.
 *
 * The function extracts the initials of the assignee and sets the background color using `getAssigneeColor`.
 */
function htmlTemplateAssigneeIcon(assignee) {
    const firstInitial = assignee.substring(0, assignee.indexOf(' ')).charAt(0);
    const secondInitial = assignee.substring(assignee.indexOf(' ') + 1).charAt(0);
    const initials = firstInitial + secondInitial;
    return /*html*/ `
    <div style="background-color:${getAssigneeColor(assignee)}">${initials}</div> `;
}

/**
 * Retrieves the background color associated with an assignee from the contacts database.
 *
 * @param {string} assignee - The full name of the assignee.
 * @returns {string} - The background color assigned to the assignee.
 *
 * The function matches the assignee's first and last name with the contacts in the database
 * to retrieve their assigned color.
 */
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

/**
 * Generates the HTML template for a task card in the Kanban board.
 *
 * @param {number} i - The index of the task in the database.
 * @param {Object} task - The task object containing the task details.
 * @param {number} currentColumnTaskCount - The number of tasks in the current column, used to set the card's position.
 * @returns {string} - The HTML string for the task card.
 *
 * The function generates a task card with its category, title, a shortened description, progress bar for subtasks,
 * assignees, and priority icon. The top position of the card is set based on the task's position in the column.
 */
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

/**
 * Returns a shortened version of the task description if it exceeds the maximum allowed length.
 *
 * @param {string} description - The task description to shorten.
 * @returns {string} - The shortened description with an ellipsis if it exceeds the maximum length, or the full description if not.
 *
 * The function trims the description to the maximum length set by `boardMaximumDescriptionLength` and ensures it doesn't cut off in the middle of a word.
 */
function boardGetShortenedDescription(description) {
    if (description.length > boardMaximumDescriptionLength) {
        let shortened = description.substring(0, boardMaximumDescriptionLength);
        const lastWhitespace = shortened.lastIndexOf(' ');
        shortened = description.substring(0, lastWhitespace).trim() + '...';
        return shortened;
    }
    return description;
}

/**
 * Checks if the task has any subtasks and returns the appropriate style.
 *
 * @param {Object} task - The task object containing the subtasks.
 * @returns {string} - A CSS style string to hide the progress bar if there are no subtasks, or an empty string otherwise.
 */
function boardCheckForSubtasks(task) {
    if (task.subtasks.name.length == 0) {
        return "display:none";
    }
}

/**
 * Generates the HTML template for the subtasks progress bar.
 *
 * @param {Object} task - The task object containing subtasks.
 * @returns {string} - The HTML string for the subtasks progress bar and progress text.
 *
 * The function calculates the progress of subtasks as a fraction of completed subtasks and generates a visual progress bar.
 */
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

/**
 * Determines how many subtasks have been completed for a given task.
 *
 * @param {Object} task - The task object containing subtasks.
 * @returns {number} - The number of completed subtasks.
 *
 * The function counts the number of subtasks with a status of "true" (indicating they are complete).
 */
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

/**
 * Returns the string label for the task's priority.
 *
 * @param {Object} task - The task object containing the priority level.
 * @returns {string} - The priority label ('Low', 'Medium', or 'Urgent').
 *
 * The function converts the priority level (`low`, `medium`, or `high`) into a human-readable string.
 */
function getTaskPrioBoard(task) {
    if (task.prio == 'low') {
        return 'Low';
    } else if (task.prio == 'medium') {
        return 'Medium';
    } else {
        return 'Urgent';
    }
}

/**
 * Retrieves the color associated with a task's category.
 *
 * @param {string} taskCategory - The name of the task category.
 * @returns {string} - The color assigned to the category.
 *
 * The function searches the `database.categories` array for the category matching `taskCategory` and returns its color.
 */
function getCategoryColor(taskCategory) {
    for (let i = 0; i < database.categories.length; i++) {
        const category = database.categories[i];
        if (category.name == taskCategory) {
            return category.color;
        }
    }
}