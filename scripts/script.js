console.log("JavaScript working!");
const STORAGE_KEY = "todo_tasks_pending_v1";

let taskForm;
let taskInput;
let taskList;

const tasksById = new Map();
function getId() {
  if (typeof crypto !== "undefined" && crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeParseJSON(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function loadPendingTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  const pending = safeParseJSON(raw);
  if (!Array.isArray(pending)) return;

  for (const item of pending) {
    if (!item || typeof item.id !== "string" || typeof item.text !== "string") continue;
    tasksById.set(item.id, { id: item.id, text: item.text, completed: false });
  }
}

function persistPendingTasks() {
  const pending = [...tasksById.values()]
    .filter((t) => !t.completed)
    .map((t) => ({ id: t.id, text: t.text }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item" + (task.completed ? " completed" : "");
  li.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = Boolean(task.completed);
  checkbox.setAttribute("aria-label", "Marcar como hecha");

  const text = document.createElement("span");
  text.className = "task-text";
  text.textContent = task.text;

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "task-delete";
  delBtn.textContent = "Eliminar";
  delBtn.setAttribute("aria-label", "Eliminar tarea");

  li.appendChild(checkbox);
  li.appendChild(text);
  li.appendChild(delBtn);

  return li;
}

function renderInitialTasks() {
  taskList.innerHTML = "";
  for (const task of tasksById.values()) {
    taskList.appendChild(createTaskElement(task));
  }
}

function setup() {
  taskForm = document.getElementById("task-form");
  taskInput = document.getElementById("task-input");
  taskList = document.getElementById("task-list");
  if (!taskForm || !taskInput || !taskList) return;

  
  loadPendingTasks();
  renderInitialTasks();

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const text = taskInput.value.trim();
    if (!text) return;

    const id = getId();
    const task = { id, text, completed: false };
    tasksById.set(id, task);

    const el = createTaskElement(task);
    taskList.appendChild(el);

    persistPendingTasks();
    taskInput.value = "";
    taskInput.focus();
  });

  
  taskList.addEventListener("click", (e) => {
    const delBtn = e.target.closest(".task-delete");
    if (!delBtn) return;

    const li = delBtn.closest(".task-item");
    if (!li) return;

    const id = li.dataset.id;
    if (!id) return;

    tasksById.delete(id);
    persistPendingTasks();
    li.remove();
  });

  taskList.addEventListener("change", (e) => {
    const cb = e.target;
    if (!(cb instanceof HTMLInputElement)) return;
    if (!cb.classList.contains("task-checkbox")) return;

    const li = cb.closest(".task-item");
    if (!li) return;

    const id = li.dataset.id;
    const task = tasksById.get(id);
    if (!task) return;

    task.completed = cb.checked;

    li.classList.toggle("completed", task.completed);
    persistPendingTasks();
  });
}

document.addEventListener("DOMContentLoaded", setup);
