// 날짜별 할 일 목록. 브라우저(localStorage)에 저장한다.
const STORAGE_KEY = 'todonamu-todos';

const dateInput = document.getElementById('today-date');
const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-button');
const todoList = document.getElementById('todo-list');

// { '2026-10-27': [ { id, text, done }, ... ], ... }
let todos = loadTodos();
// 지금 고치는 중인 할 일의 id (없으면 null)
let editingId = null;

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

    const isEditing = item.id === editingId;

    let text;
    if (isEditing) {
      text = document.createElement('input');
      text.type = 'text';
      text.className = 'edit-input';
      text.value = item.text;
      text.setAttribute('aria-label', '할 일 고치기');
    } else {
      text = document.createElement('span');
      text.textContent = item.text;
    }

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = isEditing ? 'save-button' : 'edit-button';
    editButton.textContent = isEditing ? '저장' : '수정';

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete-button';
    del.textContent = '삭제';

    li.append(check, text, editButton, del);
    todoList.append(li);
  });

  const editInput = todoList.querySelector('.edit-input');
  if (editInput) editInput.focus();
}

function saveEdit(li) {
  const input = li.querySelector('.edit-input');
  const newText = input.value.trim();
  if (!newText) return;

  const item = (todos[currentDate()] || []).find((t) => t.id === li.dataset.id);
  if (item) item.text = newText;
  editingId = null;
  saveTodos();
  render();
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
  editingId = null;
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
  } else if (event.target.matches('.edit-button')) {
    editingId = li.dataset.id;
    render();
    return;
  } else if (event.target.matches('.save-button')) {
    saveEdit(li);
    return;
  } else if (event.target.matches('.delete-button')) {
    if (editingId === li.dataset.id) editingId = null;
    todos[date] = items.filter((t) => t.id !== li.dataset.id);
    if (todos[date].length === 0) delete todos[date];
  } else {
    return;
  }

  saveTodos();
  render();
});

// 고치는 칸에서 Enter는 저장, Esc는 취소
todoList.addEventListener('keydown', (event) => {
  if (!event.target.matches('.edit-input')) return;
  if (event.key === 'Enter' && !event.isComposing) {
    saveEdit(event.target.closest('li'));
  } else if (event.key === 'Escape') {
    editingId = null;
    render();
  }
});

dateInput.value = todayString();
render();
