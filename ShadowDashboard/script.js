// 🌑 ShadowBot Dashboard
// Discord OAuth + Server Selector + Profile

const API = "https://node6.quaxly.com:25522";

// =========================
// START
// =========================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("🌑 ShadowDashboard started.");
    console.log("🔗 Backend:", API);

    await checkLogin();
});

// =========================
// DISCORD LOGIN
// =========================

function loginWithDiscord() {
    console.log("🔐 Starting Discord OAuth...");

    const loginURL = API + "/auth/discord";

    console.log("➡️ Redirecting to:", loginURL);

    window.location.assign(loginURL);
}

// =========================
// CHECK LOGIN
// =========================

async function checkLogin() {

    const loginScreen =
        document.getElementById("loginScreen");

    const serverScreen =
        document.getElementById("serverScreen");

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }

    if (serverScreen) {
        serverScreen.style.display = "none";
    }

    document.body.classList.add("dashboard-locked");

    try {

        console.log("🔎 Checking Discord login...");

        const response = await fetch(
            API + "/api/me",
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        console.log(
            "📡 /api/me status:",
            response.status
        );

        if (!response.ok) {

            console.log("❌ User is not logged in.");

            return;
        }

        const data = await response.json();

        console.log("👤 Discord user:", data);

        if (!data.user) {

            console.log(
                "❌ Backend did not return a Discord user."
            );

            return;
        }

        updateUserProfile(data.user);

        document.body.classList.remove(
            "dashboard-locked"
        );

        if (loginScreen) {
            loginScreen.style.display = "none";
        }

        if (serverScreen) {
            serverScreen.style.display = "flex";
        }

        await loadServers();

    } catch (error) {

        console.error(
            "❌ Dashboard connection failed:",
            error
        );

        document.body.classList.add(
            "dashboard-locked"
        );

        if (loginScreen) {
            loginScreen.style.display = "flex";
        }

        if (serverScreen) {
            serverScreen.style.display = "none";
        }
    }
}

// =========================
// UPDATE USER PROFILE
// =========================

function updateUserProfile(user) {

    const username =
        user.global_name ||
        user.username ||
        "Admin";

    const dashboardUsername =
        document.getElementById(
            "dashboardUsername"
        );

    const topUsername =
        document.getElementById(
            "topUsername"
        );

    if (dashboardUsername) {

        dashboardUsername.innerText =
            username;
    }

    if (topUsername) {

        topUsername.innerText =
            username;
    }

    if (user.id && user.avatar) {

        const avatarURL =
            "https://cdn.discordapp.com/avatars/" +
            user.id +
            "/" +
            user.avatar +
            ".png?size=256";

        const userAvatar =
            document.getElementById(
                "userAvatar"
            );

        if (userAvatar) {

            if (userAvatar.tagName === "IMG") {

                userAvatar.src =
                    avatarURL;

            } else {

                userAvatar.innerHTML = `
                    <img
                        src="${avatarURL}"
                        alt="${escapeHTML(username)}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:cover;
                            border-radius:50%;
                        "
                    >
                `;
            }
        }
    }

    localStorage.setItem(
        "shadow_user",
        JSON.stringify(user)
    );
}

// =========================
// LOAD SERVERS
// =========================

async function loadServers() {

    const serverList =
        document.getElementById(
            "serverList"
        );

    if (!serverList) {
        return;
    }

    serverList.innerHTML = `
        <div class="empty-servers">
            <h2>Loading your servers...</h2>
            <p>Please wait.</p>
        </div>
    `;

    try {

        console.log("📡 Loading Discord servers...");

        const response = await fetch(
            API + "/api/guilds",
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        console.log(
            "📡 /api/guilds status:",
            response.status
        );

        if (!response.ok) {

            throw new Error(
                "Could not load servers."
            );
        }

        const data =
            await response.json();

        console.log(
            "🏠 Guilds:",
            data
        );

        const guilds =
            data.guilds || [];

        if (guilds.length === 0) {

            serverList.innerHTML = `
                <div class="empty-servers">
                    <h2>No manageable servers</h2>
                    <p>
                        You need Administrator permission
                        in a server to manage ShadowBot.
                    </p>
                </div>
            `;

            return;
        }

        serverList.innerHTML = "";

        guilds.forEach(guild => {

            const card =
                document.createElement("div");

            card.className =
                "server-card";

            let iconHTML =
                `<span style="font-size:24px;">🌑</span>`;

            if (guild.icon) {

                iconHTML = `
                    <img
                        src="https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128"
                        alt=""
                    >
                `;
            }

            card.innerHTML = `
                <div class="server-icon">
                    ${iconHTML}
                </div>

                <div>
                    <div class="server-name">
                        ${escapeHTML(guild.name)}
                    </div>

                    <div class="server-permission">
                        ✓ Administrator
                    </div>
                </div>

                <button
                    class="server-action"
                    type="button"
                >
                    Manage
                </button>
            `;

            const manageButton =
                card.querySelector(
                    ".server-action"
                );

            if (manageButton) {

                manageButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        selectServer(guild);
                    }
                );
            }

            card.addEventListener(
                "click",
                () => {

                    selectServer(guild);
                }
            );

            serverList.appendChild(card);
        });

    } catch (error) {

        console.error(
            "❌ Server loading error:",
            error
        );

        serverList.innerHTML = `
            <div class="empty-servers">
                <h2>Could not load servers</h2>
                <p>
                    Make sure the ShadowBot backend
                    is online and Discord OAuth is configured.
                </p>
            </div>
        `;
    }
}

// =========================
// SELECT SERVER
// =========================

async function selectServer(guild) {

    try {

        console.log(
            "🛡️ Selecting server:",
            guild.name
        );

        const response = await fetch(
            API +
            "/api/guild/" +
            encodeURIComponent(guild.id),
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                "❌ " +
                (
                    data.error ||
                    "You cannot manage this server."
                )
            );

            return;
        }

        localStorage.setItem(
            "shadow_selected_guild",
            JSON.stringify(data)
        );

        const serverScreen =
            document.getElementById(
                "serverScreen"
            );

        if (serverScreen) {

            serverScreen.style.display =
                "none";
        }

        document.body.classList.remove(
            "dashboard-locked"
        );

        updateSelectedServer(data);

        loadStatus();
        loadStats();

    } catch (error) {

        console.error(
            "❌ Server selection error:",
            error
        );

        alert(
            "❌ Could not select server."
        );
    }
}

// =========================
// UPDATE SELECTED SERVER
// =========================

function updateSelectedServer(guild) {

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

    if (
        pageTitle &&
        guild.name
    ) {

        pageTitle.innerText =
            guild.name +
            " — Dashboard";
    }
}

// =========================
// LOGOUT
// =========================

async function logout() {

    try {

        await fetch(
            API + "/auth/logout",
            {
                method: "POST",
                credentials: "include"
            }
        );

    } catch (error) {

        console.log(
            "Logout error:",
            error
        );
    }

    localStorage.removeItem(
        "shadow_selected_guild"
    );

    localStorage.removeItem(
        "shadow_user"
    );

    location.reload();
}

// =========================
// PAGE SWITCH
// =========================

function showPage(page, button) {

    document
        .querySelectorAll(".page")
        .forEach(p => {

            p.classList.remove("active");
        });

    document
        .querySelectorAll(".nav-btn")
        .forEach(n => {

            n.classList.remove("active");
        });

    const selectedPage =
        document.getElementById(page);

    if (selectedPage) {

        selectedPage.classList.add("active");
    }

    if (button) {

        button.classList.add("active");
    }

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

    const title =
        document.getElementById(
            "pageTitle"
        );

    if (title) {

        title.innerText =
            titles[page] ||
            "ShadowBot Dashboard";
    }
}

// =========================
// BOT STATUS
// =========================

async function loadStatus() {

    try {

        const response =
            await fetch(
                API + "/status",
                {
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                "Status unavailable"
            );
        }

        const data =
            await response.json();

        const statusText =
            document.getElementById(
                "bot-status"
            );

        const statusDot =
            document.getElementById(
                "status-dot"
            );

        if (statusText) {

            statusText.innerText =
                data.online
                    ? "ONLINE"
                    : "OFFLINE";
        }

        if (statusDot) {

            statusDot.style.background =
                data.online
                    ? "#22c55e"
                    : "#ef4444";
        }

    } catch (error) {

        const statusText =
            document.getElementById(
                "bot-status"
            );

        const statusDot =
            document.getElementById(
                "status-dot"
            );

        if (statusText) {

            statusText.innerText =
                "OFFLINE";
        }

        if (statusDot) {

            statusDot.style.background =
                "#ef4444";
        }
    }
}

// =========================
// STATS
// =========================

async function loadStats() {

    try {

        const response =
            await fetch(
                API + "/stats",
                {
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

        if (!response.ok) {
            return;
        }

        const data =
            await response.json();

        const members =
            document.getElementById(
                "memberCount"
            );

        const xp =
            document.getElementById(
                "xpCount"
            );

        const games =
            document.getElementById(
                "gameCount"
            );

        if (members) {

            members.innerText =
                data.members ?? 0;
        }

        if (xp) {

            xp.innerText =
                data.xp ??
                data.levels ??
                0;
        }

        if (games) {

            games.innerText =
                data.games ?? 0;
        }

    } catch (error) {

        console.log(
            "Stats unavailable:",
            error
        );
    }
}

// =========================
// SAVE SETTINGS
// =========================

async function saveSettings() {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) {
        return;
    }

    toast.innerText =
        "Settings saved successfully! ✓";

    toast.classList.add("show");

    setTimeout(
        () => {

            toast.classList.remove("show");

        },
        2500
    );
}

// =========================
// CREATE POLL
// =========================

async function createPoll() {

    const questionInput =
        document.getElementById(
            "pollQuestion"
        );

    if (!questionInput) {
        return;
    }

    const question =
        questionInput.value.trim();

    if (!question) {

        alert(
            "❌ Please enter a poll question."
        );

        return;
    }

    alert(
        "🗳️ Poll system will connect to ShadowBot next."
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

    if (!select) {
        return;
    }

    if (select.value === "midnight") {

        document.body.classList.add(
            "midnight"
        );

    } else {

        document.body.classList.remove(
            "midnight"
        );
    }
}

// =========================
// HTML ESCAPE
// =========================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// =========================
// AUTO REFRESH
// =========================

setInterval(
    () => {

        const loggedIn =
            !document.body.classList.contains(
                "dashboard-locked"
            );

        if (loggedIn) {

            loadStatus();
            loadStats();
        }

    },
    5000
);
