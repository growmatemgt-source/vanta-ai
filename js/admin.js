/* ============================================================
   VANTA AI — ADMIN JAVASCRIPT
   Complete Admin + Contact Messages
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  /* ------------------------------------------------------------
     SUPABASE
     ------------------------------------------------------------ */

  const supabase = window.vantaSupabase;

  if (!supabase) {
    console.error("VANTA AI: Supabase client not found.");
    showGlobalError("Supabase connection could not be initialized.");
    return;
  }

  /* ------------------------------------------------------------
     DOM
     ------------------------------------------------------------ */

  const userNameEl =
    document.getElementById("adminUserName");

  const userEmailEl =
    document.getElementById("adminUserEmail");

  const avatarEl =
    document.getElementById("adminAvatar");

  const usersCountEl =
    document.getElementById("adminUsersCount");

  const projectsCountEl =
    document.getElementById("adminProjectsCount");

  const generationsCountEl =
    document.getElementById("adminGenerationsCount");

  const activeTodayEl =
    document.getElementById("adminActiveToday");

  const usersTableEl =
    document.getElementById("adminUsersTable");

  const recentGenerationsEl =
    document.getElementById("adminRecentGenerations");

  const openDashboardBtn =
    document.getElementById("openDashboard");

  const refreshBtn =
    document.getElementById("refreshAdmin");

  const logoutBtn =
    document.getElementById("adminLogout");

  const logoutFooterBtn =
    document.getElementById("adminLogoutFooter");

  /*
     Contact messages container.

     If admin.html already has:
     #adminContactMessages
     it will be used automatically.

     If it doesn't exist yet, the rest of the admin panel
     will continue working normally.
  */
  const contactMessagesEl =
    document.getElementById("adminContactMessages");

  const contactCountEl =
    document.getElementById("adminContactCount");

  /* ------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------ */

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getInitials(name, email) {
    const source =
      String(name || email || "A").trim();

    const parts =
      source.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[1][0]
      ).toUpperCase();
    }

    return source
      .slice(0, 2)
      .toUpperCase();
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "—";
    }

    const date =
      new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }

  function formatDateTime(dateValue) {
    if (!dateValue) {
      return "—";
    }

    const date =
      new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  function formatTimeAgo(dateValue) {
    if (!dateValue) {
      return "Unknown time";
    }

    const date =
      new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown time";
    }

    const now =
      Date.now();

    const diff =
      Math.max(
        0,
        now - date.getTime()
      );

    const minutes =
      Math.floor(diff / 60000);

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours =
      Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days =
      Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d ago`;
    }

    return formatDate(dateValue);
  }

  function setLoading(
    element,
    text = "Loading..."
  ) {
    if (!element) return;

    element.innerHTML = `
      <div class="admin-loading">
        ${escapeHTML(text)}
      </div>
    `;
  }

  function setError(
    element,
    text
  ) {
    if (!element) return;

    element.innerHTML = `
      <div class="admin-error">
        ${escapeHTML(text)}
      </div>
    `;
  }

  function showGlobalError(message) {
    if (usersTableEl) {
      setError(
        usersTableEl,
        message
      );
    }

    if (recentGenerationsEl) {
      setError(
        recentGenerationsEl,
        message
      );
    }

    if (contactMessagesEl) {
      setError(
        contactMessagesEl,
        message
      );
    }
  }

  /* ------------------------------------------------------------
     AUTH CHECK
     ------------------------------------------------------------ */

  async function getCurrentUser() {
    const {
      data,
      error
    } = await supabase.auth.getUser();

    if (error) {
      console.error(
        "VANTA AI auth error:",
        error
      );

      return null;
    }

    return data?.user || null;
  }

  /* ------------------------------------------------------------
     CURRENT ADMIN PROFILE
     ------------------------------------------------------------ */

  async function loadAdminProfile(user) {
    if (!user) return;

    const metadata =
      user.user_metadata || {};

    const name =
      metadata.full_name ||
      metadata.name ||
      "Administrator";

    const email =
      user.email ||
      "Authenticated user";

    if (userNameEl) {
      userNameEl.textContent =
        name;
    }

    if (userEmailEl) {
      userEmailEl.textContent =
        email;
    }

    if (avatarEl) {
      avatarEl.textContent =
        getInitials(
          name,
          email
        );
    }
  }

  /* ------------------------------------------------------------
     LOAD PROFILES
     ------------------------------------------------------------ */

  async function loadUsers() {
    if (!usersTableEl) return [];

    setLoading(
      usersTableEl,
      "Loading users..."
    );

    const {
      data,
      error
    } = await supabase
      .from("profiles")
      .select(
        "id, full_name, plan, created_at"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

    if (error) {
      console.error(
        "VANTA AI profiles error:",
        error
      );

      setError(
        usersTableEl,
        "Could not load users."
      );

      return [];
    }

    const users =
      Array.isArray(data)
        ? data
        : [];

    if (usersCountEl) {
      usersCountEl.textContent =
        users.length;
    }

    renderUsers(users);

    return users;
  }

  function renderUsers(users) {
    if (!usersTableEl) return;

    if (!users.length) {
      usersTableEl.innerHTML = `
        <tr>
          <td colspan="4">
            <div class="admin-empty">
              No registered users found.
            </div>
          </td>
        </tr>
      `;

      return;
    }

    usersTableEl.innerHTML =
      users
        .map((user) => {
          const name =
            user.full_name ||
            "Unnamed user";

          const initials =
            getInitials(
              name,
              user.id
            );

          const plan =
            user.plan ||
            "Free";

          return `
            <tr>

              <td>
                <div class="admin-user-cell">

                  <div class="admin-user-cell-avatar">
                    ${escapeHTML(initials)}
                  </div>

                  <div>
                    <strong>
                      ${escapeHTML(name)}
                    </strong>

                    <span>
                      ${escapeHTML(user.id)}
                    </span>
                  </div>

                </div>
              </td>

              <td>
                <span class="admin-badge free">
                  ${escapeHTML(plan)}
                </span>
              </td>

              <td>
                ${escapeHTML(
                  formatDate(
                    user.created_at
                  )
                )}
              </td>

              <td>
                <span class="admin-badge active">
                  <span>●</span>
                  Active
                </span>
              </td>

            </tr>
          `;
        })
        .join("");
  }

  /* ------------------------------------------------------------
     LOAD PROJECTS
     ------------------------------------------------------------ */

  async function loadProjects() {
    const {
      data,
      error,
      count
    } = await supabase
      .from("projects")
      .select(
        "id",
        {
          count: "exact",
          head: true
        }
      );

    if (error) {
      console.error(
        "VANTA AI projects error:",
        error
      );

      if (projectsCountEl) {
        projectsCountEl.textContent =
          "—";
      }

      return 0;
    }

    const total =
      typeof count === "number"
        ? count
        : Array.isArray(data)
          ? data.length
          : 0;

    if (projectsCountEl) {
      projectsCountEl.textContent =
        total;
    }

    return total;
  }

  /* ------------------------------------------------------------
     LOAD GENERATIONS
     ------------------------------------------------------------ */

  async function loadGenerations() {
    const {
      data,
      error,
      count
    } = await supabase
      .from("ai_generations")
      .select(
        "id, user_id, prompt, response, model, status, created_at",
        {
          count: "exact"
        }
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      )
      .limit(20);

    if (error) {
      console.error(
        "VANTA AI generations error:",
        error
      );

      if (generationsCountEl) {
        generationsCountEl.textContent =
          "—";
      }

      if (recentGenerationsEl) {
        setError(
          recentGenerationsEl,
          "Could not load generation activity."
        );
      }

      return [];
    }

    const generations =
      Array.isArray(data)
        ? data
        : [];

    if (generationsCountEl) {
      generationsCountEl.textContent =
        typeof count === "number"
          ? count
          : generations.length;
    }

    renderRecentGenerations(
      generations
    );

    return generations;
  }

  function renderRecentGenerations(
    generations
  ) {
    if (!recentGenerationsEl) {
      return;
    }

    if (!generations.length) {
      recentGenerationsEl.innerHTML = `
        <div class="admin-empty">
          No AI generations yet.
        </div>
      `;

      return;
    }

    recentGenerationsEl.innerHTML =
      generations
        .slice(0, 8)
        .map((generation) => {

          const prompt =
            generation.prompt ||
            "AI generation";

          const preview =
            prompt.length > 65
              ? `${prompt.slice(0, 65)}…`
              : prompt;

          const status =
            generation.status ||
            "completed";

          return `
            <div class="admin-list-item">

              <div class="admin-list-icon">
                ✦
              </div>

              <div class="admin-list-text">

                <strong>
                  ${escapeHTML(preview)}
                </strong>

                <span>
                  ${escapeHTML(
                    generation.model ||
                    "VANTA AI"
                  )}
                  ·
                  ${escapeHTML(
                    formatTimeAgo(
                      generation.created_at
                    )
                  )}
                  ·
                  ${escapeHTML(status)}
                </span>

              </div>

            </div>
          `;
        })
        .join("");
  }

  /* ------------------------------------------------------------
     ACTIVE TODAY
     ------------------------------------------------------------ */

  async function loadActiveToday() {
    const start =
      new Date();

    start.setHours(
      0,
      0,
      0,
      0
    );

    const {
      data,
      error
    } = await supabase
      .from("ai_generations")
      .select("user_id")
      .gte(
        "created_at",
        start.toISOString()
      );

    if (error) {
      console.error(
        "VANTA AI active users error:",
        error
      );

      if (activeTodayEl) {
        activeTodayEl.textContent =
          "—";
      }

      return 0;
    }

    const uniqueUsers =
      new Set(
        (data || [])
          .map(
            (item) =>
              item.user_id
          )
          .filter(Boolean)
      );

    const count =
      uniqueUsers.size;

    if (activeTodayEl) {
      activeTodayEl.textContent =
        count;
    }

    return count;
  }

  /* ------------------------------------------------------------
     CONTACT MESSAGES
     ------------------------------------------------------------ */

  async function loadContactMessages() {
    /*
      If the current admin.html does not yet contain
      the contact messages container, don't break
      the rest of the admin panel.
    */
    if (!contactMessagesEl) {
      return [];
    }

    setLoading(
      contactMessagesEl,
      "Loading contact messages..."
    );

    const {
      data,
      error
    } = await supabase
      .from("contact_messages")
      .select(
        "id, name, email, inquiry_type, subject, message, status, created_at, updated_at"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

    if (error) {
      console.error(
        "VANTA AI contact messages error:",
        error
      );

      setError(
        contactMessagesEl,
        "Could not load contact messages."
      );

      if (contactCountEl) {
        contactCountEl.textContent =
          "—";
      }

      return [];
    }

    const messages =
      Array.isArray(data)
        ? data
        : [];

    const newMessages =
      messages.filter(
        (message) =>
          message.status === "new"
      ).length;

    if (contactCountEl) {
      contactCountEl.textContent =
        newMessages;
    }

    renderContactMessages(
      messages
    );

    return messages;
  }

  function getStatusClass(status) {
    const normalized =
      String(status || "new")
        .toLowerCase();

    if (
      normalized === "read"
    ) {
      return "read";
    }

    if (
      normalized === "replied"
    ) {
      return "replied";
    }

    if (
      normalized === "closed"
    ) {
      return "closed";
    }

    return "new";
  }

  function renderContactMessages(
    messages
  ) {
    if (!contactMessagesEl) {
      return;
    }

    if (!messages.length) {
      contactMessagesEl.innerHTML = `
        <div class="admin-empty">
          No contact messages yet.
        </div>
      `;

      return;
    }

    contactMessagesEl.innerHTML =
      messages
        .map((message) => {

          const status =
            message.status ||
            "new";

          const statusClass =
            getStatusClass(status);

          const name =
            message.name ||
            "Unknown";

          const email =
            message.email ||
            "";

          const inquiryType =
            message.inquiry_type ||
            "General inquiry";

          const subject =
            message.subject ||
            "No subject";

          const messageText =
            message.message ||
            "";

          const preview =
            messageText.length > 180
              ? `${messageText.slice(0, 180)}…`
              : messageText;

          return `
            <article
              class="admin-contact-message"
              data-message-id="${escapeHTML(message.id)}"
            >

              <div class="admin-contact-top">

                <div class="admin-contact-person">

                  <div class="admin-user-cell-avatar">
                    ${escapeHTML(
                      getInitials(
                        name,
                        email
                      )
                    )}
                  </div>

                  <div>
                    <strong>
                      ${escapeHTML(name)}
                    </strong>

                    <a
                      href="mailto:${encodeURIComponent(email)}"
                      class="admin-contact-email"
                    >
                      ${escapeHTML(email)}
                    </a>
                  </div>

                </div>

                <div class="admin-contact-date">
                  ${escapeHTML(
                    formatDateTime(
                      message.created_at
                    )
                  )}
                </div>

              </div>

              <div class="admin-contact-meta">

                <span class="admin-badge free">
                  ${escapeHTML(inquiryType)}
                </span>

                <span class="admin-contact-status ${escapeHTML(statusClass)}">
                  ${escapeHTML(status)}
                </span>

              </div>

              <h3 class="admin-contact-subject">
                ${escapeHTML(subject)}
              </h3>

              <p class="admin-contact-preview">
                ${escapeHTML(preview)}
              </p>

              <div class="admin-contact-actions">

                <a
                  href="mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
                    `Re: ${subject}`
                  )}"
                  class="admin-contact-reply"
                >
                  Reply
                </a>

                <select
                  class="admin-contact-status-select"
                  data-contact-status
                  data-id="${escapeHTML(message.id)}"
                  aria-label="Change message status"
                >
                  <option
                    value="new"
                    ${status === "new" ? "selected" : ""}
                  >
                    New
                  </option>

                  <option
                    value="read"
                    ${status === "read" ? "selected" : ""}
                  >
                    Read
                  </option>

                  <option
                    value="replied"
                    ${status === "replied" ? "selected" : ""}
                  >
                    Replied
                  </option>

                  <option
                    value="closed"
                    ${status === "closed" ? "selected" : ""}
                  >
                    Closed
                  </option>

                </select>

              </div>

            </article>
          `;
        })
        .join("");

    bindContactStatusEvents();
  }

  /* ------------------------------------------------------------
     CONTACT STATUS UPDATE
     ------------------------------------------------------------ */

  function bindContactStatusEvents() {
    if (!contactMessagesEl) {
      return;
    }

    const selects =
      contactMessagesEl.querySelectorAll(
        "[data-contact-status]"
      );

    selects.forEach((select) => {

      select.addEventListener(
        "change",
        async () => {

          const messageId =
            select.dataset.id;

          const newStatus =
            select.value;

          if (!messageId) {
            return;
          }

          const originalValue =
            select.dataset.previousValue ||
            newStatus;

          select.dataset.previousValue =
            newStatus;

          select.disabled =
            true;

          try {

            const {
              error
            } = await supabase
              .from("contact_messages")
              .update({
                status: newStatus
              })
              .eq(
                "id",
                messageId
              );

            if (error) {
              throw error;
            }

            await loadContactMessages();

          } catch (error) {

            console.error(
              "VANTA AI contact status update error:",
              error
            );

            alert(
              "Could not update message status. Please try again."
            );

            select.value =
              originalValue;

          } finally {

            select.disabled =
              false;
          }
        }
      );
    });
  }

  /* ------------------------------------------------------------
     LOAD EVERYTHING
     ------------------------------------------------------------ */

  async function loadAdminData() {
    try {

      if (refreshBtn) {
        refreshBtn.disabled =
          true;

        refreshBtn.style.opacity =
          "0.65";
      }

      await Promise.all([
        loadUsers(),
        loadProjects(),
        loadGenerations(),
        loadActiveToday(),
        loadContactMessages()
      ]);

    } catch (error) {

      console.error(
        "VANTA AI admin load error:",
        error
      );

      showGlobalError(
        "Unable to load administration data."
      );

    } finally {

      if (refreshBtn) {
        refreshBtn.disabled =
          false;

        refreshBtn.style.opacity =
          "1";
      }
    }
  }

  /* ------------------------------------------------------------
     LOGOUT
     ------------------------------------------------------------ */

  async function logout() {
    try {

      if (logoutBtn) {
        logoutBtn.disabled =
          true;
      }

      if (logoutFooterBtn) {
        logoutFooterBtn.disabled =
          true;
      }

      const {
        error
      } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      window.location.href =
        "login.html";

    } catch (error) {

      console.error(
        "VANTA AI logout error:",
        error
      );

      alert(
        "Could not sign out. Please try again."
      );

      if (logoutBtn) {
        logoutBtn.disabled =
          false;
      }

      if (logoutFooterBtn) {
        logoutFooterBtn.disabled =
          false;
      }
    }
  }

  /* ------------------------------------------------------------
     EVENTS
     ------------------------------------------------------------ */

  if (openDashboardBtn) {
    openDashboardBtn.addEventListener(
      "click",
      () => {
        window.location.href =
          "dashboard.html";
      }
    );
  }

  if (refreshBtn) {
    refreshBtn.addEventListener(
      "click",
      loadAdminData
    );
  }

  if (logoutBtn) {
    logoutBtn.addEventListener(
      "click",
      logout
    );
  }

  if (logoutFooterBtn) {
    logoutFooterBtn.addEventListener(
      "click",
      logout
    );
  }

  /* ------------------------------------------------------------
     AUTH STATE
     ------------------------------------------------------------ */

  supabase.auth.onAuthStateChange(
    (event, session) => {

      if (
        event === "SIGNED_OUT" ||
        !session?.user
      ) {
        window.location.href =
          "login.html";
      }

    }
  );

  /* ------------------------------------------------------------
     INITIALIZE
     ------------------------------------------------------------ */

  const currentUser =
    await getCurrentUser();

  if (!currentUser) {
    window.location.href =
      "login.html";

    return;
  }

  await loadAdminProfile(
    currentUser
  );

  await loadAdminData();

  /* ------------------------------------------------------------
     BRAND CONSOLE
     ------------------------------------------------------------ */

  console.log(
    "%c VANTA AI ADMIN ",
    "background:#7C5CFF;color:#fff;padding:6px 10px;border-radius:6px;font-weight:700;"
  );

});
