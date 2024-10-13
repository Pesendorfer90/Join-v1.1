let collectedContact = [];
let taskContactList = [];
let contactPosition;
let initials = [];
let selectedCategory;
let prio;
let subtasks = [];
let subtaskStatus = [];
let contacts = [];
let categories = [];
let category = [];
let tasks = [];
let task = {
    "title": "",
    "description": "",
    "category": "",
    "assigned_to": [],
    "due_date": "",
    "prio": "",
    "subtasks": {
        "name": [],
        "status": []
    },
    "progress": "todo"
};
let newCategory;
let colorForNewCategory;
let colorForNewCategoryID;
let required = '';
let initialsRenderd = false;


/**
 * This function starts all important functions at onload.
 */
async function initTask() {
    await init();
    tasks = database.tasks;
    contacts = database.contacts;
    categories = database.categories;
    renderCategorys();
    renderContacts();
    datePicker();
    renderloggedInUserinContactList();
    startEventListener()
}

/**
 * This function starts all eventListener.
 */
function startEventListener() {
    subtaskEventListener();
    clickOutsideDropdownMenu();
}


/**
 * This function renders the actual user in 'Assigned to'.
 */
function renderloggedInUserinContactList() {
    document.getElementById('loggedInUserAddTask').innerHTML = `
    <div class="dd-placeholder gray-hover" onclick="selectedForTask(contacts[${searchContactwithEmail()}], 'contacts[${searchContactwithEmail()}]')">
        <div>You</div>
        <div class="task-select-box center">
            <div id="contacts[${searchContactwithEmail()}]"></div>
        </div>
    </div>
`
}


/**
 * This function searches for a user with the email address.
 * @returns - Index number
 */
function searchContactwithEmail() {
    for (let i = 0; i < database.contacts.length; i++) {
        let contact = database.contacts[i];
        if (currentEmail == contact.email) {
            return contacts.indexOf(contact);
        }
    }
}


/**
 * This function is used to change the height of a div and display its contents
 * if the height of a div was previously changed and you click on another,
 * the previous div is reduced again and the content is hidden. 
 * The height of the clicked div is increased and the content is displayed
 * 
 * @param {string} clicked - This is the id where a classlist should be changed
 * @param {string} notClicked - This is the id where a classlist should be changed
 * @param {string} visible - This is the id where the classlist "d-none" will removed
 * @param {string} notVisible - This is the id where the classlist "d-none" will added
 */
function pullDownMenu(clicked, notClicked, visible, notVisible) {
    let openMenu = document.getElementById(clicked).classList;
    if (openMenu == 'dropdown-category-closed') {
        openDropDownMenu(clicked, notClicked, visible, notVisible);
    } else {
        closeDropDownMenu(clicked, visible, notVisible);
    } if (clicked == 'assingedTo') {
        switchContactIcons();
        renderInitials();
        initialsRenderd = false;
    }
}


/**
 * This function adds and removes CSS classes
 */
function openDropDownMenu(clicked, notClicked, visible, notVisible) {
    document.getElementById(clicked).classList.add('dropdown-category-open');
    document.getElementById(notClicked).classList.remove('dropdown-category-open');
    document.getElementById(visible).classList.remove('d-none');
    document.getElementById(notVisible).classList.add('d-none');
    document.getElementById('initialsContainer').classList.add('d-none');
}


/**
 * This function adds and removes CSS classes
 */
function closeDropDownMenu(clicked, visible, notVisible) {
    document.getElementById(clicked).classList.remove('dropdown-category-open');
    document.getElementById(visible).classList.add('d-none');
    document.getElementById(notVisible).classList.add('d-none');
    document.getElementById('initialsContainer').classList.remove('d-none');
}


/**
 * This function checks whether you have clicked.
 */
function clickOutsideDropdownMenu() {
    document.addEventListener('click', closeMenuIfClickedOutside);
}


function closeMenuIfClickedOutside(event) {
    const categoryMenu = document.getElementById('category');
    const assignedToMenu = document.getElementById('assingedTo');

    if (!categoryMenu.contains(event.target) &&
        categoryMenu.classList.contains('dropdown-category-open')) {
        pullDownMenu('category', 'assingedTo', 'moreCategorys', 'moreContacts')
    }

    if (!assignedToMenu.contains(event.target) &&
        assignedToMenu.classList.contains('dropdown-category-open')) {
        pullDownMenu('assingedTo', 'category', 'moreContacts', 'moreCategorys');
        initialsRenderd = true;
        switchContactIcons();
        setTimeout(() => {
            initialsRenderd = false;
        }, 20)
    }
}


/**
 * This function shows a datepicker.
 * Source: https://github.com/qodesmith/datepicker
 */
function datePicker() {
    const picker = datepicker('#date', {
        startDay: 1,
        formatter: (input, date, instance) => {
            const dateObject = new Date(date);
            const year = dateObject.getFullYear();
            const month = String(dateObject.getMonth() + 1).padStart(2, '0');
            const day = String(dateObject.getDate()).padStart(2, '0');
            const isoDate = `${year}-${month}-${day}`;
            input.value = isoDate;
        }
    })
}


/**
 * This function renders the list of categories.
 */
function renderCategorys() {
    categoryContainer = document.getElementById('loadedCategorys');
    categoryContainer.innerHTML = '';
    for (let i = 0; i < categories.length; i++) {
        let category = categories[i].name;
        let categoryColor = categories[i].color;
        categoryContainer.innerHTML += `
        <div class="dd-placeholder gray-hover" onclick="selectCategory('${category}', '${categoryColor}')">
            <div class="center">
                <div class="padding-17-right">${category}</div>
                <div class="task-category-color" style="background-color: ${categoryColor}"></div>
            </div>
        </div>`;
    }
}


/**
 * This function renders the list of contacts.
 */
function renderContacts() {
    contactContainer = document.getElementById('loadedContacts');
    contactContainer.innerHTML = '';
    for (let i = 0; i < contacts.length;) {
        if (contacts[i].email == currentEmail) {
            i++
        } else {
            contactContainer.innerHTML += `
            <div class="dd-placeholder gray-hover" onclick="selectedForTask(contacts[${i}], 'contacts[${i}]')">
                <div>${contacts[i].firstname} ${contacts[i].lastname}</div>
                <div class="task-select-box center">
                    <div id="contacts[${i}]"></div>
                </div>
            </div>`;
            i++
        }
    }
}


/**
 * In this function, the selected category is rendered using the 2 strings and the drop down menu is closed.
 * @param {string} category - Category that was selected.
 * @param {string} categoryColor - Category color in rgb.
 */
function selectCategory(category, categoryColor) {
    document.getElementById('chosenCategory').innerHTML = `
            <div class="center">
                <div class="padding-17-right">${category}</div>
                <div class="task-category-color" style="background-color: ${categoryColor};"></div>
            </div>`
    selectedCategory = category;
    let classStatus = document.getElementById('category').classList
    if (classStatus.contains('dropdown-category-open')) {
        pullDownMenu('category', 'assingedTo', 'moreCategorys', 'moreContacts');
    }
}


/**
 * In this function contacts are pushed into an array.
 * If the contact was already selected and is in the array, it will be deleted from the array.
 * @param {Object} selected - The complete contact information.
 * @param {string} id - ID of the contact's select box.
 */
function selectedForTask(selected, id) {
    if (taskContactList.includes(selected) == false) {
        taskContactList.push(selected);
        addSelectedPoint(id);
        switchContactIcons(selected);
    } else {
        removeContactsForSubTask(selected);
        removeSelectedPoint(id);
        switchContactIcons();
    }
}


/**
 * This function removes a contact form the array.
 * @param {object} selected - Contact to remove.
 */
function removeContactsForSubTask(selected) {
    let index = taskContactList.indexOf(selected);
    taskContactList.splice(index, 1);
}


/**
 * This function add a CSS property.
 * @param {string} id - ID of the contact's select box.
 */
function addSelectedPoint(id) {
    document.getElementById(id).classList.add('selection-point');
}


/**
 * This function remove a CSS property
 * @param {string} id - ID of the contact's select box.
 */
function removeSelectedPoint(id) {
    document.getElementById(id).classList.remove('selection-point');
}


/**
 * This function creates initials from the first and last name.
 */
function createInitials() {
    initials = [];
    taskContactList.forEach(currentContact => {
        let initial = getFirstLetters(currentContact);
        initials.push(initial);
    });
}


/**
 * This function adds and/or removes css classes to create a drop down menu.
 */
function switchContactIcons() {
    if (taskContactList.length == false || initialsRenderd == true) {
        document.getElementById('clearAddButtons').classList.add('d-none');
        document.getElementById('ddArrow').classList.remove('d-none');
        setTimeout(setAttribute, 200)
    } else {
        document.getElementById('clearAddButtons').classList.remove('d-none');
        document.getElementById('ddArrow').classList.add('d-none');
        document.getElementById('contactsToAssingContainer').removeAttribute("onclick");
    }
}


/**
 * This function adds an onclick.
 */
function setAttribute() {
    document.getElementById('contactsToAssingContainer').setAttribute("onclick", "pullDownMenu('assingedTo', 'category', 'moreContacts', 'moreCategorys')");
}


/**
 * This function creates initials from the first and last name.
 * @param {Object} contact - The complete contact information.
 * @returns - The first letter of the first and last name.
 */
function getFirstLetters(contact) {
    let firstLetters = contact.firstname.charAt(0) + contact.lastname.charAt(0);;
    return firstLetters;
}


/**
 * This function removes all selected contacts, initials,
 * closes the drop down menu and re-renders the contacts.
 */
function clearContacts() {
    let classStatus = document.getElementById('assingedTo').classList
    if (classStatus.contains('dropdown-category-open')) {
        pullDownMenu('assingedTo', 'category', 'moreContacts', 'moreCategorys');
    }
    collectedContact = [];
    taskContactList = [];
    initials = [];
    switchContactIcons();
    renderContacts();
    renderloggedInUserinContactList();
    renderInitials();
}


/**
 * This function starts the function to create and render the initials,
 * closes the drop down menu and changes the icons.
 */
function addContacts() {
    initialsRenderd = true;
    createInitials();
    switchContactIcons();
    renderInitials();
    pullDownMenu('assingedTo', 'category', 'moreContacts', 'moreCategorys');
}


/**
 * This function renders the initials.
 */
function renderInitials() {
    initialsContainer = document.getElementById('initialsContainer');
    initialsContainer.innerHTML = '';
    if (taskContactList.length > 0) {
        for (let i = 0; i < initials.length; i++) {
            initialsContainer.innerHTML += `
            <div class="task-initials" style="background-color: ${contactColor(i)}" id="contactInitials${[i]}">${initials[i]}</div>`
        }
    }
}



/**
 * This function returns the color of the contact.
 * @param {number} i - Array position of the contact.
 * @returns  - The color of the contact (rgb).
 */
function contactColor(i) {
    return taskContactList[i].color
}


/**
 *  
This function sets the background color for the respective button and sets the priority of the task.
 * @param {string} clicked - The ID of the clicked button.
 * @param {string} img - The ID of the Image from the clicked button.
 */
function priority(clicked, img) {
    resetPrioButtom();
    element = document.getElementById(clicked);
    if (clicked == 'prioHigh') {
        element.style.backgroundColor = 'rgb(236, 85, 32)';
        element.style.fontWeight = '700';
        element.style.color = 'white'
        changeColor(img);
        prio = 'high';
    } if (clicked == 'prioMedium') {
        element.style.backgroundColor = 'rgb(243, 173, 50)';
        element.style.fontWeight = '700';
        element.style.color = 'white'
        changeColor(img);
        prio = 'medium';
    } if (clicked == 'prioLow') {
        element.style.backgroundColor = 'rgb(147, 222, 70)';
        element.style.fontWeight = '700';
        element.style.color = 'white'
        changeColor(img);
        prio = 'low';
    }
}


/**
 * This function resets the CSS classes and the images to default.
 * @param {string} notClicked - The ID of the button that was not clicked.
 * @param {string} alsoNotClicked - The ID of the button that was not clicked.
 */
function resetPrioButtom() {
    document.getElementById('prioHigh').style = ``;
    document.getElementById('prioMedium').style = ``;
    document.getElementById('prioLow').style = ``;
    document.getElementById('prioHighImg').src = `assets/img/prio_high.svg`;
    document.getElementById('prioMediumImg').src = `assets/img/prio_medium.svg`;
    document.getElementById('prioLowImg').src = `assets/img/prio_low.svg`;
}


/**
 * This function changes the path of the image.
 * @param {string} img - ID of the IMG.
 */
function changeColor(img) {
    imgPath = document.getElementById(img)
    if (img == 'prioHighImg') {
        imgPath.src = `assets/img/prio_high_white.svg`
    } if (img == 'prioMediumImg') {
        imgPath.src = `assets/img/prio_medium_white.svg`
    } if (img == 'prioLowImg') {
        imgPath.src = `assets/img/prio_low_white.svg`
    }
}


/**
 * This function create a subtask. It pushes the input value and status into an array.
 * Renders the subtask and changes the icons.
 */
function addSubtask() {
    let subtaskInput = document.getElementById('subtaskInput').value;
    if (containsBrackets(subtaskInput)) {
        document.getElementById('subTaskReport').classList.remove('d-none');
        document.getElementById('subTaskReport').innerHTML = 'The following characters are not allowed { } [ ] "'
    } else if (subtaskInput == '') {
        document.getElementById('subTaskReport').classList.remove('d-none');
        document.getElementById('subTaskReport').innerHTML = 'Empty subtasks are not allowed'
    } else {
        document.getElementById('subTaskReport').classList.add('d-none');
        subtasks.push(subtaskInput);
        subtaskStatus.push('false');
        renderSubtasks();
        switchSubtaskIcons();
    }
}


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