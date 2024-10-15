


/**
 * This function starts an event listener that checks whether enter is pressed in the subtask input field.
 */
function subtaskEventListener() {
    document.addEventListener('DOMContentLoaded', function () {
        let subTaskInputField = document.getElementById('subtaskInput');
        subTaskInputField.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                addSubtask();
            }
        });
    });
}


/**
 * This function removes a subtask and subtask status and re-renders the remaining ones.
 * @param {number} i - Index of subtask
 */
function removeSubtask(i) {
    subtasks.splice(i, 1);
    subtaskStatus.splice(i, 1);
    renderSubtasks();
}


/**
 * This function renders the subtasks.
 */
function renderSubtasks() {
    let subtaskContainer = document.getElementById('addetSubtasks');
    subtaskContainer.innerHTML = '';
    for (let i = 0; i < subtasks.length; i++) {
        subtaskContainer.innerHTML += `<div class="sub-task">
            <div onclick="setStatus('selectboxSubtask${i}', ${i})" class="selectbox-subtask pointer">
            <img class="subtaskDone ${getClass(i)}" id="selectboxSubtask${i}" src="assets/img/create_subtask.png">
            </div>
            <div class="pointer" onclick="removeSubtask(${i}), ${i}">${subtasks[i]}</div>
            </div>`
    }
}



/**
 * This function changes the class of the input field.
 * If you click in the input field, add a subtask or press cancel,
 * you will switch between 2 different views on the right side of the input field.
 */
function switchSubtaskIcons() {
    let addSubtask = document.getElementById('addSubtask');
    let createSubtask = document.getElementById('createSubtask');
    let subtaskInput = document.getElementById('subtaskInput');
    let createSubtaskClass = createSubtask.classList.value;
    if (createSubtaskClass.includes('d-none') == true) {
        showAddClearIcons(addSubtask, createSubtask, subtaskInput);
    } else {
        removeAddClearIcons(addSubtask, createSubtask, subtaskInput);
    }
}


/**
 * This function changes the classes of the input field, 
 * focuses the input field and removes onclick.
 * @param {string} addSubtask - ID of a button.
 * @param {string} createSubtask - ID of a button container.
 * @param {string} subtaskInput - ID of an input field.
 */
function showAddClearIcons(addSubtask, createSubtask, subtaskInput) {
    subtaskInput.removeAttribute("onclick");
    createSubtask.classList.remove('d-none');
    addSubtask.classList.add('d-none');
    subtaskInput.focus();
}


/**
 * This function changes the classes of the input field,
 * clears the value of the input field and removes the focus from the input field
 * @param {string} addSubtask - ID of a button.
 * @param {string} createSubtask - ID of a button container.
 * @param {string} subtaskInput - ID of an input field.
 */
function removeAddClearIcons(addSubtask, createSubtask, subtaskInput) {
    subtaskInput.setAttribute("onclick", "switchSubtaskIcons()");
    createSubtask.classList.add('d-none');
    addSubtask.classList.remove('d-none');
    subtaskInput.blur();
    subtaskInput.value = '';
}


/**
 * This function checks whether a subtask is done or not and then returns the corresponding value.
 * @param {number} i - Index of the subtask.
 * @returns - CSS class or ''.
 */
function getClass(i) {
    if (subtaskStatus[i] == 'true') {
        return setClass = '';
    } else {
        return setClass = 'd-none';
    }
}


/**
 * If a subtask's checkbox is clicked,
 * the CSS class 'd-none' will be removed or added and
 * subTaskStatus is set to true or false at the correct index.
 * @param {string} divID - ID of an div.
 * @param {number} i - Index of the subtask.
 */
function setStatus(divID, i) {
    if (subtaskStatus[i] == 'false') {
        document.getElementById(divID).classList.remove('d-none');
        subtaskStatus.splice(i, 1, 'true');
    } else {
        document.getElementById(divID).classList.add('d-none')
        subtaskStatus.splice(i, 1, 'false');
    }
}


/**
 * This function opens an input field and a div with selectable random colors.
 */
function openCreateCategory() {
    document.getElementById('newCategoryContainer').classList.remove('d-none');
    document.getElementById('color-picker').classList.remove('d-none');
    pullDownMenu('category', 'assingedTo', 'moreCategorys', 'moreContacts');
    getRandomColor();
    document.getElementById('category').classList.add('d-none');
}


/**
 * This function removes an input field and a div with selectable random colors.
 */
function closeCreateCategory() {
    document.getElementById('category').classList.remove('d-none');
    document.getElementById('categoryPlaceholder').classList.remove('d-none');
    document.getElementById('newCategoryContainer').classList.add('d-none');
    document.getElementById('color-picker').classList.add('d-none');
    // pullDownMenu('category', 'assingedTo', 'moreCategorys', 'moreContacts');
    removeSelectedColor();
}


/**
 * This function checks if an input field is empty and if a color has been selected.
 * If both exist, a function is started.
 */
function addCategory() {
    categoryInputFiled = document.getElementById('categoryInput');
    newCategory = categoryInputFiled.value;
    if (newCategory == '') {
        alert('Please enter a new category name')
    } else if (colorForNewCategory == undefined) {
        alert('Please choose a color')
    } else {
        createCategory(categoryInputFiled);
    }
}


/**
 * This function saves a new category, empty and close an input field,
 * select and shows the new category.
 */
function createCategory(categoryInputFiled) {
    saveNewCategory();
    categoryInputFiled.value = '';
    closeCreateCategory();
    selectCategory(newCategory, colorForNewCategory);
}


/**
 * This function adds a rgb background color to div's.
 */
function getRandomColor() {
    for (let index = 0; index < 6; index++) {
        generatedColor = generateRandomColor();
        colorCircle = document.getElementById('colorPickCircle' + index);
        colorCircle.style = `background-color: ${generatedColor}`;
        setOnclickForColorpicker(colorCircle, generatedColor, index);
    }
}


/**
 * This function creates random colors.
 * @returns random rgb numbers.
 */
function generateRandomColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}


/**
 * This function set a oncklick.
 * @param {string} colorCircle - The ID of a div.
 * @param {string} generatedColor - rgb code.
 * @param {number} index - index of a div.
 */
function setOnclickForColorpicker(colorCircle, generatedColor, index) {
    colorCircle.setAttribute("onclick", `selectedColor('${generatedColor}', 'colorPickCircle${index}')`);
}


/**
 * This function gives an rgb code to one variable and an ID to another variable.
 * Adds a class to the corresponding div to show the user what he clicked.
 * @param {string} color - rgb code
 * @param {string} id - The ID of the clicked div.
 */
function selectedColor(color, id) {
    colorForNewCategory = `${color}`;
    colorForNewCategoryID = id;
    removeSelectedColor();
    document.getElementById(id).classList.add('task-selected-category-color');
}


/**
 * This function removes the CSS class 'task-selected-category-color'.
 */
function removeSelectedColor() {
    for (let i = 0; i < 6; i++) {
        document.getElementById('colorPickCircle' + i).classList.remove('task-selected-category-color');
    }
}


/**
 * This function prepares a new category to be pushed into a JSON.
 */
function saveNewCategory() {
    category = {
        "name": `${newCategory}`,
        "color": `${colorForNewCategory}`
    };
    pushCategoryInCategorys();
}


/**
 * This function pushes a new category into the database array.
 */
async function pushCategoryInCategorys() {
    categories.push(category);
    renderCategorys();
}


/**
 * This function gets the value from the input field,
 * checks if it is empty and warns the user that this input field cannot be empty.
 * @returns value from input field.
 */
function getTitle() {
    let title = document.getElementById('tileInput').value;
    if (title == '' || containsBrackets(title)) {
        document.getElementById('titleReport').classList.remove('d-none');
        required = true;
    } else {
        return title;
    }
}


/**
 * This function gets the value from the input field,
 * checks if it is empty and warns the user that this input field cannot be empty.
 * @returns value from input field.
 */
function getDescription() {
    let description = document.getElementById('descriptionInput').value;
    if (description == '' || containsBrackets(description)) {
        document.getElementById('descriptionReport').classList.remove('d-none');
        required = true;
    } else {
        return description;
    }
}


/**
 * This function checks the variable selectedCategory if it is empty and
 * warns the user if no category is selected.
 * @returns selected category
 */
function getCategory() {
    if (selectedCategory == undefined) {
        document.getElementById('categoryReport').classList.remove('d-none');
        required = true;
    } else {
        return selectedCategory;
    }
}


/**
 * This function pushes all the names of the selected contacts in an array.
 */
function getName() {
    taskContactList.forEach((ContactName) => {
        fullName = ContactName.firstname + ' ' + ContactName.lastname;
        collectedContact.push(fullName);
    })

}


/**
 * This function gets the value from the input field,
 * checks if it is empty and warns the user that this input field cannot be empty.
 * @returns value from input field.
 */
function getDate() {
    let date_regex = /^(?:19|20)\d{2}-(?:0?[1-9]|1[0-2])-(?:0?[1-9]|[1-2][0-9]|3[0-1])$/;
    let chosenDate = document.getElementById('date').value;
    if (chosenDate == '' || !(date_regex.test(chosenDate))) {
        document.getElementById('dateReport').classList.remove('d-none');
        required = true;
    } else {
        return chosenDate;
    }
}


/**
 * This function checks the variable prio if it is empty and
 * warns the user if no priority is selected.
 * @returns 'urgent', 'medium' or 'low'
 */
function getPrio() {
    if (prio == undefined) {
        document.getElementById('prioReport').classList.remove('d-none');
        required = true;
    } else {
        return prio;
    }
}

/**
 * This function pushes all subtasks into a JSON.
 */
function pushSubtask() {
    for (let i = 0; i < subtasks.length; i++) {
        task.subtasks.name.push(subtasks[i]) || [];
    }
}

/**
 * This function pushes all subtask status into a JSON.
 */
function pushStatus() {
    for (let i = 0; i < subtaskStatus.length; i++) {
        task.subtasks.status.push(subtaskStatus[i]);
    }
}


/**
 * The function collects information from various input fields and assigns them to a task object. 
 * The function also includes some additional actions such as disabling a button,
 * reactivating the button after a delay if any input is missing and saving everything to the database.
 */
function collectAllInfos() {
    disableAddTaskButton();
    getName();
    task.title = getTitle();
    task.description = getDescription();
    task.category = getCategory();
    task.assigned_to = collectedContact;
    task.due_date = getDate();
    task.prio = getPrio();
    setTimeout(() => {
        if (required == '') {
            pushSubtask();
            pushStatus();
            saveDatabase()
        } else {
            activateAddTaskButton();
            required = ''
        }
    }, 300)
}


/**
 * This function disables the hover effect and the onclick on the add task button.
 */
function disableAddTaskButton() {
    document.getElementById('mobileCreateTask').removeAttribute("onclick");
    document.getElementById('desktopCreateTask').removeAttribute("onclick");
    document.getElementById('desktopCreateTask').classList.remove("create-hover");
}


/**
 * This function aktivates the hover effect and the onclick on the add task button.
 */
function activateAddTaskButton() {
    document.getElementById('mobileCreateTask').setAttribute("onclick", `collectAllInfos()`);
    document.getElementById('desktopCreateTask').setAttribute("onclick", `collectAllInfos()`);
    document.getElementById('desktopCreateTask').classList.add("create-hover");
}


/**
 * This function pushes the created task into the database.
 * Starts the upload on the remote server and redirects the user to the summary page.
 */
async function saveDatabase() {
    document.getElementById('addetToBoard').classList.add('addet-to-board-position-animate')
    database.tasks.push(task);
    await setItem('database', database);
    setTimeout(() => {
        window.location.replace('board.html')
    }, 1500)
}


/**
 * This function clears all input fields and selected fields.
 */
function clearAllFields() {
    document.getElementById('tileInput').value = '';
    document.getElementById('descriptionInput').value = '';
    clearCreateCategory();
    clearContacts();
    document.getElementById('date').value = '';
    resetPrioButtom();
    resetSubTasks();
    resetWarnings();
}


/**
 * This function clears the selected field.
 */
function clearCreateCategory() {
    document.getElementById('chosenCategory').innerHTML = `Select task category`
    selectedCategory = category;
    let classStatus = document.getElementById('category').classList
    if (classStatus.contains('dropdown-category-open')) {
        pullDownMenu('category', 'assingedTo', 'moreCategorys', 'moreContacts');
    }
}


/**
 * This function deletes all subtasks.
 */
function resetSubTasks() {
    document.getElementById('subTaskReport').classList.add('d-none');
    subtasks = [];
    subtaskStatus = [];
    renderSubtasks();
}


/**
 * This function opens the add contact form.
 */
function openAddContact() {
    openNewContactForm();
    clearContacts();
    renderContactsAfterCreate();

}


/**
 * This function renders the contacts after creating a new contact.
 */
function renderContactsAfterCreate() {
    document.getElementById("create-contact").addEventListener("click", function () {
        setTimeout(clearContacts, 300);
    });
}


/**
 * This function clears the warnings.
 */
function resetWarnings() {
    document.getElementById('titleReport').classList.add('d-none');
    document.getElementById('descriptionReport').classList.add('d-none');
    document.getElementById('categoryReport').classList.add('d-none');
    document.getElementById('dateReport').classList.add('d-none');
    document.getElementById('prioReport').classList.add('d-none');
}