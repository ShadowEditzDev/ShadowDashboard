// 🌑 ShadowBot Dashboard

const API = "http://localhost:8080";

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

    const savedTheme = localStorage.getItem("shadowTheme");

    if (savedTheme) {
        const themeSelect = document.getElementById("themeSelect");

        if (themeSelect) {
            themeSelect.value = savedTheme;
        }

        changeTheme();
    }

});

// =========================
// PAGE SWITCH
// =========================

function showPage(page, button = null) {

    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });

    document.querySelectorAll(".nav-btn").forEach(n => {
        n.classList.remove("active");
    });

    const selectedPage = document.getElementById(page);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    if (button) {
        button.classList.add("active");
    } else {
        const selectedNav = document.querySelector(
            `.nav-btn[onclick*="'${page}'"]`
        );

        if (selectedNav) {
            selectedNav.classList.add("active");
        }
    }

    const pageTitle = document.getElementById("pageTitle");

    if (pageTitle && pageTitles[page]) {
        pageTitle.innerText = pageTitles[page];
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

        const res = await fetch(API + "/status");

        if (!res.ok) {
            throw new Error("API returned " + res.status);
        }

        const data = await res.json();

        updateBotStatus(
            data.online === true
        );

    } catch (error) {

        updateBotStatus(false);

        console.log(
            "❌ Could not connect to ShadowBot API:",
            error
        );
    }
}

// =========================
// UPDATE BOT STATUS
// =========================

function updateBotStatus(online) {

    const statusTexts = document.querySelectorAll(
        ".bot-status small"
    );

    const statusDots = document.querySelectorAll(
        ".status-dot"
    );

    statusTexts.forEach(status => {

        status.innerText = online
            ? "ONLINE"
            : "OFFLINE";

        status.style.color = online
            ? "var(--green)"
            : "var(--red)";
    });

    statusDots.forEach(dot => {

        dot.style.background = online
            ? "var(--green)"
            : "var(--red)";

        dot.style.boxShadow = online
            ? "0 0 12px var(--green)"
            : "0 0 12px var(--red)";
    });

}

// =========================
// STATS
// =========================

async function loadStats() {

    try {

        const res = await fetch(API + "/stats");

        if (!res.ok) {
            throw new Error("API returned " + res.status);
        }

        const data = await res.json();

        const memberCount =
            document.getElementById("memberCount");

        const xpCount =
            document.getElementById("xpCount");

        const gameCount =
            document.getElementById("gameCount");

        if (
            memberCount &&
            data.members !== undefined
        ) {
            memberCount.innerText =
                Number(data.members).toLocaleString();
        }

        if (
            xpCount &&
            data.xp !== undefined
        ) {
            xpCount.innerText =
                Number(data.xp).toLocaleString();
        }

        if (
            gameCount &&
            data.games !== undefined
        ) {
            gameCount.innerText =
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

    const themeSelect =
        document.getElementById("themeSelect");

    // Save dashboard theme locally
    if (themeSelect) {

        localStorage.setItem(
            "shadowTheme",
            themeSelect.value
        );

    }

    // Save XP setting if available
    if (xpToggle) {

        try {

            const response = await fetch(
                API + "/settings/xp",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        enabled: xpToggle.checked
                    })
                }
            );

            if (!response.ok) {
                throw new Error(
                    "XP settings API returned " +
                    response.status
                );
            }

        } catch (error) {

            console.log(
                "⚠️ Could not save XP settings:",
                error
            );
        }
    }

    showToast(
        "Settings saved successfully! ✓"
    );
}

// =========================
// THEME
// =========================

function changeTheme() {

    const themeSelect =
        document.getElementById("themeSelect");

    if (!themeSelect) {
        return;
    }

    const theme =
        themeSelect.value;

    localStorage.setItem(
        "shadowTheme",
        theme
    );

    if (theme === "midnight") {

        document.body.style.background =
            "#050509";

        document.documentElement.style.setProperty(
            "--bg",
            "#050509"
        );

        document.documentElement.style.setProperty(
            "--sidebar",
            "#08080f"
        );

    } else {

        document.body.style.background =
            "#08080d";

        document.documentElement.style.setProperty(
            "--bg",
            "#08080d"
        );

        document.documentElement.style.setProperty(
            "--sidebar",
            "#0d0d14"
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
        document.querySelectorAll(
            ".poll-options .text-input"
        );

    const pollMessage =
        document.getElementById("pollMessage");

    if (!questionInput) {
        return;
    }

    const question =
        questionInput.value.trim();

    const options = [];

    optionInputs.forEach(input => {

        const value =
            input.value.trim();

        if (value) {
            options.push(value);
        }

    });

    if (!question) {

        showPollMessage(
            "❌ Please enter a poll question.",
            true
        );

        return;
    }

    if (options.length < 2) {

        showPollMessage(
            "❌ Please enter at least 2 options.",
            true
        );

        return;
    }

    try {

        const response = await fetch(
            API + "/poll",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question: question,
                    options: options
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                "Poll API returned " +
                response.status
            );
        }

        showPollMessage(
            "🗳️ Poll created successfully!",
            false
        );

        questionInput.value = "";

        optionInputs.forEach(input => {
            input.value = "";
        });

    } catch (error) {

        showPollMessage(
            "❌ Failed to create poll. Make sure ShadowBot is running.",
            true
        );

        console.log(
            "❌ Poll error:",
            error
        );
    }
}

// =========================
// POLL MESSAGE
// =========================

function showPollMessage(message, error = false) {

    const pollMessage =
        document.getElementById("pollMessage");

    if (!pollMessage) {
        return;
    }

    pollMessage.innerText = message;

    pollMessage.style.color =
        error
            ? "var(--red)"
            : "var(--green)";
}

// =========================
// TOAST
// =========================

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}

// =========================
// AUTO REFRESH
// =========================

setInterval(() => {

    loadStatus();
    loadStats();

}, 5000);
