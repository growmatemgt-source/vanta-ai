/* ============================================================
   VANTA AI — ADMIN JAVASCRIPT
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  /* ------------------------------------------------------------
     SUPABASE
     ------------------------------------------------------------ */

  const supabase = window.vantaSupabase;

  if (!supabase) {
    console.error("VANTA AI: Supabase client not found.");
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

  const contactCountEl =
    document.getElementById("adminContactCount");

  const contactMessagesEl =
    document.getElementById("adminContactMessages");


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


  function formatTimeAgo(dateValue) {
    if (!dateValue) {
      return "Unknown time";
    }

    const date =
      new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unknown time";
    }

    const diff =
      Math.max(
        0,
        Date.now() - date.getTime()
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


  function setError(element, text) {
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
     ADMIN PROFILE
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
      userNameEl.textContent = name;
    }

    if (userEmailEl) {
      userEmailEl.textContent = email;
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
     LOAD USERS
     
     IMPORTANT:
     profiles table does NOT have a "plan" column.
     Therefore we only request columns that actually exist.
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
        "id, full_name, created_at"
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

      if (usersCountEl) {
        usersCountEl.textContent = "—";
      }

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

          /*
           * Plan column does not currently exist
           * in profiles, so admin UI displays
           * the current default plan as Free.
           */
          const plan = "Free";

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
        projectsCountEl.textContent = "—";
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
     LOAD AI GENERATIONS
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
        generationsCountEl.textContent = "—";
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
        activeTodayEl.textContent = "—";
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
     LOAD CONTACT MESSAGES
     ------------------------------------------------------------ */

  async function loadContactMessages() {
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

      if (contactCountEl) {
        contactCountEl.textContent = "0 New";
      }

      setError(
        contactMessagesEl,
        "Could not load contact messages."
      );

      return [];
    }

    const messages =
      Array.isArray(data)
        ? data
        : [];

    const newCount =
      messages.filter(
        (message) =>
          message.status === "new"
      ).length;

    if (contactCountEl) {
      contactCountEl.textContent =
        `${newCount} New`;
    }

    renderContactMessages(
      messages
    );

    return messages;
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

          const name =
            message.name ||
            "Unknown";

          const email =
            message.email ||
            "";

          const subject =
            message.subject ||
            "No subject";

          const inquiry =
            message.inquiry_type ||
            "general";

          const body =
            message.message ||
            "";

          const safeEmail =
            encodeURIComponent(email);

          return `
            <div
              class="admin-contact-item"
              data-contact-id="${escapeHTML(message.id)}"
            >

              <div class="admin-contact-main">

                <div class="admin-contact-top">

                  <div>
                    <strong>
                      ${escapeHTML(name)}
                    </strong>

                    <span>
                      ${escapeHTML(email)}
                    </span>
                  </div>

                  <span class="admin-contact-time">
                    ${escapeHTML(
                      formatTimeAgo(
                        message.created_at
                      )
                    )}
                  </span>

                </div>


                <div class="admin-contact-subject">
                  ${escapeHTML(subject)}
                </div>


                <div class="admin-contact-type">
                  ${escapeHTML(inquiry)}
                </div>


                <p class="admin-contact-message">
                  ${escapeHTML(body)}
                </p>


                <div class="admin-contact-actions">

                  <a
                    href="mailto:${safeEmail}"
                    class="admin-contact-reply"
                  >
                    Reply
                  </a>

                  <select
                    class="admin-contact-status"
                    data-id="${escapeHTML(message.id)}"
                    aria-label="Contact message status"
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

              </div>

            </div>
          `;
        })
        .join("");


    contactMessagesEl
      .querySelectorAll(
        ".admin-contact-status"
      )
      .forEach((select) => {

        select.addEventListener(
          "change",
          async (event) => {

            const id =
              event.target.dataset.id;

            const newStatus =
              event.target.value;

            await updateContactStatus(
              id,
              newStatus
            );

          }
        );

      });
  }


  /* ------------------------------------------------------------
     UPDATE CONTACT STATUS
     ------------------------------------------------------------ */

  async function updateContactStatus(
    id,
    status
  ) {
    if (!id || !status) {
      return;
    }

    const {
      error
    } = await supabase
      .from("contact_messages")
      .update({
        status
      })
      .eq(
        "id",
        id
      );

    if (error) {
      console.error(
        "VANTA AI contact status error:",
        error
      );

      alert(
        "Could not update message status."
      );

      return;
    }

    await loadContactMessages();
  }


  /* ------------------------------------------------------------
     LOAD EVERYTHING
     ------------------------------------------------------------ */

  async function loadAdminData() {
    try {

      if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.style.opacity = "0.65";
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
        refreshBtn.disabled = false;
        refreshBtn.style.opacity = "1";
      }

    }
  }


  /* ------------------------------------------------------------
     LOGOUT
     ------------------------------------------------------------ */

  async function logout() {
    try {

      if (logoutBtn) {
        logoutBtn.disabled = true;
      }

      if (logoutFooterBtn) {
        logoutFooterBtn.disabled = true;
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
        logoutBtn.disabled = false;
      }

      if (logoutFooterBtn) {
        logoutFooterBtn.disabled = false;
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
