// 🌑 ShadowDashboard
// Navigation + Login + Animations + Toasts + Backend

var BACKEND_URL = "https://shadoweditzdev.github.io/ShadowDashboard/";

// =========================
// DISCORD LOGIN
// =========================

function loginWithDiscord() {

    if (
        !BACKEND_URL ||
        BACKEND_URL === "YOUR_BACKEND_URL_HERE"
    ) {
        alert("❌ BACKEND_URL is not configured yet.");
        return;
    }

    window.location.href =
        `${BACKEND_URL}/auth/discord`;
}


// =========================
// PAGE NAVIGATION
// =========================

function showPage(pageId, button = null) {

    const pages =
        document.querySelectorAll(".page");

    const navButtons =
        document.querySelectorAll(".nav-btn");

    pages.forEach(page => {
        page.classList.remove("active");
    });

    navButtons.forEach(btn => {
        btn.classList.remove("active");
    });

    const page =
        document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }

    if (button) {
        button.classList.add("active");
    } else {

        navButtons.forEach(btn => {

            const onclick =
                btn.getAttribute("onclick") || "";

            if (
                onclick.includes(
                    `showPage('${pageId}'`
                )
            ) {
                btn.classList.add("active");
            }

        });

    }

    const pageTitle =
        document.getElementById("pageTitle");

    const titles = {
        overview: "Dashboard Overview",
        server: "Server Management",
        xp: "XP & Levels",
        games: "Games",
        moderation: "Moderation",
        verification: "Verification",
        polls: "Polls",
        settings: "Settings"
    };

    if (pageTitle && titles[pageId]) {
        pageTitle.textContent =
            titles[pageId];
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    createRipple(
        button || page
    );
}


// =========================
// DOM READY
// =========================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // =========================
        // NAV BUTTONS
        // =========================

        const navButtons =
            document.querySelectorAll(".nav-btn");

        navButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const onclick =
                        button.getAttribute("onclick") || "";

                    const match =
                        onclick.match(
                            /showPage\(['"]([^'"]+)/
                        );

                    if (match) {
                        showPage(
                            match[1],
                            button
                        );
                    }

                }
            );

        });


        // =========================
        // RIPPLE EFFECTS
        // =========================

        const buttons =
            document.querySelectorAll(
                "button"
            );

        buttons.forEach(button => {

            button.addEventListener(
                "click",
                function (event) {

                    createButtonRipple(
                        this,
                        event
                    );

                }
            );

        });


        // =========================
        // QUICK ACTIONS
        // =========================

        const quickButtons =
            document.querySelectorAll(
                ".quick-actions button"
            );

        quickButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const text =
                        button.innerText.trim();

                    showToast(
                        `⚡ ${text} selected`
                    );

                }
            );

        });


        // =========================
        // SWITCHES
        // =========================

        const switches =
            document.querySelectorAll(
                ".switch input"
            );

        switches.forEach(toggle => {

            toggle.addEventListener(
                "change",
                () => {

                    if (toggle.checked) {

                        showToast(
                            "🟣 Feature enabled"
                        );

                    } else {

                        showToast(
                            "⚫ Feature disabled"
                        );

                    }

                }
            );

        });


        // =========================
        // CARD TILT
        // =========================

        const cards =
            document.querySelectorAll(
                ".stat-card, .setting-card, .game-panel"
            );

        cards.forEach(card => {

            card.addEventListener(
                "mousemove",
                event => {

                    const rect =
                        card.getBoundingClientRect();

                    const x =
                        event.clientX -
                        rect.left;

                    const y =
                        event.clientY -
                        rect.top;

                    const rotateX =
                        ((y / rect.height) - 0.5) *
                        -3;

                    const rotateY =
                        ((x / rect.width) - 0.5) *
                        3;

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
                        (event.clientX -
                            rect.left) /
                        rect.width;

                    const y =
                        (event.clientY -
                            rect.top) /
                        rect.height;

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
        // ONLINE ANIMATION
        // =========================

        const online =
            document.querySelector(
                ".online-badge"
            );

        if (online) {

            setInterval(
                () => {

                    online.style.transform =
                        "scale(1.03)";

                    setTimeout(
                        () => {

                            online.style.transform =
                                "scale(1)";

                        },
                        300
                    );

                },
                2500
            );

        }


        // =========================
        // NUMBER COUNTERS
        // =========================

        const statNumbers =
            document.querySelectorAll(
                ".stat-card strong"
            );

        statNumbers.forEach(number => {

            const text =
                number.textContent.trim();

            const match =
                text.match(/^([\d,]+)$/);

            if (!match) return;

            const target =
                Number(
                    match[1].replace(/,/g, "")
                );

            if (!target) return;

            number.textContent = "0";

            const duration = 800;

            const start =
                performance.now();

            function animateCounter(time) {

                const progress =
                    Math.min(
                        (time - start) /
                        duration,
                        1
                    );

                const value =
                    Math.floor(
                        target *
                        (
                            1 -
                            Math.pow(
                                1 - progress,
                                3
                            )
                        )
                    );

                number.textContent =
                    value.toLocaleString();

                if (progress < 1) {

                    requestAnimationFrame(
                        animateCounter
                    );

                } else {

                    number.textContent =
                        target.toLocaleString();

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

        setTimeout(
            () => {

                document.body.classList.add(
                    "dashboard-loaded"
                );

            },
            100
        );


        console.log(
            "🌑 ShadowDashboard loaded successfully."
        );

    }
);


// =========================
// RIPPLE
// =========================

function createRipple(element) {

    if (!element) return;

    const ripple =
        document.createElement("span");

    ripple.className =
        "click-ripple";

    element.appendChild(ripple);

    setTimeout(
        () => {

            ripple.remove();

        },
        600
    );
}


function createButtonRipple(
    element,
    event
) {

    if (!element) return;

    const rect =
        element.getBoundingClientRect();

    const ripple =
        document.createElement("span");

    ripple.className =
        "click-ripple";

    ripple.style.left =
        `${event.clientX - rect.left}px`;

    ripple.style.top =
        `${event.clientY - rect.top}px`;

    element.appendChild(ripple);

    setTimeout(
        () => {

            ripple.remove();

        },
        600
    );
}


// =========================
// TOAST
// =========================

function showToast(message) {

    let toast =
        document.querySelector(".toast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.className =
            "toast";

        document.body.appendChild(toast);

    }

    toast.textContent =
        message;

    toast.classList.remove(
        "show"
    );

    void toast.offsetWidth;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toast.hideTimer
    );

    toast.hideTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );
}


// =========================
// SAVE SETTINGS
// =========================

function saveSettings() {

    showToast(
        "💾 Settings saved successfully!"
    );

}


// =========================
// CREATE POLL
// =========================

function createPoll() {

    const question =
        document.getElementById(
            "pollQuestion"
        );

    const message =
        document.getElementById(
            "pollMessage"
        );

    if (!question) return;

    if (!question.value.trim()) {

        showToast(
            "⚠️ Enter a poll question first."
        );

        return;
    }

    if (message) {

        message.textContent =
            "🗳️ Poll created successfully!";

    }

    showToast(
        "🗳️ Poll created!"
    );

}


// =========================
// THEME
// =========================

function changeTheme() {

    const select =
        document.getElementById(
            "themeSelect"
        );

    if (!select) return;

    const theme =
        select.value;

    document.body.dataset.theme =
        theme;

    showToast(
        `🎨 Theme changed to ${theme}`
    );

}
