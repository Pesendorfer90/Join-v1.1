let tasks;
let users;
let valueJson;


/**
 * This function will initialize the page
 */
async function initSummary() {
    await init()
    includeUser();
    await getData();
    if (checkForAnimation()) {
        openMobileGreeting();
    }
}


/**
 * This function will add the hover effect to the div
 * 
 * @param {*} id This is the id where the hover effect will be added
 */
function addHoverEffect(id) {
    if (id == 'todoPicture') {
        document.getElementById(id).src = 'assets/img/pen_hover.png';
    }
    if (id == 'donePicture') {
        document.getElementById(id).src = 'assets/img/tick_hover.png';
    }
}


/**
 * This function will remove the hover effect from the div
 * 
 * @param {*} id This is the id where the hover effect will be removed
 */
function removeHoverEffect(id) {
    if (id == 'todoPicture') {
        document.getElementById(id).src = 'assets/img/pen.png';
    }
    if (id == 'donePicture') {
        document.getElementById(id).src = 'assets/img/tick.png';
    }
}


/**
 * This function will get the data from the backend
 */
async function getData() {
    tasks = database['tasks'];
    users = database['users'];
    switchHtml();
}


/**
 * This function will include all the info from the backend
 */
function switchHtml() {
    document.getElementById('nameOfUser').innerHTML = currentUsername;
    document.getElementById('tasksInProgress').innerHTML = getTasksInProgress();
    document.getElementById('awaitingFeedback').innerHTML = getAwaitingFeedback();
    document.getElementById('todo').innerHTML = getTodo();
    document.getElementById('done').innerHTML = getDone();
    document.getElementById('urgent').innerHTML = getUrgent();
    document.getElementById('tasksInBoard').innerHTML = tasks.length;
    document.getElementById('greeting').innerHTML = getTimeOfDay();
    document.getElementById('upcomingDeadline').innerHTML = getUpcomingDeadline();
}


/**
 * This function finds out how many tasks are in progress
 * 
 * @returns It will return the amount of tasks which are in progress
 */
function getTasksInProgress() {
    let tasksInProgress = 0;

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i]['progress'] == 'in-progress') {
            tasksInProgress++;
        }
    }
    return tasksInProgress;
}


/**
 * This function finds out how many tasks are awaiting feedback
 * 
 * @returns It will return the amount of tasks which are awaiting feedback
 */
function getAwaitingFeedback() {
    let awaitingFeedback = 0;

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i]['progress'] == 'awaiting-feedback') {
            awaitingFeedback++;
        }
    }
    return awaitingFeedback;
}


/**
 * This function finds out how many tasks got status "Todo"
 * 
 * @returns It will return the amount of tasks which got the status "Todo"
 */
function getTodo() {
    let todo = 0;

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i]['progress'] == 'todo') {
            todo++;
        }
    }
    return todo;
}


/**
 * This function finds out how many tasks got status "Done"
 * 
 * @returns It will return the amount of tasks which got the status "Done"
 */
function getDone() {
    let done = 0;

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i]['progress'] == 'done') {
            done++;
        }
    }
    return done;
}


/**
 * This function finds out how many tasks got a high priority
 * 
 * @returns It will return the amount of tasks which got a high priority
 */
function getUrgent() {
    let urgent = 0;

    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i]['prio'] == 'high') {
            urgent++;
        }
    }
    return urgent;
}


/**
 * This function is used to get the upcoming Deadline
 * 
 * @returns If there is an upcoming Date then it will be returned, if not 'No' will be returned
 */
function getUpcomingDeadline() {
    let dateArray = [];

    for (let i = 0; i < tasks.length; i++) {
        dateArray.push(tasks[i]['due_date'])
    }
    if (findUpcomingDate(dateArray) == 'No') {
        return 'No'
    }
    else {
        return formateDate(findUpcomingDate(dateArray));
    }
}


/**
 * This function is used to get the next upcoming task
 * 
 * @param {Array} dateArray This Array contains the due dates of the tasks
 * @returns it returns the upcoming Task
 */
function findUpcomingDate(dateArray) {
    // Check if the array is empty or zero
    if (!dateArray || dateArray.length === 0) {
        return 'No';
    }

    // get current date
    const today = new Date();

    // get rid of past dates
    const futureDates = dateArray.filter((date) => new Date(date) > today);

    // sort the upcoming dates
    futureDates.sort((a, b) => new Date(a) - new Date(b));

    // return the next date (if available)
    return futureDates.length > 0 ? futureDates[0] : 'No';
}


/**
 * This function is used to change the format of the date
 * 
 * @param {date} date This is the date in the wrong way
 * @returns It returns the date in the right format
 */
function formateDate(date) {
    const months = [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ];

    const [year, month, day] = date.split("-").map(Number);
    const formatedDate = `${months[month - 1]} ${day}, ${year}`;

    return formatedDate;
}


/**
 * This function will get the current time of the day
 * 
 * @returns it returns the greeting for each part of the day
 */
function getTimeOfDay() {
    let currentTime = new Date();
    let currentHour = currentTime.getHours();

    if (currentHour >= 0 && currentHour <= 8) {
        return "Good morning,";
    } else if (currentHour > 8 && currentHour <= 16) {
        return "Good day,";
    } else {
        return "Good evening,";
    }
}


/**
 * This function checks if the mobile animation has to appear
 * 
 * @returns It returns true if the animation has to appear
 */
function checkForAnimation() {
    var previousPage = document.referrer;
    var pageURL = "login.html";
    return animation = previousPage.includes(pageURL);
}


/**
 * This function is used to show the mobile greeting
 */
function openMobileGreeting() {
    const screenWidth = window.innerWidth;

    if (screenWidth < 900) {
        document.getElementById('headerContainer').style = 'display: none;';
        document.getElementById('mainLeftContainer').style = 'display: none;';
        document.getElementById('mainRightContainer').style = 'display: flex;';
        document.getElementById('main').style = 'height: inherit;';
        setTimeout(() => {
            document.getElementById('headerContainer').style = '';
            document.getElementById('mainLeftContainer').style = '';
            document.getElementById('mainRightContainer').style = '';
            document.getElementById('main').style = '';
        }, 2000);
    }
}

