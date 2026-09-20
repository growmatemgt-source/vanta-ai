/* ============================================================
   VANTA AI — AUTHENTICATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const supabase = window.vantaSupabase;

  if (!supabase) {
    console.error(
      "VANTA AI: Supabase client not found."
    );
    return;
  }


  /* ------------------------------------------------------------
     DOM ELEMENTS
     ------------------------------------------------------------ */

  const loginForm =
    document.getElementById("loginForm");

  const signupForm =
    document.getElementById("signupForm");

  const forgotForm =
    document.getElementById("forgotPasswordForm");

  const logoutButtons =
    document.querySelectorAll(
      "[data-vanta-logout]"
    );


  /* ------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------ */

  function getValue(id) {
    const element =
      document.getElementById(id);

    return element
      ? element.value.trim()
      : "";
  }


  function setLoading(button, loading, text) {
    if (!button) return;

    if (loading) {
      button.dataset.originalText =
        button.textContent;

      button.disabled = true;
      button.textContent =
        text || "Please wait...";
      button.style.opacity = "0.7";
    } else {
      button.disabled = false;
      button.textContent =
        button.dataset.originalText ||
        text ||
        "Continue";
      button.style.opacity = "1";
    }
  }


  function showMessage(
    form,
    message,
    type = "error"
  ) {
    if (!form) return;

    let messageEl =
      form.querySelector(
        ".auth-message"
      );

    if (!messageEl) {
      messageEl =
        document.createElement("div");

      messageEl.className =
        "auth-message";

      form.prepend(messageEl);
    }

    messageEl.textContent =
      message;

    messageEl.dataset.type =
      type;

    messageEl.style.display =
      "block";

    messageEl.style.marginBottom =
      "14px";

    messageEl.style.padding =
      "11px 13px";

    messageEl.style.borderRadius =
      "10px";

    messageEl.style.fontSize =
      "13px";

    messageEl.style.lineHeight =
      "1.5";

    if (type === "success") {
      messageEl.style.color =
        "#9BEAF5";

      messageEl.style.background =
        "rgba(34,211,238,.07)";

      messageEl.style.border =
        "1px solid rgba(34,211,238,.15)";
    } else {
      messageEl.style.color =
        "#FFAAAA";

      messageEl.style.background =
        "rgba(255,80,100,.07)";

      messageEl.style.border =
        "1px solid rgba(255,80,100,.15)";
    }
  }


  function clearMessage(form) {
    if (!form) return;

    const messageEl =
      form.querySelector(
        ".auth-message"
      );

    if (messageEl) {
      messageEl.style.display =
        "none";
    }
  }


  function redirectToDashboard() {
    window.location.href =
      "dashboard.html";
  }


  function redirectToLogin() {
    window.location.href =
      "login.html";
  }


  /* ------------------------------------------------------------
     ERROR NORMALIZATION
     ------------------------------------------------------------ */

  function friendlyAuthError(error) {
    const message =
      String(
        error?.message || ""
      ).toLowerCase();

    if (
      message.includes(
        "invalid login credentials"
      )
    ) {
      return "Email ya password incorrect hai.";
    }

    if (
      message.includes(
        "email not confirmed"
      )
    ) {
      return "Please pehle apni email confirm karein.";
    }

    if (
      message.includes(
        "user already registered"
      )
    ) {
      return "Is email se account already registered hai.";
    }

    if (
      message.includes(
        "password should be at least"
      )
    ) {
      return "Password kam az kam 6 characters ka hona chahiye.";
    }

    if (
      message.includes(
        "unable to validate email"
      ) ||
      message.includes(
        "invalid email"
      )
    ) {
      return "Please valid email address enter karein.";
    }

    if (
      message.includes(
        "rate limit"
      )
    ) {
      return "Too many attempts. Kuch der baad dobara try karein.";
    }

    if (error?.message) {
      return error.message;
    }

    return "Something went wrong. Please try again.";
  }


  /* ------------------------------------------------------------
     LOGIN
     ------------------------------------------------------------ */

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        clearMessage(loginForm);

        const email =
          getValue("loginEmail");

        const password =
          getValue("loginPassword");

        const button =
          loginForm.querySelector(
            'button[type="submit"]'
          );


        if (!email) {
          showMessage(
            loginForm,
            "Please apna email enter karein."
          );
          return;
        }


        if (!password) {
          showMessage(
            loginForm,
            "Please apna password enter karein."
          );
          return;
        }


        setLoading(
          button,
          true,
          "Signing in..."
        );


        try {

          const {
            data,
            error
          } = await supabase.auth.signInWithPassword({
            email,
            password
          });


          if (error) {
            throw error;
          }


          if (!data?.user) {
            throw new Error(
              "Login failed. User session was not created."
            );
          }


          showMessage(
            loginForm,
            "Login successful. Opening dashboard...",
            "success"
          );


          setTimeout(
            redirectToDashboard,
            500
          );


        } catch (error) {

          console.error(
            "VANTA AI login error:",
            error
          );

          showMessage(
            loginForm,
            friendlyAuthError(error)
          );

          setLoading(
            button,
            false
          );
        }

      }
    );
  }


  /* ------------------------------------------------------------
     SIGNUP
     ------------------------------------------------------------ */

  if (signupForm) {

    signupForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        clearMessage(signupForm);

        const name =
          getValue("signupName");

        const email =
          getValue("signupEmail");

        const password =
          getValue("signupPassword");

        const confirmPassword =
          getValue(
            "signupConfirmPassword"
          );

        const button =
          signupForm.querySelector(
            'button[type="submit"]'
          );


        if (!name) {
          showMessage(
            signupForm,
            "Please apna naam enter karein."
          );
          return;
        }


        if (!email) {
          showMessage(
            signupForm,
            "Please apna email enter karein."
          );
          return;
        }


        if (!password) {
          showMessage(
            signupForm,
            "Please password enter karein."
          );
          return;
        }


        if (password.length < 6) {
          showMessage(
            signupForm,
            "Password kam az kam 6 characters ka hona chahiye."
          );
          return;
        }


        if (
          confirmPassword &&
          password !== confirmPassword
        ) {
          showMessage(
            signupForm,
            "Passwords match nahi kar rahe."
          );
          return;
        }


        setLoading(
          button,
          true,
          "Creating account..."
        );


        try {

          const {
            data,
            error
          } = await supabase.auth.signUp({
            email,
            password,

            options: {
              data: {
                full_name: name,
                name: name
              }
            }
          });


          if (error) {
            throw error;
          }


          /*
             If email confirmation is disabled,
             Supabase may immediately create
             an authenticated session.
          */

          if (data?.session) {

            showMessage(
              signupForm,
              "Account created successfully. Opening dashboard...",
              "success"
            );

            setTimeout(
              redirectToDashboard,
              500
            );

            return;
          }


          /*
             If email confirmation is enabled,
             show confirmation message.
          */

          showMessage(
            signupForm,
            "Account created. Please check your email to confirm your account.",
            "success"
          );


          signupForm.reset();

          setLoading(
            button,
            false
          );


        } catch (error) {

          console.error(
            "VANTA AI signup error:",
            error
          );

          showMessage(
            signupForm,
            friendlyAuthError(error)
          );

          setLoading(
            button,
            false
          );
        }

      }
    );
  }


  /* ------------------------------------------------------------
     FORGOT PASSWORD
     ------------------------------------------------------------ */

  if (forgotForm) {

    forgotForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        clearMessage(forgotForm);

        const email =
          getValue("forgotEmail");

        const button =
          forgotForm.querySelector(
            'button[type="submit"]'
          );


        if (!email) {
          showMessage(
            forgotForm,
            "Please apna email enter karein."
          );
          return;
        }


        setLoading(
          button,
          true,
          "Sending..."
        );


        try {

          const {
            error
          } = await supabase.auth.resetPasswordForEmail(
            email,
            {
              redirectTo:
                `${window.location.origin}/login.html`
            }
          );


          if (error) {
            throw error;
          }


          showMessage(
            forgotForm,
            "Password reset link email kar diya gaya hai. Apna inbox check karein.",
            "success"
          );


          forgotForm.reset();

          setLoading(
            button,
            false
          );


        } catch (error) {

          console.error(
            "VANTA AI password reset error:",
            error
          );

          showMessage(
            forgotForm,
            friendlyAuthError(error)
          );

          setLoading(
            button,
            false
          );
        }

      }
    );
  }


  /* ------------------------------------------------------------
     LOGOUT
     ------------------------------------------------------------ */

  logoutButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        async () => {

          try {

            button.disabled =
              true;

            const {
              error
            } = await supabase.auth.signOut();

            if (error) {
              throw error;
            }

            redirectToLogin();

          } catch (error) {

            console.error(
              "VANTA AI logout error:",
              error
            );

            button.disabled =
              false;

            alert(
              "Logout nahi ho saka. Please dobara try karein."
            );
          }

        }
      );

    }
  );


  /* ------------------------------------------------------------
     SESSION-BASED PAGE PROTECTION
     ------------------------------------------------------------ */

  const currentPage =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();


  const protectedPages = [
    "dashboard.html",
    "admin.html"
  ];


  const authPages = [
    "login.html"
  ];


  const {
    data: {
      session
    }
  } =
    await supabase.auth.getSession();


  /*
     User already logged in and opens login page
     → dashboard
  */

  if (
    session &&
    authPages.includes(
      currentPage
    )
  ) {
    redirectToDashboard();
    return;
  }


  /*
     User is not logged in and opens
     protected page → login
  */

  if (
    !session &&
    protectedPages.includes(
      currentPage
    )
  ) {
    redirectToLogin();
    return;
  }


  /* ------------------------------------------------------------
     AUTH STATE LISTENER
     ------------------------------------------------------------ */

  supabase.auth.onAuthStateChange(
    (event, newSession) => {

      if (
        event === "SIGNED_OUT" &&
        protectedPages.includes(
          currentPage
        )
      ) {
        redirectToLogin();
      }

      if (
        event === "SIGNED_IN" &&
        authPages.includes(
          currentPage
        )
      ) {
        redirectToDashboard();
      }

    }
  );


  /* ------------------------------------------------------------
     PASSWORD VISIBILITY
     ------------------------------------------------------------ */

  const passwordToggles =
    document.querySelectorAll(
      "[data-password-toggle]"
    );


  passwordToggles.forEach(
    (toggle) => {

      toggle.addEventListener(
        "click",
        () => {

          const targetId =
            toggle.getAttribute(
              "data-password-toggle"
            );

          const input =
            document.getElementById(
              targetId
            );

          if (!input) return;

          if (
            input.type === "password"
          ) {
            input.type =
              "text";

            toggle.textContent =
              "Hide";
          } else {
            input.type =
              "password";

            toggle.textContent =
              "Show";
          }

        }
      );

    }
  );


  /* ------------------------------------------------------------
     ENTER KEY SUPPORT
     ------------------------------------------------------------ */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key !== "Enter"
      ) {
        return;
      }

      const active =
        document.activeElement;

      if (
        active?.tagName === "INPUT"
      ) {
        const form =
          active.closest("form");

        if (form) {
          /*
             Browser's normal form submission
             will handle the event.
          */
        }
      }

    }
  );


  /* ------------------------------------------------------------
     CONSOLE BRANDING
     ------------------------------------------------------------ */

  console.log(
    "%c VANTA AI AUTH ",
    "background:#7C5CFF;color:#fff;padding:6px 10px;border-radius:6px;font-weight:700;"
  );

});
