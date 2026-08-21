// 🌑 ShadowDashboard
// Navigation + Discord OAuth + Session + Animations + Toasts + Backend

const BACKEND_URL =
    "https://punctured-aide-yogurt.ngrok-free.dev";

const NGROK_HEADER = {
    "ngrok-skip-browser-warning": "true"
};


// =========================
// DISCORD LOGIN
// =========================

function loginWithDiscord() {

    console.log("🔐 Opening Discord OAuth...");

    window.location.href =
        BACKEND_URL + "/auth/discord";
}


// =========================
// GET SESSION
// =========================

function getSession() {

    return localStorage.getItem(
        "shadowbot_session"
    );
}


// =========================
// SAVE SESSION
// =========================

function saveSession(session) {

    if (!session)
        return;

    localStorage.setItem(
        "shadowbot_session",
        session
    );
}


// =========================
// CLEAR SESSION
// =========================

function clearSession() {

    localStorage.removeItem(
        "shadowbot_session"
    );
}


// =========================
// API REQUEST
// =========================

async function apiFetch(
    endpoint,
    options = {}
) {

    const session =
        getSession();

    const headers = {

        "Accept":
            "application/json",

        ...NGROK_HEADER,

        ...(options.headers || {})
    };

    if (session) {

        headers.Authorization =
            `Bearer ${session}`;
    }

    return fetch(
        BACKEND_URL + endpoint,
        {
            ...options,
            headers,
            credentials: "include"
        }
    );
}


// =========================
// CHECK DISCORD LOGIN
// =========================

async function checkDiscordLogin() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const loginStatus =
            params.get("login");

        const session =
            params.get("session");


        // =========================
        // SAVE OAUTH SESSION
        // =========================

        if (session) {

            console.log(
                "🔑 OAuth session received."
            );

            saveSession(session);
        }


        // =========================
        // OAUTH FAILED
        // =========================

        if (
            loginStatus === "failed" ||
            loginStatus === "error" ||
            loginStatus === "cancelled"
        ) {

            console.error(
                "❌ Discord OAuth failed:",
                loginStatus
            );

            clearSession();

            cleanURL();

            showToast(
                "❌ Discord login failed."
            );

            return;
        }


        // =========================
        // CHECK BACKEND SESSION
        // =========================

        console.log(
            "🔍 Checking Discord session..."
        );

        const response =
            await apiFetch(
                "/api/me"
            );


        // =========================
        // NOT LOGGED IN
        // =========================

        if (!response.ok) {

            console.log(
                "🔒 No valid dashboard session:",
                response.status
            );

            cleanURL();

            return;
        }


        const data =
            await response.json();


        console.log(
            "📡 Session response:",
            data
        );


        // =========================
        // LOGGED IN
        // =========================

        if (
            data.loggedIn &&
            data.user
        ) {

            console.log(
                "✅ Logged in as:",
                data.user.username
            );


            // =========================
            // HIDE LOGIN SCREEN
            // =========================

            const loginScreen =
                document.getElementById(
                    "loginScreen"
                );

            if (loginScreen) {

                loginScreen.style.display =
                    "none";
            }


            // =========================
            // UPDATE USERNAME
            // =========================

            const username =
                data.user.username;

            const topUsername =
                document.getElementById(
                    "topUsername"
                );

            const dashboardUsername =
                document.getElementById(
                    "dashboardUsername"
                );

            if (topUsername) {

                topUsername.textContent =
                    username;
            }

            if (dashboardUsername) {

                dashboardUsername.textContent =
                    username;
            }


            // =========================
            // UPDATE AVATAR
            // =========================

            const userAvatar =
                document.getElementById(
                    "userAvatar"
                );

            if (
                userAvatar &&
                data.user.avatar
            ) {

                userAvatar.innerHTML = "";

                const img =
                    document.createElement(
                        "img"
                    );

                img.src =
                    data.user.avatar;

                img.alt =
                    username;

                img.style.width =
                    "100%";

                img.style.height =
                    "100%";

                img.style.objectFit =
                    "cover";

                img.style.borderRadius =
                    "inherit";

                userAvatar.appendChild(
                    img
                );
            }


            // =========================
            // WELCOME MESSAGE
            // =========================

            if (
                loginStatus === "success" ||
                session
            ) {

                showToast(
                    `👋 Welcome, ${username}!`
                );
            }


            cleanURL();

            return;
        }


        console.log(
            "🔒 Backend says user is not logged in."
        );

    } catch (error) {

        console.error(
            "❌ Login check failed:",
            error
        );
    }
}


// =========================
// CLEAN URL
// =========================

function cleanURL() {

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );
}


// =========================
// LOGOUT
// =========================

async function logout() {

    try {

        await apiFetch(
            "/auth/logout",
            {
                method: "POST"
            }
        );

    } catch (error) {

        console.error(
            "❌ Logout request failed:",
            error
        );

    } finally {

        clearSession();

        console.log(
            "👋 Logged out."
        );

        window.location.reload();
    }
}


// =========================
// PAGE NAVIGATION
// =========================

function showPage(
    pageId,
    button = null
) {

    const pages =
        document.querySelectorAll(
            ".page"
        );

    const navButtons =
        document.querySelectorAll(
            ".nav-btn"
        );

    pages.forEach(
        page => {

            page.classList.remove(
                "active"
            );

        }
    );

    navButtons.forEach(
        btn => {

            btn.classList.remove(
                "active"
            );

        }
    );

    const page =
        document.getElementById(
            pageId
        );

    if (page) {

        page.classList.add(
            "active"
        );
    }

    if (button) {

        button.classList.add(
            "active"
        );

    } else {

        navButtons.forEach(
            btn => {

                const onclick =
                    btn.getAttribute(
                        "onclick"
                    ) || "";

                if (
                    onclick.includes(
                        `showPage('${pageId}'`
                    ) ||
                    onclick.includes(
                        `showPage("${pageId}"`
                    )
                ) {

                    btn.classList.add(
                        "active"
                    );
                }

            }
        );
    }

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

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

    if (
        pageTitle &&
        titles[pageId]
    ) {

        pageTitle.textContent =
            titles[pageId];
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================
// DOM READY
// =========================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkDiscordLogin();


        // =========================
        // RIPPLE EFFECTS
        // =========================

        const buttons =
            document.querySelectorAll(
                "button"
            );

        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    function(event) {

                        createButtonRipple(
                            this,
                            event
                        );

                    }
                );

            }
        );


        // =========================
        // QUICK ACTIONS
        // =========================

        const quickButtons =
            document.querySelectorAll(
                ".quick-actions button"
            );

        quickButtons.forEach(
            button => {

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

            }
        );


        // =========================
        // SWITCHES
        // =========================

        const switches =
            document.querySelectorAll(
                ".switch input"
            );

        switches.forEach(
            toggle => {

                toggle.addEventListener(
                    "change",
                    () => {

                        if (
                            toggle.checked
                        ) {

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

            }
        );


        // =========================
        // CARD TILT
        // =========================

        const cards =
            document.querySelectorAll(
                ".stat-card, .setting-card, .game-panel"
            );

        cards.forEach(
            card => {

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
                            (
                                (
                                    y /
                                    rect.height
                                ) -
                                0.5
                            ) * -3;

                        const rotateY =
                            (
                                (
                                    x /
                                    rect.width
                                ) -
                                0.5
                            ) * 3;

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

            }
        );


        // =========================
        // HERO PARALLAX
        // =========================

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
                        (
                            event.clientX -
                            rect.left
                        ) /
                        rect.width;

                    const y =
                        (
                            event.clientY -
                            rect.top
                        ) /
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

        statNumbers.forEach(
            number => {

                const text =
                    number.textContent.trim();

                const match =
                    text.match(
                        /^([\d,]+)$/
                    );

                if (!match)
                    return;

                const target =
                    Number(
                        match[1].replace(
                            /,/g,
                            ""
                        )
                    );

                if (!target)
                    return;

                number.textContent =
                    "0";

                const duration =
                    800;

                const start =
                    performance.now();

                function animateCounter(
                    time
                ) {

                    const progress =
                        Math.min(
                            (
                                time -
                                start
                            ) /
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

                    if (
                        progress <
                        1
                    ) {

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
            }
        );


        // =========================
        // INPUT GLOW
        // =========================

        const inputs =
            document.querySelectorAll(
                ".text-input, .number-input, select"
            );

        inputs.forEach(
            input => {

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

            }
        );


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
// BUTTON RIPPLE
// =========================

function createButtonRipple(
    element,
    event
) {

    if (!element)
        return;

    const rect =
        element.getBoundingClientRect();

    const ripple =
        document.createElement(
            "span"
        );

    ripple.className =
        "click-ripple";

    ripple.style.left =
        `${event.clientX - rect.left}px`;

    ripple.style.top =
        `${event.clientY - rect.top}px`;

    element.appendChild(
        ripple
    );

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

function showToast(
    message
) {

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

    if (!question)
        return;

    if (
        !question.value.trim()
    ) {

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

    if (!select)
        return;

    const theme =
        select.value;

    document.body.dataset.theme =
        theme;

    showToast(
        `🎨 Theme changed to ${theme}`
    );
}
