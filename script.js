// 🌑 ShadowDashboard
// Animated UI + Navigation + Ripple Effects + Toasts

document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // PAGE NAVIGATION
    // =========================

    const navButtons = document.querySelectorAll(".nav-btn");
    const pages = document.querySelectorAll(".page");

    navButtons.forEach(button => {

        button.addEventListener("click", () => {

            const target = button.dataset.page;

            if (!target) return;

            // Active navigation
            navButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            // Switch page
            pages.forEach(page => {
                page.classList.remove("active");
            });

            const targetPage = document.getElementById(target);

            if (targetPage) {
                targetPage.classList.add("active");
            }

            // Smooth scroll to top
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            // Small click effect
            createRipple(button);
        });

    });


    // =========================
    // RIPPLE EFFECT
    // =========================

    function createRipple(element) {

        const ripple = document.createElement("span");

        ripple.className = "click-ripple";

        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);

    }


    // =========================
    // RIPPLE ON BUTTONS
    // =========================

    const buttons = document.querySelectorAll(
        "button, .primary-btn, .quick-actions button"
    );

    buttons.forEach(button => {

        button.addEventListener("click", function (event) {

            const rect = this.getBoundingClientRect();

            const ripple = document.createElement("span");

            ripple.className = "click-ripple";

            ripple.style.left =
                `${event.clientX - rect.left}px`;

            ripple.style.top =
                `${event.clientY - rect.top}px`;

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);

        });

    });


    // =========================
    // QUICK ACTION FEEDBACK
    // =========================

    const quickButtons =
        document.querySelectorAll(".quick-actions button");

    quickButtons.forEach(button => {

        button.addEventListener("click", () => {

            const text =
                button.innerText.trim();

            showToast(
                `⚡ ${text} selected`
            );

        });

    });


    // =========================
    // PRIMARY BUTTON FEEDBACK
    // =========================

    const primaryButtons =
        document.querySelectorAll(".primary-btn");

    primaryButtons.forEach(button => {

        button.addEventListener("click", () => {

            if (
                button.dataset.noToast === "true"
            ) {
                return;
            }

            showToast("🌑 Shadow action activated");

        });

    });


    // =========================
    // SWITCH FEEDBACK
    // =========================

    const switches =
        document.querySelectorAll(
            ".switch input"
        );

    switches.forEach(toggle => {

        toggle.addEventListener("change", () => {

            if (toggle.checked) {

                showToast(
                    "🟣 Feature enabled"
                );

            } else {

                showToast(
                    "⚫ Feature disabled"
                );

            }

        });

    });


    // =========================
    // TOAST SYSTEM
    // =========================

    function showToast(message) {

        let toast =
            document.querySelector(".toast");

        if (!toast) {

            toast =
                document.createElement("div");

            toast.className = "toast";

            document.body.appendChild(toast);

        }

        toast.textContent = message;

        toast.classList.remove("show");

        // Force animation restart
        void toast.offsetWidth;

        toast.classList.add("show");

        clearTimeout(
            toast.hideTimer
        );

        toast.hideTimer =
            setTimeout(() => {

                toast.classList.remove("show");

            }, 2500);

    }


    // =========================
    // CARD HOVER TILT
    // =========================

    const cards = document.querySelectorAll(
        ".stat-card, .setting-card, .game-panel"
    );

    cards.forEach(card => {

        card.addEventListener(
            "mousemove",
            event => {

                const rect =
                    card.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;

                const rotateX =
                    ((y / rect.height) - 0.5) * -3;

                const rotateY =
                    ((x / rect.width) - 0.5) * 3;

                card.style.transform =
                    `perspective(700px)
                     rotateX(${rotateX}deg)
                     rotateY(${rotateY}deg)
                     translateY(-4px)`;

            }
        );

        card.addEventListener(
            "mouseleave",
            () => {

                card.style.transform = "";

            }
        );

    });


    // =========================
    // HERO PARALLAX
    // =========================

    const hero =
        document.querySelector(".hero");

    if (hero) {

        hero.addEventListener(
            "mousemove",
            event => {

                const rect =
                    hero.getBoundingClientRect();

                const x =
                    (event.clientX - rect.left)
                    / rect.width;

                const y =
                    (event.clientY - rect.top)
                    / rect.height;

                const moveX =
                    (x - 0.5) * 8;

                const moveY =
                    (y - 0.5) * 8;

                hero.style.backgroundPosition =
                    `${50 + moveX}% ${50 + moveY}%`;

            }
        );

        hero.addEventListener(
            "mouseleave",
            () => {

                hero.style.backgroundPosition =
                    "center";

            }
        );

    }


    // =========================
    // ONLINE STATUS ANIMATION
    // =========================

    const online =
        document.querySelector(".online-badge");

    if (online) {

        setInterval(() => {

            online.style.transform =
                "scale(1.03)";

            setTimeout(() => {

                online.style.transform =
                    "scale(1)";

            }, 300);

        }, 2500);

    }


    // =========================
    // NUMBER COUNTER
    // =========================

    const statNumbers =
        document.querySelectorAll(
            ".stat-card strong"
        );

    statNumbers.forEach(number => {

        const text =
            number.textContent.trim();

        const match =
            text.match(/^(\d+)$/);

        if (!match) return;

        const target =
            Number(match[1]);

        if (target === 0) return;

        number.textContent = "0";

        let current = 0;

        const duration = 800;

        const start =
            performance.now();

        function animateCounter(time) {

            const progress =
                Math.min(
                    (time - start) / duration,
                    1
                );

            current =
                Math.floor(
                    target *
                    (1 -
                        Math.pow(
                            1 - progress,
                            3
                        ))
                );

            number.textContent =
                current;

            if (progress < 1) {

                requestAnimationFrame(
                    animateCounter
                );

            } else {

                number.textContent =
                    target;

            }

        }

        requestAnimationFrame(
            animateCounter
        );

    });


    // =========================
    // INPUT GLOW
    // =========================

    const inputs =
        document.querySelectorAll(
            ".text-input, .number-input, select"
        );

    inputs.forEach(input => {

        input.addEventListener(
            "focus",
            () => {

                input.style.boxShadow =
                    "0 0 20px rgba(139,92,246,0.15)";

            }
        );

        input.addEventListener(
            "blur",
            () => {

                input.style.boxShadow =
                    "";

            }
        );

    });


    // =========================
    // PAGE LOAD
    // =========================

    setTimeout(() => {

        document.body.classList.add(
            "dashboard-loaded"
        );

    }, 100);


    console.log(
        "🌑 ShadowDashboard animations loaded."
    );

});
