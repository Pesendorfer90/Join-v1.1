/**
 * @param {string} firstLetter 
 * @returns renders the HTML content of the alphabetical category of the contact list
 */
function templateContactFirstLetters(firstLetter) {
    return /*html*/`
        <div class="contact-letter" id="contact-index">${firstLetter.toUpperCase()}</div>
    `;
}


/**
 * @param {object} userData - all contact data
 * @param {number} i - index of the database.contacts array
 * @returns renders the HTML code of the overview user data in the contact list 
 */
function templateContactList(userData, i) {
    return /*html*/`
        <div class="contact-list-box" id="userSmall-${i}" onclick="openContactDetails(${i})">
                <div style="background-color:${userData['color']}"  class="contact-initialen-small" id="listIcon"> ${userData['firstname'].charAt(0).toUpperCase()}${userData['lastname'].charAt(0).toUpperCase()} </div>
            <div class="contact-text">
                <div class="contact-list-name">${userData['firstname']} ${userData['lastname']}</div>
                <div class="contact-list-email">${userData['email']}</div>
            </div>
        </div>
    `;
}


/**
 * @param {number} i - index of the database.contacts array
 * @returns the HTML code of the selected user details
 */
function templateContactDetails(i) {
    let userDetails = contacts[i];
    return /*html*/`
<div class="contact-card">
    <div class="contact-card-container">
        <div class="contact-user-initiale" style="background-color:${userDetails['color']}">
            ${userDetails['firstname'].charAt(0).toUpperCase()}${userDetails['lastname'].charAt(0).toUpperCase()} </div>
        <div>
            <div class="contact-member">${userDetails['firstname']} ${userDetails['lastname']}</div>
            <div class="editorial">
                <div class="contact-edit" id="contact-edit" onclick="editContact(${i})">
                    <div><img src="assets/img/contact_edit_new.png" alt="" class="contact-edit-pen">Edit</div>
                </div>
                <div class="contact-edit" id="contact-trash" onclick="deleteContact(${i})">
                    <img class="delete-icon" id="delete-icon" src="assets/img/contacts_trash.png" alt="">Delete
                </div>
            </div>
        </div>
    </div>
</div>
<div>
    <div class="contact-info">Contact information</div>
    <div class="info-mail">Email </div>
    <div class="info-mail-adress">${userDetails['email']}</div>
    <div class="info-phone">Phone</div>
    <div> ${userDetails['phone']}</div>
</div>
<div class="contact-info-buttons" id="contact-info-buttons">
    <img class="trash-icon" id="trash-icon" src="assets/img/contact_delete_button.png" alt=""
        onclick="deleteContact(${i})">
    <img class="edit-contact-icon" id="edit-contact-icon" onclick="editContact(${i})"
        src="assets/img/contact_edit_small.png" alt="">
</div>`
}







/**
 * renders the HTML code of the add new contact overlay form
 */
function templateAddContactOverlay() {
    return /*html*/ `
<div class="contact-overlay-container">
    <div class="contact-overlay-box" id="contactOverlayBoxAdd">
        <div class="contact-overlay-container-section">
            <div class="contact-overlay-section">
                <div onclick="closeContactOverlay()" class="close-form-mobile">
                    <img src="assets/img/contact_close_mobile.png" alt="">
                </div>
                <div class="overlay-text-container">
                    <img class="contact-overlay-logo" src="assets/img/join_small.png" alt="">
                    <div class="contact-overlay-headline">Add contact</div>
                    <div class="contact-overlay-subheadline">Tasks are better with a team</div>
                    <div class="contact-overlay-divider"></div>
                </div>
            </div>
            <div class="contact-overlay-form-section">
                <div onclick="closeContactOverlay()" class="close-form"><img src="assets/img/contact_close_form.png"
                        alt=""></div>
                <div class="contact-overlay-form-box">
                    <div class="contact-overlay-icon-box"><img class="contact-overlay-icon"
                            src="assets/img/contact_user_white.png" alt=""></div>
                    <form class="contact-form-container" >
                        <input id="newContactName" required type="text" placeholder="Name"
                            style="color: rgb(0,0,0)"  class="contact-overlay-name" >
                        <input id="newContactEmail" required type="email" placeholder="Email"
                            style="color: rgb(0,0,0)"  class="contact-overlay-email">
                        <input id="newContactPhone" required type="tel" placeholder="Phone"
                            style="color: rgb(0,0,0)"  class="contact-overlay-phone">
                    </form>
                </div>
                <div class="contact-overlay-buttons">
                    <button class="contact-cancel-button" onclick="closeContactOverlay()">
                        <div>Cancel</div>
                        <img src="assets/img/contact_form_cancel.png" alt="">
                    </button>
                   <button onclick="if (validateForm()) { addContact(); }" class="contact-create-button" id="create-contact">
                        <div>Create contact</div>
                        <img src="assets/img/contact_form_check.png" alt="">
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>`;
}


/**
 * 
 * @param {number} i - index of the database.contacts array
 * @param {object} editDetails - shows the selected user details for editing
 * @returns the HMTL code of the edit contact form
 */
function templateContactOverlayEdit(i, editDetails) {
    return /*html*/ `
<div class="contact-overlay-container">
    <div class="contact-overlay-box" id="contactOverlayBoxEdit">
        <div class="contact-overlay-container-section">
            <div class="contact-overlay-section">
                <div onclick="closeOverlayEdit()" class="close-form-mobile"><img
                        src="assets/img/contact_close_mobile.png" alt=""></div>
                <div class="overlay-text-container">
                    <img class="contact-overlay-logo" src="assets/img/join_small.png" alt="">
                    <div class="contact-overlay-headline">Edit contact</div>
                    <div class="contact-overlay-divider"></div>
                </div>
            </div>
            <div class="contact-overlay-form-section">
                <div onclick="closeOverlayEdit()" class="close-form"><img src="assets/img/contact_close_form.png"
                        alt=""></div>
                <div class="contact-overlay-form-box">
                    <div class="contact-initialen" style="background-color:${editDetails['color']}">
                        ${editDetails['firstname'].charAt(0).toUpperCase()}${editDetails['lastname'].charAt(0).toUpperCase()}
                    </div>
                    <form class="contact-form-container">
                        <input class="contact-overlay-name" required type="text" id="editName" style="color: rgb(0,0,0)"
                            value="${editDetails['firstname']} ${editDetails['lastname']}">
                        <input class="contact-overlay-email" required type="email" id="editEmail"
                            style="color: rgb(0,0,0)" value="${editDetails['email']}">
                        <input class="contact-overlay-phone" required type="tel" id="editPhone"
                            style="color: rgb(0,0,0)" value="${editDetails['phone']}">
                    </form>
                </div>
                <div class="contact-overlay-buttons">
                    <button class="contact-delete-button" onclick="deleteContact(${i})">
                        <div>Delete</div>
                    </button>
                    <button onclick="saveEditedUser(${i})" class="contact-save-button">
                        <div>Save</div>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
    `;
}

