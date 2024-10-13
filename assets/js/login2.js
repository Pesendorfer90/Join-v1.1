//Other functions

/**
 * This function will set and reset the tick in the "Remember me" box
 */
function setTick() {
    if (tickCount == 0) {
        document.getElementById('tick').classList.remove('d-none');
        rememberMe = true;
    }
    else {
        document.getElementById('tick').classList.add('d-none');
        rememberMe = false;
    }
    tickCount++;
    if (tickCount >= 2) {
        tickCount = 0;
    }
}


/**
 * This function is used to fill in the login data if the remember me tick is set
 */
function fillInData() {
    document.getElementById('email').value = currentEmail;
    document.getElementById('password').value = currentPassword;
    setTick();
}


/**
 * This function is used to check the width of the screen
 * 
 * @returns it returns true when the screen is smaller than 900px
 */
function checkScreenSize() {
    return window.innerWidth <= 900;
}


/**
 * This function is switching the image next to the passwort inputfield onkeyup
 */
function switchPasswordPicture() {
    let passwordInput = document.getElementById("password").value;
    let passwordInputType = document.getElementById("password");

    if (passwordInput == '') {
        document.getElementById('lock').classList.remove('d-none');
        document.getElementById('showPassword').classList.add('d-none');
        document.getElementById('hidePassword').classList.add('d-none');
    }
    else {
        if (passwordInputType.type == "password") {
            document.getElementById('lock').classList.add('d-none');
            document.getElementById('showPassword').classList.add('d-none')
            document.getElementById('hidePassword').classList.remove('d-none');
        }
        else {
            document.getElementById('lock').classList.add('d-none');
            document.getElementById('showPassword').classList.remove('d-none')
            document.getElementById('hidePassword').classList.add('d-none');
        }
    }

}


/**
 * This function is used to switch the password inputfield image onclick
 */
function showPassword1() {
    let passwordInput = document.getElementById("password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        document.getElementById('showPassword').classList.remove('d-none');
        document.getElementById('hidePassword').classList.add('d-none');

    } else {
        passwordInput.type = "password";
        document.getElementById('showPassword').classList.add('d-none');
        document.getElementById('hidePassword').classList.remove('d-none');
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
 * This function is used to change the border of the parent-element of the inputfield
 * 
 * @param {string} event This is the active event
 */
function activeInputfield(event) {
    // Hole das aktuell aktive Element
    const activeInput = event.target;

    // Überprüfe, ob das aktive Element ein Input-Feld ist
    if (activeInput.tagName === "INPUT") {
        if (event.type === "focus") {
            // Das Input-Feld hat den Fokus erhalten
            const activeInputfieldId = activeInput.id;
            document.getElementById(activeInputfieldId).parentNode.style = "border: 1px solid #29ABE2;"
        } else if (event.type === "blur") {
            // Das Input-Feld hat den Fokus verloren
            const activeInputfieldId = activeInput.id;
            document.getElementById(activeInputfieldId).parentNode.style = ""
        }
    }
}


/**
 * This function is used to restart the animation when the screen is resized
 */
function handleResize() {
    let screenWidth = window.innerWidth;
    if (screenWidth == 900) {
        waitForAnimation();
    }
}


function disableButton(buttonId) {
    const button = document.getElementById(buttonId);

    button.disabled = true;

    setTimeout(() => {
        button.disabled = false;
    }, 2000);
}

//Eventlistener

document.addEventListener("focus", activeInputfield, true); // gets the inputfield which is in focus
document.addEventListener("blur", activeInputfield, true); // get the inputfield which looses the focus
window.addEventListener('resize', handleResize); // checks if the screen is resizing