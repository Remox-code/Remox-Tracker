/* CONFIG */
const DEFAULT_ICON = "../../assets/images/logo.jpg";

/* STATE */
let habits = JSON.parse(localStorage.getItem("habits")) || [];

function saveHabits(){
  localStorage.setItem("habits", JSON.stringify(habits));
}

/* Theme detection */
function getThemeClass(name){
  const txt = name.toLowerCase();
  if(txt.includes('water')) return 'water';
  if(txt.includes('gym')) return 'gym';
  if(txt.includes('meditate')) return 'meditate';
  if(txt.includes('book')) return 'book';
  if(txt.includes('sleep')) return 'sleep';
  return 'water';
}

/* RENDER */
function renderHabits(){
  const container = document.getElementById("habits-container");
  container.innerHTML = "";

  if (habits.length === 0){
    container.innerHTML = `
      <div style="text-align:center;color:#9faec0;margin-top:60px;">
        <h2>No habits yet</h2>
        <p>Click <b>"Add Habit"</b> to start building awesome routines! or go to "Any List" and start</p>
      </div>`;
    return;
  }

  habits.forEach((habit,index)=>{
    const theme = getThemeClass(habit.title);
    const icon = habit.icon || DEFAULT_ICON;
    const card = document.createElement('div');
    card.className = `habit-card ${theme}`;
    card.innerHTML = `
      <button class="delete-btn" data-index="${index}">🗑</button>

      <div class="left">
        <img src="${icon}" alt="">
        <div class="habit-info">
          <h3>${habit.title}</h3>
          <h4>${habit.desc}</h4>
        </div>
      </div>

      <div>
        <h3>${habit.days || 0} Days 🔥</h3>
        <div class="row-percent">
          <span class="percent">${habit.percent || 0}%</span>
          <div class="progress">
            <div class="progress-bar" style="width:${habit.percent || 0}%"></div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  /* DELETE EVENTS */
  document.querySelectorAll(".delete-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const idx = btn.dataset.index;
      habits.splice(idx,1);
      saveHabits();
      renderHabits();
    });
  });
}

/* MODAL */
const modal = document.getElementById("habit-modal");
const addBtn = document.getElementById("add-habit-btn");
const cancelBtn = document.getElementById("cancel-habit");
const saveBtn = document.getElementById("save-habit");
const iconInput = document.getElementById("habit-icon");
let tempIcon = null;

addBtn.addEventListener('click',()=> modal.style.display='flex');
cancelBtn.addEventListener('click',closeModal);

function closeModal(){
  modal.style.display='none';
  document.getElementById("habit-name").value="";
  document.getElementById("habit-desc").value="";
  iconInput.value="";
  tempIcon=null;
}

iconInput.addEventListener('change',()=>{
  const f = iconInput.files[0];
  if(f) tempIcon = URL.createObjectURL(f);
});

/* SAVE */
saveBtn.addEventListener('click',()=>{
  const name=document.getElementById("habit-name").value.trim();
  const desc=document.getElementById("habit-desc").value.trim();
  if(!name){alert("Please enter habit name");return;}
  habits.push({
    title:name,
    desc:desc || "No description",
    icon:tempIcon || DEFAULT_ICON,
    days:0,
    percent:0
  });
  saveHabits();
  renderHabits();
  closeModal();
});

/* INIT */
renderHabits();
