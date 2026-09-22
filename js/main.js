/* ============================================================
   VANTA AI — MAIN JAVASCRIPT
   Global website interactions
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     DOM READY
     ========================================================== */

  document.addEventListener("DOMContentLoaded", () => {
    initPageLoader();
    initHeader();
    initMobileMenu();
    initSmoothScrolling();
    initScrollReveal();
    initActiveNavigation();
    initInteractiveDemo();
    initCardInteractions();
    initHeroInteraction();
    initFooterYear();
    initContactLinks();
    initExternalLinks();
    initKeyboardAccessibility();
  });


  /* ==========================================================
     PAGE LOADER
     ========================================================== */

  function initPageLoader() {
    const loader = document.querySelector(".page-loader");

    if (!loader) return;

    const hideLoader = () => {
      window.setTimeout(() => {
        loader.classList.add("loaded");
      }, 250);
    };

    if (document.readyState === "complete") {
      hideLoader();
    } else {
      window.addEventListener("load", hideLoader, {
        once: true
      });
    }
  }


  /* ==========================================================
     HEADER
     ========================================================== */

  function initHeader() {
    const header = document.querySelector(".site-header");

    if (!header) return;

    const updateHeader = () => {
      if (window.scrollY > 30) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      {
        passive: true
      }
    );
  }


  /* ==========================================================
     MOBILE MENU
     ========================================================== */

  function initMobileMenu() {
    const menuButton =
      document.querySelector(".mobile-menu-btn");

    const mobileNav =
      document.querySelector(".mobile-nav");

    if (!menuButton || !mobileNav) return;

    const closeMenu = () => {
      menuButton.classList.remove("active");
      mobileNav.classList.remove("open");

      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );

      document.body.classList.remove("menu-open");
    };

    const openMenu = () => {
      menuButton.classList.add("active");
      mobileNav.classList.add("open");

      menuButton.setAttribute(
        "aria-expanded",
        "true"
      );

      document.body.classList.add("menu-open");
    };

    menuButton.setAttribute(
      "aria-expanded",
      "false"
    );

    menuButton.setAttribute(
      "aria-label",
      "Open navigation menu"
    );

    menuButton.addEventListener("click", () => {
      const isOpen =
        mobileNav.classList.contains("open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileNav
      .querySelectorAll("a")
      .forEach((link) => {
        link.addEventListener("click", () => {
          closeMenu();
        });
      });

    document.addEventListener("click", (event) => {
      const clickedInside =
        mobileNav.contains(event.target) ||
        menuButton.contains(event.target);

      if (!clickedInside) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    });
  }


  /* ==========================================================
     SMOOTH SCROLLING
     ========================================================== */

  function initSmoothScrolling() {
    const links =
      document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href =
          link.getAttribute("href");

        if (!href || href === "#") return;

        const target =
          document.querySelector(href);

        if (!target) return;

        event.preventDefault();

        const header =
          document.querySelector(".site-header");

        const headerHeight =
          header
            ? header.offsetHeight
            : 0;

        const targetPosition =
          target.getBoundingClientRect().top +
          window.scrollY -
          headerHeight -
          15;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });

        history.replaceState(
          null,
          "",
          href
        );
      });
    });
  }


  /* ==========================================================
     SCROLL REVEAL
     ========================================================== */

  function initScrollReveal() {
    const elements =
      document.querySelectorAll(
        ".reveal, " +
        ".solution-card, " +
        ".automation-item, " +
        ".industry-card, " +
        ".process-card, " +
        ".price-card, " +
        ".workflow-step, " +
        ".before-panel, " +
        ".after-panel"
      );

    if (!elements.length) return;

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (reduceMotion) {
      elements.forEach((element) => {
        element.classList.add("visible");
      });

      return;
    }

    elements.forEach((element) => {
      element.classList.add("reveal");
    });

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.classList.add("visible");
      });

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries, observerInstance) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add(
              "visible"
            );

            observerInstance.unobserve(
              entry.target
            );
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -45px 0px"
        }
      );

    elements.forEach((element) => {
      observer.observe(element);
    });
  }


  /* ==========================================================
     ACTIVE NAVIGATION
     ========================================================== */

  function initActiveNavigation() {
    const navLinks =
      document.querySelectorAll(
        '.desktop-nav a[href^="#"]'
      );

    if (!navLinks.length) return;

    const sections = [];

    navLinks.forEach((link) => {
      const href =
        link.getAttribute("href");

      const section =
        document.querySelector(href);

      if (section) {
        sections.push({
          section,
          link
        });
      }
    });

    if (!sections.length) return;

    const updateActiveNav = () => {
      const scrollPosition =
        window.scrollY + 140;

      let current = null;

      sections.forEach((item) => {
        if (
          item.section.offsetTop <=
          scrollPosition
        ) {
          current = item;
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove("active");
      });

      if (current) {
        current.link.classList.add(
          "active"
        );
      }
    };

    updateActiveNav();

    window.addEventListener(
      "scroll",
      updateActiveNav,
      {
        passive: true
      }
    );
  }


  /* ==========================================================
     INTERACTIVE VANTA DEMO
     ========================================================== */

  function initInteractiveDemo() {
    const demoOptions =
      document.querySelectorAll(
        ".demo-option"
      );

    if (!demoOptions.length) return;

    const demoTitle =
      document.querySelector(
        ".demo-result h3"
      );

    const demoDescription =
      document.querySelector(
        ".demo-result > p"
      );

    const demoSteps =
      document.querySelectorAll(
        ".demo-step"
      );

    const demoData = {
      leads: {
        title:
          "Lead capture & qualification",

        description:
          "A visitor submits an enquiry. The workflow can capture the information, structure it, apply qualification rules and route the lead to the right destination.",

        steps: [
          [
            "01",
            "Trigger",
            "New enquiry"
          ],
          [
            "02",
            "AI",
            "Understand intent"
          ],
          [
            "03",
            "Action",
            "Create lead record"
          ],
          [
            "04",
            "Outcome",
            "Route for follow-up"
          ]
        ]
      },

      support: {
        title:
          "Customer support workflow",

        description:
          "Incoming support requests can be classified, enriched with relevant information and routed according to the type of request.",

        steps: [
          [
            "01",
            "Trigger",
            "New support request"
          ],
          [
            "02",
            "AI",
            "Classify request"
          ],
          [
            "03",
            "Action",
            "Route response"
          ],
          [
            "04",
            "Outcome",
            "Track resolution"
          ]
        ]
      },

      appointments: {
        title:
          "Appointment workflow",

        description:
          "An appointment request can move through qualification, scheduling and notification steps without relying on repetitive manual handling.",

        steps: [
          [
            "01",
            "Trigger",
            "Booking request"
          ],
          [
            "02",
            "AI",
            "Read request"
          ],
          [
            "03",
            "Action",
            "Schedule / route"
          ],
          [
            "04",
            "Outcome",
            "Notify customer"
          ]
        ]
      },

      reporting: {
        title:
          "Reporting & notifications",

        description:
          "Operational information can be collected from connected systems, organized into a useful summary and delivered to the appropriate team.",

        steps: [
          [
            "01",
            "Trigger",
            "New data"
          ],
          [
            "02",
            "AI",
            "Summarize information"
          ],
          [
            "03",
            "Action",
            "Prepare report"
          ],
          [
            "04",
            "Outcome",
            "Notify team"
          ]
        ]
      }
    };

    const applyDemo =
      (key) => {
        const data =
          demoData[key];

        if (!data) return;

        if (demoTitle) {
          demoTitle.textContent =
            data.title;
        }

        if (demoDescription) {
          demoDescription.textContent =
            data.description;
        }

        demoSteps.forEach(
          (step, index) => {
            const item =
              data.steps[index];

            if (!item) return;

            const elements =
              step.children;

            if (elements[0]) {
              elements[0].textContent =
                item[0];
            }

            if (elements[1]) {
              elements[1].textContent =
                item[1];
            }

            if (elements[2]) {
              elements[2].textContent =
                item[2];
            }
          }
        );
      };

    demoOptions.forEach((option) => {
      option.addEventListener(
        "click",
        () => {
          demoOptions.forEach(
            (item) => {
              item.classList.remove(
                "active"
              );
            }
          );

          option.classList.add(
            "active"
          );

          const key =
            option.dataset.demo ||
            option.dataset.usecase ||
            option.getAttribute(
              "data-target"
            );

          if (key) {
            applyDemo(key);
          }
        }
      );
    });

    const initialOption =
      document.querySelector(
        ".demo-option.active"
      );

    if (initialOption) {
      const initialKey =
        initialOption.dataset.demo ||
        initialOption.dataset.usecase ||
        initialOption.getAttribute(
          "data-target"
        );

      if (initialKey) {
        applyDemo(initialKey);
      }
    }
  }


  /* ==========================================================
     CARD INTERACTIONS
     ========================================================== */

  function initCardInteractions() {
    const cards =
      document.querySelectorAll(
        ".solution-card, " +
        ".industry-card, " +
        ".process-card, " +
        ".automation-item"
      );

    if (!cards.length) return;

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (reduceMotion) return;

    cards.forEach((card) => {
      card.addEventListener(
        "mouseenter",
        () => {
          card.classList.add(
            "is-hovered"
          );
        }
      );

      card.addEventListener(
        "mouseleave",
        () => {
          card.classList.remove(
            "is-hovered"
          );
        }
      );
    });
  }


  /* ==========================================================
     HERO INTERACTION
     ========================================================== */

  function initHeroInteraction() {
    const hero =
      document.querySelector(".hero");

    const visual =
      document.querySelector(
        ".hero-visual"
      );

    if (!hero || !visual) return;

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (reduceMotion) return;

    /*
      Only enable the subtle mouse movement
      on devices that actually have a mouse.
    */

    if (
      !window.matchMedia(
        "(hover: hover)"
      ).matches
    ) {
      return;
    }

    hero.addEventListener(
      "mousemove",
      (event) => {
        const rect =
          hero.getBoundingClientRect();

        const x =
          (event.clientX -
            rect.left) /
          rect.width;

        const y =
          (event.clientY -
            rect.top) /
          rect.height;

        const moveX =
          (x - 0.5) * 12;

        const moveY =
          (y - 0.5) * 12;

        visual.style.transform =
          `translate3d(${moveX}px, ${moveY}px, 0)`;
      }
    );

    hero.addEventListener(
      "mouseleave",
      () => {
        visual.style.transform =
          "";
      }
    );
  }


  /* ==========================================================
     FOOTER YEAR
     ========================================================== */

  function initFooterYear() {
    const year =
      document.querySelector("#year");

    if (!year) return;

    year.textContent =
      new Date().getFullYear();
  }


  /* ==========================================================
     CONTACT LINKS
     ========================================================== */

  function initContactLinks() {
    /*
      These are optional.
      If the relevant links exist on a page,
      they are enhanced without requiring
      them to exist.
    */

    const whatsappLinks =
      document.querySelectorAll(
        "[data-whatsapp]"
      );

    whatsappLinks.forEach((link) => {
      const number =
        link.dataset.whatsapp;

      if (!number) return;

      link.setAttribute(
        "href",
        `https://wa.me/${number}`
      );

      link.setAttribute(
        "target",
        "_blank"
      );

      link.setAttribute(
        "rel",
        "noopener noreferrer"
      );
    });


    const emailLinks =
      document.querySelectorAll(
        "[data-email]"
      );

    emailLinks.forEach((link) => {
      const email =
        link.dataset.email;

      if (!email) return;

      link.setAttribute(
        "href",
        `mailto:${email}`
      );
    });
  }


  /* ==========================================================
     EXTERNAL LINKS
     ========================================================== */

  function initExternalLinks() {
    const links =
      document.querySelectorAll(
        'a[href^="http://"], ' +
        'a[href^="https://"]'
      );

    links.forEach((link) => {
      const href =
        link.getAttribute("href");

      if (!href) return;

      const currentHost =
        window.location.hostname;

      let linkHost = "";

      try {
        linkHost =
          new URL(href).hostname;
      } catch {
        return;
      }

      if (
        linkHost &&
        linkHost !== currentHost
      ) {
        link.setAttribute(
          "target",
          "_blank"
        );

        link.setAttribute(
          "rel",
          "noopener noreferrer"
        );
      }
    });
  }


  /* ==========================================================
     KEYBOARD ACCESSIBILITY
     ========================================================== */

  function initKeyboardAccessibility() {
    const interactiveElements =
      document.querySelectorAll(
        "button, a, input, textarea, select"
      );

    interactiveElements.forEach(
      (element) => {
        element.addEventListener(
          "keydown",
          (event) => {
            if (
              event.key === "Enter" &&
              element.tagName === "BUTTON"
            ) {
              /*
                Native buttons already handle Enter.
                This simply keeps custom button-like
                elements from becoming inert.
              */
            }
          }
        );
      }
    );
  }


  /* ==========================================================
     BUTTON PRESS FEEDBACK
     ========================================================== */

  document.addEventListener(
    "pointerdown",
    (event) => {
      const button =
        event.target.closest(
          ".btn, .nav-cta, .price-button, .text-link"
        );

      if (!button) return;

      button.classList.add(
        "is-pressed"
      );
    }
  );

  document.addEventListener(
    "pointerup",
    () => {
      document
        .querySelectorAll(
          ".is-pressed"
        )
        .forEach((element) => {
          element.classList.remove(
            "is-pressed"
          );
        });
    }
  );


  /* ==========================================================
     GLOBAL ERROR PROTECTION
     ========================================================== */

  window.addEventListener(
    "error",
    (event) => {
      /*
        Prevent a missing optional element
        from breaking the whole page.
      */

      if (!event.error) return;

      console.warn(
        "VANTA AI page interaction warning:",
        event.error
      );
    }
  );

})();
