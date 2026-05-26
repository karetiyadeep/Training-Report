// ================= JSONBIN.IO CONFIG =================
const BIN_ID = "6a0b320dee5a733b12dca250";
const MASTER_KEY = "$2a$10$2aZJbFHGbvLQ.IP1/jfXOOA40e0n7/p35eDd0mjumEBsCBY92eaeS";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function getRecords() {
  try {
    const res = await fetch(`${BIN_URL}/latest`, {
      headers: { "X-Master-Key": MASTER_KEY }
    });
    const data = await res.json();
    return data.record.records || [];
  } catch (e) {
    console.error("Failed to fetch records:", e);
    return [];
  }
}

async function saveRecords(records) {
  try {
    await fetch(BIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": MASTER_KEY
      },
      body: JSON.stringify({ records })
    });
  } catch (e) {
    console.error("Failed to save records:", e);
  }
}

function showLoader(msg = "Loading...") {
  let el = document.getElementById("globalLoader");
  if (!el) {
    el = document.createElement("div");
    el.id = "globalLoader";
    el.className = "fixed inset-0 bg-white/70 z-[999] flex flex-col items-center justify-center";
    el.innerHTML = `<div class="w-12 h-12 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin mb-4"></div><p class="text-[#58a6ff] font-semibold text-lg">${msg}</p>`;
    document.body.appendChild(el);
  }
}

function hideLoader() {
  const el = document.getElementById("globalLoader");
  if (el) el.remove();
}


// ================= UI NAVIGATION =================
function goStep2() {
  const emp = document.getElementById("employeeName").value.trim();
  const pin = document.getElementById("employeePin").value.trim();
  if (!emp) return alert("Please enter the Employee Name");
  if (!pin) return alert("Please create a Security PIN / Password to protect your updates");

  document.getElementById("step1").classList.add("hidden");

  const s2 = document.getElementById("step2");
  s2.classList.remove("hidden");
  s2.classList.add("fade-in");
}

function goBack(currentId, targetId) {
  document.getElementById(currentId).classList.add("hidden");
  const target = document.getElementById(targetId);
  target.classList.remove("hidden");
  target.classList.add("fade-in");
}

// ================= CREATE =================
function createActivities() {
  const projectName = document.getElementById("projectName").value;
  const count = Number(document.getElementById("activityCount").value);

  if (!projectName) return alert("Please enter a Project Name");
  if (!count || count < 1) return alert("Please enter at least 1 activity");

  const box = document.getElementById("activityBox");
  box.innerHTML = "";

  document.getElementById("activityHeaderBadge").innerText = `${count} Activities`;

  for (let i = 0; i < count; i++) {
    box.innerHTML += `
      <div class="bg-white/5 border border-[#30363d] hover:border-[#30363d] p-5 rounded-2xl transition-all duration-300 group">
        
        <div class="flex justify-between items-center mb-4 pb-3 border-b border-[#30363d]">
          <h4 class="font-bold text-[#c9d1d9]">Activity ${i + 1}</h4>
          <i class="ph ph-calendar-check text-gray-500 group-hover:text-[#c9d1d9] transition-colors"></i>
        </div>

        <div class="space-y-3">
          <div>
            <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">Name</label>
            <input class="activityName glass-input w-full p-2.5 rounded-lg text-sm" placeholder="e.g. React Training"/>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">Start Date</label>
              <input type="date" class="startDate glass-input w-full p-2.5 rounded-lg text-sm"/>
            </div>
            <div>
              <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">End Date</label>
              <input type="date" class="endDate glass-input w-full p-2.5 rounded-lg text-sm"/>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">Trainer</label>
              <input class="trainerName glass-input w-full p-2.5 rounded-lg text-sm" placeholder="Trainer Name"/>
            </div>
            <div>
              <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">Progress %</label>
              <input type="number" min="0" max="100" class="progressPercent glass-input w-full p-2.5 rounded-lg text-sm" placeholder="0 - 100"/>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  document.getElementById("step2").classList.add("hidden");
  const s3 = document.getElementById("step3");
  s3.classList.remove("hidden");
  s3.classList.add("fade-in");
}

// ================= SAVE =================
async function finalSave() {
  const emp = document.getElementById("employeeName").value;
  const project = document.getElementById("projectName").value;
  const pin = document.getElementById("employeePin").value.trim();

  const n = document.querySelectorAll(".activityName");
  const s = document.querySelectorAll(".startDate");
  const e = document.querySelectorAll(".endDate");
  const t = document.querySelectorAll(".trainerName");
  const p = document.querySelectorAll(".progressPercent");

  let activities = [];
  let isValid = true;

  for (let i = 0; i < n.length; i++) {
    if (!n[i].value) isValid = false;
    activities.push({
      activityName: n[i].value,
      startDate: s[i].value,
      endDate: e[i].value,
      trainerName: t[i].value,
      progressPercent: p[i].value || 0
    });
  }

  if (!isValid) {
    if (!confirm("Some activities are missing names. Save anyway?")) return;
  }

  showLoader("Saving training plan...");
  const records = await getRecords();
  records.push({
    id: Date.now().toString(),
    employeeName: emp,
    projectName: project,
    pin: pin,
    activities: activities,
    createdAt: new Date().toISOString()
  });
  await saveRecords(records);
  hideLoader();

  const btn = document.querySelector("#step3 button:last-child");
  btn.innerHTML = `<i class="ph ph-check text-xl"></i><span>Saved Successfully!</span>`;

  setTimeout(() => { resetForm(); }, 1500);
}

function resetForm() {
  location.reload();
}

// ================= ADMIN LOGIN =================
function openAdminLogin() {
  document.getElementById("adminLogin").classList.remove("hidden");
  document.getElementById("adminLogin").querySelector('div').classList.add("fade-in");
}

function closeAdminLogin() {
  document.getElementById("adminLogin").classList.add("hidden");
}

function checkAdminLogin() {
  const id = document.getElementById("adminId").value;
  const pass = document.getElementById("adminPass").value;

  if (id === "admin" && pass === "1234") {
    closeAdminLogin();
    document.getElementById("adminPanel").classList.remove("hidden");
    loadAdminData();
  } else {
    alert("Invalid Admin Credentials! Access denied.");
  }
}

function closeAdminPanel() {
  document.getElementById("adminPanel").classList.add("hidden");
}

// ================= DELETE =================
async function deleteRecord(id, event) {
  if (event) event.stopPropagation();
  if (!confirm("Are you sure you want to delete this record?")) return;

  showLoader("Deleting record...");
  let records = await getRecords();
  records = records.filter(r => r.id !== id);
  await saveRecords(records);
  hideLoader();
  loadAdminData();
}

// ================= DETAIL =================
async function openDetail(id) {
  showLoader("Loading details...");
  const records = await getRecords();
  hideLoader();
  const r = records.find(rec => rec.id === id);
  if (!r) return;

  // Calculate overall progress
  let totalProg = 0;
  r.activities.forEach(a => totalProg += Number(a.progressPercent || 0));
  let avgProg = r.activities.length ? Math.round(totalProg / r.activities.length) : 0;

  let html = `
    <div class="mb-6 pb-6 border-b border-[#30363d] flex justify-between items-start">
      <div>
        <h2 class="text-3xl font-bold mb-1 text-white capitalize">${r.employeeName}</h2>
        <p class="text-[#c9d1d9] flex items-center gap-2"><i class="ph ph-gear"></i> Process: ${r.projectName}</p>
      </div>
      <div class="text-right">
        <div class="text-sm text-[#8b949e] mb-1">Overall Progress</div>
        <div class="text-2xl font-bold text-[#c9d1d9]">${avgProg}%</div>
      </div>
    </div>
    
    <div class="space-y-4">
  `;

  r.activities.forEach((a, i) => {
    let historyHtml = "";
    if (a.history && a.history.length > 0) {
      historyHtml = `<div class="mt-4 bg-black/50 rounded-lg p-3 text-xs text-[#8b949e] space-y-1.5 border border-white/5">
        <div class="font-bold text-[#c9d1d9] mb-2 uppercase tracking-wide text-[10px]">Update History:</div>`;
      a.history.forEach(h => {
        historyHtml += `<div><span class="text-gray-500">${h.date}</span> : <span class="line-through text-gray-500">${h.old}%</span> ➔ <span class="text-white font-bold">${h.new}%</span>${h.comment ? ` <span class="text-[#58a6ff] italic">("${h.comment}")</span>` : ''}</div>`;
      });
      historyHtml += `</div>`;
    }

    html += `
      <div class="bg-white/5 border border-[#30363d] rounded-xl p-4 flex flex-col gap-2">
        <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div class="flex gap-4 items-center">
            <div class="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center font-bold border border-[#30363d] shrink-0">
              ${i + 1}
            </div>
            <div>
              <h4 class="font-bold text-lg leading-tight mb-1 text-white">${a.activityName || 'Unnamed Activity'}</h4>
              <div class="text-sm text-[#8b949e] flex items-center gap-3">
                <span class="flex items-center gap-1"><i class="ph ph-user"></i> <strong class="text-white font-semibold capitalize">${a.trainerName || 'N/A'}</strong></span>
                <span class="flex items-center gap-1"><i class="ph ph-calendar"></i> ${a.startDate} to ${a.endDate}</span>
              </div>
            </div>
          </div>
          
          <div class="shrink-0 w-full sm:w-auto text-right mt-3 sm:mt-0">
            <div class="text-xs text-[#8b949e] mb-1 uppercase tracking-wider">Completion</div>
            <div class="font-bold text-lg text-white">${a.progressPercent || 0}%</div>
            <div class="w-full sm:w-32 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
              <div class="h-full bg-white rounded-full" style="width: ${a.progressPercent || 0}%"></div>
            </div>
          </div>
        </div>
        ${historyHtml}
      </div>
    `;
  });

  html += `</div>`;

  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("detailModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("detailModal").classList.add("hidden");
}

// ================= ADMIN LIVE =================
async function loadAdminData() {
  const box = document.getElementById("adminData");
  const search = document.getElementById("searchEmp").value.toLowerCase();
  box.innerHTML = `<div class="text-center py-10 text-[#8b949e]"><div class="w-8 h-8 border-4 border-[#58a6ff] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>Loading...</div>`;
  const records = await getRecords();

  records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  box.innerHTML = "";

  if (records.length === 0) {
    box.innerHTML = `
      <div class="text-center py-10 text-gray-500 flex flex-col items-center">
        <i class="ph ph-empty text-4xl mb-2"></i>
        <p>No records found.</p>
      </div>
    `;
    loadChart();
    return;
  }

  // Populate filterProject dropdown dynamically
  const filterDropdown = document.getElementById("filterProject");
  const currentSelection = filterDropdown ? filterDropdown.value : "";

  // Get unique project/process names from all records
  const uniqueProjects = [...new Set(records.map(r => r.projectName))].filter(Boolean).sort();

  if (filterDropdown) {
    let dropdownHtml = `<option value="">All Processes</option>`;
    uniqueProjects.forEach(proj => {
      dropdownHtml += `<option value="${proj}">${proj}</option>`;
    });
    filterDropdown.innerHTML = dropdownHtml;
    
    // Attempt to restore selection
    filterDropdown.value = currentSelection;
    if (filterDropdown.value !== currentSelection) {
      filterDropdown.value = "";
    }
  }

  const selectedProject = filterDropdown ? filterDropdown.value : "";

  // Filter records first based on search AND dropdown selection
  const filteredRecords = records.filter(r => {
    const matchesSearch = r.employeeName.toLowerCase().includes(search) || r.projectName.toLowerCase().includes(search);
    const matchesProject = selectedProject === "" || r.projectName === selectedProject;
    return matchesSearch && matchesProject;
  });

  if (filteredRecords.length === 0) {
    box.innerHTML = `<div class="text-center py-5 text-gray-500">No matches found.</div>`;
    loadChart();
    return;
  }

  // Group by Project
  const grouped = {};
  filteredRecords.forEach(r => {
    if (!grouped[r.projectName]) grouped[r.projectName] = [];
    grouped[r.projectName].push(r);
  });

  // Render HTML
  for (const [project, projRecords] of Object.entries(grouped)) {
    box.innerHTML += `
      <div class="mt-6 mb-3 px-2 flex items-center gap-2 text-[#c9d1d9]">
        <i class="ph ph-gear text-xl"></i>
        <h3 class="text-xl font-bold uppercase tracking-wider">Process: ${project}</h3>
        <span class="ml-2 text-xs bg-white/10 text-[#c9d1d9] py-1 px-2 rounded-full">${projRecords.length} Employees</span>
      </div>
    `;

    projRecords.forEach(r => {
      box.innerHTML += `
        <div onclick="openDetail('${r.id}')" class="group bg-[#21262d] hover:bg-[#30363d] border-[#30363d] p-4 rounded-xl border border-white/5 hover:border-[#30363d] flex justify-between items-center cursor-pointer transition-all mb-2 ml-2 sm:ml-6">
          
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500/20 to-violet-500/20 text-[#c9d1d9] flex items-center justify-center text-lg border border-cyan-500/30 font-bold shadow-inner shadow-black/50">
              ${r.employeeName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 class="font-bold text-lg text-white group-hover:text-[#c9d1d9] transition-colors">${r.employeeName}</h4>
            </div>
          </div>

          <div class="flex gap-2">
            <button onclick="openAdminEdit('${r.id}', event)" class="opacity-0 group-hover:opacity-100 bg-[#21262d] hover:bg-[#30363d] border-[#30363d] hover:text-amber-400 text-[#8b949e] w-9 h-9 rounded-full flex items-center justify-center transition-all border border-[#30363d]">
              <i class="ph ph-pencil-simple"></i>
            </button>
            <button onclick="deleteRecord('${r.id}', event)" class="opacity-0 group-hover:opacity-100 bg-[#21262d] hover:bg-[#30363d] border-[#30363d] hover:text-rose-400 text-[#8b949e] w-9 h-9 rounded-full flex items-center justify-center transition-all border border-[#30363d]">
              <i class="ph ph-trash"></i>
            </button>
          </div>

        </div>
      `;
    });
  }

  loadChart();
}

// ================= EXCEL EXPORT FOR ADMIN =================
async function downloadAdminExcel() {
  showLoader("Preparing Admin export...");
  let records = await getRecords();
  hideLoader();

  if (records.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Get selected project/process from the dropdown
  const filterDropdown = document.getElementById("filterProject");
  const selectedProject = filterDropdown ? filterDropdown.value : "";

  let filtered = records;
  let promptMsg = "Admin Export: Enter an Employee Name to filter, or leave blank to export all records:";

  if (selectedProject !== "") {
    // Only include the selected process
    filtered = records.filter(r => r.projectName === selectedProject);
    promptMsg = `Admin Export (Process: ${selectedProject}): Enter an Employee Name to filter, or leave blank to export all records for this process:`;
  }

  const searchName = prompt(promptMsg);
  if (searchName === null) return; // User clicked Cancel

  if (searchName.trim() !== "") {
    filtered = filtered.filter(r => r.employeeName.toLowerCase().includes(searchName.trim().toLowerCase()));
    if (filtered.length === 0) {
      alert(`No training records found for "${searchName}" under ${selectedProject !== "" ? `process "${selectedProject}"` : "all processes"}.`);
      return;
    }
  }

  // Generate custom name for Excel file
  let exportName = selectedProject !== "" ? selectedProject : "";
  if (searchName.trim() !== "") {
    exportName = exportName !== "" ? `${exportName}_${searchName.trim()}` : searchName.trim();
  }

  generateExcelFile(filtered, exportName);
}

// ================= EXCEL EXPORT FOR EMPLOYEE =================
async function downloadEmployeeExcel() {
  const empName = prompt("Enter your Employee Name to export your training data:");
  if (empName === null || empName.trim() === "") return;

  const pin = prompt("Enter your Security PIN / Password:");
  if (pin === null || pin.trim() === "") return;

  showLoader("Verifying and preparing export...");
  const records = await getRecords();
  hideLoader();

  const matched = records.filter(r => {
    const storedName = (r.employeeName || "").toLowerCase().trim();
    const storedPin = (r.pin || "").trim();
    return storedName === empName.trim().toLowerCase() && storedPin === pin.trim();
  });

  if (matched.length === 0) {
    alert("Incorrect Employee Name or Security PIN! Export denied.");
    return;
  }

  generateExcelFile(matched, empName.trim());
}

// ================= HELPER TO GENERATE EXCEL =================
function generateExcelFile(recordsList, filterName) {
  const rows = [];

  // Sort project-wise (Process-wise) first, then employee-wise
  const sortedRecords = [...recordsList].sort((a, b) => {
    const projA = (a.projectName || "").toLowerCase().trim();
    const projB = (b.projectName || "").toLowerCase().trim();
    const nameA = (a.employeeName || "").toLowerCase().trim();
    const nameB = (b.employeeName || "").toLowerCase().trim();

    if (projA < projB) return -1;
    if (projA > projB) return 1;
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  sortedRecords.forEach(r => {
    r.activities.forEach(a => {
      rows.push({
        'Employee Name': r.employeeName,
        'Process Name': r.projectName, // Changed key from Project Name to Process Name
        'Activity Name': a.activityName,
        'Trainer Name': a.trainerName,
        'Start Date': a.startDate,
        'End Date': a.endDate,
        'Progress': a.progressPercent + "%"
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();

  // Auto width columns roughly
  const colWidths = [{ wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 10 }];
  ws['!cols'] = colWidths;

  const fileName = filterName !== "" ? `Training_Export_${filterName}.xlsx` : "Training_Project_Export.xlsx";

  XLSX.utils.book_append_sheet(wb, ws, "Training Data");
  XLSX.writeFile(wb, fileName);
}

// ================= CHART =================
let chart;

async function loadChart() {
  const records = await getRecords();
  let labels = [], values = [];

  records.forEach(r => {
    let total = 0;
    r.activities.forEach(a => {
      total += Number(a.progressPercent || 0);
    });
    let avg = r.activities.length ? total / r.activities.length : 0;

    // Check if employee already exists in chart, if so average them or append name
    labels.push(r.employeeName + " (" + r.projectName + ")");
    values.push(avg);
  });

  if (chart) chart.destroy();

  const ctx = document.getElementById("progressChart").getContext('2d');

  // Custom gradient for chart
  let gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)');   // Violet
  gradient.addColorStop(1, 'rgba(37, 99, 235, 0.2)');    // Blue

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Project Completion %",
        data: values,
        backgroundColor: gradient,
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          titleFont: { family: 'Outfit', size: 14 },
          bodyFont: { family: 'Outfit', size: 14 },
          padding: 12,
          cornerRadius: 8,
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(255,255,255,0.05)',
            drawBorder: false,
          },
          ticks: {
            color: 'rgba(255,255,255,0.5)',
            font: { family: 'Outfit' }
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: 'rgba(255,255,255,0.5)',
            font: { family: 'Outfit' },
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });
}

// ================= EMPLOYEE UPDATE PROGRESS =================
function openUpdateLogin() {
  document.getElementById("updateLogin").classList.remove("hidden");
  document.getElementById("updateLogin").querySelector('div').classList.add("fade-in");
}

function closeUpdateLogin() {
  document.getElementById("updateLogin").classList.add("hidden");
}

async function checkUpdateLogin() {
  const name = document.getElementById("updateEmployeeName").value.trim().toLowerCase();
  const pin = document.getElementById("updateEmployeePin").value.trim();
  if (!name) return alert("Please enter your name");
  if (!pin) return alert("Please enter your Security PIN");

  showLoader("Searching records...");
  const records = await getRecords();
  hideLoader();

  const myRecords = records.filter(r => {
    const storedName = (r.employeeName || "").toLowerCase().trim();
    const storedPin = (r.pin || "").trim();
    return storedName === name && storedPin === pin;
  });

  if (myRecords.length === 0) {
    return alert("Incorrect Employee Name or Security PIN! Please try again.");
  }

  closeUpdateLogin();

  if (myRecords.length === 1) {
    openEditDetail(myRecords[0].id);
  } else {
    openEmployeeTrainingList(myRecords);
  }
}

function openEmployeeTrainingList(myRecords) {
  const box = document.getElementById("employeeProjectsList");
  box.innerHTML = "";

  myRecords.forEach(r => {
    box.innerHTML += `
      <div onclick="openEditDetail('${r.id}')" class="bg-[#21262d] hover:bg-[#30363d] border-[#30363d] p-4 rounded-xl border border-[#30363d] cursor-pointer transition-all mb-2 flex justify-between items-center">
        <div>
          <h4 class="font-bold text-lg text-white">${r.projectName}</h4>
          <p class="text-sm text-[#8b949e]">${r.activities.length} Activities</p>
        </div>
        <i class="ph ph-arrow-right text-[#c9d1d9]"></i>
      </div>
    `;
  });

  document.getElementById("employeeTrainingListModal").classList.remove("hidden");
}

function closeEmployeeTrainingList() {
  document.getElementById("employeeTrainingListModal").classList.add("hidden");
}

async function openEditDetail(recordId) {
  closeEmployeeTrainingList();

  showLoader("Loading your training...");
  const records = await getRecords();
  hideLoader();
  const r = records.find(rec => rec.id === recordId);
  if (!r) return;

  let html = `
    <div class="mb-6 pb-6 border-b border-[#30363d]">
      <h2 class="text-2xl font-bold mb-1">Process: ${r.projectName}</h2>
      <p class="text-[#8b949e]">Update your activity progress</p>
    </div>
    <div class="space-y-4">
  `;

  r.activities.forEach((a, i) => {
    html += `
      <div class="bg-white/5 border border-[#30363d] rounded-xl p-4 flex flex-col gap-3">
        <h4 class="font-bold text-lg leading-tight text-[#c9d1d9]">${i + 1}. ${a.activityName || 'Unnamed Activity'}</h4>
        <div class="flex items-center gap-4">
          <label class="text-sm text-[#8b949e] whitespace-nowrap">Progress %</label>
          <input type="number" id="editProg_${i}" value="${a.progressPercent || 0}" min="0" max="100" class="glass-input w-full p-2.5 rounded-lg text-sm" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm text-[#8b949e]">Comment <span class="text-[#58a6ff]">(optional)</span></label>
          <textarea id="editComment_${i}" rows="2" placeholder="Add a note or reason for this update..." class="glass-input w-full p-2.5 rounded-lg text-sm resize-none"></textarea>
        </div>
      </div>
    `;
  });

  html += `
    </div>
    <button onclick="saveProgressUpdate('${r.id}')" class="w-full bg-[#238636] border border-[#30363d] text-white hover:bg-[#2ea043] text-white font-bold py-4 rounded-xl mt-6 transition-all shadow-lg shadow-sm">
      Save Updates
    </button>
  `;

  document.getElementById("editModalContent").innerHTML = html;
  document.getElementById("editDetailModal").classList.remove("hidden");
}

function closeEditModal() {
  document.getElementById("editDetailModal").classList.add("hidden");
}

async function saveProgressUpdate(recordId) {
  showLoader("Saving progress...");
  let records = await getRecords();
  const rIndex = records.findIndex(rec => rec.id === recordId);
  if (rIndex === -1) { hideLoader(); return; }

  const r = records[rIndex];
  for (let i = 0; i < r.activities.length; i++) {
    const inputVal = document.getElementById("editProg_" + i).value;
    const commentVal = (document.getElementById("editComment_" + i)?.value || "").trim();
    const oldVal = r.activities[i].progressPercent || 0;

    if (String(oldVal) !== String(inputVal) || commentVal) {
      r.activities[i].history = r.activities[i].history || [];
      r.activities[i].history.push({
        date: new Date().toLocaleString(),
        old: oldVal,
        new: inputVal,
        comment: commentVal || null
      });
      r.activities[i].progressPercent = inputVal;
    }
  }

  await saveRecords(records);
  hideLoader();
  closeEditModal();
  alert("Progress updated successfully! 🎉");
  loadChart();
}

// ================= ADMIN FULL EDIT =================
async function openAdminEdit(recordId, event) {
  if (event) event.stopPropagation();

  showLoader("Loading record...");
  const records = await getRecords();
  hideLoader();
  const r = records.find(rec => rec.id === recordId);
  if (!r) return;

  let html = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-[#30363d]">
      <div>
        <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">Employee Name</label>
        <input type="text" id="adminEditEmpName" value="${r.employeeName}" class="glass-input w-full p-2.5 rounded-lg text-sm" />
      </div>
      <div>
        <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">Process Name</label>
        <input type="text" id="adminEditProjName" value="${r.projectName}" class="glass-input w-full p-2.5 rounded-lg text-sm" />
      </div>
      <div>
        <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">Security PIN / Password</label>
        <input type="text" id="adminEditPin" value="${r.pin || ''}" placeholder="PIN or Password" class="glass-input w-full p-2.5 rounded-lg text-sm" />
      </div>
    </div>
    
    <h4 class="font-bold text-lg mb-4">Activities</h4>
    <div class="space-y-4">
  `;

  r.activities.forEach((a, i) => {
    html += `
      <div class="bg-white/5 border border-[#30363d] rounded-xl p-4 flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <h5 class="font-bold text-[#c9d1d9]">Activity ${i + 1}</h5>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div class="md:col-span-2">
            <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">Activity Name</label>
            <input type="text" id="adminEditActName_${i}" value="${a.activityName}" class="glass-input w-full p-2.5 rounded-lg text-sm" />
          </div>
          <div>
            <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">Start Date</label>
            <input type="date" id="adminEditStart_${i}" value="${a.startDate}" class="glass-input w-full p-2.5 rounded-lg text-sm" />
          </div>
          <div>
            <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">End Date</label>
            <input type="date" id="adminEditEnd_${i}" value="${a.endDate}" class="glass-input w-full p-2.5 rounded-lg text-sm" />
          </div>
          <div>
            <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">Progress %</label>
            <input type="number" id="adminEditProg_${i}" value="${a.progressPercent}" min="0" max="100" class="glass-input w-full p-2.5 rounded-lg text-sm" />
          </div>
          <div class="md:col-span-5">
            <label class="text-xs text-[#8b949e] uppercase tracking-wider mb-1 block">Trainer Name</label>
            <input type="text" id="adminEditTrainer_${i}" value="${a.trainerName}" class="glass-input w-full p-2.5 rounded-lg text-sm" />
          </div>
        </div>
      </div>
    `;
  });

  html += `
    </div>
    <button onclick="saveAdminEdit('${r.id}')" class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-4 rounded-xl mt-6 transition-all shadow-lg shadow-emerald-500/20">
      Save All Changes
    </button>
  `;

  document.getElementById("adminEditModalContent").innerHTML = html;
  document.getElementById("adminEditDetailModal").classList.remove("hidden");
}

function closeAdminEditModal() {
  document.getElementById("adminEditDetailModal").classList.add("hidden");
}

async function saveAdminEdit(recordId) {
  showLoader("Saving changes...");
  let records = await getRecords();
  const rIndex = records.findIndex(rec => rec.id === recordId);
  if (rIndex === -1) { hideLoader(); return; }

  const r = records[rIndex];

  r.employeeName = document.getElementById("adminEditEmpName").value;
  r.projectName = document.getElementById("adminEditProjName").value;
  r.pin = document.getElementById("adminEditPin").value.trim();

  for (let i = 0; i < r.activities.length; i++) {
    r.activities[i].activityName = document.getElementById("adminEditActName_" + i).value;
    r.activities[i].startDate = document.getElementById("adminEditStart_" + i).value;
    r.activities[i].endDate = document.getElementById("adminEditEnd_" + i).value;
    r.activities[i].progressPercent = document.getElementById("adminEditProg_" + i).value;
    r.activities[i].trainerName = document.getElementById("adminEditTrainer_" + i).value;
  }

  await saveRecords(records);
  hideLoader();
  closeAdminEditModal();
  alert("Record fully updated by Admin! 🔐");
  loadAdminData();
}



