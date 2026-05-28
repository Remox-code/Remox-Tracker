// ===== GLOBAL VARIABLES =====
const modal = document.getElementById("taskModal");
const openBtn = document.getElementById("openTaskModal");
const addBtn = document.getElementById("addTaskBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");
const taskInput = document.getElementById("taskInput");
const taskPriority = document.getElementById("taskPriority");
const tasksContainer = document.querySelector(".tasks-table");
const filterBtns = document.querySelectorAll('.filter-btn');
const statusFilterBtns = document.querySelectorAll('.tasks-header-filter button');

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = 'daily'; // daily, weekly, monthly
let statusFilter = 'Total';   // Total, Completed, In Progress, Overdue
let selectedDate = null; 

const priorityWeight = { high: 1, medium: 2, low: 3 };

// ===== INIT & LISTENERS =====

// فیلترهای زمانی (بالا)
filterBtns.forEach(btn => {
    btn.onclick = () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        selectedDate = null; 
        renderTasks();
    };
});

// فیلترهای وضعیتی (پایین هدر)
statusFilterBtns.forEach(btn => {
    btn.onclick = () => {
        statusFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        statusFilter = btn.id; 
        renderTasks();
    };
});

const openModal = () => modal.classList.add("active");
const closeModal = () => { modal.classList.remove("active"); taskInput.value = ""; };

openBtn.onclick = openModal;
if(emptyAddBtn) emptyAddBtn.onclick = openModal;
modal.onclick = (e) => { if (e.target === modal) closeModal(); };

// ===== HELPERS =====
function saveTasks() { localStorage.setItem("tasks", JSON.stringify(tasks)); }
function getTodayISO() { return new Date().toISOString().split("T")[0]; }
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// اصلی‌ترین بخش: ترکیب فیلتر Scope و Status
function getFilteredTasks() {
    const todayStr = getTodayISO();
    
    // ۱. ابتدا فیلتر بر اساس Scope (Daily/Weekly/Monthly)
    let filtered = tasks.filter(t => t.scope === currentFilter);

    // ۲. سپس اعمال فیلتر وضعیتی روی نتایج مرحله قبل
    if (statusFilter === 'Completed') {
        filtered = filtered.filter(t => t.completed);
    } else if (statusFilter === 'In Progress') {
        filtered = filtered.filter(t => !t.completed && t.date >= todayStr);
    } else if (statusFilter === 'Overdue') {
        filtered = filtered.filter(t => !t.completed && t.date < todayStr);
    }

    return filtered;
}

// ===== RENDER LOGIC =====

function renderTasks() {
    tasksContainer.innerHTML = "";
    tasksContainer.classList.remove("calendar-grid");

    const filtered = getFilteredTasks();

    if (currentFilter === 'daily') {
        renderDailyView(filtered);
    } else {
        renderCalendarView(filtered);
    }
    
    // آپدیت آمار کلی بر اساس تسک‌های مربوط به Scope فعلی (نه لزوماً فیلتر وضعیتی)
    const scopeOnlyTasks = tasks.filter(t => t.scope === currentFilter);
    updateStats(scopeOnlyTasks);
    updateCircleProgress(scopeOnlyTasks);
}

function renderDailyView(filtered) {
    tasksContainer.innerHTML = `
        <div class="tasks-table-header">
            <span></span><span>Task</span><span>Priority</span><span>Deadline</span><span>Progress</span><span></span>
        </div>`;

    if (filtered.length === 0) {
        showEmptyState(`No ${statusFilter} tasks in Daily view`);
        return;
    }

    const sortedTasks = [...filtered].sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);

    sortedTasks.forEach(task => {
        const taskEl = createTaskRow(task);
        tasksContainer.appendChild(taskEl);
    });
}

function renderCalendarView(filtered) {
    tasksContainer.classList.add("calendar-grid");
    
    let daysToShow = [];
    const today = new Date();

    if (currentFilter === 'weekly') {
        for (let i = 0; i < 7; i++) {
            let d = new Date();
            d.setDate(today.getDate() - today.getDay() + i);
            daysToShow.push(d.toISOString().split('T')[0]);
        }
    } else {
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            daysToShow.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
        }
    }

    daysToShow.forEach(date => {
        const dayCell = document.createElement('div');
        dayCell.className = `day-cell ${selectedDate === date ? 'selected' : ''}`;
        dayCell.innerHTML = `<h4>${formatDate(date)}</h4><ul></ul>`;
        
        dayCell.onclick = () => {
            selectedDate = (selectedDate === date) ? null : date;
            renderTasks();
        };

        const dayTasks = filtered.filter(t => t.date === date);
        const ul = dayCell.querySelector('ul');

        dayTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = task.completed ? "completed-task-li" : "";
            li.innerHTML = `
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span title="${task.text}">${task.text}</span>
                <button class="mini-del" title="Delete">✕</button>
            `;

            li.querySelector('input').onclick = (e) => e.stopPropagation();
            li.querySelector('input').onchange = () => {
                task.completed = !task.completed;
                saveTasks();
                renderTasks();
            };

            li.querySelector('.mini-del').onclick = (e) => {
                e.stopPropagation();
                tasks = tasks.filter(t => t !== task);
                saveTasks();
                renderTasks();
            };
            ul.appendChild(li);
        });
        tasksContainer.appendChild(dayCell);
    });
}

function createTaskRow(task) {
    const div = document.createElement("div");
    div.className = `task-row ${task.completed ? 'completed' : ''}`;
    div.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""}>
        <div><strong>${task.text}</strong></div>
        <span class="priority ${task.priority}">${task.priority}</span>
        <span>${formatDate(task.date)}</span>
        <div class="progress"><div style="width:${task.completed ? "100%" : "0%"}"></div></div>
        <button class="delete-task">✕</button>
    `;

    div.querySelector("input").onchange = (e) => {
        task.completed = e.target.checked;
        saveTasks();
        renderTasks();
    };

    div.querySelector(".delete-task").onclick = () => {
        tasks = tasks.filter(t => t !== task);
        saveTasks();
        renderTasks();
    };
    return div;
}

function showEmptyState(msg) {
    tasksContainer.innerHTML += `
        <div class="empty-state">
            <div class="empty-icon">🗂</div>
            <h3>${msg}</h3>
            <button class="empty-add-btn" onclick="modal.classList.add('active')">+ Add Task</button>
        </div>`;
}

// ===== ACTIONS =====
function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    let targetDate = getTodayISO();
    if (currentFilter !== 'daily' && selectedDate) {
        targetDate = selectedDate;
    }

    tasks.push({
        text: text,
        priority: taskPriority.value,
        date: targetDate,
        completed: false,
        scope: currentFilter 
    });

    saveTasks();
    renderTasks();
    closeModal();
}

addBtn.onclick = addTask;

// کیبورد لیسنرها
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'n' && !modal.classList.contains('active')) {
        e.preventDefault();
        openModal();
        setTimeout(() => taskInput.focus(), 100);
    }
});

// ===== STATS & UI =====
function updateStats(filtered) {
    const todayStr = getTodayISO();
    document.getElementById("totalTasks").textContent = filtered.length;
    document.getElementById("completedTasks").textContent = filtered.filter(t => t.completed).length;
    document.getElementById("inProgressTasks").textContent = filtered.filter(t => !t.completed && t.date >= todayStr).length;
    
    const overdue = filtered.filter(t => t.date < todayStr && !t.completed).length;
    document.getElementById("overdueTasks").textContent = overdue;
}

function updateCircleProgress(filtered) {
    const total = filtered.length;
    const completed = filtered.filter(t => t.completed).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    
    const circle = document.getElementById("circleProgress");
    if(circle) {
        circle.style.setProperty("--progress", percent + "%");
        document.getElementById("circlePercent").textContent = percent + "%";
    }
}

// INITIAL RUN
document.getElementById('Total').classList.add('active'); // ست کردن پیش‌فرض دکمه توتال
renderTasks();
