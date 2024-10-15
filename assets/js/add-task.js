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


/**
 * Closes dropdown menus if a click occurs outside the specified menu elements.
 *
 * @param {Event} event - The click event that triggers the function.
 *
 * The function checks if the click occurred outside of the 'category' and 'assignedTo' menus.
 * If a menu is open (indicated by the 'dropdown-category-open' class) and the click happened outside of it,
 * the menu will be closed by calling `pullDownMenu`. Additional actions are performed for the 'assignedTo' menu.
 */
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