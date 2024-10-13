let firstLetters = [];
//let contacts = [];

/**
 * This onload-function starts the most important functions.
 */
async function initContact() {
    await init();
    contacts = database.contacts;
    users = database.users;
    loadContacts();
}


/**
 * This function gets the first letter of a name and puts it in alphabetical order.
 */
function loadContacts() {
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        let firstLetter = contact['firstname'].charAt(0).toLowerCase();
        if (!firstLetters.includes(firstLetter)) {
            firstLetters.push(firstLetter);
        }
    }
    firstLetters.sort();
    let contactList = document.getElementById('contact-list');
    contactList.innerHTML = '';
    renderContactList(firstLetters);
}


/**
 * This function renders the capital letter as alphabetical category of the contact list
 * @param {string} firstLetters - The first letter of contact['firstname'].
 */
function renderContactList(firstLetters) {
    for (let i = 0; i < firstLetters.length; i++) {
        const firstLetter = firstLetters[i];
        let contactList = document.getElementById('contact-list');
        contactList.innerHTML += templateContactFirstLetters(firstLetter);
        renderFirstLetter(firstLetter);
    }
}


/**
 * Uses the first letter, then creates a small user entry in the contact list
 * @param {string} firstLetter - The first letter of contact['firstname'].
 */
function renderFirstLetter(firstLetter) {
    for (let i = 0; i < contacts.length; i++) {
        const userData = contacts[i];
        let contactFirstLetter = userData['firstname'].charAt(0).toLowerCase();
        if (contactFirstLetter === firstLetter) {
            let contactList = document.getElementById('contact-list');
            contactList.innerHTML += templateContactList(userData, i);
        }
    }
}


/**
 * This function changes the color of a user in the contact list when clicked on.
 */
function removeContactColor() {
    let elem = document.querySelectorAll(".contact-list-box");
    for (let j = 0; j < elem.length; j++) {
        elem[j].classList.remove('change-background-color');
    }
}


/**
 * This function shows the contact details of a selected user
 * @param {number} i  - index of the database.contacts array
 */
function openContactDetails(i) {
    removeContactColor();
    document.getElementById(`userSmall-${i}`).classList.add('change-background-color');
    let showDetails = document.getElementById('selectedContact');
    showDetails.innerHTML = '';
    showDetails.innerHTML = templateContactDetails(i);
    changeMobileView();
}


/**
 * This function opens the overlay selected user information when a screen is max 900px wide.
 */
function changeMobileView() {
    if (window.matchMedia('screen and (max-width: 900px)').matches) {
        document.getElementById('contacts-container').classList.add('show-contact-selection-overlay');
    }
}


/**
 * This function closes overlay selected user information.
 */
function closeMobileVersion() {
    document.getElementById('contacts-container').classList.remove('show-contact-selection-overlay');
}


/**
 * This function opens the add new contact overlay form.
 */
function openNewContactForm() {
    let newContact = document.getElementById('overlaySection');
    newContact.innerHTML = '';
    newContact.innerHTML = templateAddContactOverlay();
    setTimeout(() => {
        document.getElementById('contactOverlayBoxAdd').classList.add('contact-overlay-box-animate');
    }, 10)
}


/**
 * This function checks if all input fields are filled in.
 * @returns false to show that the form is not valid.
 */
function validateForm() {
    let name = document.getElementById("newContactName").value;
    let email = document.getElementById("newContactEmail").value;
    let phone = document.getElementById("newContactPhone").value;

    if (name == "") {
        alert("Bitte geben Sie einen Namen ein.");
        return false;
    }

    if (email == "") {
        alert("Bitte geben Sie eine E-Mail-Adresse ein.");
        return false;
    }

    if (phone == "") {
        alert("Bitte geben Sie eine Telefonnummer ein.");
        return false;
    }

    return true;
}


/**
 * This function adds a new contact to contacts object and saves it in the remote storage.
 */
async function addContact() {
    let name = document.getElementById('newContactName').value;
    let email = document.getElementById('newContactEmail').value;
    let phone = document.getElementById('newContactPhone').value;
    let initialColor = getRandomRGBColor();
    let fullName = name.split(' ');
    let firstName = fullName[0].charAt(0).toUpperCase() + fullName[0].slice(1);
    let lastName = '';
    if (fullName[1]) {
        lastName = fullName[1].charAt(0).toUpperCase() + fullName[1].slice(1);
    }
    contacts.push({
        "firstname": `${firstName}`,
        "lastname": `${lastName}`,
        "email": `${email}`,
        "phone": `${phone}`,
        "color": `${initialColor}`
    })

    try {
        await setItem('database', JSON.stringify(database));
    } catch (e) {
        console.error('Loading error:', e);
    }

    resetForm(name, email, phone);
    disableButton();
    userCreatedSuccess();
    closeContactOverlay();
    if (window.location.pathname == '/contacts.html') {
        loadContacts();
    }
}


/**
 * This function empties the input fields of the add contact form.
 * @param {string} name 
 * @param {string} email 
 * @param {number} phone 
 */
function resetForm(name, email, phone) {
    name.value = '';
    email.value = '';
    phone.value = '';
}


/**
 * This function disables the hover effect and the onclick on the add new contact button.
 */
function disableButton() {
    //document.getElementById('addUser').removeAttribute("onclick");
    document.getElementById('create-contact').removeAttribute("onclick");
    if (window.location.pathname == '/contacts.html') {
        document.getElementById('user-contact-button').classList.remove("button-hover:hover");
    }
}


/**
 * This function creates random colors.
 * @returns random rgb numbers.
 */
function getRandomRGBColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}


/**
 * This function creates the popup window after a new contact was created successfully.
 */
function userCreatedSuccess() {
    const popup = document.createElement('div');
    popup.classList.add('popup-contact-created');
    popup.innerHTML = `<p>Contact successfully created</p>`;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.remove();
    }, 2000);
}


/**
 * This function deletes a selected contact and saves the new status in the remote storage
 * @param {number} i - index of the database.contacts array
 */
async function deleteContact(i) {
    let toDelete = contacts[i]
    deleteContatctsFromTask(toDelete);
    contacts.splice(i, 1);
    try {
        await setItem('database', JSON.stringify(database));
    } catch (e) {
        console.error('Loading error:', e);
    }
    if (document.getElementById("contactOverlayBoxEdit")) {
        closeOverlayEdit();
    }
    await initContact();
    updateContactSelection();
}


/**
 * This function closes the add new contact form.
 */
function closeContactOverlay() {
    document.getElementById('contactOverlayBoxAdd').classList.remove('contact-overlay-box-animate');
    setTimeout(() => {
        document.getElementById('overlaySection').innerHTML = '';
    }, 300)
}


/**
 * This function opens the edit contact form
 * @param {number} i - index of the database.contacts array 
 */
function editContact(i) {
    let editDetails = contacts[i];
    document.getElementById('editContact').innerHTML = templateContactOverlayEdit(i, editDetails);
    setTimeout(() => {
        document.getElementById('contactOverlayBoxEdit').classList.add('contact-overlay-box-animate');
    }, 20)
}


/**
 * This functions shows and saves the edited user information 
 * @param {number} i - index of the database.contacts array
 */
async function saveEditedUser(i) {
    let name = document.getElementById('editName').value;
    let fullName = name.split(' ');
    let firstName = fullName[0];
    let lastName = fullName[1];
    contacts[i]['firstname'] = firstName;
    contacts[i]['lastname'] = lastName;
    contacts[i]['email'] = document.getElementById('editEmail').value;
    contacts[i]['phone'] = document.getElementById('editPhone').value;

    try {
        await setItem('database', JSON.stringify(database));
    } catch (e) {
        console.error('Loading error:', e);
    }

    closeOverlayEdit();
    openContactDetails(i);
    loadContacts();
}


/**
 * This function closes the edit contact form.
 */
function closeOverlayEdit() {
    document.getElementById('contactOverlayBoxEdit').classList.remove('contact-overlay-box-animate');
    setTimeout(() => {
        document.getElementById('editContact').innerHTML = '';
    }, 350)
}


/**
 * This function updates the contact list after a contact was deleted.
 */
function updateContactSelection() {
    let selectedContact = document.getElementById('selectedContact');
    selectedContact.innerHTML = '';
    loadContacts();
}



/**
 * This function deletes a user contact from a task and from the database
 * @param {string} contactToDelete - the contact to be deleted
 */

function deleteContatctsFromTask(contactToDelete) {
    let toDelete = contactToDelete.firstname + ' ' + contactToDelete.lastname;
    database.tasks.forEach(task => {
        const assignedIndex = task.assigned_to.indexOf(toDelete);
        if (assignedIndex !== -1) {
            task.assigned_to.splice(assignedIndex, 1);
        }
    });
}