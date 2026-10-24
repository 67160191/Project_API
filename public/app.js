/**
 * TaskFlow Pro — Client Application Logic (Vanilla JavaScript)
 * Calls real APIs:
 * 1. GET /api/v1/tasks (Read tasks list with query filter)
 * 2. GET /api/v1/analytics/summary (Microservice Task Analytics)
 * 3. GET /api/v1/weather (Live weather integration)
 * 4. POST /api/v1/tasks (Create task with client-side validation)
 * 5. PATCH /api/v1/tasks/:id/status (Quick update status)
 * 6. DELETE /api/v1/tasks/:id (Delete task)
 * 7. GET /api/v1/tasks/:id/weather (Task Weather Modal with Resilience info)
 */

document.addEventListener("DOMContentLoaded", () => {
  // Global State
  let allTasks = [];
  let currentFilter = "all";
  let searchQuery = "";

  // DOM Elements
  const tasksGrid = document.getElementById("tasksGrid");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const errorState = document.getElementById("errorState");
  const errorStateMessage = document.getElementById("errorStateMessage");
  const emptyState = document.getElementById("emptyState");
  const globalAlert = document.getElementById("globalAlert");
  const alertMessage = document.getElementById("alertMessage");
  const toastContainer = document.getElementById("toastContainer");

  // Counters
  const countAll = document.getElementById("countAll");
  const countPending = document.getElementById("countPending");
  const countInProgress = document.getElementById("countInProgress");
  const countCompleted = document.getElementById("countCompleted");

  // Stats
  const statTotal = document.getElementById("statTotal");
  const statCompleted = document.getElementById("statCompleted");
  const statInProgress = document.getElementById("statInProgress");
  const statRate = document.getElementById("statRate");
  const weatherTemp = document.getElementById("weatherTemp");
  const weatherDesc = document.getElementById("weatherDesc");

  // Search & Filter
  const taskSearchInput = document.getElementById("taskSearchInput");
  const filterTabs = document.querySelectorAll(".tab-btn");

  // Create Task Modal
  const createTaskModal = document.getElementById("createTaskModal");
  const openCreateModalBtn = document.getElementById("openCreateModalBtn");
  const closeCreateModalBtn = document.getElementById("closeCreateModalBtn");
  const cancelCreateBtn = document.getElementById("cancelCreateBtn");
  const createTaskForm = document.getElementById("createTaskForm");
  const submitSpinner = document.getElementById("submitSpinner");
  const submitCreateBtn = document.getElementById("submitCreateBtn");

  // Weather Modal
  const weatherModal = document.getElementById("weatherModal");
  const closeWeatherModalBtn = document.getElementById("closeWeatherModalBtn");
  const closeWeatherBtn = document.getElementById("closeWeatherBtn");
  const weatherModalBody = document.getElementById("weatherModalBody");

  // Retry Button
  const retryFetchBtn = document.getElementById("retryFetchBtn");

  // =========================================================================
  // 1. Toast & Alert Helpers
  // =========================================================================

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const icon = type === "success" ? "✓" : "⚠️";
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(20px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function showAlert(msg) {
    alertMessage.textContent = msg;
    globalAlert.classList.remove("hidden");
  }

  document.getElementById("alertCloseBtn").addEventListener("click", () => {
    globalAlert.classList.add("hidden");
  });

  // =========================================================================
  // 2. Fetch Tasks & Analytics (GET APIs)
  // =========================================================================

  async function loadTasks() {
    showLoading(true);
    errorState.classList.add("hidden");
    emptyState.classList.add("hidden");

    try {
      const response = await fetch("/api/v1/tasks");
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ไม่สามารถดึงข้อมูลงานได้`);
      }
      const result = await response.json();
      allTasks = result.data || [];
      renderTasks();
      updateCounters();
      loadAnalytics();
    } catch (err) {
      console.error("[loadTasks error]", err);
      showLoading(false);
      errorState.classList.remove("hidden");
      errorStateMessage.textContent = err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
    }
  }

  async function loadAnalytics() {
    try {
      const response = await fetch("/api/v1/analytics/summary");
      if (response.ok) {
        const data = await response.json();
        const s = data.summary;
        statTotal.textContent = s.totalTasks;
        statCompleted.textContent = s.completedTasks;
        statInProgress.textContent = s.inProgressTasks;
        statRate.textContent = `ความสำเร็จ ${s.completionRatePercent}%`;
      }
    } catch (e) {
      console.warn("Analytics microservice offline, using client calculation");
      updateClientAnalytics();
    }
  }

  function updateClientAnalytics() {
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.status === "completed").length;
    const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    statTotal.textContent = total;
    statCompleted.textContent = completed;
    statInProgress.textContent = inProgress;
    statRate.textContent = `ความสำเร็จ ${rate}%`;
  }

  async function loadWeatherWidget() {
    try {
      const response = await fetch("/api/v1/weather?city=Bangkok");
      if (response.ok) {
        const result = await response.json();
        const w = result.weather;
        weatherTemp.textContent = w.temperature_celsius ? `${w.temperature_celsius}°C` : "สำรอง (28°C)";
        weatherDesc.textContent = w.condition || "สภาพอากาศปกติ";
      }
    } catch (e) {
      weatherTemp.textContent = "28°C";
      weatherDesc.textContent = "ท้องฟ้าปลอดโปร่ง (Default)";
    }
  }

  function showLoading(isLoading) {
    if (isLoading) {
      loadingIndicator.classList.remove("hidden");
      tasksGrid.innerHTML = "";
    } else {
      loadingIndicator.classList.add("hidden");
    }
  }

  // =========================================================================
  // 3. Render Task Cards in UI
  // =========================================================================

  function renderTasks() {
    showLoading(false);

    // Apply Filter & Search
    let filtered = allTasks;

    if (currentFilter !== "all") {
      filtered = filtered.filter((t) => t.status === currentFilter);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.owner && t.owner.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      emptyState.classList.remove("hidden");
      tasksGrid.innerHTML = "";
      return;
    }

    emptyState.classList.add("hidden");

    tasksGrid.innerHTML = filtered
      .map((task) => {
        const statusThai = {
          pending: "รอดำเนินการ",
          in_progress: "กำลังทำ",
          completed: "เสร็จสิ้น",
          cancelled: "ยกเลิก",
        }[task.status] || task.status;

        const tagsHtml = (task.tags || [])
          .map((tag) => `<span class="badge badge-tag">🏷️ ${tag}</span>`)
          .join("");

        const formattedDate = task.due_date ? task.due_date : "ไม่ได้ระบุ";

        return `
          <div class="task-card" data-id="${task.id}">
            <div>
              <div class="task-card-header">
                <span class="badge badge-${task.status}">${statusThai}</span>
                <button class="btn btn-weather" onclick="openTaskWeather(${task.id})">
                  🌤️ ตรวจสภาพอากาศ
                </button>
              </div>
              <h3 class="task-card-title">${escapeHtml(task.title)}</h3>
              <p class="task-card-desc">${escapeHtml(task.description || "ไม่มีคำอธิบายเพิ่มเติม")}</p>
              ${tagsHtml ? `<div class="task-tags-row">${tagsHtml}</div>` : ""}
            </div>

            <div>
              <div class="task-card-meta">
                <div class="task-owner">
                  <span class="owner-avatar">${(task.owner || "U").charAt(0).toUpperCase()}</span>
                  <span>${escapeHtml(task.owner || "User #" + task.user_id)}</span>
                </div>
                <div>📅 ${formattedDate}</div>
              </div>

              <div class="task-actions">
                <select class="status-select" onchange="changeTaskStatus(${task.id}, this.value)">
                  <option value="pending" ${task.status === "pending" ? "selected" : ""}>รอดำเนินการ</option>
                  <option value="in_progress" ${task.status === "in_progress" ? "selected" : ""}>กำลังดำเนินการ</option>
                  <option value="completed" ${task.status === "completed" ? "selected" : ""}>เสร็จสิ้น</option>
                  <option value="cancelled" ${task.status === "cancelled" ? "selected" : ""}>ยกเลิก</option>
                </select>
                <button class="btn btn-danger-outline" onclick="deleteTask(${task.id})">
                  🗑️ ลบ
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function updateCounters() {
    countAll.textContent = allTasks.length;
    countPending.textContent = allTasks.filter((t) => t.status === "pending").length;
    countInProgress.textContent = allTasks.filter((t) => t.status === "in_progress").length;
    countCompleted.textContent = allTasks.filter((t) => t.status === "completed").length;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, function (m) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[m];
    });
  }

  // =========================================================================
  // 4. Client-side Form Validation & POST API
  // =========================================================================

  function validateCreateTaskForm() {
    let isValid = true;

    const titleInput = document.getElementById("taskTitle");
    const titleError = document.getElementById("titleError");
    const userIdInput = document.getElementById("taskUserId");
    const userIdError = document.getElementById("userIdError");
    const dueDateInput = document.getElementById("taskDueDate");
    const dueDateError = document.getElementById("dueDateError");

    // Reset errors
    titleError.textContent = "";
    userIdError.textContent = "";
    dueDateError.textContent = "";
    titleInput.classList.remove("error");
    userIdInput.classList.remove("error");

    // Validate Title
    if (!titleInput.value || titleInput.value.trim().length < 3) {
      titleError.textContent = "กรุณาระบุชื่องานอย่างน้อย 3 ตัวอักษร";
      titleInput.classList.add("error");
      isValid = false;
    }

    // Validate Assignee
    if (!userIdInput.value) {
      userIdError.textContent = "กรุณาเลือกผู้รับผิดชอบงาน";
      userIdInput.classList.add("error");
      isValid = false;
    }

    // Validate Due Date (Optional but if entered, must be valid)
    if (dueDateInput.value) {
      const selectedDate = new Date(dueDateInput.value);
      if (isNaN(selectedDate.getTime())) {
        dueDateError.textContent = "รูปแบบวันที่ไม่ถูกต้อง";
        isValid = false;
      }
    }

    return isValid;
  }

  createTaskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateCreateTaskForm()) {
      return;
    }

    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const dueDate = document.getElementById("taskDueDate").value || null;
    const status = document.getElementById("taskStatus").value;
    const userId = parseInt(document.getElementById("taskUserId").value, 10);

    const tagCheckboxes = document.querySelectorAll('input[name="tag_ids"]:checked');
    const tagIds = Array.from(tagCheckboxes).map((cb) => parseInt(cb.value, 10));

    // Submit state
    submitSpinner.classList.remove("hidden");
    submitCreateBtn.disabled = true;

    try {
      const response = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          due_date: dueDate,
          status,
          user_id: userId,
          tag_ids: tagIds,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "ไม่สามารถสร้างงานใหม่ได้");
      }

      showToast("สร้างงานใหม่เรียบร้อยแล้ว!", "success");
      createTaskModal.classList.add("hidden");
      createTaskForm.reset();
      await loadTasks();
    } catch (err) {
      console.error("[Create Task Error]", err);
      showToast(err.message, "error");
    } finally {
      submitSpinner.classList.add("hidden");
      submitCreateBtn.disabled = false;
    }
  });

  // =========================================================================
  // 5. PATCH & DELETE APIs
  // =========================================================================

  window.changeTaskStatus = async function (taskId, newStatus) {
    try {
      const response = await fetch(`/api/v1/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.message || "อัปเดตสถานะไม่สำเร็จ");
      }

      // Update in local state
      const task = allTasks.find((t) => t.id === taskId);
      if (task) {
        task.status = newStatus;
      }
      renderTasks();
      updateCounters();
      updateClientAnalytics();
      showToast(`เปลี่ยนสถานะงานเป็น "${newStatus}" สำเร็จ`, "success");
    } catch (err) {
      console.error("[changeTaskStatus error]", err);
      showToast(err.message, "error");
      loadTasks(); // rollback UI
    }
  };

  window.deleteTask = async function (taskId) {
    if (!confirm(`คุณต้องการลบงานรหัส #${taskId} ใช่หรือไม่?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/tasks/${taskId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.message || "ลบงานไม่สำเร็จ");
      }

      allTasks = allTasks.filter((t) => t.id !== taskId);
      renderTasks();
      updateCounters();
      updateClientAnalytics();
      showToast(`ลบงานรหัส #${taskId} เรียบร้อยแล้ว`, "success");
    } catch (err) {
      console.error("[deleteTask error]", err);
      showToast(err.message, "error");
    }
  };

  // =========================================================================
  // 6. Task Weather Modal (External Integration & Resilience)
  // =========================================================================

  window.openTaskWeather = async function (taskId) {
    weatherModal.classList.remove("hidden");
    weatherModalBody.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <p>กำลังเชื่อมต่อ Open-Meteo Weather API พร้อมระบบ Resilience (Retry & Fallback)...</p>
      </div>
    `;

    try {
      const response = await fetch(`/api/v1/tasks/${taskId}/weather`);
      const data = await response.json();

      const w = data.weather;
      const meta = data.resilienceMeta || {};
      const isFallback = data.isFallback;

      weatherModalBody.innerHTML = `
        <div class="weather-detail-box">
          <div class="weather-detail-header">
            <div>
              <div style="font-size: 0.85rem; color: var(--text-dim);">สถานที่พยากรณ์: ${data.location?.city || "Bangkok"}</div>
              <div style="font-size: 1.15rem; font-weight: 600; color: #fff;">${w.condition || "สภาพอากาศ"}</div>
            </div>
            <div class="weather-temp-large">${w.temperature_celsius !== null ? w.temperature_celsius + "°C" : "N/A"}</div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
            <div>💨 ความเร็วลม: ${w.windspeed_kmh !== null ? w.windspeed_kmh + " km/h" : "-"}</div>
            <div>🌤️ กิจกรรมกลางแจ้ง: ${w.is_outdoor_suitable ? "✅ เหมาะสม" : "⚠️ ควรงด"}</div>
          </div>

          <div class="weather-advice-box">
            💡 <strong>คำแนะนำสำหรับงาน:</strong> ${w.recommendation || "วางแผนการทำงานตามปกติ"}
          </div>

          <div style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-dim); border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.5rem;">
            <div><strong>สถาปัตยกรรม Resilience:</strong></div>
            <div>• Provider: ${meta.provider || "Open-Meteo API"}</div>
            <div>• Attempts Made: ${meta.attemptsMade || 1} ครั้ง (Max Retries: ${meta.maxRetries || 2})</div>
            <div>• Timeout Limit: ${meta.timeoutMs || 3000} ms</div>
            <div>• สถานะ Fallback: ${isFallback ? '<span style="color:#fbbf24;">เปิดใช้งาน (Fallback Strategy Active)</span>' : '<span style="color:#34d399;">ข้อมูลสดจาก API จริง</span>'}</div>
            ${meta.errorReason ? `<div style="color:#f87171;">• รายละเอียดข้อผิดพลาด: ${meta.errorReason}</div>` : ""}
          </div>
        </div>
      `;
    } catch (err) {
      weatherModalBody.innerHTML = `
        <div class="empty-state">
          <p style="color: var(--danger);">เกิดข้อผิดพลาดในการโหลดสภาพอากาศ: ${err.message}</p>
        </div>
      `;
    }
  };

  closeWeatherModalBtn.addEventListener("click", () => weatherModal.classList.add("hidden"));
  closeWeatherBtn.addEventListener("click", () => weatherModal.classList.add("hidden"));

  // =========================================================================
  // 7. Modal Open & Close Listeners
  // =========================================================================

  openCreateModalBtn.addEventListener("click", () => {
    createTaskModal.classList.remove("hidden");
    document.getElementById("taskTitle").focus();
  });

  closeCreateModalBtn.addEventListener("click", () => createTaskModal.classList.add("hidden"));
  cancelCreateBtn.addEventListener("click", () => createTaskModal.classList.add("hidden"));

  createTaskModal.addEventListener("click", (e) => {
    if (e.target === createTaskModal) createTaskModal.classList.add("hidden");
  });
  weatherModal.addEventListener("click", (e) => {
    if (e.target === weatherModal) weatherModal.classList.add("hidden");
  });

  // =========================================================================
  // 8. Filters & Search Listeners
  // =========================================================================

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.getAttribute("data-filter");
      renderTasks();
    });
  });

  taskSearchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderTasks();
  });

  retryFetchBtn.addEventListener("click", () => {
    loadTasks();
  });

  // =========================================================================
  // Initial Boot
  // =========================================================================
  loadTasks();
  loadWeatherWidget();
});
