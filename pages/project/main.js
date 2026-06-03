const STORAGE_KEY = "remox_projects";

const projectSearch = document.getElementById("projectSearch");
const projectsGrid = document.getElementById("projectsGrid");
const sortProjects = document.getElementById("sortProjects");
const filterButtons = document.querySelectorAll(".filter-btn");

const totalProjectsEl = document.getElementById("totalProjects");
const activeProjectsEl = document.getElementById("activeProjects");
const completedProjectsEl = document.getElementById("completedProjects");
const pendingProjectsEl = document.getElementById("pendingProjects");

const projectModal = document.getElementById("projectModal");
const openProjectModal = document.getElementById("openProjectModal");
const closeProjectModal = document.getElementById("closeProjectModal");
const saveProjectBtn = document.getElementById("saveProjectBtn");

const projectTitle = document.getElementById("projectTitle");
const projectDescription = document.getElementById("projectDescription");
const projectStatus = document.getElementById("projectStatus");
const projectPriority = document.getElementById("projectPriority");
const projectProgress = document.getElementById("projectProgress");
const projectDeadline = document.getElementById("projectDeadline");
const projectMembers = document.getElementById("projectMembers");

let currentFilter = "all";

/* بدون پروژه پیش‌فرض */
let projects = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function saveProjectsToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function updateStats() {
  totalProjectsEl.textContent = projects.length;
  activeProjectsEl.textContent = projects.filter(
    (p) => p.status === "active",
  ).length;
  completedProjectsEl.textContent = projects.filter(
    (p) => p.status === "completed",
  ).length;
  pendingProjectsEl.textContent = projects.filter(
    (p) => p.status === "pending",
  ).length;
}

function getFilteredProjects() {
  let filtered = [...projects];

  const searchValue = projectSearch.value.trim().toLowerCase();

  if (searchValue) {
    filtered = filtered.filter(
      (project) =>
        project.title.toLowerCase().includes(searchValue) ||
        project.description.toLowerCase().includes(searchValue) ||
        project.members.join(" ").toLowerCase().includes(searchValue),
    );
  }

  if (currentFilter !== "all") {
    filtered = filtered.filter((project) => project.status === currentFilter);
  }

  const sortValue = sortProjects.value;

  if (sortValue === "progress-high") {
    filtered.sort((a, b) => b.progress - a.progress);
  } else if (sortValue === "progress-low") {
    filtered.sort((a, b) => a.progress - b.progress);
  } else if (sortValue === "deadline-near") {
    filtered.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  } else {
    filtered.sort((a, b) => b.createdAt - a.createdAt);
  }

  return filtered;
}

function createProjectCard(project) {
  return `
    <article class="project-card">
      <div class="project-top">
        <div>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.description}</p>
        </div>
        <div>
          <span class="status-badge status-${project.status}">${project.status}</span>
        </div>
      </div>

      <div class="project-meta">
        <span class="priority-badge priority-${project.priority}">${project.priority} priority</span>
        <span>📅 ${project.deadline || "No deadline"}</span>
        <span>👥 ${project.members.length} Members</span>
      </div>

      <div class="progress-wrap">
        <div class="progress-head">
          <span>Progress</span>
          <span>${project.progress}%</span>
        </div>
        <div class="progress-bar">
          <span style="width:${project.progress}%"></span>
        </div>
      </div>

      <div class="members">
        ${
          project.members.length
            ? project.members
                .map((member) => `<span class="member-pill">${member}</span>`)
                .join("")
            : `<span class="member-pill">No members</span>`
        }
      </div>

      <div class="project-actions">
        <button class="delete-project-btn" data-id="${project.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderProjects() {
  const filteredProjects = getFilteredProjects();

  if (!filteredProjects.length) {
    projectsGrid.innerHTML = `
      <div class="empty-projects">
        <h3>No projects found</h3>
        <p>Try creating a new project or changing filters.</p>
      </div>
    `;
    return;
  }

  projectsGrid.innerHTML = filteredProjects.map(createProjectCard).join("");
}

function clearModalFields() {
  projectTitle.value = "";
  projectDescription.value = "";
  projectStatus.value = "active";
  projectPriority.value = "high";
  projectProgress.value = 0;
  projectDeadline.value = "";
  projectMembers.value = "";
}

function openModal() {
  projectModal.classList.add("show");
}

function closeModal() {
  projectModal.classList.remove("show");
}

function addProject() {
  const title = projectTitle.value.trim();
  const description = projectDescription.value.trim();
  const status = projectStatus.value;
  const priority = projectPriority.value;
  const progress = Number(projectProgress.value);
  const deadline = projectDeadline.value;
  const members = projectMembers.value
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  if (!title || !description) {
    alert("Please fill in title and description.");
    return;
  }

  const newProject = {
    id: Date.now(),
    title,
    description,
    status,
    priority,
    progress: Math.max(0, Math.min(100, progress)),
    deadline,
    members,
    createdAt: Date.now(),
  };

  projects.unshift(newProject);
  saveProjectsToStorage();
  updateStats();
  renderProjects();
  clearModalFields();
  closeModal();
}

function deleteProject(projectId) {
  projects = projects.filter((project) => project.id !== Number(projectId));
  saveProjectsToStorage();
  updateStats();
  renderProjects();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderProjects();
  });
});

projectSearch.addEventListener("input", renderProjects);
sortProjects.addEventListener("change", renderProjects);

openProjectModal.addEventListener("click", openModal);
closeProjectModal.addEventListener("click", closeModal);

projectModal.addEventListener("click", (e) => {
  if (e.target === projectModal) {
    closeModal();
  }
});

saveProjectBtn.addEventListener("click", addProject);

projectsGrid.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-project-btn")) {
    const projectId = e.target.dataset.id;
    deleteProject(projectId);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  updateStats();
  renderProjects();
});
