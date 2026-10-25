/**
 * TaskFlow — Client Application Logic (Vanilla JavaScript)
 * Professional Light Theme Edition (Human-designed Minimalist SaaS)
 *
 * Real Endpoints:
 * 1. GET /api/v1/tasks (Tasks list with filter & search)
 * 2. GET /api/v1/analytics/summary (Microservice Task Analytics)
 * 3. GET /api/v1/weather (Weather integration & widget)
 * 4. POST /api/v1/tasks (Create task with client-side validation)
 * 5. PATCH /api/v1/tasks/:id/status (Quick update status)
 * 6. DELETE /api/v1/tasks/:id (Delete task)
 * 7. GET /api/v1/tasks/:id/weather (Task Weather Modal with Resilience metadata)
 * 8. GET /api/v1/users & GET /api/v1/tags (Dynamic form options)
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
  const taskUserId = document.getElementById("taskUserId");
  const tagsSelector = document.getElementById("tagsSelector");

  // Weather Modal
  const weatherModal = document.getElementById("weatherModal");
  const closeWeatherModalBtn = document.getElementById("closeWeatherModalBtn");
  const closeWeatherBtn = document.getElementById("closeWeatherBtn");
  const weatherModalBody = document.getElementById("weatherModalBody");

  // Retry Button
  const retryFetchBtn = document.getElementById("retryFetchBtn");

  // =========================================================================
  // 1. Toast Notification Helpers
  // =========================================================================

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    const iconSvg = type === "success"
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    toast.innerHTML = `${iconSvg} <span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function showAlert(msg) {
    alertMessage.textContent = msg;
    globalAlert.classList.remove("hidden");
  }

  document.getElementById("alertCloseBtn").addEventListener("click", () => {
    globalAlert.classList.add("hidden");
  });

  // =========================================================================
  // 2. Fetch Tasks & Microservices (GET APIs)
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
      errorStateMessage.textContent = err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ Express หรือ MySQL";
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
        statRate.textContent = `อัตราสำเร็จ ${s.completionRatePercent}%`;
      } else {
        updateClientAnalytics();
      }
    } catch (e) {
      console.warn("Analytics microservice unreachable, falling back to client-side computation");
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
    statRate.textContent = `อัตราสำเร็จ ${rate}%`;
  }

  async function loadWeatherWidget() {
    try {
      const response = await fetch("/api/v1/weather?city=Bangkok");
      if (response.ok) {
        const result = await response.json();
        const w = result.weather;
        weatherTemp.textContent = w.temperature_celsius !== null ? `${w.temperature_celsius}°C` : "29°C";
        weatherDesc.textContent = w.condition || "ท้องฟ้าแจ่มใส";
      }
    } catch (e) {
      weatherTemp.textContent = "29°C";
      weatherDesc.textContent = "ท้องฟ้าแจ่มใส (ข้อมูลสำรอง)";
    }
  }

  // Fetch Users & Tags to populate form dynamically
  async function loadFormData() {
    try {
      const [usersRes, tagsRes] = await Promise.all([
        fetch("/api/v1/users"),
        fetch("/api/v1/tags")
      ]);

      if (usersRes.ok) {
        const userData = await usersRes.json();
        if (userData.data && userData.data.length > 0) {
          taskUserId.innerHTML = '<option value="">-- เลือกผู้รับผิดชอบ --</option>' +
            userData.data.map(u => `<option value="${u.id}">${escapeHtml(u.username)} (${escapeHtml(u.email)})</option>`).join("");
        }
      }

      if (tagsRes.ok) {
        const tagData = await tagsRes.json();
        if (tagData.data && tagData.data.length > 0) {
          tagsSelector.innerHTML = tagData.data.map(tag => `
            <label class="tag-checkbox-pill">
              <input type="checkbox" name="tag_ids" value="${tag.id}">
              <span>${escapeHtml(tag.name)}</span>
            </label>
          `).join("");
        }
      }
    } catch (err) {
      console.warn("Could not load dynamic user/tag options, using defaults.");
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

    // Filter & Search
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
          in_progress: "กำลังดำเนินการ",
          completed: "เสร็จสิ้น",
          cancelled: "ยกเลิก",
        }[task.status] || task.status;

        const tagsHtml = (task.tags || [])
          .map((tag) => `<span class="badge-tag">${escapeHtml(tag)}</span>`)
          .join("");

        const formattedDate = task.due_date ? task.due_date : "ไม่ระบุวัน";
        const ownerName = task.owner || `User #${task.user_id}`;
        const avatarLetter = (task.owner || "U").charAt(0).toUpperCase();

        return `
          <div class="task-card" data-id="${task.id}">
            <div>
              <div class="task-card-header">
                <span class="badge-status badge-${task.status}">${statusThai}</span>
                <button class="btn btn-weather" onclick="openTaskWeather(${task.id})" title="ตรวจสอบสภาพอากาศสำหรับงานนี้">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                  </svg>
                  <span>สภาพอากาศ</span>
                </button>
              </div>

              <h3 class="task-card-title">${escapeHtml(task.title)}</h3>
              <p class="task-card-desc">${escapeHtml(task.description || "ไม่มีรายละเอียดเพิ่มเติม")}</p>

              ${tagsHtml ? `<div class="task-tags-row">${tagsHtml}</div>` : ""}
            </div>

            <div class="task-card-footer">
              <div class="task-card-meta">
                <div class="task-owner">
                  <span class="owner-avatar">${avatarLetter}</span>
                  <span>${escapeHtml(ownerName)}</span>
                </div>
                <div class="task-due">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>${formattedDate}</span>
                </div>
              </div>

              <div class="task-card-actions">
                <select class="status-select" onchange="changeTaskStatus(${task.id}, this.value)">
                  <option value="pending" ${task.status === "pending" ? "selected" : ""}>รอดำเนินการ</option>
                  <option value="in_progress" ${task.status === "in_progress" ? "selected" : ""}>กำลังดำเนินการ</option>
                  <option value="completed" ${task.status === "completed" ? "selected" : ""}>เสร็จสิ้น</option>
                  <option value="cancelled" ${task.status === "cancelled" ? "selected" : ""}>ยกเลิก</option>
                </select>

                <button class="btn btn-danger-ghost" onclick="deleteTask(${task.id})" title="ลบงานนี้">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  <span>ลบ</span>
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
    return String(str).replace(/[&<>"']/g, function (m) {
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

    // Validate Title (at least 3 chars)
    if (!titleInput.value || titleInput.value.trim().length < 3) {
      titleError.textContent = "กรุณากรอกชื่องานอย่างน้อย 3 ตัวอักษร";
      titleInput.classList.add("error");
      isValid = false;
    }

    // Validate Assignee
    if (!userIdInput.value) {
      userIdError.textContent = "กรุณาเลือกผู้รับผิดชอบงาน";
      userIdInput.classList.add("error");
      isValid = false;
    }

    // Validate Due Date
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
      showToast(`เปลี่ยนสถานะงานเรียบร้อยแล้ว`, "success");
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
      showToast(`ลบงานรหัส #${taskId} สำเร็จ`, "success");
    } catch (err) {
      console.error("[deleteTask error]", err);
      showToast(err.message, "error");
    }
  };

  // =========================================================================
  // 6. Task Weather Modal (Resilience & Simulation)
  // =========================================================================

  window.openTaskWeather = async function (taskId) {
    weatherModal.classList.remove("hidden");
    weatherModalBody.innerHTML = `
      <div class="state-container">
        <div class="spinner"></div>
        <p class="state-title">กำลังเชื่อมต่อ Open-Meteo Weather API...</p>
        <p class="state-desc">พร้อมระบบ Resilience (Timeout 3s, Retry 2 ครั้ง, Fallback)</p>
      </div>
    `;

    try {
      const response = await fetch(`/api/v1/tasks/${taskId}/weather`);
      const data = await response.json();

      const w = data.weather || {};
      const meta = data.resilienceMeta || {};
      const isFallback = data.isFallback;

      weatherModalBody.innerHTML = `
        <div class="weather-card-dialog">
          <div class="weather-header-row">
            <div>
              <span class="weather-city-label">พยากรณ์สำหรับพื้นที่: ${escapeHtml(data.location?.city || "Bangkok")}</span>
              <div class="weather-cond-main">${escapeHtml(w.condition || "สภาพอากาศปกติ")}</div>
            </div>
            <div class="weather-temp-badge">
              ${w.temperature_celsius !== null ? w.temperature_celsius + "°C" : "N/A"}
            </div>
          </div>

          <div class="weather-stats-subgrid">
            <div class="weather-stat-item">
              <div class="weather-stat-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
                <span>ความเร็วลม</span>
              </div>
              <div class="weather-stat-val">${w.windspeed_kmh !== null ? w.windspeed_kmh + " km/h" : "-"}</div>
            </div>
            <div class="weather-stat-item">
              <div class="weather-stat-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                <span>กิจกรรมกลางแจ้ง</span>
              </div>
              <div class="weather-stat-val">
                ${w.is_outdoor_suitable ? '<span class="pill-status pill-suitable">เหมาะสม</span>' : '<span class="pill-status pill-caution">ควรงด</span>'}
              </div>
            </div>
          </div>

          <div class="weather-recommendation">
            <div class="recommendation-header">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span>คำแนะนำสำหรับการทำงาน</span>
            </div>
            <div class="recommendation-text">${escapeHtml(w.recommendation || "สามารถวางแผนการทำงานได้ตามปกติ")}</div>
          </div>

          <div class="resilience-meta-box">
            <div class="resilience-meta-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>ข้อมูลการทำงานของระบบ Resilience</span>
            </div>
            <div class="resilience-meta-row">
              <span>Service Provider:</span>
              <strong>${escapeHtml(meta.provider || "Open-Meteo API")}</strong>
            </div>
            <div class="resilience-meta-row">
              <span>Attempts Executed:</span>
              <strong>${meta.attemptsMade || 1} ครั้ง (โควตา Max Retries: ${meta.maxRetries || 2})</strong>
            </div>
            <div class="resilience-meta-row">
              <span>Timeout Threshold:</span>
              <strong>${meta.timeoutMs || 3000} ms (AbortController)</strong>
            </div>
            <div class="resilience-meta-row">
              <span>สถานะ Fallback:</span>
              <strong>${isFallback ? '<span style="color:#d97706;">เปิดใช้งาน (Fallback Strategy Active)</span>' : '<span style="color:#16a34a;">สำเร็จจาก API จริง (Live API Data)</span>'}</strong>
            </div>
            ${meta.errorReason ? `<div class="resilience-meta-row"><span style="color:#dc2626;">Error Cause:</span><span style="color:#dc2626;">${escapeHtml(meta.errorReason)}</span></div>` : ""}
          </div>
        </div>
      `;
    } catch (err) {
      weatherModalBody.innerHTML = `
        <div class="state-container">
          <div class="state-icon-circle state-icon-red">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h3 class="state-title">ไม่สามารถดึงข้อมูลสภาพอากาศได้</h3>
          <p class="state-desc">${escapeHtml(err.message)}</p>
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
  loadFormData();
});
