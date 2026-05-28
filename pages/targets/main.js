(() => {
  const targetsContainer = document.getElementById("targets-container");
  if (!targetsContainer) return; // فقط روی صفحه targets اجرا شود

  const LS_KEY = "remox_targets";

  const modal = document.getElementById("targetModal");
  const openModalBtn = document.getElementById("openTargetModal");
  const closeModalBtn = document.getElementById("closeTargetModal");
  const addBtn = document.getElementById("addTargetBtn");

  const titleInput = document.getElementById("targetTitle");
  const descInput  = document.getElementById("targetDesc");

  const ovTotal = document.getElementById("ovTotal");
  const ovPending = document.getElementById("ovPending");
  const ovCompleted = document.getElementById("ovCompleted");
  const ovMessageCard = document.getElementById("ovMessageCard");
  const ovMessageText = document.getElementById("ovMessageText");
  const ovMessageSub = document.getElementById("ovMessageSub");

  let currentView = "yearly"; // yearly | monthly | weekly
  let targets = safeLoad();

  function safeLoad() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY));
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(targets));
  }

  function uid() {
    return "t_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  // Tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentView = btn.dataset.view;
      render();
    });
  });

  // Modal open/close
  function openModal() {
    modal.classList.add("active");
    titleInput.focus();
  }
  function closeModal() {
    modal.classList.remove("active");
    clearModalFields();
  }
  function clearModalFields() {
    titleInput.value = "";
    descInput.value = "";
    titleInput.style.border = "";
  }

  openModalBtn?.addEventListener("click", openModal);
  closeModalBtn?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Add
  function addTarget() {
    const title = titleInput.value.trim();
    const desc  = descInput.value.trim();

    if (!title) {
      titleInput.style.border = "2px solid rgba(248,113,113,0.9)";
      titleInput.focus();
      return;
    }

    const newTarget = {
      id: uid(),
      view: currentView,
      title,
      desc,
      completed: false,
      createdAt: new Date().toISOString()
    };

    targets.unshift(newTarget); // جدیدترین بالا بیاد
    save();
    render();

    // نکته مهم: بعد از افزودن، فیلدها پاک شوند
    closeModal();
  }

  addBtn?.addEventListener("click", addTarget);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
    if (e.key === "Enter" && modal.classList.contains("active")) {
      // داخل textarea اینتر طبیعی باشه
      if (document.activeElement === descInput) return;
      addTarget();
    }
  });

  // Smart message thresholds
  function getMood(percent) {
    if (percent >= 100) return 100;
    if (percent >= 80) return 80;
    if (percent >= 60) return 60;
    if (percent >= 40) return 40;
    if (percent >= 20) return 20;
    return 0;
  }

  function setMessageFor(percent, total, completed, pending) {
    // reset mood classes
    ovMessageCard.classList.remove("mood-0","mood-20","mood-40","mood-60","mood-80","mood-100");
    const mood = getMood(percent);
    ovMessageCard.classList.add(`mood-${mood}`);

    if (total === 0) {
      ovMessageText.textContent = "Add your first target to begin.";
      ovMessageSub.textContent = "Pick a simple goal and check it off when done.";
      return;
    }

    // متن‌های مخصوص برای 20/40/60/80/100
    if (mood === 0) {
      ovMessageText.textContent = "No progress yet — you’ve got this.";
      ovMessageSub.textContent = `0% completed • ${pending} pending. Start with the easiest one.`;
    } else if (mood === 20) {
      ovMessageText.textContent = "Nice start — momentum is building.";
      ovMessageSub.textContent = `${percent}% completed • Keep it consistent.`;
    } else if (mood === 40) {
      ovMessageText.textContent = "Good pace — you’re warming up.";
      ovMessageSub.textContent = `${percent}% completed • Try finishing one more today.`;
    } else if (mood === 60) {
      ovMessageText.textContent = "Solid progress — stay locked in.";
      ovMessageSub.textContent = `${percent}% completed • You’re past the halfway mark.`;
    } else if (mood === 80) {
      ovMessageText.textContent = "Almost there — finish strong.";
      ovMessageSub.textContent = `${percent}% completed • Close the remaining ${pending}.`;
    } else if (mood === 100) {
      ovMessageText.textContent = "All done — targets completed.";
      ovMessageSub.textContent = `${completed}/${total} completed • Add the next challenge.`;
    }
  }

  // Overview per view
  function updateOverview(viewItems) {
    const total = viewItems.length;
    const completed = viewItems.filter(t => t.completed).length;
    const pending = total - completed;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    ovTotal.textContent = total;
    ovCompleted.textContent = completed;
    ovPending.textContent = pending;

    setMessageFor(percent, total, completed, pending);
  }

  // Render
  function render() {
    const viewItems = targets.filter(t => t.view === currentView);

    updateOverview(viewItems);

    targetsContainer.innerHTML = "";

    if (viewItems.length === 0) {
      targetsContainer.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon">🎯</div>
          <h3>No targets in this view</h3>
          <p>Add your first ${currentView} target.</p>
          <button class="empty-add-btn" id="emptyTargetAddBtn">+ Add Target</button>
        </div>
      `;
      document.getElementById("emptyTargetAddBtn").onclick = openModal;
      return;
    }

    viewItems.forEach(item => {
      const card = document.createElement("div");
      card.className = "target-card" + (item.completed ? " completed" : "");

      card.innerHTML = `
        <div class="target-top">
          <div>
            <h3 class="target-title">${escapeHtml(item.title)}</h3>
          </div>

          <div class="target-actions">
            <label class="target-check">
              <input type="checkbox" ${item.completed ? "checked" : ""} />
              
            </label>
            <button class="target-delete" type="button" title="Delete">✕</button>
          </div>
        </div>

        <div class="target-desc">${item.desc ? escapeHtml(item.desc) : "<span style='opacity:.7'>No description</span>"}</div>
      `;

      // checkbox
      const checkbox = card.querySelector('input[type="checkbox"]');
      checkbox.addEventListener("change", () => {
        item.completed = checkbox.checked;
        save();
        render();
      });

      // delete
      const delBtn = card.querySelector(".target-delete");
      delBtn.addEventListener("click", () => {
        targets = targets.filter(t => t.id !== item.id);
        save();
        render();
      });

      targetsContainer.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  render();
})();
