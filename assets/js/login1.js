// Global variables

let tickCount = 0;
let changePasswordEmail;
let currentPassword;
let rememberMe = false;

//Init functions

/**
 * This function will initialize the page
 */
function initLogin() {
    getData();
    getDataLocalStorage();
    checkForChangePassword();
}


/**
 * This function will get the data from the backend
 */
async function getData() {
    await getItem('database');
    users = database['users'];
}


/**
 * This function is used to get the data from the local storage
 */
function getDataLocalStorage() {
    let localStorageData = getItemLocalStorage('loggedInUser');
    if (localStorageData) {
        currentEmail = localStorageData['email'];
        currentPassword = localStorageData['password'];
        currentRememberMe = localStorageData['remember'];
        if (currentRememberMe == true) {
            fillInData()
        }
    }
}


/**
 * This function will check if there is a request for a password change
 */
function checkForChangePassword() {
    // URL-Parameter auslesen
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);

    changePasswordEmail = urlParams.get('email');
    if (changePasswordEmail === null) { //Checks if there is a variable in the link
        waitForAnimation();
    }
    else {
        openResetPw();
    }
}



//HTML functions

/**
 * This function will open the window to register a user
 */
function openRegister() {
    document.getElementById('signUp').classList.add('d-none');
    document.getElementById('loginContainer').classList.add('d-none');
    document.getElementById('resetPwContainer').classList.add('d-none');
    document.getElementById('signUpContainer').classList.remove('d-none');
}


/**
 * This function will open the window to login
 */
function openLogin() {
    document.getElementById('signUp').classList.remove('d-none');
    document.getElementById('loginContainer').classList.remove('d-none');
    document.getElementById('signUpContainer').classList.add('d-none');
    document.getElementById('resetPwContainer').classList.add('d-none');
    document.getElementById('forgotPwContainer').classList.add('d-none');
}


/**
 * This function will open the window to request a passwort change
 */
function openForgotPw() {
    document.getElementById('signUp').classList.add('d-none');
    document.getElementById('loginContainer').classList.add('d-none');
    document.getElementById('resetPwContainer').classList.add('d-none');
    document.getElementById('forgotPwContainer').classList.remove('d-none');
    document.getElementById('signUpContainer').classList.add('d-none');
}


/**
 * This function will open the window to change the password
 */
function openResetPw() {
    document.getElementById('signUp').classList.add('d-none');
    document.getElementById('loginContainer').classList.add('d-none');
    document.getElementById('resetPwContainer').classList.remove('d-none');
    document.getElementById('forgotPwContainer').classList.add('d-none');
    document.getElementById('signUpContainer').classList.add('d-none');
}


/**
 * This function waits till the animation is done and shows then the login windows
 */
function waitForAnimation() {
    if (checkScreenSize()) {
        // Der Code für den Fall, dass die Bildschirmbreite kleiner oder gleich 900px ist
        document.getElementById('mobileStartScreen').classList.remove('d-none');
        document.getElementById('loginContainer').classList.add('d-none');
        document.getElementById('signUp').classList.add('d-none');
        setTimeout(() => { document.getElementById('mobileStartScreen').classList.add('d-none'); document.getElementById('joinPic').style = 'display: block'; }, 300);
        setTimeout(() => { document.getElementById('loginContainer').classList.remove('d-none'); document.getElementById('signUp').classList.remove('d-none'); }, 1300);
    }
    else {
        // Der Code für den Fall, dass die Bildschirmbreite größer als 900px ist
        setTimeout(() => { document.getElementById('loginContainer').classList.remove('d-none'); document.getElementById('signUp').classList.remove('d-none'); }, 1000);
    }
}


/**
 * Will start the animation that the email was sent
 */
function emailSentAnimation() {
    document.getElementById('emailSent').classList.remove('d-none');
    setTimeout(() => { document.getElementById('emailSent').classList.add('d-none'); }, 1000); // Lets the EmailSent-Container vanish after 3 seconds
}

//Login functions

/**
 * This function will log in the user
 * 
 * @param {string} email This is the email from the user which wants to login
 * @param {string} username This is the username of the user which wants to login
 */
function login(email, username) {
    let password = document.getElementById('password').value

    let localStorageData = { email: email, username: username, remember: rememberMe, password: password };

    setItemLocalStorage('loggedInUser', localStorageData);

    // Zur neuen URL weiterleiten
    window.location.href = 'summary.html';
}


/**
 * This function will login the user as a guest
 */
function guestLogin() {
    let email = 'guest@mail.com';
    let username = 'Guest';
    login(email, username);
}


/**
 * This function will check if the email or the password is correct
 * 
 * @returns The function will stop logged in succesfully
 */
function checkLogin() {
    let emailLogIn = document.getElementById('email').value;
    let passwordLogIn = document.getElementById('password').value;

    for (let i = 0; i < users.length; i++) {
        if (emailLogIn == users[i]['email'] && passwordLogIn == users[i]['password']) {
            let email = users[i]['email'];
            let username = users[i]['username'];
            login(email, username);
            return;
        }
    }
    document.getElementById('wrongPassword').style = 'color: red';
    document.getElementById('passwordContainer').style = 'border: 1px solid red';
}


/**
 * This function will save the value in the local storage for the log in
 * 
 * @param {string} key This is the key for the local storage
 * @param {string} value This is the value for the local storage
 */
function setItemLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

//Sign up functions

/**
 * This function will push the data in the database
 * 
 * @param {string} account This is the data of the account which will be pushed
 * @param {string} contact This is the data of the contact which will be pushed
 */
function signUpUser(account, contact) {
    database['users'].push(account);
    database['contacts'].push(contact);
    setItem('database', database);
    alert("Account has been created");
    clearSignUpInput();
}


/**
 * This function will set up the data to be pushed
 * 
 * @returns If the user already exists, the function will be stopped at that point
 */
function accountData() {
    let usernameSignUp = document.getElementById('username').value;
    let emailSignUp = document.getElementById('signUpEmail').value;
    let passwordSignUp = document.getElementById('signUpPassword').value;

    if (checkIfUserExists(usernameSignUp, emailSignUp) == false) {
        return
    }

    let account = {
        "username": usernameSignUp,
        "email": emailSignUp,
        "password": passwordSignUp
    }

    let contact = {
        "firstname": usernameSignUp,
        "lastname": "",
        "email": emailSignUp,
        "phone": "",
        "color": generateRandomColor()
    }

    signUpUser(account, contact);
}


/**
 * This function will check if the username or the email is already in use
 * 
 * @param {string} usernameSignUp This is the username to sign up
 * @param {string} emailSignUp This is the email to sign up
 * @returns It returns "false" if the email or the username already exists and "true" if they doesn´t exists
 */
function checkIfUserExists(usernameSignUp, emailSignUp) {
    for (let i = 0; i < users.length; i++) {
        if (usernameSignUp == users[i]['username']) {
            alert("Username is already taken");
            return false
        };
        if (emailSignUp == users[i]['email']) {
            alert("Email is already in use");
            return false
        };
    };

    return true;
}


/**
 * This function will clear the input fields in the sign up user
 */
function clearSignUpInput() {
    document.getElementById('username').value = '';
    document.getElementById('signUpEmail').value = '';
    document.getElementById('signUpPassword').value = '';
}

// Reset password functions

/**
 * This function checks if the email exists. If the Email exist it will start other functions to send the mail to reset the password
 * 
 * @returns the function will stop if the email does not exist
 */
function emailSent() {
    let forgotPwEmail = document.getElementById('forgotPwEmail').value; // Email from the inputfield to reset the password

    if (getUsername(forgotPwEmail) == false) { // Checks if the email exists
        alert("Email does not exist");
        return;
    }

    sentMailToPhp(forgotPwEmail);
    activatePhp();
    emailSentAnimation();
}


/**
 * This function is used to get the username through the email
 * 
 * @param {string} forgotPwEmail This is the email from where we get the username
 * @returns The username will be returned, if the email does not exists it will return "false"
 */
function getUsername(forgotPwEmail) {
    for (let i = 0; i < users.length; i++) {
        if (users[i]['email'] == forgotPwEmail) {
            return users[i]['username'];
        }
    }
    return false;
}


/**
 * This function will set link which includes the email to reset the password
 * 
 * @param {string} forgotPwEmail The Email from which the password should be changed
 * @returns It returns the Link which includes the email to reset the password
 */
function getForgotPwLink(forgotPwEmail) {
    let url = 'https://gruppe-596.developerakademie.net/join/login.html?email=' + encodeURIComponent(forgotPwEmail);
    return url;
}


/**
 * This function will send the username, the email and the link to the Php-Script
 * 
 * @param {*} forgotPwEmail The Email from which the password should be changed
 */
function sentMailToPhp(forgotPwEmail) {  // Email wird das Php skript übergeben
    var username = getUsername(forgotPwEmail);
    var link = getForgotPwLink(forgotPwEmail);
    var email = forgotPwEmail;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Erfolgreiche Antwort vom Server erhalten
            console.log("E-Mail gesendet");
        }
    };
    xmlhttp.open("POST", "send_mail.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    var params = "username=" + encodeURIComponent(username) + "&link=" + encodeURIComponent(link) + "&email=" + encodeURIComponent(email);
    xmlhttp.send(params);
}


/**
 * This function will activate the Php-Script to send the mail
 */
function activatePhp() { //Php skript wird ausgeführt
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Erfolgreiche Antwort vom Server erhalten
            console.log(this.responseText);
        }
    };
    xmlhttp.open("GET", "send_mail.php", true);
    xmlhttp.send();
}


/**
 * This function will start the functions to reset the password
 */
function passwordReset() {
    if (checkNewPassword() == true) {
        changePassword();
        document.getElementById('resetPassword').classList.remove('d-none');
        setTimeout(() => { document.getElementById('resetPassword').classList.add('d-none'); }, 1000); // Lets the EmailSent-Container vanish after 3 seconds
        openLogin();
    }
    else {
        document.getElementById('passwordDontMatch').style = 'color: red';
        document.getElementById('confirmedPasswordContainer').style = 'border: 1px solid red';
    }
}


/**
 *  This function changes the password
 */
function changePassword() {
    let newPassword = document.getElementById('newPassword').value;

    for (let i = 0; i < users.length; i++) {
        if (changePasswordEmail == users[i]['email']) {
            users[i]['password'] = newPassword;
        }
    }
}


/**
 * This function checks if the new password and and the confirmed password matches
 * 
 * @returns It returns true if the passwords match and false if they don´t match
 */
function checkNewPassword() {
    let newPassword = document.getElementById('newPassword').value;
    let confirmedPassword = document.getElementById('confirmedPassword').value;

    if (newPassword == confirmedPassword) {
        return true;
    }
    else {
        return false;
    }
}
