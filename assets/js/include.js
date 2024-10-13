/**
 * This function searches for all elements with the name w3-include-html and inserts the corresponding html file.
 */
async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        file = element.getAttribute("w3-include-html");
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found!';
        }
    }
}


/**
 * This function decides which div gets a background color based on the pathname.
 */
function sideMenuColor() {
    let pathName = window.location.pathname;
    if (pathName == '/summary.html') {
        document.getElementById('summaryMenu').classList.add('link-active')
    } else if (pathName == '/board.html') {
        document.getElementById('boardMenu').classList.add('link-active')
    } else if (pathName == '/add-task.html') {
        document.getElementById('addTaskMenu').classList.add('link-active')
    } else if (pathName == '/contacts.html') {
        document.getElementById('contactsMenu').classList.add('link-active')
    } else if (pathName == '/legal-notice.html') {
        document.getElementById('legalNoticeMenu').classList.add('link-active')
    }
}