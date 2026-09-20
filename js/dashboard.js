/* ============================================================
   VANTA AI — DASHBOARD
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  "use strict";

  const supabase = window.vantaSupabase;

  if (!supabase) {
    console.error("VANTA AI: Supabase client not found.");
    return;
  }

  /* ----------------------------------------------------------
     ELEMENTS
  ---------------------------------------------------------- */

  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");

  const navButtons = document.querySelectorAll(".nav-btn[data-view]");
  const views = document.querySelectorAll(".dashboard-view");

  const pageTitle = document.getElementById("pageTitle");
  const logoutBtn = document.getElementById("logoutBtn");

  const welcomeName = document.getElementById("welcomeName");
  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const sidebarName = document.getElementById("sidebarName");
  const sidebarEmail = document.getElementById("sidebarEmail");

  const aiPrompt = document.getElementById("aiPrompt");
  const generateBtn = document.getElementById("generateBtn");
  const aiResponse = document.getElementById("aiResponse");

  const aiPromptFull = document.getElementById("aiPromptFull");
  const generateBtnFull = document.getElementById("generateBtnFull");
  const aiResponseFull = document.getElementById("aiResponseFull");

  const settingsName = document.getElementById("settingsName");
  const settingsEmail = document.getElementById("settingsEmail");
  const saveSettings = document.getElementById("saveSettings");
  const settingsMessage = document.getElementById("settingsMessage");

  let currentUser = null;
  let currentProfile = null;

  /* ----------------------------------------------------------
     AUTH CHECK
  ---------------------------------------------------------- */

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    window.location.href = "login.html";
    return;
  }

  currentUser = session.user;

  /* ----------------------------------------------------------
     PROFILE
  ---------------------------------------------------------- */

  async function loadProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      console.error("Profile load error:", error);
      return;
    }

    if (!data) {
      const fullName =
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        "";

      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: currentUser.id,
          full_name: fullName,
          plan: "Free"
        })
        .select()
        .single();

      if (createError) {
        console.error("Profile creation error:", createError);
        return;
      }

      currentProfile = newProfile;
    } else {
      currentProfile = data;
    }

    updateProfileUI();
  }

  /* ----------------------------------------------------------
     PROFILE UI
  ---------------------------------------------------------- */

  function updateProfileUI() {
    if (!currentProfile) return;

    const fullName =
      currentProfile.full_name ||
      currentUser.user_metadata?.full_name ||
      "VANTA User";

    const email = currentUser.email || "";

    if (welcomeName) {
      welcomeName.textContent = fullName;
    }

    if (sidebarName) {
      sidebarName.textContent = fullName;
    }

    if (sidebarEmail) {
      sidebarEmail.textContent = email;
    }

    if (settingsName) {
      settingsName.value = fullName === "VANTA User" ? "" : fullName;
    }

    if (settingsEmail) {
      settingsEmail.value = email;
    }

    if (sidebarAvatar) {
      const initial = fullName.trim().charAt(0).toUpperCase() || "V";

      sidebarAvatar.textContent = initial;
    }
  }

  /* ----------------------------------------------------------
     NAVIGATION
  ---------------------------------------------------------- */

  const pageTitles = {
    overview: "Overview",
    ai: "AI Workspace",
    projects: "Projects",
    settings: "Settings"
  };

  function showView(viewName) {
    views.forEach((view) => {
      view.classList.remove("active");
      view.style.display = "none";
    });

    const target = document.getElementById(`view-${viewName}`);

    if (target) {
      target.classList.add("active");
      target.style.display = "";
    }

    navButtons.forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.view === viewName
      );
    });

    if (pageTitle) {
      pageTitle.textContent =
        pageTitles[viewName] || "VANTA AI";
    }

    closeMobileMenu();
  }

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showView(button.dataset.view);
    });
  });

  /* ----------------------------------------------------------
     MOBILE MENU
  ---------------------------------------------------------- */

  function openMobileMenu() {
    if (sidebar) {
      sidebar.classList.add("open");
    }

    if (sidebarOverlay) {
      sidebarOverlay.classList.add("active");
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.setAttribute("aria-expanded", "true");
    }
  }

  function closeMobileMenu() {
    if (sidebar) {
      sidebar.classList.remove("open");
    }

    if (sidebarOverlay) {
      sidebarOverlay.classList.remove("active");
    }

    if (mobileMenuBtn) {
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    }
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      if (sidebar?.classList.contains("open")) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeMobileMenu);
  }

  /* ----------------------------------------------------------
     LOGOUT
  ---------------------------------------------------------- */

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      logoutBtn.disabled = true;
      logoutBtn.textContent = "Logging out...";

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);

        logoutBtn.disabled = false;
        logoutBtn.textContent = "Logout";
        return;
      }

      window.location.href = "login.html";
    });
  }

  /* ----------------------------------------------------------
     PROJECTS
  ---------------------------------------------------------- */

  async function loadProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", currentUser.id)
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.error("Projects load error:", error);
      return [];
    }

    return data || [];
  }

  function renderProjects(projects) {
    const projectsGrid =
      document.querySelector(".projects-grid");

    if (!projectsGrid) return;

    if (!projects.length) {
      projectsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">✦</div>
          <h3>No projects yet</h3>
          <p>Create your first AI project from the workspace.</p>
        </div>
      `;

      return;
    }

    projectsGrid.innerHTML = projects
      .map((project) => {
        const date = new Date(project.created_at)
          .toLocaleDateString();

        return `
          <article class="project-card">
            <div class="project-card-top">
              <span class="project-status">
                ${escapeHtml(project.status || "active")}
              </span>
            </div>

            <h3>${escapeHtml(project.name)}</h3>

            <p>
              ${escapeHtml(
                project.description ||
                "VANTA AI project"
              )}
            </p>

            <div class="project-card-footer">
              <span>${date}</span>
            </div>
          </article>
        `;
      })
      .join("");
  }

  /* ----------------------------------------------------------
     DASHBOARD STATS
  ---------------------------------------------------------- */

  async function loadStats() {
    const { count: projectCount, error: projectError } =
      await supabase
        .from("projects")
        .select("*", {
          count: "exact",
          head: true
        })
        .eq("user_id", currentUser.id);

    if (projectError) {
      console.error(
        "Project count error:",
        projectError
      );
    }

    const { count: generationCount, error: generationError } =
      await supabase
        .from("ai_generations")
        .select("*", {
          count: "exact",
          head: true
        })
        .eq("user_id", currentUser.id);

    if (generationError) {
      console.error(
        "Generation count error:",
        generationError
      );
    }

    updateStat(
      [
        "projectCount",
        "projectsCount",
        "totalProjects"
      ],
      projectCount ?? 0
    );

    updateStat(
      [
        "generationCount",
        "generationsCount",
        "totalGenerations"
      ],
      generationCount ?? 0
    );
  }

  function updateStat(ids, value) {
    for (const id of ids) {
      const element = document.getElementById(id);

      if (element) {
        element.textContent = value;
        return;
      }
    }
  }

  /* ----------------------------------------------------------
     AI GENERATION
  ---------------------------------------------------------- */

  async function generateAI(prompt, responseElement, button) {
    if (!prompt || !prompt.trim()) {
      showAIMessage(
        responseElement,
        "Please enter a prompt first."
      );
      return;
    }

    if (!currentUser) {
      showAIMessage(
        responseElement,
        "Your session has expired. Please login again."
      );
      return;
    }

    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Generating...";

    responseElement.classList.add("loading");

    responseElement.textContent =
      "VANTA AI is thinking...";

    let generationId = null;

    try {
      /* ------------------------------------------------------
         STEP 1 — CREATE PENDING GENERATION
      ------------------------------------------------------ */

      const { data: generation, error: insertError } =
        await supabase
          .from("ai_generations")
          .insert({
            user_id: currentUser.id,
            prompt: prompt.trim(),
            status: "pending",
            model: "vanta-ai"
          })
          .select()
          .single();

      if (insertError) {
        throw new Error(
          `Could not create generation record: ${
            insertError.message
          }`
        );
      }

      generationId = generation.id;

      /* ------------------------------------------------------
         STEP 2 — CALL SUPABASE EDGE FUNCTION
      ------------------------------------------------------ */

      const {
        data: functionData,
        error: functionError
      } = await supabase.functions.invoke("vanta-ai", {
        body: {
          prompt: prompt.trim(),
          generation_id: generationId
        }
      });

      if (functionError) {
        throw new Error(
          functionError.message ||
          "VANTA AI backend request failed."
        );
      }

      /* ------------------------------------------------------
         STEP 3 — READ AI RESPONSE
      ------------------------------------------------------ */

      const aiText =
        functionData?.response ||
        functionData?.text ||
        functionData?.content ||
        functionData?.output;

      if (!aiText) {
        console.error(
          "Unexpected Edge Function response:",
          functionData
        );

        throw new Error(
          "AI backend returned an empty response."
        );
      }

      const model =
        functionData?.model ||
        "vanta-ai";

      /* ------------------------------------------------------
         STEP 4 — SAVE COMPLETED GENERATION
      ------------------------------------------------------ */

      const { error: updateError } =
        await supabase
          .from("ai_generations")
          .update({
            response: aiText,
            model: model,
            status: "completed"
          })
          .eq("id", generationId)
          .eq("user_id", currentUser.id);

      if (updateError) {
        console.error(
          "Generation update error:",
          updateError
        );
      }

      /* ------------------------------------------------------
         STEP 5 — SHOW RESPONSE
      ------------------------------------------------------ */

      responseElement.classList.remove("loading");

      responseElement.textContent = aiText;

      await loadStats();

    } catch (error) {
      console.error("VANTA AI generation error:", error);

      responseElement.classList.remove("loading");

      responseElement.textContent =
        error.message ||
        "Something went wrong while generating the response.";

      /* ------------------------------------------------------
         MARK FAILED GENERATION
      ------------------------------------------------------ */

      if (generationId) {
        await supabase
          .from("ai_generations")
          .update({
            status: "failed"
          })
          .eq("id", generationId)
          .eq("user_id", currentUser.id);
      }

    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  function showAIMessage(element, message) {
    if (!element) return;

    element.classList.remove("loading");
    element.textContent = message;
  }

  /* ----------------------------------------------------------
     AI BUTTONS
  ---------------------------------------------------------- */

  if (generateBtn && aiPrompt && aiResponse) {
    generateBtn.addEventListener("click", () => {
      generateAI(
        aiPrompt.value,
        aiResponse,
        generateBtn
      );
    });
  }

  if (
    generateBtnFull &&
    aiPromptFull &&
    aiResponseFull
  ) {
    generateBtnFull.addEventListener("click", () => {
      generateAI(
        aiPromptFull.value,
        aiResponseFull,
        generateBtnFull
      );
    });
  }

  /* ----------------------------------------------------------
     ENTER KEY FOR AI PROMPT
  ---------------------------------------------------------- */

  [aiPrompt, aiPromptFull].forEach((input) => {
    if (!input) return;

    input.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();

        const button =
          input === aiPrompt
            ? generateBtn
            : generateBtnFull;

        const response =
          input === aiPrompt
            ? aiResponse
            : aiResponseFull;

        if (button && response) {
          generateAI(
            input.value,
            response,
            button
          );
        }
      }
    });
  });

  /* ----------------------------------------------------------
     SETTINGS
  ---------------------------------------------------------- */

  if (saveSettings) {
    saveSettings.addEventListener("click", async () => {
      const name =
        settingsName?.value.trim() || "";

      saveSettings.disabled = true;
      saveSettings.textContent = "Saving...";

      if (settingsMessage) {
        settingsMessage.textContent = "";
      }

      try {
        const { error: authError } =
          await supabase.auth.updateUser({
            data: {
              full_name: name
            }
          });

        if (authError) {
          throw authError;
        }

        const { data, error } =
          await supabase
            .from("profiles")
            .upsert({
              id: currentUser.id,
              full_name: name
            })
            .select()
            .single();

        if (error) {
          throw error;
        }

        currentProfile = {
          ...currentProfile,
          ...data
        };

        updateProfileUI();

        if (settingsMessage) {
          settingsMessage.textContent =
            "Settings saved successfully.";
        }

      } catch (error) {
        console.error(
          "Settings save error:",
          error
        );

        if (settingsMessage) {
          settingsMessage.textContent =
            error.message ||
            "Could not save settings.";
        }

      } finally {
        saveSettings.disabled = false;
        saveSettings.textContent = "Save Changes";
      }
    });
  }

  /* ----------------------------------------------------------
     ESCAPE HTML
  ---------------------------------------------------------- */

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ----------------------------------------------------------
     AUTH STATE
  ---------------------------------------------------------- */

  supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (
        event === "SIGNED_OUT" ||
        !session
      ) {
        window.location.href = "login.html";
      }
    }
  );

  /* ----------------------------------------------------------
     INITIAL LOAD
  ---------------------------------------------------------- */

  await loadProfile();

  const projects = await loadProjects();

  renderProjects(projects);

  await loadStats();

  showView("overview");

  console.log(
    "VANTA AI Dashboard — Ready"
  );
});
