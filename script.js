// 🌑 ShadowDashboard
// Discord OAuth + Navigation + Animations + Ripple Effects + Toasts

// ============================================================
// BACKEND CONFIG
// ============================================================

// Put your PUBLIC HTTPS Quaxly backend URL here.
//
// Example:
// const BACKEND_URL = "https://your-backend-url.com";
//
// Do NOT use:
// http://localhost:8080
// 192.168.x.x
//
// GitHub Pages needs a public HTTPS backend.

const BACKEND_URL = "https://YOUR-BACKEND-URL-HERE.com";


// ============================================================
// DISCORD LOGIN
// ============================================================

function loginWithDiscord() {

    if (
        !BACKEND_URL ||
        BACKEND_URL.includes("YOUR-BACKEND-URL-HERE")
    ) {

        alert(
            "⚠️ Backend URL is not configured yet.\n\n" +
            "Open script.js and replace BACKEND_URL with your public HTTPS Quaxly backend URL."
        );

        return;
    }

    const loginUrl =
        `${BACKEND_URL}/auth/discord`;

    console.log(
        "🌑 Redirecting to Discord OAuth:",
        loginUrl
    );

    window.location.href = loginUrl;
}


// ============================================================
// PAGE NAVIGATION
// ============================================================

function showPage(pageId, button = null) {

    const pages =
        document.querySelectorAll(".page");

    const navButtons =
        document.querySelectorAll(".nav-btn");

    // Remove active state

    pages.forEach(page => {
        page.classList.remove("active");
    });

    navButtons.forEach(btn => {
        btn.classList.remove("active");
    });


    // Activate requested page

    const targetPage =
        document.getElementById(pageId);

    if (!targetPage) {

        console.warn(
            `⚠️ Page "${pageId}" was not found.`
        );

        return;
    }

    targetPage.classList.add("active");


    // Activate clicked navigation button

    if (button) {

        button.classList.add("active");

    } else {

        const matchingButton =
            document.querySelector(
                `.nav-btn[onclick*="'${pageId}'"]`
            );

        if (matchingButton) {
            matchingButton.classList.add("active");
        }

    }


    // Update page title

    const pageTitle =
        document.getElementById("pageTitle");

    const titles = {

        overview:
            "Dashboard Overview",

        server:
            "Server Management",

        xp:
            "XP & Levels",

        games:
            "Games",

        moderation:
            "Moderation",

        verification:
            "Verification",

        polls:
            "Polls",

        settings:
            "Settings"

    };

    if (pageTitle) {

        pageTitle.textContent =
            titles[pageId] ||
            "ShadowBot Dashboard";

    }


    // Scroll to top

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    // Ripple

    if (button) {
        createRipple(button);
    }

}


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ====================================================
        // RIPPLE EFFECT
        // ====================================================

        window.createRipple =
            function(element, event = null) {

                if (!element) return;

                const ripple =
                    document.createElement("span");

                ripple.className =
                    "click-ripple";


                if (event) {

                    const rect =
                        element.getBoundingClientRect();

                    ripple.style.left =
                        `${event.clientX - rect.left}px`;

                    ripple.style.top =
                        `${event.clientY - rect.top}px`;

                } else {

                    ripple.style.left =
                        "50%";

                    ripple.style.top =
                        "50%";

                }


                element.appendChild(ripple);


                setTimeout(() => {

                    ripple.remove();

                }, 600);

            };


        // ====================================================
        // BUTTON RIPPLE
        // ====================================================

        const buttons =
            document.querySelectorAll(
                "button"
            );


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                function(event) {

                    createRipple(
                        this,
                        event
                    );

                }
            );

        });


        // ====================================================
        // QUICK ACTIONS
        // ====================================================

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


        // ====================================================
        // PRIMARY BUTTON FEEDBACK
        // ====================================================

        const primaryButtons =
            document.querySelectorAll(
                ".primary-btn"
            );


        primaryButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if (
                        button.dataset.noToast ===
                        "true"
                    ) {
                        return;
                    }

                    showToast(
                        "🌑 Shadow action activated"
                    );

                }
            );

        });


        // ====================================================
        // SWITCH FEEDBACK
        // ====================================================

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


        // ====================================================
        // TOAST SYSTEM
        // ====================================================

        window.showToast =
            function(message) {

                let toast =
                    document.querySelector(
                        ".toast"
                    );


                if (!toast) {

                    toast =
                        document.createElement(
                            "div"
                        );

                    toast.className =
                        "toast";

                    document.body.appendChild(
                        toast
                    );

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

            };


        // ====================================================
        // CARD HOVER TILT
        // ====================================================

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

                    card.style.transform =
                        "";

                }
            );

        });


        // ====================================================
        // HERO PARALLAX
        // ====================================================

        const hero =
            document.querySelector(
                ".hero"
            );


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


        // ====================================================
        // ONLINE STATUS ANIMATION
        // ====================================================

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


        // ====================================================
        // NUMBER COUNTERS
        // ====================================================

        const statNumbers =
            document.querySelectorAll(
                ".stat-card strong"
            );


        statNumbers.forEach(number => {

            const text =
                number.textContent.trim();


            const match =
                text.match(/^(\d+)$/);


            if (!match) {
                return;
            }


            const target =
                Number(match[1]);


            if (target === 0) {
                return;
            }


            number.textContent =
                "0";


            const duration =
                800;


            const start =
                performance.now();


            function animateCounter(time) {

                const progress =
                    Math.min(
                        (time - start) /
                        duration,
                        1
                    );


                const current =
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


        // ====================================================
        // INPUT GLOW
        // ====================================================

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


        // ====================================================
        // SAVE SETTINGS
        // ====================================================

        window.saveSettings =
            function() {

                showToast(
                    "💾 Settings saved successfully!"
                );

            };


        // ====================================================
        // CREATE POLL
        // ====================================================

        window.createPoll =
            function() {

                const question =
                    document.getElementById(
                        "pollQuestion"
                    );


                const message =
                    document.getElementById(
                        "pollMessage"
                    );


                if (
                    !question ||
                    !question.value.trim()
                ) {

                    showToast(
                        "⚠️ Enter a poll question first."
                    );

                    return;
                }


                if (message) {

                    message.textContent =
                        "✓ Poll created successfully.";

                }


                showToast(
                    "🗳️ Poll created!"
                );

            };


        // ====================================================
        // THEME
        // ====================================================

        window.changeTheme =
            function() {

                const select =
                    document.getElementById(
                        "themeSelect"
                    );


                if (!select) {
                    return;
                }


                const theme =
                    select.value;


                document.body.dataset.theme =
                    theme;


                if (theme === "midnight") {

                    document.documentElement
                        .style
                        .setProperty(
                            "--bg",
                            "#03030a"
                        );

                } else {

                    document.documentElement
                        .style
                        .setProperty(
                            "--bg",
                            "#08080d"
                        );

                }


                showToast(
                    `🌑 ${theme} theme selected`
                );

            };


        // ====================================================
        // PAGE LOAD
        // ====================================================

        setTimeout(
            () => {

                document.body.classList.add(
                    "dashboard-loaded"
                );

            },
            100
        );


        // ====================================================
        // CONSOLE
        // ====================================================

        console.log(
            "🌑 ShadowDashboard loaded."
        );

        console.log(
            "🔐 Discord OAuth ready."
        );

    }
);
