/* ============================================================
   VANTA AI — MAIN JAVASCRIPT
   Production UI / UX
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* ========================================================
       PAGE LOADER
       ======================================================== */

    const loader = document.querySelector(".page-loader");

    if (loader) {
        const hideLoader = () => {
            setTimeout(() => {
                loader.classList.add("loaded");
            }, 450);
        };

        if (document.readyState === "complete") {
            hideLoader();
        } else {
            window.addEventListener("load", hideLoader, { once: true });
        }
    }


    /* ========================================================
       HEADER — SCROLL EFFECT
       ======================================================== */

    const header = document.querySelector(".site-header");

    const handleHeader = () => {
        if (!header) return;

        header.classList.toggle("scrolled", window.scrollY > 30);
    };

    handleHeader();

    window.addEventListener("scroll", handleHeader, {
        passive: true
    });


    /* ========================================================
       MOBILE MENU
       ======================================================== */

    const menuButton = document.querySelector(".mobile-menu-btn");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {

        const closeMobileMenu = () => {
            menuButton.classList.remove("active");
            mobileNav.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
        };

        const openMobileMenu = () => {
            menuButton.classList.add("active");
            mobileNav.classList.add("open");
            menuButton.setAttribute("aria-expanded", "true");
        };

        menuButton.setAttribute("aria-expanded", "false");

        menuButton.addEventListener("click", () => {

            const isOpen = mobileNav.classList.contains("open");

            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }

        });


        /* Close after clicking navigation link */

        mobileNav.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {
                closeMobileMenu();
            });

        });


        /* Close when clicking outside */

        document.addEventListener("click", (event) => {

            if (
                mobileNav.classList.contains("open") &&
                !mobileNav.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {
                closeMobileMenu();
            }

        });


        /* Close with Escape */

        document.addEventListener("keydown", (event) => {

            if (event.key === "Escape") {
                closeMobileMenu();
            }

        });


        /* Reset on desktop */

        window.addEventListener("resize", () => {

            if (window.innerWidth > 900) {
                closeMobileMenu();
            }

        });

    }


    /* ========================================================
       SMOOTH SCROLL
       ======================================================== */

    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            let target;

            try {
                target = document.querySelector(targetId);
            } catch {
                return;
            }

            if (!target) return;

            event.preventDefault();

            const headerHeight = header
                ? header.offsetHeight
                : 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                12;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

        });

    });


    /* ========================================================
       SCROLL REVEAL
       ======================================================== */

    const revealElements = document.querySelectorAll(".reveal");

    if (
        "IntersectionObserver" in window &&
        revealElements.length
    ) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("revealed");

                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -45px 0px"
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });

    } else {

        revealElements.forEach((element) => {
            element.classList.add("revealed");
        });

    }


    /* ========================================================
       ACTIVE NAVIGATION
       ======================================================== */

    const navLinks = document.querySelectorAll(
        '.desktop-nav a[href^="#"], .mobile-nav a[href^="#"]'
    );

    const sections = document.querySelectorAll("main section[id]");

    if (navLinks.length && sections.length) {

        const updateActiveNav = () => {

            const scrollPosition =
                window.scrollY +
                (header ? header.offsetHeight : 0) +
                120;

            let currentSection = "";

            sections.forEach((section) => {

                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (
                    scrollPosition >= sectionTop &&
                    scrollPosition < sectionTop + sectionHeight
                ) {
                    currentSection = section.id;
                }

            });

            navLinks.forEach((link) => {

                const href = link.getAttribute("href");

                link.classList.toggle(
                    "active",
                    href === `#${currentSection}`
                );

            });

        };

        updateActiveNav();

        window.addEventListener(
            "scroll",
            updateActiveNav,
            { passive: true }
        );

    }


    /* ========================================================
       BUTTON MICRO INTERACTIONS
       ======================================================== */

    const buttons = document.querySelectorAll(".btn");

    buttons.forEach((button) => {

        button.addEventListener("mouseenter", () => {
            button.style.willChange = "transform";
        });

        button.addEventListener("mouseleave", () => {
            button.style.willChange = "auto";
        });

    });


    /* ========================================================
       CARD HOVER EFFECT
       ======================================================== */

    const cards = document.querySelectorAll(
        ".solution-card, .workflow-card, .process-card, .pricing-card, .integration-card"
    );

    cards.forEach((card) => {

        card.addEventListener("mouseenter", () => {
            card.style.willChange = "transform";
        });

        card.addEventListener("mouseleave", () => {
            card.style.willChange = "auto";
        });

    });


    /* ========================================================
       HERO ORBIT — SUBTLE MOUSE MOVEMENT
       ======================================================== */

    const heroVisual = document.querySelector(".hero-visual");

    if (heroVisual && window.matchMedia("(pointer: fine)").matches) {

        let ticking = false;

        heroVisual.addEventListener("mousemove", (event) => {

            if (ticking) return;

            window.requestAnimationFrame(() => {

                const rect = heroVisual.getBoundingClientRect();

                const x =
                    (event.clientX - rect.left) /
                    rect.width -
                    0.5;

                const y =
                    (event.clientY - rect.top) /
                    rect.height -
                    0.5;

                heroVisual.style.setProperty(
                    "--mouse-x",
                    `${x * 12}px`
                );

                heroVisual.style.setProperty(
                    "--mouse-y",
                    `${y * 12}px`
                );

                ticking = false;

            });

            ticking = true;

        });

        heroVisual.addEventListener("mouseleave", () => {

            heroVisual.style.setProperty(
                "--mouse-x",
                "0px"
            );

            heroVisual.style.setProperty(
                "--mouse-y",
                "0px"
            );

        });

    }


    /* ========================================================
       CURRENT YEAR
       ======================================================== */

    const yearElement = document.querySelector("#year");

    if (yearElement) {
        yearElement.textContent =
            new Date().getFullYear();
    }


    /* ========================================================
       EXTERNAL / CTA BUTTON FEEDBACK
       ======================================================== */

    const actionLinks = document.querySelectorAll(
        'a[href^="mailto:"], a[href^="https://wa.me/"]'
    );

    actionLinks.forEach((link) => {

        link.addEventListener("click", () => {
            link.classList.add("clicked");

            setTimeout(() => {
                link.classList.remove("clicked");
            }, 500);
        });

    });


    /* ========================================================
       REDUCED MOTION ACCESSIBILITY
       ======================================================== */

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    if (reducedMotion.matches) {

        document.documentElement.style.scrollBehavior =
            "auto";

        revealElements.forEach((element) => {
            element.classList.add("revealed");
        });

    }


    /* ========================================================
       CONSOLE BRANDING
       ======================================================== */

    console.log(
        "%cVANTA AI",
        "font-size:22px;font-weight:700;color:#7C5CFF;"
    );

    console.log(
        "%cAutomation that works.",
        "font-size:13px;color:#22D3EE;"
    );

});
