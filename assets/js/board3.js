/**
 * Displays the "Add Task" overlay and initializes it with the selected progress.
 *
 * @param {string} progress - The progress status (e.g., 'todo', 'in-progress') for the new task.
 *
 * This function initializes variables for subtasks, renders categories and contacts,
 * and shows the "Add Task" overlay. It hides the Kanban board if the screen width is below 700px.
 */
function boardShowAddtaskOverlay(progress) {
    task.progress = progress;
    subtasks = [];
    subtaskStatus = [];
    document.getElementById('board-add-task-subtasks').innerHTML = boardAddTaskTemplateSubtasks();
    renderCategorys();
    renderContacts();
    document.getElementById('board-add-task').classList.remove('board-display-none');
    document.getElementById('board-add-task').parentNode.classList.remove('board-display-none');
    document.getElementById('board-kanban').classList.add('board-display-none-700px');
    document.getElementById('contentAlignment').classList.add('board-overflow');
}

/**
 * Hides the "Add Task" overlay and clears its content.
 *
 * This function hides the overlay for adding a task, clears any subtask inputs, and re-displays
 * the Kanban board if it was hidden.
 */
function boardHideAddtaskOverlay() {
    document.getElementById('board-add-task').classList.add('board-display-none');
    document.getElementById('board-add-task').parentNode.classList.add('board-display-none');
    document.getElementById('board-kanban').classList.remove('board-display-none-700px');
    document.getElementById('board-add-task-subtasks').innerHTML = '';
}

/**
 * Displays the task editor for the currently selected task and initializes the editor's fields.
 *
 * This function loads the current task data into the task editor, including priority, assignees,
 * and subtasks. It hides the task detail view and shows the task editor.
 */
function boardShowTaskEditor() {
    const task = database.tasks[boardCurrentTaskInDetailView];
    taskEditorSelectedPrio = task.prio;
    taskEditorRenderPrioButtons(task.prio);
    taskEditorRenderData();
    boardIncludeAssignePickerOnTaskEditor();
    document.getElementById('board-detail-view-subtasks').innerHTML = '';
    document.getElementById('board-task-editor-subtasks').innerHTML = boardTaskEditorTemplateSubtasks();
    taskEditorInitAssigneePicker(task.assigned_to);
    boardRenderSubtasks(task.subtasks, 'addetSubtasks');
    document.getElementById('board-detail-view').classList.add('board-display-none');
    document.getElementById('board-task-editor').classList.remove('board-display-none');
}

/**
 * Initializes the assignee picker in the task editor with the current assignees.
 *
 * @param {Array} assignees - The list of assignees for the task.
 *
 * The function renders the contacts list and selects the current assignees for the task
 * by matching names with the contacts database. It also sets up the contact picker UI.
 */
function taskEditorInitAssigneePicker(assignees) {
    renderContacts();
    taskContactList = [];
    for (let i = 0; i < assignees.length; i++) {
        const assignee = assignees[i];
        const firstname = assignee.substring(0, assignee.indexOf(' '));
        const lastname = assignee.substring(assignee.indexOf(' ') + 1);
        for (let j = 0; j < database.contacts.length; j++) {
            const contact = database.contacts[j];
            if (firstname == contact.firstname && lastname == contact.lastname) {
                const id = `contacts[${j}]`;
                selectedForTask(contact, id);
            }
        }
    }
    addContacts();
    pullDownMenu('assingedTo', 'category', 'moreContacts', 'moreCategorys');
    document.getElementById('ddArrow').classList.remove('d-none');
    document.getElementById('clearAddButtons').classList.add('d-none');
}

/**
 * Hides the task editor and clears its content.
 *
 * This function hides the task editor, resets the assignee and subtask fields, and re-displays
 * the Kanban board. It also recreates all event listeners.
 */
function boardHideTaskEditor() {
    taskContactList = [];
    document.getElementById('board-detail-view-subtasks').innerHTML = '';
    document.getElementById('board-task-editor').parentNode.classList.add('board-display-none');
    document.getElementById('board-task-editor').classList.add('board-display-none');
    document.getElementById('board-kanban').classList.remove('board-display-none-700px');
    document.getElementById('board-task-editor-assignee-picker').innerHTML = '';
    document.getElementById('board-task-editor-subtasks').innerHTML = '';
    boardCreateAllEventListeners();
}

/**
 * Confirms and saves the changes made in the task editor to the current task.
 *
 * The function updates the task title, description, due date, and assignees, then hides the editor.
 * It also re-renders the task cards and saves the updated task to the database.
 */
async function boardConfirmEditorChanges() {
    const taskEditorTitle = replaceForbiddenCharacters(document.getElementById('task-editor-title').value);
    const taskEditorDescription = replaceForbiddenCharacters(document.getElementById('task-editor-description').value);
    const taskEditorDueDate = document.getElementById('task-editor-date').value;
    database.tasks[boardCurrentTaskInDetailView].prio = taskEditorSelectedPrio;
    database.tasks[boardCurrentTaskInDetailView].title = taskEditorTitle;
    database.tasks[boardCurrentTaskInDetailView].description = taskEditorDescription;
    database.tasks[boardCurrentTaskInDetailView].due_date = taskEditorDueDate;
    taskEditorSaveContacts();
    boardHideTaskEditor();
    renderAllTaskCards();
    boardCreateAllEventListeners();
    await setItem('database', database);
}

/**
 * Saves the selected assignees from the task editor to the task's `assigned_to` field.
 *
 * The function collects the selected assignees from `taskContactList` and updates
 * the task with the new list of assigned contacts.
 */
function taskEditorSaveContacts() {
    let newAssignees = [];
    for (let i = 0; i < taskContactList.length; i++) {
        const contact = taskContactList[i];
        const name = contact.firstname + ' ' + contact.lastname;
        newAssignees.push(name);       
    }
    database.tasks[boardCurrentTaskInDetailView].assigned_to = newAssignees;
}

/**
 * Renders the priority buttons in the task editor, highlighting the selected priority.
 *
 * @param {string} selectedPrio - The selected priority ('high', 'medium', or 'low').
 *
 * The function highlights the selected priority and resets the appearance of the other priority buttons.
 */
function taskEditorRenderPrioButtons(selectedPrio) {
    taskEditorSelectedPrio = selectedPrio;
    let prios = ['high', 'medium', 'low'];
    const selectedIconId = `task-editor-prio-icon-${selectedPrio}`;
    const index = prios.indexOf(selectedPrio);
    prios.splice(index, 1);
    for (let i = 0; i < prios.length; i++) {
        const unselectedPrio = prios[i];
        const iconId = `task-editor-prio-icon-${unselectedPrio}`;
        document.getElementById(iconId).parentNode.style = 'background-color:rgb(255, 255, 255)';
        document.getElementById(iconId).parentNode.classList.add('board-cursor-pointer');
        document.getElementById(iconId).src = `./assets/img/board/prio_${unselectedPrio}.svg`;
    }
    document.getElementById(selectedIconId).parentNode.style = 'color:rgb(255, 255, 255)';
    document.getElementById(selectedIconId).parentNode.classList.remove('board-cursor-pointer');
    document.getElementById(selectedIconId).src = `./assets/img/board/prio_${selectedPrio}_white.svg`;
}

/**
 * Renders the task editor input fields with the current task data.
 *
 * This function populates the title, description, and due date fields in the task editor
 * with the values from the current task.
 */
function taskEditorRenderData() {
    const task = database.tasks[boardCurrentTaskInDetailView];
    taskEditorRenderInputField('task-editor-title', task.title);
    taskEditorRenderInputField('task-editor-description', task.description);
    taskEditorRenderInputField('task-editor-date', task.due_date);
}

/**
 * Renders the value of an input field in the task editor.
 *
 * @param {string} inputId - The ID of the input field to populate.
 * @param {string} value - The value to set in the input field.
 */
function taskEditorRenderInputField(inputId, value) {
    document.getElementById(inputId).value = value;
}

/**
 * Renders the subtasks for the current task in the specified container.
 *
 * @param {Object} subtasks - The subtasks object containing names and statuses.
 * @param {string} containerId - The ID of the container where the subtasks should be displayed.
 *
 * The function generates the HTML for each subtask, including its status and delete option, and displays them.
 */
function boardRenderSubtasks(subtasks, containerId) {
    let html = '';
    let container = document.getElementById(containerId);
    if (subtasks.name.length == 0) {
        html = 'No subtasks';
    } else {
        for (let i = 0; i < subtasks.name.length; i++) {

            html += taskEditorSubtaskTemplate(i, subtasks.name[i], subtasks.status[i], containerId);
        }
    }
    container.innerHTML = html;
}

/**
 * Generates the HTML template for a subtask in the task editor.
 *
 * @param {number} i - The index of the subtask.
 * @param {string} name - The name of the subtask.
 * @param {string} status - The completion status of the subtask ('true' or 'false').
 * @param {string} containerId - The container ID where the subtask will be rendered.
 * @returns {string} - The HTML string for the subtask.
 */
function taskEditorSubtaskTemplate(i, name, status, containerId) {
    const html = /*html*/ `
            <div class="sub-task">
            <div onclick="taskEditorSetCheckbox(${i})" class="selectbox-subtask pointer">
            <img class="subtaskDone ${taskEditorGetSubtaskStatus(status)}" id="taskEditorCheckmark${i}" src="./assets/img/create_subtask.png">
            </div>
            <div class="board-detail-view-subtask">${name}
            <img class="board-cursor-pointer" src="./assets/img/board/close.svg"
            onclick="boardRemoveSubtask(${i}, '${containerId}')" alt="delete-icon"></div>
            </div>`;
    return html;
}

/**
 * Removes a subtask from the current task and re-renders the subtasks.
 *
 * @param {number} i - The index of the subtask to remove.
 * @param {string} containerId - The ID of the container where the subtasks are displayed.
 *
 * The function removes the selected subtask and updates the database, then re-renders the task cards.
 */
async function boardRemoveSubtask(i, containerId) {
    database.tasks[boardCurrentTaskInDetailView].subtasks.name.splice(i, 1);
    database.tasks[boardCurrentTaskInDetailView].subtasks.status.splice(i, 1);
    boardRenderSubtasks(database.tasks[boardCurrentTaskInDetailView].subtasks, containerId);
    renderAllTaskCards();
    boardCreateAllEventListeners();
    await setItem('database', database);
}

/**
 * Toggles the completion status of a subtask in the task editor.
 *
 * @param {number} i - The index of the subtask to toggle.
 *
 * The function updates the subtask's status and re-renders the task cards to reflect the change.
 */
async function taskEditorSetCheckbox(i) {
    const id = `taskEditorCheckmark${i}`;
    if (database.tasks[boardCurrentTaskInDetailView].subtasks.status[i] == 'false') {
        document.getElementById(id).classList.remove('d-none');
        database.tasks[boardCurrentTaskInDetailView].subtasks.status[i] = 'true';
    } else {
        document.getElementById(id).classList.add('d-none');
        database.tasks[boardCurrentTaskInDetailView].subtasks.status[i] = 'false';
    }
    renderAllTaskCards();
    await setItem('database', database);
}

/**
 * Returns the appropriate CSS class for the subtask based on its status.
 *
 * @param {string} status - The completion status of the subtask ('true' or 'false').
 * @returns {string} - The CSS class to apply to the subtask checkmark ('d-none' if not completed).
 */
function taskEditorGetSubtaskStatus(status) {
    if (status != 'true') {
        return 'd-none';
    }
}

/**
 * Adds a new subtask to the current task in the task editor.
 *
 * The function retrieves the subtask input, validates it, and adds the new subtask to the task.
 * It re-renders the subtasks and saves the updated task to the database.
 */
function taskEditorAddSubtask() {
    const subtaskInput = replaceForbiddenCharacters(document.getElementById('subtaskInput').value);
    if (subtaskInput) {
        database.tasks[boardCurrentTaskInDetailView].subtasks.name.push(subtaskInput);
        database.tasks[boardCurrentTaskInDetailView].subtasks.status.push('false');
        boardRenderSubtasks(database.tasks[boardCurrentTaskInDetailView].subtasks, 'addetSubtasks');
        document.getElementById('subtaskInput').value = '';
        renderAllTaskCards();
        boardCreateAllEventListeners();
        setItem('database', database);
    }
}

/**
 * Replaces forbidden characters in a string with valid ones.
 *
 * @param {string} string - The string to sanitize.
 * @returns {string} - The sanitized string with forbidden characters replaced by valid ones.
 *
 * The function replaces square brackets `{}`, `[]`, and quotes with parentheses.
 */
function replaceForbiddenCharacters(string) {
    let validatedString = string.replace(/[\[{]/g, '(');
    validatedString = validatedString.replace(/[\]}]/g, ')');
    return validatedString;
}

/**
 * Returns the HTML template for the subtasks section of the "Add Task" overlay.
 *
 * @returns {string} - The HTML template for the subtasks input and display section.
 */
function boardAddTaskTemplateSubtasks() {
    return /*html*/ `
        <div class="padding-36-bottom">
        <div class="display-flex">
            <div class="padding-10-bottom padding-17-right">Subtasks</div>
            <div id="subTaskReport" class="report d-none">The following characters are not allowed { } [
                ] "</div>
        </div>
        <div class="task-white-box task-subtask-container" id="subtask">
            <input type="text" placeholder="Add new subtask" id="subtaskInput"
                class="input-cat-sub no-outline" onclick="switchSubtaskIcons()">
            <div class="center" id="addSubtask">
                <img onclick="switchSubtaskIcons()" class="padding-17-right pointer"
                    src="assets/img/add_subtask.png">
            </div>
            <div class="center spcae-between clear-add-button-container padding-17-right d-none"
                id="createSubtask">
                <img class="clear-input pointer" onclick="switchSubtaskIcons()"
                    src="./assets/img/Clear_task_input.png">
                <div>|</div>
                <img id="board-button-submit-new-subtask" onclick="addSubtask()" class="pointer" src="./assets/img/create_subtask.png">
            </div>
        </div>
        <div id="addetSubtasks"></div>
        </div>
    `;
}

/**
 * Returns the HTML template for the subtasks section of the task editor.
 *
 * @returns {string} - The HTML template for the subtasks input and display section in the editor.
 */
function boardTaskEditorTemplateSubtasks() {
    return /*html*/ `
        <div class="padding-36-bottom">
        <div class="display-flex">
            <div class="padding-10-bottom padding-17-right">Subtasks</div>
            <div id="subTaskReport" class="report d-none">The following characters are not allowed { } [
                ] "</div>
        </div>
        <div class="task-white-box task-subtask-container" id="subtask">
            <input type="text" placeholder="Add new subtask" id="subtaskInput"
                class="input-cat-sub no-outline" onclick="switchSubtaskIcons()">
            <div class="center" id="addSubtask">
                <img onclick="switchSubtaskIcons()" class="padding-17-right pointer"
                    src="assets/img/add_subtask.png">
            </div>
            <div class="center spcae-between clear-add-button-container padding-17-right d-none"
                id="createSubtask">
                <img class="clear-input pointer" onclick="switchSubtaskIcons()"
                    src="./assets/img/Clear_task_input.png">
                <div>|</div>
                <img id="board-button-submit-new-subtask" onclick="taskEditorAddSubtask()" class="pointer" src="./assets/img/create_subtask.png">
            </div>
        </div>
        <div id="addetSubtasks"></div>
        </div>
    `;
}

/**
 * Includes the assignee picker template in the task editor.
 *
 * The function populates the task editor with the assignee picker UI.
 */
function boardIncludeAssignePickerOnTaskEditor() {
    let container = document.getElementById('board-task-editor-assignee-picker');
    container.innerHTML = boardTemplateAssigneePicker();
}

/**
 * Returns the HTML template for the assignee picker.
 *
 * @returns {string} - The HTML template for the assignee picker UI, allowing contacts to be selected for the task.
 */
function boardTemplateAssigneePicker() {
    return /*html*/ `
        <div>
            <div class="display-flex">
                <div class="padding-10-bottom padding-17-right">Assigned to</div>
                <div id="contactReport" class="report d-none">This field is required</div>
            </div>

            <div class="dropdown-category-closed" id="assingedTo">

                <div onclick="pullDownMenu('assingedTo', 'category', 'moreContacts', 'moreCategorys')" class="dd-placeholder" id="contactsToAssingContainer">
                    <div>Contacts to assign</div>
                    <img id="ddArrow" src="assets/img/drop_down.png">

                    <div class="center spcae-between clear-add-button-container d-none" id="clearAddButtons">
                        <img class="clear-input pointer" onclick="clearContacts()" src="./assets/img/Clear_task_input.png">
                        <div>|</div>
                        <img onclick="addContacts()" class="pointer" src="./assets/img/create_subtask.png">
                    </div>
                </div>

                <div class="d-none task-more-content overflow-auto" id="moreContacts">
                    <div id="loggedInUserAddTask"></div>
                    <div id="loadedContacts"></div>

                </div>

            </div>
        </div>
        <div class="task-initials-container" id="initialsContainer"></div>
    `;
}