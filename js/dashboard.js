/* ============================================================
   VANTA AI — DASHBOARD
   Real Supabase + AI workspace logic
   ============================================================ */

(() => {
  "use strict";

  const boot = async () => {
    const supabaseClient = window.vantaSupabase;

    if (!supabaseClient) {
      console.error("VANTA AI: Supabase client not found.");
      window.location.href = "login.html";
      return;
    }

    const $ = (id) => document.getElementById(id);
    const $$ = (selector) => document.querySelectorAll(selector);

    const sidebar = $("sidebar");
    const mobileMenuBtn = $("mobileMenuBtn");
    const navButtons = $$(".nav-btn");
    const views = $$(".view");
    const pageTitle = $("pageTitle");
    const logoutBtn = $("logoutBtn");

    /* ------------------------------------------------------------
       AUTH
       ------------------------------------------------------------ */

    const {
      data: sessionData,
      error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError || !sessionData?.session) {
      window.location.href = "login.html";
      return;
    }

    const user = sessionData.session.user;

    /* ------------------------------------------------------------
       USER / PROFILE
       ------------------------------------------------------------ */

    let profile = null;

    const loadProfile = async () => {
      const {
        data,
        error
      } = await supabaseClient
        .from("profiles")
        .select(
          "id, full_name, avatar_url, plan, created_at, updated_at"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile load error:", error);
      }

      profile = data || null;

      if (!profile) {
        const metadata = user.user_metadata || {};

        const fallbackName =
          metadata.full_name ||
          metadata.name ||
          user.email?.split("@")[0] ||
          "User";

        const {
          data: createdProfile,
          error: createError
        } = await supabaseClient
          .from("profiles")
          .insert({
            id: user.id,
            full_name: fallbackName,
            plan: "Free"
          })
          .select()
          .single();

        if (createError) {
          console.error(
            "Profile create error:",
            createError
          );
        } else {
          profile = createdProfile;
        }
      }

      const metadata = user.user_metadata || {};

      const fullName =
        profile?.full_name ||
        metadata.full_name ||
        metadata.name ||
        user.email?.split("@")[0] ||
        "User";

      const email = user.email || "";
      const plan = profile?.plan || "Free";

      if ($("welcomeName")) {
        $("welcomeName").textContent =
          fullName.split(" ")[0];
      }

      if ($("sidebarName")) {
        $("sidebarName").textContent =
          fullName;
      }

      if ($("sidebarEmail")) {
        $("sidebarEmail").textContent =
          email;
      }

      if ($("settingsName")) {
        $("settingsName").value =
          fullName;
      }

      if ($("settingsEmail")) {
        $("settingsEmail").value =
          email;
      }

      if ($("planValue")) {
        $("planValue").textContent =
          plan;
      }

      if ($("accountStatus")) {
        $("accountStatus").textContent =
          "Active";
      }

      const initials = fullName
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      if ($("sidebarAvatar")) {
        $("sidebarAvatar").textContent =
          initials || "U";
      }
    };

    await loadProfile();

    /* ------------------------------------------------------------
       NAVIGATION
       ------------------------------------------------------------ */

    const titles = {
      overview: "Overview",
      ai: "AI Workspace",
      projects: "Projects",
      settings: "Settings"
    };

    const switchView = (viewName) => {
      navButtons.forEach((button) => {
        button.classList.toggle(
          "active",
          button.dataset.view === viewName
        );
      });

      views.forEach((view) => {
        view.classList.remove("active");
      });

      const selectedView =
        $("view-" + viewName);

      if (selectedView) {
        selectedView.classList.add("active");
      }

      if (pageTitle) {
        pageTitle.textContent =
          titles[viewName] || "Dashboard";
      }

      sidebar?.classList.remove("open");
    };

    navButtons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          switchView(
            button.dataset.view ||
            "overview"
          );
        }
      );
    });

    mobileMenuBtn?.addEventListener(
      "click",
      () => {
        sidebar?.classList.toggle("open");
      }
    );

    /* ------------------------------------------------------------
       LOGOUT
       ------------------------------------------------------------ */

    logoutBtn?.addEventListener(
      "click",
      async () => {
        logoutBtn.disabled = true;
        logoutBtn.textContent =
          "Logging out...";

        const {
          error
        } = await supabaseClient.auth.signOut();

        if (error) {
          console.error(
            "Logout error:",
            error
          );

          logoutBtn.disabled = false;
          logoutBtn.textContent =
            "Logout";

          return;
        }

        window.location.href =
          "login.html";
      }
    );

    /* ------------------------------------------------------------
       DASHBOARD STATS
       ------------------------------------------------------------ */

    const loadDashboardStats =
      async () => {

        const {
          count: projectCount,
          error: projectError
        } = await supabaseClient
          .from("projects")
          .select("id", {
            count: "exact",
            head: true
          })
          .eq("user_id", user.id);

        const {
          count: generationCount,
          error: generationError
        } = await supabaseClient
          .from("ai_generations")
          .select("id", {
            count: "exact",
            head: true
          })
          .eq("user_id", user.id);

        if (projectError) {
          console.error(
            "Project count error:",
            projectError
          );
        }

        if (generationError) {
          console.error(
            "Generation count error:",
            generationError
          );
        }

        const projects =
          projectError
            ? 0
            : projectCount || 0;

        const generations =
          generationError
            ? 0
            : generationCount || 0;

        if ($("projectCount")) {
          $("projectCount").textContent =
            projects;
        }

        if ($("generationCount")) {
          $("generationCount").textContent =
            generations;
        }

        if ($("projectCountNote")) {
          $("projectCountNote").textContent =
            projects === 0
              ? "No projects yet"
              : `${projects} active project${
                  projects === 1
                    ? ""
                    : "s"
                }`;
        }

        if ($("generationCountNote")) {
          $("generationCountNote").textContent =
            generations === 0
              ? "Start your first generation"
              : `${generations} generation${
                  generations === 1
                    ? ""
                    : "s"
                } created`;
        }

        if (
          $("planValue") &&
          profile?.plan
        ) {
          $("planValue").textContent =
            profile.plan;
        }

        if ($("planNote")) {
          $("planNote").textContent =
            "VANTA AI workspace";
        }
      };

    /* ------------------------------------------------------------
       PROJECTS
       ------------------------------------------------------------ */

    const loadProjects = async () => {
      const grid =
        document.querySelector(
          ".projects-grid"
        );

      if (!grid) return;

      const {
        data,
        error
      } = await supabaseClient
        .from("projects")
        .select(
          "id, name, description, status, created_at, updated_at"
        )
        .eq("user_id", user.id)
        .order(
          "created_at",
          {
            ascending: false
          }
        );

      if (error) {
        console.error(
          "Projects load error:",
          error
        );

        grid.innerHTML = `
          <div class="project-card">
            <div class="project-icon">!</div>
            <h3>Projects unavailable</h3>
            <p>
              We could not load your projects right now.
            </p>
          </div>
        `;

        return;
      }

      if (!data || data.length === 0) {
        grid.innerHTML = `
          <div class="project-card">
            <div class="project-icon">✦</div>
            <h3>No projects yet</h3>
            <p>
              Your VANTA AI projects will appear here
              when you create them.
            </p>
          </div>
        `;

        return;
      }

      grid.innerHTML =
        data
          .map(
            (project, index) => {

              const icons = [
                "✦",
                "⌘",
                "◇",
                "◌",
                "✧"
              ];

              const icon =
                icons[
                  index %
                  icons.length
                ];

              const status =
                project.status ||
                "active";

              const description =
                project.description ||
                "VANTA AI project workspace.";

              return `
                <article class="project-card">

                  <div class="project-icon">
                    ${icon}
                  </div>

                  <h3>
                    ${escapeHtml(
                      project.name
                    )}
                  </h3>

                  <p>
                    ${escapeHtml(
                      description
                    )}
                  </p>

                  <div
                    style="
                      margin-top:14px;
                      color:#7DECFB;
                      font-size:10px;
                      text-transform:uppercase;
                      letter-spacing:.12em;
                    "
                  >
                    ${escapeHtml(
                      status
                    )}
                  </div>

                </article>
              `;
            }
          )
          .join("");
    };

    /* ------------------------------------------------------------
       AI GENERATION
       ------------------------------------------------------------ */

    const generateAI = async (
      promptElement,
      responseElement,
      button
    ) => {

      const prompt =
        promptElement?.value
          ?.trim() || "";

      if (!prompt) {

        if (responseElement) {
          responseElement.textContent =
            "Please enter a prompt first.";

          responseElement.classList.add(
            "show"
          );
        }

        promptElement?.focus();

        return;
      }

      if (prompt.length > 10000) {

        if (responseElement) {
          responseElement.textContent =
            "Your prompt is too long. Please keep it under 10,000 characters.";

          responseElement.classList.add(
            "show"
          );
        }

        return;
      }

      if (!button) return;

      button.disabled = true;
      button.textContent =
        "Generating...";

      if (responseElement) {
        responseElement.classList.add(
          "show"
        );

        responseElement.textContent =
          "VANTA AI is thinking...";
      }

      try {

        const {
          data: latestSession,
          error: sessionError
        } =
          await supabaseClient.auth.getSession();

        if (
          sessionError ||
          !latestSession?.session
        ) {
          throw new Error(
            "Your session has expired. Please log in again."
          );
        }

        const generationId =
          crypto.randomUUID();

        const {
          data,
          error
        } =
          await supabaseClient.functions.invoke(
            "vanta-ai",
            {
              body: {
                prompt,
                generation_id:
                  generationId
              }
            }
          );

        if (error) {
          throw new Error(
            error.message ||
            "AI generation failed."
          );
        }

        if (data?.error) {
          throw new Error(
            data.error
          );
        }

        const responseText =
          typeof data?.response ===
          "string"
            ? data.response.trim()
            : "";

        if (!responseText) {
          throw new Error(
            "VANTA AI returned an empty response."
          );
        }

        if (responseElement) {
          responseElement.textContent =
            responseText;

          responseElement.classList.add(
            "show"
          );
        }

        const {
          error: saveError
        } =
          await supabaseClient
            .from("ai_generations")
            .insert({
              id: generationId,
              user_id: user.id,
              prompt,
              response:
                responseText,
              model:
                data?.model ||
                "gpt-5-mini",
              status:
                "completed"
            });

        if (saveError) {
          console.error(
            "Generation history save error:",
            saveError
          );
        }

        await loadDashboardStats();

      } catch (error) {

        console.error(
          "VANTA AI generation error:",
          error
        );

        if (responseElement) {
          responseElement.textContent =
            error?.message ||
            "VANTA AI could not generate a response right now.";

          responseElement.classList.add(
            "show"
          );
        }

      } finally {

        button.disabled = false;

        button.textContent =
          "Generate";
      }
    };

    /* ------------------------------------------------------------
       AI WORKSPACE BUTTONS
       ------------------------------------------------------------ */

    const generateBtn =
      $("generateBtn");

    const aiPrompt =
      $("aiPrompt");

    const aiResponse =
      $("aiResponse");

    generateBtn?.addEventListener(
      "click",
      () => {
        generateAI(
          aiPrompt,
          aiResponse,
          generateBtn
        );
      }
    );

    const generateBtnFull =
      $("generateBtnFull");

    const aiPromptFull =
      $("aiPromptFull");

    const aiResponseFull =
      $("aiResponseFull");

    generateBtnFull?.addEventListener(
      "click",
      () => {
        generateAI(
          aiPromptFull,
          aiResponseFull,
          generateBtnFull
        );
      }
    );

    /* ------------------------------------------------------------
       ENTER TO GENERATE
       Shift + Enter = new line
       ------------------------------------------------------------ */

    [
      aiPrompt,
      aiPromptFull
    ].forEach(
      (textarea, index) => {

        textarea?.addEventListener(
          "keydown",
          (event) => {

            if (
              event.key ===
                "Enter" &&
              !event.shiftKey
            ) {

              event.preventDefault();

              if (index === 0) {
                generateBtn?.click();
              } else {
                generateBtnFull?.click();
              }
            }
          }
        );
      }
    );

    /* ------------------------------------------------------------
       SETTINGS
       ------------------------------------------------------------ */

    const saveSettings =
      $("saveSettings");

    const settingsName =
      $("settingsName");

    const settingsMessage =
      $("settingsMessage");

    saveSettings?.addEventListener(
      "click",
      async () => {

        const newName =
          settingsName?.value
            ?.trim() || "";

        if (!newName) {

          if (settingsMessage) {
            settingsMessage.textContent =
              "Please enter your name.";
          }

          return;
        }

        saveSettings.disabled =
          true;

        saveSettings.textContent =
          "Saving...";

        try {

          const {
            error: authError
          } =
            await supabaseClient.auth.updateUser(
              {
                data: {
                  full_name:
                    newName,
                  name:
                    newName
                }
              }
            );

          if (authError) {
            throw authError;
          }

          const {
            error: profileError
          } =
            await supabaseClient
              .from("profiles")
              .upsert(
                {
                  id: user.id,
                  full_name:
                    newName,
                  plan:
                    profile?.plan ||
                    "Free"
                },
                {
                  onConflict:
                    "id"
                }
              );

          if (profileError) {
            throw profileError;
          }

          profile = {
            ...(profile || {}),
            id: user.id,
            full_name:
              newName
          };

          if ($("welcomeName")) {
            $("welcomeName").textContent =
              newName.split(" ")[0];
          }

          if ($("sidebarName")) {
            $("sidebarName").textContent =
              newName;
          }

          const initials =
            newName
              .split(/\s+/)
              .filter(Boolean)
              .map(
                (word) =>
                  word[0]
              )
              .join("")
              .slice(0, 2)
              .toUpperCase();

          if ($("sidebarAvatar")) {
            $("sidebarAvatar").textContent =
              initials || "U";
          }

          if (settingsMessage) {
            settingsMessage.textContent =
              "Profile updated successfully.";
          }

        } catch (error) {

          console.error(
            "Settings save error:",
            error
          );

          if (settingsMessage) {
            settingsMessage.textContent =
              error?.message ||
              "Could not update your profile.";
          }

        } finally {

          saveSettings.disabled =
            false;

          saveSettings.textContent =
            "Save changes";
        }
      }
    );

    /* ------------------------------------------------------------
       AUTH STATE LISTENER
       ------------------------------------------------------------ */

    supabaseClient.auth.onAuthStateChange(
      (event, session) => {

        if (
          event ===
            "SIGNED_OUT" ||
          !session
        ) {
          window.location.href =
            "login.html";
        }
      }
    );

    /* ------------------------------------------------------------
       INITIAL DATA
       ------------------------------------------------------------ */

    await Promise.all([
      loadDashboardStats(),
      loadProjects()
    ]);

    console.log(
      "VANTA AI — Dashboard authenticated and ready"
    );
  };

  /* --------------------------------------------------------------
     HTML ESCAPE
     -------------------------------------------------------------- */

  const escapeHtml = (value) => {

    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  };

  /* --------------------------------------------------------------
     START
     -------------------------------------------------------------- */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      boot,
      { once: true }
    );

  } else {

    boot();
  }

})();
