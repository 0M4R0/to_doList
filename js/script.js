let taskArray = JSON.parse(localStorage.getItem("taskArray")) || [];
let editTaskIndex = null;
let currentFilter = "all";

const addTaskButton = document.getElementById("add-task-button");
const addTaskButtonSidebar = document.getElementById("add-task-button-sidebar");

const taskInput = document.getElementById("task-input");
const errorMessage = document.getElementById("error-message");
const prioritySelect = document.getElementById("priority-select");

const helpTaskText = document.getElementById("help-task-text");
const titleTask = document.getElementById("title-task");

const remainingTasksCount = document.getElementById("remaining-tasks");
const helpTaskTextRemaining = document.getElementById(
    "help-task-text-remaining"
);


const filterSectionMain = document.getElementById("filter-section-main");

function addTask() {
    const text = taskInput.value.trim();
    const priority = prioritySelect.value;

    if (taskInput.value === "") {
        errorMessage.textContent = "Please enter a task";
        errorMessage.style.color = "red";
        errorMessage.style.display = "block";
        return;
    }

    errorMessage.textContent = "";
    errorMessage.style.display = "none";

    if (editTaskIndex !== null) {
        taskArray[editTaskIndex].text = text;
        taskArray[editTaskIndex].priority = priority;
        editTaskIndex = null;
    } else {
        const task = {
            id: Date.now(),
            text: text,
            time: new Date().toLocaleString(),
            priority: priority,
            completed: false,
        };
        taskArray.push(task);
    }

    taskInput.value = "";
    prioritySelect.value = "medium";
    colorSelect();
    taskInput.blur();

    displayTask();
    saveTask_loadStorage();
}

function editTask(index) {
    const task = taskArray[index];
    taskInput.value = task.text;
    prioritySelect.value = task.priority;
    taskInput.focus();
    editTaskIndex = index;
}

function removeTask(index) {
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
    taskArray.splice(index, 1);
    displayTask();
    saveTask_loadStorage();
}

function createTaskElement(task, index) {
    const taskItem = document.createElement("div");
    taskItem.classList.add("task-item");

    const taskItemContainer = document.createElement("div");
    taskItemContainer.classList.add("task-item-container");

    const taskItemContainerTexts = document.createElement("div");
    taskItemContainerTexts.classList.add("task-item-container-texts");

    const taskItemContainerTime = document.createElement("div");
    taskItemContainerTime.classList.add("task-item-container-time");

    const taskText = document.createElement("span");
    taskText.classList.add("task-item-container-text-task");
    taskText.textContent = task.text;
    if (task.completed) {
        taskText.style.textDecoration = "line-through";
        taskText.style.color = "gray";
    }

    const taskTime = document.createElement("span");
    taskTime.classList.add("task-item-container-text-time");
    const createdTime = new Date(task.time);

    const options = {
        month: "short", // Jun
        day: "numeric", // 7
        hour: "2-digit", // 07
        minute: "2-digit", // 22
        hour12: true, // PM
    };

    const formattedTime = createdTime.toLocaleString("en-US", options);
    taskTime.textContent = "Created: " + formattedTime;

    const taskPriority = document.createElement("span");
    taskPriority.classList.add("task-item-container-text-priority");
    taskPriority.textContent = "Priority: " + task.priority;

    switch (task.priority) {
        case "high":
            taskPriority.style.color = "#dc2626";
            taskPriority.style.border = "1px solid #ff0000";
            break;
        case "medium":
            taskPriority.style.color = "#ea580c";
            taskPriority.style.border = "1px solid #fdb420";
            break;
        case "low":
            taskPriority.style.color = "#16a34a";
            taskPriority.style.border = "1px solid #00C851";
            break;
    }

    const completeBtn = document.createElement("button");
    completeBtn.classList.add("check-icon");
    completeBtn.innerHTML = "<i class='fa-solid fa-circle-check'></i>";
    completeBtn.addEventListener("click", () => toggleTaskCompletion(index));

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-icon");
    editBtn.innerHTML = "<i class='fa-solid fa-pencil'></i>";
    editBtn.addEventListener("click", () => editTask(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-icon");
    deleteBtn.innerHTML = "<i class='fa-solid fa-trash'></i>";
    deleteBtn.addEventListener("click", () => removeTask(index));

    taskItem.appendChild(completeBtn);
    taskItem.appendChild(taskItemContainer);
    taskItemContainer.appendChild(taskItemContainerTexts);
    taskItemContainer.appendChild(taskItemContainerTime);
    taskItemContainerTexts.appendChild(taskText);
    taskItemContainerTime.appendChild(taskTime);
    taskItemContainerTime.appendChild(taskPriority);
    taskItem.appendChild(editBtn);
    taskItem.appendChild(deleteBtn);

    return taskItem;
}

function filterTasks(filter) {
    currentFilter = filter;

    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("active");
        if (btn.dataset.filter === filter) {
            btn.classList.add("active");
        }
    });

    displayTask();
}

function getFilteredTasks() {
    switch (currentFilter) {
        case "pending":
            return taskArray.filter((task) => !task.completed);
        case "completed":
            return taskArray.filter((task) => task.completed);
        case "high":
            return taskArray.filter((task) => task.priority === "high");
        default:
            return taskArray;
    }
}

function displayTask() {
    const taskListContainer = document.getElementById("task-list-item");
    taskListContainer.innerHTML = "";

    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        let emptyMessage = "No tasks yet";
        if (currentFilter !== "all") {
            switch (currentFilter) {
                case "pending":
                    emptyMessage = "No pending tasks";
                    break;
                case "completed":
                    emptyMessage = "No completed tasks";
                    break;
                case "high":
                    emptyMessage = "No high priority tasks";
                    break;
            }
        }
        helpTaskText.innerHTML = emptyMessage;
        titleTask.innerHTML = "Your tasks";

        remainingTasksCount.textContent = "0/0";
        helpTaskTextRemaining.textContent = "Completed";

        return;
    }

    const completedTasks = taskArray.filter((task) => task.completed).length;
    const remainingTasks = taskArray.length - completedTasks;

    helpTaskText.innerHTML = remainingTasks + " tasks remaining";
    titleTask.innerHTML = "Your tasks";

    remainingTasksCount.textContent = completedTasks + "/" + taskArray.length;
    helpTaskTextRemaining.textContent = "Completed";

    filteredTasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, taskArray.indexOf(task));
        taskListContainer.appendChild(taskElement);
    });
}

function toggleTaskCompletion(index) {
    taskArray[index].completed = !taskArray[index].completed;
    displayTask();
    saveTask_loadStorage();
}

function saveTask_loadStorage() {
    try {
        localStorage.setItem("taskArray", JSON.stringify(taskArray));
        const savedTaskArray = JSON.parse(localStorage.getItem("taskArray"));
        if (savedTaskArray) {
            taskArray = savedTaskArray;
        }
    } catch (error) {
        console.error("Error saving task to localStorage:", error);
    }
}

function keyPress(event) {
    try {
        if (event.key === "Enter") {
            addTask();
        }

        if (event.key === "/") {
            event.preventDefault();
            taskInput.focus();
        }
    } catch (error) {
        console.error("Error handling key press:", error);
    }
}

const select = document.getElementById("priority-select");
function colorSelect() {
    const value = select.value;

    // Limpia clases anteriores
    select.classList.remove("low", "medium", "high");

    // Agrega clase según selección
    select.classList.add(value);
}

colorSelect();
select.addEventListener('change', colorSelect)


function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const toggleOnBtn = document.getElementById("toggle-sidebar");

    if (sidebar.style.display === "none") {
        sidebar.style.display = "flex";
        toggleOnBtn.style.display = "none";
        filterSectionMain.style.display = "none";
        localStorage.setItem("filterSectionMain", "none");
        localStorage.setItem("sidebarState", "open");
    } else {
        sidebar.style.display = "none";
        toggleOnBtn.style.display = "block";
        filterSectionMain.style.display = "block";
        localStorage.setItem("sidebarState", "closed");
        localStorage.setItem("filterSectionMain", "block");
    }
}

function loadSidebarState() {
    const sidebar = document.getElementById("sidebar");
    const toggleOnBtn = document.getElementById("toggle-sidebar");
    const filterSectionMain = document.getElementById("filter-section-main");

    const savedState = localStorage.getItem("sidebarState");
    const savedFilterSectionMain = localStorage.getItem("filterSectionMain");

    if (savedState === "closed") {
        sidebar.style.display = "none";
        toggleOnBtn.style.display = "block";
    } else {
        sidebar.style.display = "flex";
        toggleOnBtn.style.display = "none";
    }

    if (savedFilterSectionMain === "none") {
        filterSectionMain.style.display = "none";
    } else {
        filterSectionMain.style.display = "block";
    }
}

const toggleSidebarButton = document.getElementById("toggle-sidebar");
toggleSidebarButton.addEventListener("click", toggleSidebar);

const toggleSidebarButtonOn = document.getElementById("toggle-sidebar-on");
toggleSidebarButtonOn.addEventListener("click", toggleSidebar);


// Theme
const themeToggle = document.getElementById("theme-toggle");

// Load theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.innerHTML = "<i class='fa-solid fa-sun'></i>Light Mode";
}

themeToggle.addEventListener("click", toggleDarkMode);

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle("dark-mode");

    if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        themeToggle.innerHTML = "<i class='fa-solid fa-sun'></i>Light Mode";
        themeToggle.title = "Light Mode";
        themeToggle.style.color = "#fff";
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.innerHTML = "<i class='fa-solid fa-moon'></i>Dark Mode";
        themeToggle.title = "Dark Mode";
        themeToggle.style.color = "#000";
    }
}





displayTask();

addTaskButton.addEventListener("click", addTask);
addTaskButtonSidebar.addEventListener("click", () => {
    taskInput.focus();
});

document.addEventListener("keypress", keyPress);

loadSidebarState();

document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        filterTasks(btn.dataset.filter);
    });
});
