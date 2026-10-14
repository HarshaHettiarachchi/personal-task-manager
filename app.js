// ==========================================
// Personal Task Manager - JavaScript Logic
// ==========================================

// Key used to store tasks in the browser's localStorage
const STORAGE_KEY = "antigravity_tasks";

// State: list of tasks and current active filter
let tasks = [];
let currentFilter = "all";

// DOM Element References
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const emptyText = document.getElementById("empty-text");
const taskCount = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clear-completed-btn");

// ------------------------------------------
// 1. LocalStorage Helpers
// ------------------------------------------

// Load tasks from browser localStorage
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    tasks = saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Could not load tasks from localStorage:", error);
    tasks = [];
  }
}

// Save tasks array to browser localStorage
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks to localStorage:", error);
  }
}

// ------------------------------------------
// 2. Task Actions (CRUD)
// ------------------------------------------

// Add a new task
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTask = {
    id: Date.now().toString(), // unique timestamp ID
    text: trimmed,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask); // Add to the top of the list
  saveTasks();
  render();
}

// Toggle task completion status
function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  render();
}

// Delete a task by ID
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
}

// Clear all completed tasks
function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
}

// Set active filter tab ('all' | 'active' | 'completed')
function setFilter(newFilter) {
  currentFilter = newFilter;

  // Update active class on filter buttons
  filterButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });

  render();
}

// ------------------------------------------
// 3. Render / UI Update Logic
// ------------------------------------------

function render() {
  // 1. Filter tasks according to currentFilter
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true; // 'all'
  });

  // 2. Clear current list DOM
  taskList.innerHTML = "";

  // 3. Render filtered items
  filteredTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;
    li.dataset.id = task.id;

    // Custom Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark "${task.text}" as ${task.completed ? "active" : "completed"}`);

    // Text Span
    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    // Content container
    const content = document.createElement("div");
    content.className = "task-content";
    content.appendChild(checkbox);
    content.appendChild(span);

    // Delete Button with sleek SVG icon
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.type = "button";
    deleteBtn.title = "Delete task";
    deleteBtn.setAttribute("aria-label", `Delete task "${task.text}"`);
    deleteBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    `;

    li.appendChild(content);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });

  // 4. Update Empty State visibility & message
  if (filteredTasks.length === 0) {
    emptyState.classList.remove("hidden");
    const targetTextEl = emptyText || emptyState.querySelector("p");
    if (targetTextEl) {
      if (currentFilter === "active") {
        targetTextEl.textContent = "No active tasks! You are all caught up.";
      } else if (currentFilter === "completed") {
        targetTextEl.textContent = "No completed tasks yet. Finish a task to see it here!";
      } else {
        targetTextEl.textContent = "No tasks yet! Add a task above to get started.";
      }
    }
  } else {
    emptyState.classList.add("hidden");
  }

  // 5. Update Remaining Task Count
  const remainingCount = tasks.filter(t => !t.completed).length;
  taskCount.textContent = `${remainingCount} ${remainingCount === 1 ? "task" : "tasks"} left`;
}

// ------------------------------------------
// 4. Event Listeners
// ------------------------------------------

// Form submission for adding tasks
taskForm.addEventListener("submit", event => {
  event.preventDefault();
  addTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
});

// Event delegation on task list (handles clicks on checkbox or delete button)
taskList.addEventListener("click", event => {
  const target = event.target;
  const taskItem = target.closest(".task-item");
  if (!taskItem) return;

  const id = taskItem.dataset.id;

  // If clicked checkbox
  if (target.classList.contains("task-checkbox")) {
    toggleTask(id);
    return;
  }

  // If clicked delete button or its inner icon
  const deleteBtn = target.closest(".delete-btn");
  if (deleteBtn) {
    deleteTask(id);
  }
});

// Filter button clicks
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    setFilter(btn.dataset.filter);
  });
});

// Clear completed button
clearCompletedBtn.addEventListener("click", clearCompleted);

// ------------------------------------------
// 5. App Initialization
// ------------------------------------------
loadTasks();
render();
