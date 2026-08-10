// 🌑 ShadowBot Dashboard

const API = "http://localhost:8080";

// =========================
// SIDEBAR
// =========================

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            showPage(item.dataset.page);
        });
    });

    loadStatus();
    loadStats();
});

// =========================
// PAGE SWITCH
// =========================

function showPage(page) {

    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });

    document.querySelectorAll(".nav-item").forEach(n => {
        n.classList.remove("active");
    });

    const selectedPage = document.getElementById(page);
    const selectedNav = document.querySelector(
        `[data-page="${page}"]`
    );

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    if (selectedNav) {
        selectedNav.classList.add("active");
    }
}

// =========================
// BOT STATUS
// =========================

async function loadStatus() {

    try {

        const res = await fetch(
            API + "/status"
        );

        const data = await res.json();

        const statusText =
            document.getElementById("bot-status");

        const statusDot =
            document.getElementById("status-dot");

        if (statusText) {
            statusText.innerText =
                data.online ? "ONLINE" : "OFFLINE";
        }

        if (statusDot) {
            statusDot.style.background =
                data.online
                    ? "#22c55e"
                    : "#ef4444";
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
            statusDot.style.background = "#ef4444";
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

        const res = await fetch(
            API + "/stats"
        );

        const data = await res.json();

        const members =
            document.getElementById("members");

        const levels =
            document.getElementById("levels");

        const games =
            document.getElementById("games");

        const polls =
            document.getElementById("polls");

        if (members) {
            members.innerText = data.members;
        }

        if (levels) {
            levels.innerText = data.levels;
        }

        if (games) {
            games.innerText = data.games;
        }

        if (polls) {
            polls.innerText = data.polls;
        }

    } catch (error) {

        console.log(
            "❌ Could not load ShadowBot stats:",
            error
        );
    }
}

// =========================
// AUTO LEVEL
// =========================

async function saveSettings() {

    const autoLevel =
        document.getElementById("autoLevel");

    if (!autoLevel) {
        return;
    }

    const enabled =
        autoLevel.checked;

    try {

        await fetch(
            API + "/settings/autolevel",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    enabled: enabled
                })
            }
        );

        alert(
            "✅ Auto Level settings saved!"
        );

    } catch (error) {

        alert(
            "❌ Failed to save Auto Level settings."
        );

        console.log(error);
    }
}

// =========================
// CREATE POLL
// =========================

async function createPoll() {

    const questionInput =
        document.getElementById("pollQuestion");

    const optionsInput =
        document.getElementById("pollOptions");

    if (!questionInput || !optionsInput) {
        return;
    }

    const question =
        questionInput.value.trim();

    const options =
        optionsInput.value.trim();

    if (!question) {

        alert(
            "❌ Please enter a poll question."
        );

        return;
    }

    if (!options) {

        alert(
            "❌ Please enter poll options."
        );

        return;
    }

    try {

        await fetch(
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

        alert(
            "🗳️ Poll created!"
        );

        questionInput.value = "";
        optionsInput.value = "";

    } catch (error) {

        alert(
            "❌ Failed to create poll."
        );

        console.log(error);
    }
}

// =========================
// REFRESH EVERY 5 SECONDS
// =========================

setInterval(() => {

    loadStatus();
    loadStats();

}, 5000);