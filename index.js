// Import taskFunctions.js & initialData.js
import * as taskFunctions from "/utils/taskFunctions.js";
import { initialData } from "/initialData.js";
//console.log(initialData);
//console.log(taskFunctions.getTasks);

// Function checks if local storage already has data, if not it loads initialData to localStorage as well as sidebar and theme defaults.
//If starage already exists thn a console.log message is returned.
function initializeData(data) {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(data));
    localStorage.setItem("showSideBar", "true");
    localStorage.getItem("light-theme", "disabled");
    localStorage.getItem("showMobileMenu", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}
initializeData(initialData);
//console.log(localStorage.tasks);

//Alot of the DOm elements required are targeted in Elements object.
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  columnDivs: document.querySelectorAll(".column-div"),
  filterDiv: document.getElementById("filterDiv"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  mobileThemeSwitch: document.getElementById("mobile-switch"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  modalWindow: document.getElementById("new-task-modal-window"),
  sideBar: document.getElementById("side-bar-div"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  editTaskModalWindow: document.querySelector(".edit-task-modal-window"),
  mobileAddNewBoardBtn: document.getElementById("mobile-add-new-board-btn"),
  newBoardForm: document.getElementById("new-board-form"),
  newBoardInput: document.getElementById("new-board-input"),
  newBoardSubmitBtn: document.getElementById("new-board-submit-btn"),
  newBoardCloseBtn: document.getElementById("new-board-close"),
};
//console.log(elements.dropDownBtn);
/////////// BOARD FUNCTIONS //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let activeBoard = "";
// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = taskFunctions.getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
  //console.log(activeBoard);
}
// Adds boards into the DOM as Bottons that can then be clicked to show the board.
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container
  const mobileBoardsContainer = document.getElementById("mobile-boards-nav-links-div");
  mobileBoardsContainer.innerHTML = "";

  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", function () {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
    //mobileBoardsContainer.appendChild(boardElement);

    const mobileBoardElement = boardElement.cloneNode(true);
    mobileBoardElement.classList.remove("board-btn");
    mobileBoardElement.classList.add("mobile-board-btn");
    mobileBoardElement.addEventListener("click", function () {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    mobileBoardsContainer.appendChild(mobileBoardElement);
  });
}

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  document.querySelectorAll(".mobile-board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

///////// Task Functions ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boards) {
  const tasks = taskFunctions.getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => task.board === boards);

  // creating the colums for each status and giving them the correct title
  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    if (status) {
      column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

      const tasksContainer = document.createElement("div");
      tasksContainer.classList.add("tasks-container");
      column.appendChild(tasksContainer);
      //console.log(status);

      //Filtering the tasks based on which status they should currently be under.
      filteredTasks
        .filter((task) => task.status === status)
        .forEach((task) => {
          const taskElement = document.createElement("div");
          taskElement.classList.add("task-div");
          taskElement.textContent = task.title;
          taskElement.setAttribute("data-task-id", task.id);

          // Listen for a click event on each task and open a modal
          taskElement.addEventListener("click", () => {
            openEditTaskModal(task);
          });

          tasksContainer.appendChild(taskElement);
        });
    } else {
      console.log("no status");
    }
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function to refresh the UI without having to refresh the webpage.
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// function to add the indivudual tasks to the UI.
function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`);
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = `${task.title}`; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);
}

/////////// Event Listeners /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () => toggleModal(false, elements.editTaskModalWindow));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  //////Add new board/////////////////
  elements.newBoardForm.addEventListener("submit", addNewBoard);
  elements.newBoardCloseBtn.addEventListener("click", () => {
    closeNewBoardForm();
    toggleMobileMenu();
  });

  const addNewBoardButton = document.getElementById("add-new-board");
  addNewBoardButton.addEventListener("click", () => {
    elements.newBoardForm.style.display = "block";
  });

  elements.mobileAddNewBoardBtn.addEventListener("click", () => {
    elements.newBoardForm.style.display = "block";
    toggleMobileMenu();
  });

  //////Side bar event listeners
  // Hide sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  //Show sidebar eventListener
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  ///////////// Mobile menu //////////////////////////////////////
  //Open and close menu at three dot button
  const editBoardBtn = document.getElementById("edit-board-btn");

  editBoardBtn.addEventListener("click", toggleMobileMenu);

  //close button in mobile menu
  const hideMobileMenu = document.getElementById("mobile-hide-side-bar-btn");
  hideMobileMenu.addEventListener("click", () => {
    const isMobileMenuOpen = localStorage.getItem("showMobileMenu") === "true";
    toggleMobileMenu(!isMobileMenuOpen);
  });

  ////////Theme event istener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  elements.mobileThemeSwitch.addEventListener("change", toggleTheme);

  //////// Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });
  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}

// Toggles tasks modal

// Function to change the style of the modals so that they are either displayed as block or none (hidden)
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none";
}

//

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addNewBoard(event) {
  event.preventDefault();
  const boardName = elements.newBoardInput.value.trim();

  if (!boardName) {
    alert("board name cannot be empty.");
    return;
  }

  const tasks = taskFunctions.getTasks();
  const boards = [...new Set(tasks.map((task) => task.board))];

  if (boards.includes(boardName)) {
    alert("board name already exists.");
    return;
  }

  const newTask = {
    id: Date.now(),
    title: "Example Task",
    description: "This is an example task. Edit or delete me",
    status: "todo",
    board: boardName,
  };

  taskFunctions.createNewTask(newTask);

  fetchAndDisplayBoardsAndTasks();
  elements.newBoardInput.value = "";
  elements.newBoardForm.style.display = "none";
}

function closeNewBoardForm() {
  elements.newBoardForm.style.display = "none";
}

/// Functions to add tasked through the add task modal
function addTask(event) {
  event.preventDefault();
  const titleInput = document.getElementById("title-input").value;
  const descInput = document.getElementById("desc-input").value;
  const statusSelect = document.getElementById("select-status").value;

  //Assign user input to the task object
  const task = {
    title: titleInput,
    description: descInput,
    status: statusSelect,
    board: activeBoard,
  };

  //createNewTask function give a new task a unique ID, and save the object data of task to the local storage array.
  const newTask = taskFunctions.createNewTask(task); //gives new task an id and pushes it to the array which is then saved in local storage.
  if (newTask) {
    addTaskToUI(newTask); //adds new task to UI.
    toggleModal(false); // Closes add task Modal.
    elements.filterDiv.style.display = "none"; //  Hides the filter overlay.
    event.target.reset(); //resets the form so that when add new task button is clicked it is clear.
    refreshTasksUI(); //refreshes the UI automatically so that the page doesnt need to be refreshed.
  }
}

//////// Side Bar function///////////////////////////////////////
function toggleSidebar(show) {
  if (show) {
    //if true, sidebar display style set to block "block", showSideBarBtn button is either "none" or "block" depending on if the sideBasr is open or not.
    elements.sideBar.style.display = "block";
    localStorage.setItem("showSideBar", "true"); //updating state in local storage
    elements.showSideBarBtn.style.display = "none";
  } else {
    elements.sideBar.style.display = "none";
    localStorage.setItem("showSideBar", "false"); //updating state in local storage
    elements.showSideBarBtn.style.display = "block";
  }
}

///////////////Mobile menu function///////////////////////////////////////////
const mobileSideBar = document.getElementById("mobile-side-bar-div");

function toggleMobileMenu(show) {
  if (mobileSideBar.style.display === "block") {
    //if true, sidebar display style set to block "block", showSideBarBtn button is either "none" or "block" depending on if the sideBasr is open or not.
    mobileSideBar.style.display = "none";
    localStorage.setItem("showMobileMenu", "false"); //updating state in local storage
  } else {
    mobileSideBar.style.display = "block";
    localStorage.setItem("showMobileMenu", "true"); //updating state in local storage
  }
}

///////////Toggle the theme function /////////////////////////////////////////////////////////////////
function toggleTheme(theme) {
  console.log("toggleTheme called", theme.target.checked);
  const logoText = document.getElementById("logo-text");
  const logoImage = document.getElementById("logo"); //targets the logo
  const isChecked = theme.target.checked; //isChecked varialble has a value of true if the checkedbox element is checked and false if it is not checked.
  if (isChecked) {
    //if isChecked is true
    //it will add the light-theme to the class list. And it will use the correct light logo. setting are savbed in local Storage
    document.body.classList.add("light-theme");
    logoText.style.color = "black";
    localStorage.setItem("light-theme", "enabled");
    if (logoImage) {
      logoImage.src = "./assets/logo-light.svg";
    } //update to local storage
  } else {
    //if the toggle is disabled it will take away the light theme class.
    document.body.classList.remove("light-theme");
    localStorage.setItem("light-theme", "disabled"); //update to local storage
    logoText.style.color = "white";
    if (logoImage) {
      logoImage.src = "./assets/logo-dark.svg";
    }
  }
  updateTheme();
}

//////////////////Funcation to open edit modal with current task deations///////////////////////////
function openEditTaskModal(task) {
  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");
  const editTaskForm = document.getElementById("edit-task-form");
  // Set task details in modal inputs
  titleInput.value = task.title;
  descInput.value = task.description;
  statusSelect.value = task.status;
  editTaskForm.dataset.taskId = task.id;
  // Get button elements from the task modal
  //const editButton = document.getElementById("edit-btn");
  const saveTaskChangesBtn = document.getElementById("save-task-changes-btn");
  saveTaskChangesBtn.addEventListener("click", () => {
    saveTaskChanges(task.id);
  });
  // Call saveTaskChanges upon click of Save Changes button
  const deleteTaskBtn = document.getElementById("delete-task-btn");
  deleteTaskBtn.addEventListener("click", () => {
    taskFunctions.deleteTask(task.id);
    toggleModal(false, elements.editTaskModalWindow);
    refreshTasksUI();
  });
  toggleModal(true, elements.editTaskModalWindow);
  // Delete task using a helper function and close the task modal
  // Show the edit task modal
}

////////// Function to save changed made in edit modal.///////////////////////////////////////
function saveTaskChanges(taskId) {
  // Get new user inputs
  const titleInput = document.getElementById("edit-task-title-input").value;
  const descInput = document.getElementById("edit-task-desc-input").value;
  const statusSelect = document.getElementById("edit-select-status").value;

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: titleInput,
    description: descInput,
    status: statusSelect,
    board: activeBoard,
  };
  // putTask function used to update the task information in the local Storage.
  taskFunctions.putTask(taskId, updatedTask);
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModalWindow);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();

  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);

  const showMobileMenu = localStorage.getItem("showMobileMenu");
  if (showMobileMenu === "true") {
    mobileSideBar.style.display = "block";
  } else {
    mobileSideBar.style.display = "none";
  }

  updateTheme();

  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}

function updateTheme() {
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  if (elements.themeSwitch) {
    elements.themeSwitch.checked = isLightTheme;
  }
  if (elements.mobileThemeSwitch) {
    elements.mobileThemeSwitch.checked = isLightTheme;
  }

  const logoImage = document.getElementById("logo");
  if (isLightTheme) {
    logoImage.src = "./assets/cute-puppy.png";
  } else {
    logoImage.src = "./assets/cute-puppy.png";
  }
}
