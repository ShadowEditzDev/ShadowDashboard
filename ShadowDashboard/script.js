// 🌑 ShadowBot Dashboard

const API = "http://localhost:8080";

let autoRefreshEnabled = true;

// =========================
// PAGE TITLES
// =========================

const pageTitles = {
    overview: "Dashboard Overview",
    server: "Server Management",
    xp: "XP & Levels",
    games: "Games",
    moderation: "Moderation",
    verification: "Verification",
    polls: "Polls",
    settings: "Settings"
};

// =========================
// START DASHBOARD
// =========================

document.addEventListener("DOMContentLoaded", () => {

    loadStatus();
    loadStats();

    const savedTheme =
        localStorage.getItem("shadowTheme");

    if (savedTheme) {
        applyTheme(savedTheme);

        const themeSelect =
            document.getElementById("themeSelect");

        if (themeSelect) {
            themeSelect.value = savedTheme;
        }
    }

});

// =========================
// PAGE SWITCH
// =========================

function showPage(page, button = null) {

    document.querySelectorAll(".page").forEach(pageElement => {
        pageElement.classList.remove("active");
    });

    document.querySelectorAll(".nav-btn").forEach(nav => {
        nav.classList.remove("active");
    });

    const selectedPage =
        document.getElementById(page);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    if (button) {
        button.classList.add("active");
    } else {

        const navButton =
            document.querySelector(
                `.nav-btn[onclick*="'${page}'"]`
            );

        if (navButton) {
            navButton.classList.add("active");
        }
    }

    const title =
        document.getElementById("pageTitle");

    if (title && pageTitles[page]) {
        title.innerText =
            pageTitles[page];
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// =========================
// BOT STATUS
// =========================

async function loadStatus() {

    try {

        const response =
            await fetch(API + "/status");

        if (!response.ok) {
            throw new Error(
                "Status request failed"
            );
        }

        const data =
            await response.json();

        const statusText =
            document.getElementById("bot-status");

        const statusDot =
            document.getElementById("status-dot");

        if (data.online) {

            if (statusText) {
                statusText.innerText = "ONLINE";
            }

            if (statusDot) {
                statusDot.style.background =
                    "#22c55e";
            }

        } else {

            if (statusText) {
                statusText.innerText = "OFFLINE";
            }

            if (statusDot) {
                statusDot.style.background =
                    "#ef4444";
            }
        }

    } catch (error) {

        const statusText =
            document.getElementById("bot-status");

        const statusDot =
            document.getElementById("status-dot");

        if (statusText) {
            statusText.innerText = "OFFLINE";
        }

        if (statusDot) {
            statusDot.style.background =
                "#ef4444";
        }

        console.log(
            "❌ Could not connect to ShadowBot API:",
            error
        );
    }
}

// =========================
// STATS
// =========================

async function loadStats() {

    try {

        const response =
            await fetch(API + "/stats");

        if (!response.ok) {
            throw new Error(
                "Stats request failed"
            );
        }

        const data =
            await response.json();

        const memberCount =
            document.getElementById("memberCount");

        const xpCount =
            document.getElementById("xpCount");

        const gameCount =
            document.getElementById("gameCount");

        const gamesPlayed =
            document.getElementById("gamesPlayed");

        if (memberCount && data.members !== undefined) {
            memberCount.innerText =
                Number(data.members).toLocaleString();
        }

        if (xpCount && data.xp !== undefined) {
            xpCount.innerText =
                Number(data.xp).toLocaleString();
        }

        if (gameCount && data.games !== undefined) {
            gameCount.innerText =
                Number(data.games).toLocaleString();
        }

        if (gamesPlayed && data.games !== undefined) {
            gamesPlayed.innerText =
                Number(data.games).toLocaleString();
        }

    } catch (error) {

        console.log(
            "❌ Could not load ShadowBot stats:",
            error
        );
    }
}

// =========================
// SAVE SETTINGS
// =========================

async function saveSettings() {

    const xpToggle =
        document.getElementById("xpToggle");

    const xpPerMessage =
        document.getElementById("xpPerMessage");

    const xpCooldown =
        document.getElementById("xpCooldown");

    const rankCards =
        document.getElementById("rankCards");

    const verificationRole =
        document.getElementById("verificationRole");

    const verificationChannel =
        document.getElementById("verificationChannel");

    const notificationsToggle =
        document.getElementById("notificationsToggle");

    const autoRefreshToggle =
        document.getElementById("autoRefreshToggle");

    const settings = {

        xpEnabled:
            xpToggle
                ? xpToggle.checked
                : true,

        xpPerMessage:
            xpPerMessage
                ? Number(xpPerMessage.value)
                : 10,

        xpCooldown:
            xpCooldown
                ? Number(xpCooldown.value)
                : 30,

        rankCards:
            rankCards
                ? rankCards.checked
                : true,

        verificationRole:
            verificationRole
                ? verificationRole.value
                : "Verified",

        verificationChannel:
            verificationChannel
                ? verificationChannel.value
                : "#verification",

        notifications:
            notificationsToggle
                ? notificationsToggle.checked
                : true,

        autoRefresh:
            autoRefreshToggle
                ? autoRefreshToggle.checked
                : true
    };

    autoRefreshEnabled =
        settings.autoRefresh;

    try {

        const response =
            await fetch(
                API + "/settings",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(settings)
                }
            );

        if (!response.ok) {
            throw new Error(
                "Settings request failed"
            );
        }

        showToast(
            "Settings saved successfully! ✓"
        );

    } catch (error) {

        console.log(
            "⚠️ ShadowBot API unavailable:",
            error
        );

        localStorage.setItem(
            "shadowSettings",
            JSON.stringify(settings)
        );

        showToast(
            "Settings saved locally ✓"
        );
    }
}

// =========================
// CREATE POLL
// =========================

async function createPoll() {

    const questionInput =
        document.getElementById("pollQuestion");

    const optionInputs =
        document.querySelectorAll(".poll-option");

    const message =
        document.getElementById("pollMessage");

    if (!questionInput) {
        return;
    }

    const question =
        questionInput.value.trim();

    const options =
        Array.from(optionInputs)
            .map(input => input.value.trim())
            .filter(option => option.length > 0);

    if (!question) {

        showToast(
            "❌ Enter a poll question."
        );

        return;
    }

    if (options.length < 2) {

        showToast(
            "❌ Add at least 2 options."
        );

        return;
    }

    try {

        const response =
            await fetch(
                API + "/poll",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            question:
                                question,
                            options:
                                options
                        })
                }
            );

        if (!response.ok) {
            throw new Error(
                "Poll request failed"
            );
        }

        questionInput.value = "";

        optionInputs.forEach(input => {
            input.value = "";
        });

        if (message) {
            message.innerText =
                "🗳️ Poll created successfully!";
        }

        showToast(
            "🗳️ Poll created!"
        );

    } catch (error) {

        console.log(
            "❌ Could not create poll:",
            error
        );

        showToast(
            "❌ ShadowBot API is offline."
        );
    }
}

// =========================
// TOAST
// =========================

function showToast(text) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.innerText = text;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}

// =========================
// THEME
// =========================

function changeTheme() {

    const select =
        document.getElementById("themeSelect");

    if (!select) {
        return;
    }

    const theme =
        select.value;

    applyTheme(theme);

    localStorage.setItem(
        "shadowTheme",
        theme
    );

    showToast(
        "Theme changed ✓"
    );
}

function applyTheme(theme) {

    document.body.classList.remove(
        "theme-dark",
        "theme-midnight"
    );

    if (theme === "midnight") {

        document.body.classList.add(
            "theme-midnight"
        );

    } else {

        document.body.classList.add(
            "theme-dark"
        );
    }
}

// =========================
// AUTO REFRESH
// =========================

setInterval(() => {

    if (!autoRefreshEnabled) {
        return;
    }

    loadStatus();
    loadStats();

}, 5000);
