// 날짜별 할 일 목록. 브라우저(localStorage)에 저장한다.
const STORAGE_KEY = 'todonamu-todos';

const dateInput = document.getElementById('today-date');
const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');

// { '2026-10-27': [ { id, text, done }, ... ], ... }
let todos = loadTodos();

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    // 저장이 막힌 브라우저에서는 새로고침하면 사라진다.
  }
}

// 오늘 날짜를 YYYY-MM-DD로 (내 시간대 기준)
function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function currentDate() {
  return dateInput.value || todayString();
}

function render() {
  const items = todos[currentDate()] || [];
  todoList.textContent = '';

  items.forEach((item) => {
    const li = document.createElement('li');
    li.dataset.id = item.id;

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = item.done;
    check.setAttribute('aria-label', '완료 체크');

    const text = document.createElement('span');
    text.textContent = item.text;

    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '삭제';

    li.append(check, text, del);
    todoList.append(li);
  });
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  const date = currentDate();
  if (!todos[date]) todos[date] = [];
  todos[date].push({ id: Date.now().toString(), text, done: false });

  saveTodos();
  todoInput.value = '';
  render();
  todoInput.focus();
}

dateInput.addEventListener('change', () => {
  if (!dateInput.value) dateInput.value = todayString();
  render();
});

addButton.addEventListener('click', addTodo);

todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.isComposing) addTodo();
});

// 체크칸과 삭제 버튼은 목록 하나에서 한꺼번에 받는다.
todoList.addEventListener('click', (event) => {
  const li = event.target.closest('li');
  if (!li) return;
  const date = currentDate();
  const items = todos[date] || [];

  if (event.target.matches('input[type="checkbox"]')) {
    const item = items.find((t) => t.id === li.dataset.id);
    if (item) item.done = event.target.checked;
  } else if (event.target.matches('button')) {
    todos[date] = items.filter((t) => t.id !== li.dataset.id);
    if (todos[date].length === 0) delete todos[date];
  } else {
    return;
  }

  saveTodos();
  render();
});

dateInput.value = todayString();
render();
