const BACKEND_URL =
    "https://shadowapi.jonhcena-co.workers.dev";

let shadowSession = null;
let shadowStatsInterval = null;
let shadowToastTimer = null;

let currentUser = null;
let currentGuilds = [];
let selectedGuild = null;

const PENDING_GUILD_KEY =
    "shadow_pending_bot_guild";

function loginWithDiscord() {
    window.location.href =
        BACKEND_URL + "/auth/discord";
}

async function apiFetch(
    endpoint,
    options = {}
) {
    const headers = {
        "Accept": "application/json",
        ...(options.headers || {})
    };

    return fetch(
        BACKEND_URL + endpoint,
        {
            ...options,
            headers,
            credentials: "include"
        }
    );
}

async function checkDiscordLogin() {
    const params =
        new URLSearchParams(
            window.location.search
        );

    const loginStatus =
        params.get("login");

    const returnedGuildId =
        params.get("guildId") ||
        params.get("guild_id");

    if (
        loginStatus === "failed" ||
        loginStatus === "error" ||
        loginStatus === "cancelled"
    ) {
        clearPendingBotGuild();
        cleanURL();

        shadowSession = null;
        currentUser = null;
        currentGuilds = [];
        selectedGuild = null;

        showLoginScreen();
        revealDashboard();

        showToast(
            "❌ Discord login failed."
        );

        return;
    }

    /*
     * Normal page visit:
     * show the login screen and do not flash the
     * dashboard underneath it.
     */
    if (loginStatus !== "success") {
        shadowSession = null;
        currentUser = null;
        currentGuilds = [];
        selectedGuild = null;

        showLoginScreen();
        revealDashboard();

        return;
    }

    const pendingGuildId =
        returnedGuildId ||
        getPendingBotGuild();

    cleanURL();

    /*
     * Keep the dashboard hidden until we know
     * whether we are opening the server selector.
     */
    hideDashboard();

    try {
        const response =
            await apiFetch("/api/me");

        if (!response.ok) {
            shadowSession = null;
            currentUser = null;
            currentGuilds = [];
            selectedGuild = null;

            showLoginScreen();
            revealDashboard();

            showToast(
                "❌ Discord session is invalid. Please login again."
            );

            return;
        }

        const data =
            await response.json();

        if (
            !data.loggedIn ||
            !data.user
        ) {
            showLoginScreen();
            revealDashboard();
            return;
        }

        currentUser =
            data.user;

        const username =
            data.user.global_name ||
            data.user.username ||
            "Discord User";

        updateElementText(
            "topUsername",
            username
        );

        updateElementText(
            "dashboardUsername",
            username
        );

        updateUserAvatar(
            data.user
        );

        await loadGuilds();

        if (!currentGuilds.length) {
            showLoginScreen();
            revealDashboard();

            clearPendingBotGuild();

            showToast(
                "⚠️ No manageable servers found."
            );

            return;
        }

        /*
         * Normal login and Add Bot both arrive
         * here. The guild ID identifies the server
         * that was just authorized for the bot.
         */
        if (pendingGuildId) {
            await refreshGuildsAfterBotAuthorization(
                pendingGuildId
            );

            clearPendingBotGuild();
        }

        /*
         * IMPORTANT:
         * Reveal only after the selector is ready.
         * This prevents the dashboard flash.
         */
        openServerScreen();
        revealDashboard();

        if (pendingGuildId) {
            const addedGuild =
                currentGuilds.find(
                    guild =>
                        String(guild.id) ===
                        String(pendingGuildId)
                );

            if (
                addedGuild &&
                addedGuild.botInstalled
            ) {
                showToast(
                    "🤖 ShadowBot is now installed in " +
                    (
                        addedGuild.name ||
                        "your server"
                    ) +
                    "!"
                );
            } else {
                showToast(
                    "⚠️ Discord authorization completed. Checking server status..."
                );

                setTimeout(
                    async () => {
                        await refreshGuildsAfterBotAuthorization(
                            pendingGuildId
                        );
                    },
                    1500
                );
            }
        } else {
            showToast(
                "👋 Welcome, " +
                username +
                "! Select your server."
            );
        }

    } catch (error) {
        console.error(
            "❌ Login check failed:",
            error
        );

        showLoginScreen();
        revealDashboard();

        showToast(
            "❌ Could not verify Discord login."
        );
    }
}

function hideDashboard() {
    document.body.dataset.shadowAuthLoading =
        "true";

    document.body.style.visibility =
        "hidden";
}

function revealDashboard() {
    document.body.style.visibility =
        "";

    delete document.body.dataset.shadowAuthLoading;
}

function showLoginScreen() {
    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    if (loginScreen) {
        loginScreen.style.display =
            "flex";
    }
}

function hideLoginScreen() {
    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    if (loginScreen) {
        loginScreen.style.display =
            "none";
    }
}

function updateElementText(
    id,
    value
) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent =
            value;
    }
}

async function loadRealStats() {
    if (
        !selectedGuild ||
        !selectedGuild.id
    ) {
        return;
    }

    try {
        const guildId =
            String(selectedGuild.id);

        const response =
            await apiFetch(
                "/stats?guildId=" +
                encodeURIComponent(
                    guildId
                )
            );

        const data =
            await response.json();

        if (!response.ok) {
            console.error(
                "❌ Stats request failed:",
                response.status,
                data
            );

            showToast(
                data.message ||
                data.error ||
                "❌ Failed to load server stats."
            );

            return;
        }

        const members =
            Number(data.members);

        if (
            Number.isFinite(members) &&
            members >= 0
        ) {
            const memberNumber =
                findMemberStatElement();

            if (memberNumber) {
                const previousValue =
                    Number(
                        memberNumber.dataset.realMembers ||
                        0
                    );

                memberNumber.dataset.realMembers =
                    String(members);

                animateNumberChange(
                    memberNumber,
                    previousValue,
                    members,
                    650
                );
            }
        }

        const totalXP =
            Number(
                data.totalXP ??
                data.xp ??
                0
            );

        const xpElement =
            document.getElementById(
                "xpCount"
            );

        if (
            xpElement &&
            Number.isFinite(totalXP) &&
            totalXP >= 0
        ) {
            const previousXP =
                Number(
                    xpElement.dataset.realXP ||
                    0
                );

            xpElement.dataset.realXP =
                String(totalXP);

            animateNumberChange(
                xpElement,
                previousXP,
                totalXP,
                650
            );
        }

        const gamesPlayed =
            Number(
                data.gamesPlayed ??
                0
            );

        const gameElement =
            document.getElementById(
                "gameCount"
            );

        if (
            gameElement &&
            Number.isFinite(gamesPlayed) &&
            gamesPlayed >= 0
        ) {
            const previousGames =
                Number(
                    gameElement.dataset.realGames ||
                    0
                );

            gameElement.dataset.realGames =
                String(gamesPlayed);

            animateNumberChange(
                gameElement,
                previousGames,
                gamesPlayed,
                650
            );
        }

        const gamesPageElement =
            document.getElementById(
                "gamesPlayedCount"
            );

        if (
            gamesPageElement &&
            Number.isFinite(gamesPlayed) &&
            gamesPlayed >= 0
        ) {
            gamesPageElement.textContent =
                gamesPlayed.toLocaleString();
        }

        console.log(
            "✅ Stats loaded for " +
            (
                selectedGuild.name ||
                "Selected Server"
            ) +
            ":",
            {
                members,
                totalXP,
                gamesPlayed
            }
        );

        if (!shadowStatsInterval) {
            shadowStatsInterval =
                setInterval(
                    () => {
                        if (
                            currentUser &&
                            selectedGuild
                        ) {
                            loadRealStats();
                        }
                    },
                    60000
                );
        }

    } catch (error) {
        console.error(
            "❌ Failed to load server stats:",
            error
        );
    }
}

function resetDisplayedStats() {
    const memberElement =
        findMemberStatElement();

    const xpElement =
        document.getElementById(
            "xpCount"
        );

    const gameElement =
        document.getElementById(
            "gameCount"
        );

    const gamesPageElement =
        document.getElementById(
            "gamesPlayedCount"
        );

    if (memberElement) {
        memberElement.dataset.realMembers =
            "0";

        memberElement.textContent =
            "0";
    }

    if (xpElement) {
        xpElement.dataset.realXP =
            "0";

        xpElement.textContent =
            "0";
    }

    if (gameElement) {
        gameElement.dataset.realGames =
            "0";

        gameElement.textContent =
            "0";
    }

    if (gamesPageElement) {
        gamesPageElement.textContent =
            "0";
    }
}

function findMemberStatElement() {
    const statCards =
        document.querySelectorAll(
            ".stat-card"
        );

    for (const card of statCards) {
        const text =
            card.textContent
                .toLowerCase();

        if (
            text.includes("members") ||
            text.includes("member")
        ) {
            const strong =
                card.querySelector(
                    "strong"
                );

            if (strong) {
                return strong;
            }
        }
    }

    return document.querySelector(
        ".stat-card strong"
    ) || null;
}

function animateNumberChange(
    element,
    from,
    to,
    duration = 700
) {
    if (!element) {
        return;
    }

    if (!Number.isFinite(from)) {
        from = 0;
    }

    if (!Number.isFinite(to)) {
        to = 0;
    }

    if (from === to) {
        element.textContent =
            to.toLocaleString();

        return;
    }

    const start =
        performance.now();

    function frame(time) {
        const progress =
            Math.min(
                (time - start) /
                duration,
                1
            );

        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );

        const value =
            Math.round(
                from +
                (to - from) *
                eased
            );

        element.textContent =
            value.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(
                frame
            );
        }
    }

    requestAnimationFrame(
        frame
    );
}

function updateUserAvatar(
    user
) {
    const avatar =
        document.getElementById(
            "userAvatar"
        );

    if (!avatar) {
        return;
    }

    let avatarURL = null;

    if (
        typeof user.avatar ===
            "string" &&
        user.avatar.startsWith(
            "http"
        )
    ) {
        avatarURL =
            user.avatar;

    } else if (
        user.avatar &&
        user.id
    ) {
        avatarURL =
            "https://cdn.discordapp.com/avatars/" +
            user.id +
            "/" +
            user.avatar +
            ".png?size=128";

    } else if (user.id) {
        const discriminator =
            Number(
                user.discriminator ||
                0
            );

        avatarURL =
            "https://cdn.discordapp.com/embed/avatars/" +
            (
                discriminator % 5
            ) +
            ".png";
    }

    if (!avatarURL) {
        avatar.textContent =
            "👤";

        return;
    }

    avatar.innerHTML =
        "";

    const img =
        document.createElement(
            "img"
        );

    img.src =
        avatarURL;

    img.alt =
        "Discord Avatar";

    img.width =
        128;

    img.height =
        128;

    img.loading =
        "eager";

    img.draggable =
        false;

    img.style.width =
        "100%";

    img.style.height =
        "100%";

    img.style.objectFit =
        "cover";

    img.style.borderRadius =
        "inherit";

    img.onerror =
        () => {
            avatar.textContent =
                "👤";
        };

    avatar.appendChild(
        img
    );
}

async function loadGuilds() {
    try {
        console.log(
            "🏠 Loading Discord servers..."
        );

        const response =
            await apiFetch(
                "/api/guilds"
            );

        if (!response.ok) {
            console.error(
                "❌ Guild loading failed:",
                response.status
            );

            return;
        }

        const data =
            await response.json();

        currentGuilds =
            Array.isArray(
                data.guilds
            )
                ? data.guilds
                : [];

        renderServerScreen(
            currentGuilds
        );

        console.log(
            "✅ Loaded " +
            currentGuilds.length +
            " servers."
        );

    } catch (error) {
        console.error(
            "❌ Guild loading failed:",
            error
        );
    }
}

async function refreshGuildsAfterBotAuthorization(
    guildId
) {
    if (!guildId) {
        await loadGuilds();
        return false;
    }

    console.log(
        "🔄 Refreshing /api/guilds after bot authorization for guild:",
        guildId
    );

    await loadGuilds();

    let guild =
        currentGuilds.find(
            item =>
                String(item.id) ===
                String(guildId)
        );

    if (
        guild &&
        guild.botInstalled
    ) {
        renderServerScreen(
            currentGuilds
        );

        return true;
    }

    const retryDelays = [
        1000,
        2000,
        3000,
        5000
    ];

    for (
        const delay of
        retryDelays
    ) {
        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    delay
                )
        );

        await loadGuilds();

        guild =
            currentGuilds.find(
                item =>
                    String(item.id) ===
                    String(guildId)
            );

        if (
            guild &&
            guild.botInstalled
        ) {
            renderServerScreen(
                currentGuilds
            );

            showToast(
                "✅ ShadowBot installed! The server is now ready to Manage."
            );

            return true;
        }
    }

    renderServerScreen(
        currentGuilds
    );

    return Boolean(
        guild &&
        guild.botInstalled
    );
}

function renderServerScreen(
    guilds
) {
    const serverList =
        document.getElementById(
            "serverList"
        );

    if (!serverList) {
        return;
    }

    serverList.innerHTML =
        "";

    if (!guilds.length) {
        serverList.innerHTML =
            '<div class="server-empty">' +
            '<div class="server-empty-icon">🏠</div>' +
            '<h3>No servers found</h3>' +
            '<p>You don\'t have any manageable servers.</p>' +
            '</div>';

        return;
    }

    guilds.forEach(
        guild => {
            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "server-card";

            let iconURL =
                "Goku.png";

            if (guild.icon) {
                if (
                    guild.icon.startsWith(
                        "http"
                    )
                ) {
                    iconURL =
                        guild.icon;
                } else {
                    iconURL =
                        "https://cdn.discordapp.com/icons/" +
                        guild.id +
                        "/" +
                        guild.icon +
                        ".png?size=128";
                }
            }

            let badges =
                "";

            if (guild.owner) {
                badges +=
                    '<span class="server-badge owner">👑 OWNER</span>';
            }

            if (guild.admin) {
                badges +=
                    '<span class="server-badge admin">🛡️ ADMIN</span>';
            }

            if (guild.botInstalled) {
                badges +=
                    '<span class="server-badge bot">✓ BOT INSTALLED</span>';
            } else {
                badges +=
                    '<span class="server-badge not-installed">⚠ BOT NOT INSTALLED</span>';
            }

            const actionButton =
                guild.botInstalled
                    ? '<button class="manage-server-btn" type="button" data-action="manage" data-guild-id="' +
                      escapeHTML(
                          guild.id
                      ) +
                      '">Manage</button>'
                    : '<button class="manage-server-btn" type="button" data-action="invite" data-guild-id="' +
                      escapeHTML(
                          guild.id
                      ) +
                      '">Add Bot</button>';

            card.innerHTML =
                '<img class="server-icon" src="' +
                escapeHTML(
                    iconURL
                ) +
                '" alt="' +
                escapeHTML(
                    guild.name
                ) +
                '" loading="lazy" draggable="false" onerror="this.src=\'Goku.png\'">' +
                '<div class="server-info">' +
                '<span class="server-name">' +
                escapeHTML(
                    guild.name
                ) +
                '</span>' +
                '<div class="server-badges">' +
                badges +
                '</div>' +
                '</div>' +
                actionButton;

            const button =
                card.querySelector(
                    ".manage-server-btn"
                );

            if (button) {
                button.addEventListener(
                    "click",
                    () => {
                        const action =
                            button.dataset.action;

                        const guildId =
                            button.dataset.guildId;

                        if (
                            action ===
                            "invite"
                        ) {
                            inviteBotToGuild(
                                guildId
                            );
                        } else {
                            selectServer(
                                guildId
                            );
                        }
                    }
                );
            }

            serverList.appendChild(
                card
            );
        }
    );
}

function escapeHTML(
    value
) {
    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

function filterServers() {
    const search =
        document.getElementById(
            "serverSearch"
        );

    if (!search) {
        return;
    }

    const cards =
        document.querySelectorAll(
            "#serverList .server-card"
        );

    const query =
        search.value
            .trim()
            .toLowerCase();

    let visibleCount =
        0;

    cards.forEach(
        card => {
            const name =
                card
                    .querySelector(
                        ".server-name"
                    )
                    ?.textContent
                    .toLowerCase() ||
                "";

            const visible =
                name.includes(
                    query
                );

            card.style.display =
                visible
                    ? "flex"
                    : "none";

            if (visible) {
                visibleCount++;
            }
        }
    );

    const existing =
        document.querySelector(
            "#serverList .search-empty"
        );

    if (existing) {
        existing.remove();
    }

    if (
        cards.length &&
        visibleCount === 0
    ) {
        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "server-empty search-empty";

        empty.innerHTML =
            '<div class="server-empty-icon">🔎</div>' +
            '<h3>No matching servers</h3>' +
            '<p>Try another server name.</p>';

        document
            .getElementById(
                "serverList"
            )
            ?.appendChild(
                empty
            );
    }
}

function openServerScreen() {
    const screen =
        document.getElementById(
            "serverScreen"
        );

    if (!screen) {
        return;
    }

    screen.style.display =
        "flex";

    screen.style.opacity =
        "0";

    requestAnimationFrame(
        () => {
            screen.style.opacity =
                "1";
        }
    );

    const search =
        document.getElementById(
            "serverSearch"
        );

    if (search) {
        search.value =
            "";

        filterServers();

        setTimeout(
            () =>
                search.focus(),
            100
        );
    }
}

function closeServerScreen() {
    const screen =
        document.getElementById(
            "serverScreen"
        );

    if (!screen) {
        return;
    }

    screen.style.opacity =
        "0";

    setTimeout(
        () => {
            screen.style.display =
                "none";

            screen.style.opacity =
                "";
        },
        180
    );
}

async function selectServer(
    guildId
) {
    if (!guildId) {
        return;
    }

    try {
        const response =
            await apiFetch(
                "/api/guild/" +
                encodeURIComponent(
                    guildId
                )
            );

        const data =
            await response.json();

        if (!response.ok) {
            console.error(
                "❌ Server selection failed:",
                data
            );

            showToast(
                data.message ||
                data.error ||
                "❌ Could not select server."
            );

            return;
        }

        selectedGuild =
            currentGuilds.find(
                guild =>
                    String(
                        guild.id
                    ) ===
                    String(
                        guildId
                    )
            ) || data;

        updateSelectedServerUI(
            selectedGuild
        );

        resetDisplayedStats();

        closeServerScreen();

        await loadServerSettings();
        await loadRealStats();

        showPage(
            "overview"
        );

        showToast(
            "🏠 " +
            (
                selectedGuild.name ||
                "Server"
            ) +
            " selected"
        );

    } catch (error) {
        console.error(
            "❌ Server selection error:",
            error
        );

        showToast(
            "❌ Server selection failed."
        );
    }
}

async function loadServerSettings() {
    if (
        !selectedGuild ||
        !selectedGuild.id
    ) {
        return;
    }

    try {
        const response =
            await apiFetch(
                "/api/guild/" +
                encodeURIComponent(
                    selectedGuild.id
                ) +
                "/settings"
            );

        const data =
            await response.json();

        if (!response.ok) {
            return;
        }

        const welcomeToggle =
            document.getElementById(
                "welcomeToggle"
            );

        const leaveToggle =
            document.getElementById(
                "leaveToggle"
            );

        const announcementsToggle =
            document.getElementById(
                "announcementsToggle"
            );

        if (welcomeToggle) {
            welcomeToggle.checked =
                data.welcomeEnabled !==
                false;
        }

        if (leaveToggle) {
            leaveToggle.checked =
                data.leaveEnabled !==
                false;
        }

        if (announcementsToggle) {
            announcementsToggle.checked =
                data.announcementsEnabled !==
                false;
        }

    } catch (error) {
        console.error(
            "❌ Failed to load server settings:",
            error
        );
    }
}

async function saveServerManagementSettings() {
    if (
        !selectedGuild ||
        !selectedGuild.id
    ) {
        showToast(
            "⚠️ Select a server first."
        );

        return false;
    }

    const welcomeToggle =
        document.getElementById(
            "welcomeToggle"
        );

    const leaveToggle =
        document.getElementById(
            "leaveToggle"
        );

    const announcementsToggle =
        document.getElementById(
            "announcementsToggle"
        );

    const body = {
        welcomeEnabled:
            welcomeToggle
                ? welcomeToggle.checked
                : true,

        leaveEnabled:
            leaveToggle
                ? leaveToggle.checked
                : true,

        announcementsEnabled:
            announcementsToggle
                ? announcementsToggle.checked
                : true
    };

    try {
        const response =
            await apiFetch(
                "/api/guild/" +
                encodeURIComponent(
                    selectedGuild.id
                ) +
                "/settings",
                {
                    method:
                        "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body:
                        JSON.stringify(
                            body
                        )
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            showToast(
                data.message ||
                data.error ||
                "❌ Failed to save server settings."
            );

            return false;
        }

        showToast(
            "💾 Server settings saved!"
        );

        return true;

    } catch (error) {
        console.error(
            "❌ Server settings save error:",
            error
        );

        showToast(
            "❌ Could not save server settings."
        );

        return false;
    }
}

function setupServerManagementSettings() {
    const toggles = [
        document.getElementById(
            "welcomeToggle"
        ),
        document.getElementById(
            "leaveToggle"
        ),
        document.getElementById(
            "announcementsToggle"
        )
    ];

    toggles.forEach(
        toggle => {
            if (!toggle) {
                return;
            }

            if (
                toggle.dataset
                    .serverSettingsBound
            ) {
                return;
            }

            toggle.dataset
                .serverSettingsBound =
                "true";

            toggle.addEventListener(
                "change",
                async () => {
                    if (!selectedGuild) {
                        showToast(
                            "⚠️ Select a server first."
                        );

                        toggle.checked =
                            !toggle.checked;

                        return;
                    }

                    await saveServerManagementSettings();
                }
            );
        }
    );
}

async function inviteBotToGuild(
    guildId
) {
    if (!guildId) {
        return;
    }

    try {
        savePendingBotGuild(
            guildId
        );

        showToast(
            "🤖 Opening Discord bot authorization..."
        );

        const response =
            await apiFetch(
                "/api/invite/" +
                encodeURIComponent(
                    guildId
                )
            );

        const data =
            await response.json();

        if (!response.ok) {
            clearPendingBotGuild();

            showToast(
                data.message ||
                data.error ||
                "❌ Could not create bot authorization."
            );

            return;
        }

        if (
            data.alreadyInstalled
        ) {
            clearPendingBotGuild();

            await loadGuilds();

            showToast(
                "✅ ShadowBot is already installed."
            );

            return;
        }

        if (!data.url) {
            clearPendingBotGuild();

            showToast(
                "❌ Discord authorization URL missing."
            );

            return;
        }

        /*
         * Full OAuth2 Add Bot flow:
         *
         * Add Bot
         * ↓
         * Discord
         * ↓
         * Authorize
         * ↓
         * /auth/discord/callback
         * ↓
         * Dashboard ?login=success&guildId=...
         */
        window.location.href =
            data.url;

    } catch (error) {
        clearPendingBotGuild();

        console.error(
            "❌ Bot invite error:",
            error
        );

        showToast(
            "❌ Failed to open Discord bot authorization."
        );
    }
}

function savePendingBotGuild(
    guildId
) {
    try {
        sessionStorage.setItem(
            PENDING_GUILD_KEY,
            String(guildId)
        );

        localStorage.setItem(
            PENDING_GUILD_KEY,
            String(guildId)
        );

    } catch (error) {
        console.warn(
            "⚠️ Could not save pending guild ID:",
            error
        );
    }
}

function getPendingBotGuild() {
    try {
        return (
            sessionStorage.getItem(
                PENDING_GUILD_KEY
            ) ||
            localStorage.getItem(
                PENDING_GUILD_KEY
            ) ||
            null
        );

    } catch (error) {
        console.warn(
            "⚠️ Could not read pending guild ID:",
            error
        );

        return null;
    }
}

function clearPendingBotGuild() {
    try {
        sessionStorage.removeItem(
            PENDING_GUILD_KEY
        );

        localStorage.removeItem(
            PENDING_GUILD_KEY
        );

    } catch (error) {
        console.warn(
            "⚠️ Could not clear pending guild ID:",
            error
        );
    }
}

function updateSelectedServerUI(
    guild
) {
    if (!guild) {
        return;
    }

    document
        .querySelectorAll(
            "[data-selected-server]"
        )
        .forEach(
            element => {
                element.textContent =
                    guild.name ||
                    "Selected Server";
            }
        );
}

function cleanURL() {
    try {
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );

    } catch (error) {
        console.warn(
            "⚠️ Could not clean OAuth URL:",
            error
        );
    }
}

async function logout() {
    try {
        await apiFetch(
            "/auth/logout",
            {
                method:
                    "POST"
            }
        );

    } catch (error) {
        console.error(
            "❌ Logout request failed:",
            error
        );

    } finally {
        clearPendingBotGuild();

        shadowSession = null;
        currentUser = null;
        currentGuilds = [];
        selectedGuild = null;

        if (
            shadowStatsInterval
        ) {
            clearInterval(
                shadowStatsInterval
            );

            shadowStatsInterval =
                null;
        }

        resetDisplayedStats();

        showLoginScreen();

        revealDashboard();

        window.location.href =
            window.location.pathname;
    }
}

function showPage(
    pageId,
    button = null
) {
    if (
        pageId !== "server" &&
        pageId !== "overview" &&
        !selectedGuild
    ) {
        showToast(
            "⚠️ Select a server first."
        );

        openServerScreen();

        return;
    }

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

        page.classList.remove(
            "page-enter"
        );

        requestAnimationFrame(
            () => {
                page.classList.add(
                    "page-enter"
                );
            }
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
                        "showPage('" +
                        pageId +
                        "'"
                    ) ||
                    onclick.includes(
                        "showPage(\"" +
                        pageId +
                        "\""
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

document.addEventListener(
    "click",
    event => {
        const target =
            event.target.closest(
                "[data-open-server]"
            );

        if (target) {
            if (currentUser) {
                openServerScreen();
            } else {
                showLoginScreen();
            }
        }
    }
);

document.addEventListener(
    "DOMContentLoaded",
    () => {
        hideDashboard();

        checkDiscordLogin();

        setupRipples();
        setupSwitches();
        setupServerManagementSettings();
        setupCardTilt();
        setupHeroParallax();
        setupOnlineAnimation();
        setupInputEffects();
        setupKeyboardShortcuts();
        setupScrollEffects();
        setupMobileNavigation();
        animateInitialCounters();
        loadSavedTheme();

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

function setupRipples() {
    document
        .querySelectorAll(
            "button"
        )
        .forEach(
            button => {
                if (
                    button.dataset
                        .rippleBound
                ) {
                    return;
                }

                button.dataset
                    .rippleBound =
                    "true";

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
}

function createButtonRipple(
    element,
    event
) {
    if (!element) {
        return;
    }

    const rect =
        element.getBoundingClientRect();

    const ripple =
        document.createElement(
            "span"
        );

    ripple.className =
        "click-ripple";

    ripple.style.left =
        String(
            event.clientX -
            rect.left
        ) +
        "px";

    ripple.style.top =
        String(
            event.clientY -
            rect.top
        ) +
        "px";

    element.appendChild(
        ripple
    );

    setTimeout(
        () => {
            ripple.remove();
        },
        650
    );
}

function setupSwitches() {
    document
        .querySelectorAll(
            ".switch input"
        )
        .forEach(
            toggle => {
                if (
                    toggle.id ===
                        "welcomeToggle" ||
                    toggle.id ===
                        "leaveToggle" ||
                    toggle.id ===
                        "announcementsToggle"
                ) {
                    return;
                }

                toggle.addEventListener(
                    "change",
                    () => {
                        showToast(
                            toggle.checked
                                ? "🟣 Feature enabled"
                                : "⚫ Feature disabled"
                        );
                    }
                );
            }
        );
}

function setupCardTilt() {
    const cards =
        document.querySelectorAll(
            ".stat-card, .setting-card, .game-panel"
        );

    cards.forEach(
        card => {
            card.addEventListener(
                "mousemove",
                event => {
                    if (
                        window.innerWidth <
                        850
                    ) {
                        return;
                    }

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
                            y /
                                rect.height -
                            0.5
                        ) *
                        -3;

                    const rotateY =
                        (
                            x /
                                rect.width -
                            0.5
                        ) *
                        3;

                    card.style.transform =
                        "perspective(800px) " +
                        "rotateX(" +
                        rotateX +
                        "deg) " +
                        "rotateY(" +
                        rotateY +
                        "deg) " +
                        "translateY(-4px)";
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
}

function setupHeroParallax() {
    const hero =
        document.querySelector(
            ".hero"
        );

    if (!hero) {
        return;
    }

    hero.addEventListener(
        "mousemove",
        event => {
            if (
                window.innerWidth <
                850
            ) {
                return;
            }

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
                (
                    50 +
                    moveX
                ) +
                "% " +
                (
                    50 +
                    moveY
                ) +
                "%";

            const symbol =
                hero.querySelector(
                    ".hero-symbol"
                );

            if (symbol) {
                symbol.style.transform =
                    "translate(" +
                    (
                        moveX *
                        0.6
                    ) +
                    "px, " +
                    (
                        moveY *
                        0.6
                    ) +
                    "px)";
            }
        }
    );

    hero.addEventListener(
        "mouseleave",
        () => {
            hero.style.backgroundPosition =
                "center";

            const symbol =
                hero.querySelector(
                    ".hero-symbol"
                );

            if (symbol) {
                symbol.style.transform =
                    "";
            }
        }
    );
}

function setupOnlineAnimation() {
    const online =
        document.querySelector(
            ".online-badge"
        );

    if (!online) {
        return;
    }

    setInterval(
        () => {
            online.classList.add(
                "status-pulse"
            );

            setTimeout(
                () => {
                    online.classList.remove(
                        "status-pulse"
                    );
                },
                350
            );
        },
        2500
    );
}

function animateInitialCounters() {
    document
        .querySelectorAll(
            ".stat-card strong"
        )
        .forEach(
            number => {
                const card =
                    number.closest(
                        ".stat-card"
                    );

                const text =
                    card
                        ?.textContent
                        .toLowerCase() ||
                    "";

                if (
                    text.includes(
                        "members"
                    ) ||
                    text.includes(
                        "member"
                    )
                ) {
                    return;
                }

                const numberText =
                    number.textContent.trim();

                const match =
                    numberText.match(
                        /^([\d,]+)$/
                    );

                if (!match) {
                    return;
                }

                const target =
                    Number(
                        match[1].replace(
                            /,/g,
                            ""
                        )
                    );

                if (!target) {
                    return;
                }

                animateNumberChange(
                    number,
                    0,
                    target,
                    850
                );
            }
        );
}

function setupInputEffects() {
    document
        .querySelectorAll(
            ".text-input, .number-input, select, input:not([type='checkbox'])"
        )
        .forEach(
            input => {
                input.addEventListener(
                    "focus",
                    () => {
                        input.classList.add(
                            "input-focused"
                        );
                    }
                );

                input.addEventListener(
                    "blur",
                    () => {
                        input.classList.remove(
                            "input-focused"
                        );
                    }
                );
            }
        );
}

function setupKeyboardShortcuts() {
    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key ===
                "Escape"
            ) {
                closeServerScreen();
            }

            if (
                event.ctrlKey &&
                event.key.toLowerCase() ===
                "k"
            ) {
                event.preventDefault();

                if (currentUser) {
                    openServerScreen();
                }
            }
        }
    );
}

function setupScrollEffects() {
    const topbar =
        document.querySelector(
            ".topbar"
        );

    if (!topbar) {
        return;
    }

    window.addEventListener(
        "scroll",
        () => {
            if (
                window.scrollY >
                12
            ) {
                topbar.classList.add(
                    "scrolled"
                );
            } else {
                topbar.classList.remove(
                    "scrolled"
                );
            }
        },
        {
            passive: true
        }
    );
}

function setupMobileNavigation() {
    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    if (!sidebar) {
        return;
    }

    document.addEventListener(
        "click",
        event => {
            const navButton =
                event.target.closest(
                    ".nav-btn"
                );

            if (
                navButton &&
                window.innerWidth <=
                850
            ) {
                sidebar.classList.remove(
                    "mobile-open"
                );
            }
        }
    );
}

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
        shadowToastTimer
    );

    shadowToastTimer =
        setTimeout(
            () => {
                toast.classList.remove(
                    "show"
                );
            },
            2800
        );
}

async function saveSettings() {
    const hasServerSettings =
        document.getElementById(
            "welcomeToggle"
        ) ||
        document.getElementById(
            "leaveToggle"
        ) ||
        document.getElementById(
            "announcementsToggle"
        );

    const serverPage =
        document.getElementById(
            "server"
        );

    const serverActive =
        serverPage &&
        serverPage.classList.contains(
            "active"
        );

    if (
        hasServerSettings &&
        serverActive
    ) {
        await saveServerManagementSettings();
        return;
    }

    showToast(
        "💾 Settings saved successfully!"
    );
}

function createPoll() {
    const question =
        document.getElementById(
            "pollQuestion"
        );

    const message =
        document.getElementById(
            "pollMessage"
        );

    if (!question) {
        return;
    }

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

    question.value =
        "";
}

function changeTheme() {
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

    try {
        localStorage.setItem(
            "shadow-theme",
            theme
        );

    } catch (error) {
        console.warn(
            "Theme storage unavailable."
        );
    }

    showToast(
        "🎨 Theme changed to " +
        theme
    );
}

function loadSavedTheme() {
    try {
        const theme =
            localStorage.getItem(
                "shadow-theme"
            );

        if (!theme) {
            return;
        }

        document.body.dataset.theme =
            theme;

        const select =
            document.getElementById(
                "themeSelect"
            );

        if (select) {
            select.value =
                theme;
        }

    } catch (error) {
        console.warn(
            "Could not load saved theme."
        );
    }
}

document.addEventListener(
    "visibilitychange",
    () => {
        if (
            !document.hidden &&
            currentUser &&
            selectedGuild
        ) {
            loadRealStats();
        }
    }
);
