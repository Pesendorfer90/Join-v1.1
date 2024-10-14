/*-------------------------------------------------
board - overlays - add task
-------------------------------------------------*/

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


function boardHideAddtaskOverlay() {

    document.getElementById('board-add-task').classList.add('board-display-none');
    document.getElementById('board-add-task').parentNode.classList.add('board-display-none');
    document.getElementById('board-kanban').classList.remove('board-display-none-700px');
    document.getElementById('board-add-task-subtasks').innerHTML = '';
}

/*-------------------------------------------------
board - overlays - edit task
-------------------------------------------------*/

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

function taskEditorSaveContacts() {
    let newAssignees = [];

    for (let i = 0; i < taskContactList.length; i++) {
        const contact = taskContactList[i];
        const name = contact.firstname + ' ' + contact.lastname;

        newAssignees.push(name);       
    }
    database.tasks[boardCurrentTaskInDetailView].assigned_to = newAssignees;
}


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


function taskEditorRenderData() {

    const task = database.tasks[boardCurrentTaskInDetailView];

    taskEditorRenderInputField('task-editor-title', task.title);
    taskEditorRenderInputField('task-editor-description', task.description);
    taskEditorRenderInputField('task-editor-date', task.due_date);
}

function taskEditorRenderInputField(inputId, value) {

    document.getElementById(inputId).value = value;
}



/*-------------------------------------------------
board - overlays - subtasks
-------------------------------------------------*/


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

async function boardRemoveSubtask(i, containerId) {

    database.tasks[boardCurrentTaskInDetailView].subtasks.name.splice(i, 1);
    database.tasks[boardCurrentTaskInDetailView].subtasks.status.splice(i, 1);

    boardRenderSubtasks(database.tasks[boardCurrentTaskInDetailView].subtasks, containerId);
    renderAllTaskCards();
    boardCreateAllEventListeners();
    await setItem('database', database);
}

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

function taskEditorGetSubtaskStatus(status) {

    if (status != 'true') {
        return 'd-none';
    }
}

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

function replaceForbiddenCharacters(string) {

    let validatedString = string.replace(/[\[{]/g, '(');
    validatedString = validatedString.replace(/[\]}]/g, ')');
    return validatedString;
}


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

/*-------------------------------------------------
board - overlays - assignee picker
-------------------------------------------------*/


function boardIncludeAssignePickerOnTaskEditor() {

    let container = document.getElementById('board-task-editor-assignee-picker');

    container.innerHTML = boardTemplateAssigneePicker();
}


function boardIncludeAssignePickerOnAddTask() {

    // let container = document.getElementById('board-add-task-assignee-picker');

    container.innerHTML = boardTemplateAssigneePicker();
}

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