// 🌑 ShadowDashboard
// Discord OAuth + Secure Session + Server Selector
// Premium UI + Real Discord Member Count

const BACKEND_URL =
    "https://shadowapi.jonhcena-co.workers.dev";

// =========================================================
// GLOBAL STATE
// =========================================================

let shadowSession =
    localStorage.getItem(
        "shadow_session"
    ) || null;

let shadowStatsInterval = null;
let shadowToastTimer = null;

let currentUser = null;
let currentGuilds = [];
let selectedGuild = null;

// =========================================================
// DISCORD LOGIN
// =========================================================

function loginWithDiscord() {

    console.log(
        "🔐 Opening Discord OAuth..."
    );

    window.location.href =
        `${BACKEND_URL}/auth/discord`;
}

// =========================================================
// API REQUEST
// =========================================================

async function apiFetch(
    endpoint,
    options = {}
) {

    const headers = {
        "Accept":
            "application/json",

        ...(options.headers || {})
    };

    if (shadowSession) {

        headers[
            "Authorization"
        ] =
            `Bearer ${shadowSession}`;
    }

    return fetch(
        BACKEND_URL + endpoint,
        {
            ...options,

            headers,

            credentials:
                "include"
        }
    );
}

// =========================================================
// CHECK LOGIN
// =========================================================

async function checkDiscordLogin() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const loginStatus =
            params.get("login");

        const sessionFromURL =
            params.get("session");

        // -----------------------------------------------------
        // GET SESSION FROM OAUTH URL
        // -----------------------------------------------------

        if (sessionFromURL) {

            shadowSession =
                sessionFromURL;

            localStorage.setItem(
                "shadow_session",
                sessionFromURL
            );

            console.log(
                "🔑 Session received from OAuth."
            );
        }

        // -----------------------------------------------------
        // REMOVE OAUTH PARAMETERS IMMEDIATELY
        // -----------------------------------------------------

        if (
            loginStatus ||
            sessionFromURL
        ) {

            cleanURL();

            console.log(
                "🧹 OAuth parameters removed from URL."
            );
        }

        // -----------------------------------------------------
        // OAUTH FAILURE
        // -----------------------------------------------------

        if (
            loginStatus === "failed" ||
            loginStatus === "error" ||
            loginStatus === "cancelled"
        ) {

            console.error(
                "❌ Discord OAuth failed:",
                loginStatus
            );

            showLoginScreen();

            showToast(
                "❌ Discord login failed."
            );

            return;
        }

        // -----------------------------------------------------
        // CHECK SESSION
        // -----------------------------------------------------

        console.log(
            "🔍 Checking Discord session..."
        );

        const response =
            await apiFetch(
                "/api/me"
            );

        if (!response.ok) {

            console.log(
                "🔒 Invalid dashboard session:",
                response.status
            );

            shadowSession =
                null;

            localStorage.removeItem(
                "shadow_session"
            );

            showLoginScreen();

            return;
        }

        const data =
            await response.json();

        console.log(
            "📡 Session response:",
            data
        );

        // -----------------------------------------------------
        // LOGGED IN
        // -----------------------------------------------------

        if (
            data.loggedIn &&
            data.user
        ) {

            currentUser =
                data.user;

            const username =
                data.user.global_name ||
                data.user.username ||
                "Discord User";

            console.log(
                "✅ Logged in as:",
                username
            );

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

            hideLoginScreen();

            await loadGuilds();

            await loadRealStats();

            // -------------------------------------------------
            // OPEN SERVER SELECTOR AFTER SUCCESSFUL LOGIN
            // -------------------------------------------------

            if (
                loginStatus ===
                "success"
            ) {

                setTimeout(
                    () => {

                        openServerScreen();

                        showToast(
                            `👋 Welcome, ${username}!`
                        );

                    },
                    250
                );
            }

            return;
        }

        showLoginScreen();

    } catch (error) {

        console.error(
            "❌ Login check failed:",
            error
        );

        showLoginScreen();
    }
}

// =========================================================
// LOGIN SCREEN
// =========================================================

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

// =========================================================
// ELEMENT HELPER
// =========================================================

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

// =========================================================
// REAL STATS
// =========================================================

async function loadRealStats() {

    try {

        console.log(
            "📊 Loading real Discord member count..."
        );

        const response =
            await apiFetch(
                "/stats"
            );

        if (!response.ok) {

            console.error(
                "❌ Stats request failed:",
                response.status
            );

            return;
        }

        const data =
            await response.json();

        const members =
            Number(
                data.members
            );

        if (
            !Number.isFinite(
                members
            ) ||
            members < 0
        ) {

            console.error(
                "❌ Invalid member count:",
                data.members
            );

            return;
        }

        const memberNumber =
            findMemberStatElement();

        if (!memberNumber) {

            console.error(
                "❌ Could not find Members stat."
            );

            return;
        }

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

        console.log(
            `✅ REAL MEMBER COUNT: ${members.toLocaleString()}`
        );

        if (!shadowStatsInterval) {

            shadowStatsInterval =
                setInterval(
                    loadRealStats,
                    60000
                );
        }

    } catch (error) {

        console.error(
            "❌ Failed to load stats:",
            error
        );
    }
}

// =========================================================
// FIND MEMBER STAT
// =========================================================

function findMemberStatElement() {

    const statCards =
        document.querySelectorAll(
            ".stat-card"
        );

    for (
        const card
        of statCards
    ) {

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

    const fallback =
        document.querySelector(
            ".stat-card strong"
        );

    return fallback || null;
}

// =========================================================
// NUMBER ANIMATION
// =========================================================

function animateNumberChange(
    element,
    from,
    to,
    duration = 700
) {

    if (!element) {
        return;
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

        if (
            progress < 1
        ) {

            requestAnimationFrame(
                frame
            );
        }
    }

    requestAnimationFrame(
        frame
    );
}

// =========================================================
// USER AVATAR
// =========================================================

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

    let avatarURL =
        null;

    if (
        typeof user.avatar ===
            "string" &&
        user.avatar.startsWith(
            "http"
        )
    ) {

        avatarURL =
            user.avatar;
    }

    else if (
        user.avatar &&
        user.id
    ) {

        avatarURL =
            `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
    }

    else if (user.id) {

        const discriminator =
            Number(
                user.discriminator ||
                0
            );

        avatarURL =
            `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`;
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

// =========================================================
// LOAD GUILDS
// =========================================================

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

        const guilds =
            Array.isArray(
                data.guilds
            )
                ? data.guilds
                : [];

        currentGuilds =
            guilds;

        renderServerScreen(
            guilds
        );

        console.log(
            `✅ Loaded ${guilds.length} servers.`
        );

    } catch (error) {

        console.error(
            "❌ Guild loading failed:",
            error
        );
    }
}

// =========================================================
// RENDER SERVER SCREEN
// =========================================================

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

        serverList.innerHTML = `
            <div class="server-empty">
                <div class="server-empty-icon">🏠</div>
                <h3>No servers found</h3>
                <p>You don't have any manageable servers.</p>
            </div>
        `;

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

            if (
                guild.icon
            ) {

                if (
                    guild.icon.startsWith(
                        "http"
                    )
                ) {

                    iconURL =
                        guild.icon;

                } else {

                    iconURL =
                        `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
                }
            }

            card.innerHTML = `
                <img
                    class="server-icon"
                    src="${escapeHTML(iconURL)}"
                    alt="${escapeHTML(guild.name)}"
                    loading="lazy"
                    draggable="false"
                    onerror="this.src='Goku.png'"
                >

                <div class="server-info">

                    <span class="server-name">
                        ${escapeHTML(guild.name)}
                    </span>

                    <div class="server-badges">

                        ${
                            guild.owner
                                ? `<span class="server-badge owner">👑 OWNER</span>`
                                : ""
                        }

                        ${
                            guild.admin
                                ? `<span class="server-badge admin">🛡️ ADMIN</span>`
                                : ""
                        }

                        ${
                            guild.botInstalled
                                ? `<span class="server-badge bot">✓ BOT INSTALLED</span>`
                                : `<span class="server-badge not-installed">⚠ BOT NOT INSTALLED</span>`
                        }

                    </div>

                </div>

                ${
                    guild.botInstalled
                        ? `
                            <button
                                class="manage-server-btn"
                                type="button"
                                data-action="manage"
                                data-guild-id="${escapeHTML(guild.id)}"
                            >
                                Manage
                            </button>
                        `
                        : `
                            <button
                                class="manage-server-btn"
                                type="button"
                                data-action="invite"
                                data-guild-id="${escapeHTML(guild.id)}"
                            >
                                Add Bot
                            </button>
                        `
                }
            `;

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

// =========================================================
// ESCAPE HTML
// =========================================================

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

// =========================================================
// SEARCH SERVERS
// =========================================================

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

        empty.innerHTML = `
            <div class="server-empty-icon">🔎</div>
            <h3>No matching servers</h3>
            <p>Try another server name.</p>
        `;

        document
            .getElementById(
                "serverList"
            )
            ?.appendChild(
                empty
            );
    }
}

// =========================================================
// OPEN SERVER SELECTOR
// =========================================================

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
            () => {
                search.focus();
            },
            100
        );
    }
}

// =========================================================
// CLOSE SERVER SELECTOR
// =========================================================

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

// =========================================================
// SELECT SERVER
// =========================================================

async function selectServer(
    guildId
) {

    if (!guildId) {
        return;
    }

    try {

        const response =
            await apiFetch(
                `/api/guild/${encodeURIComponent(guildId)}`
            );

        const data =
            await response.json();

        if (!response.ok) {

            console.error(
                "❌ Server selection failed:",
                data
            );

            showToast(
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

        closeServerScreen();

        showToast(
            `🏠 ${data.name} selected`
        );

        console.log(
            "🏠 Selected server:",
            data
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

// =========================================================
// INVITE BOT
// =========================================================

async function inviteBotToGuild(
    guildId
) {

    if (!guildId) {
        return;
    }

    try {

        showToast(
            "🤖 Opening Discord bot invite..."
        );

        const response =
            await apiFetch(
                `/api/invite/${encodeURIComponent(guildId)}`
            );

        const data =
            await response.json();

        if (!response.ok) {

            console.error(
                "❌ Invite error:",
                data
            );

            showToast(
                data.error ||
                "❌ Could not create bot invite."
            );

            return;
        }

        if (!data.url) {

            showToast(
                "❌ Discord invite URL missing."
            );

            return;
        }

        window.location.href =
            data.url;

    } catch (error) {

        console.error(
            "❌ Bot invite error:",
            error
        );

        showToast(
            "❌ Failed to open bot invite."
        );
    }
}

// =========================================================
// SELECTED SERVER UI
// =========================================================

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

// =========================================================
// CLEAN URL
// =========================================================

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

// =========================================================
// LOGOUT
// =========================================================

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

        shadowSession =
            null;

        currentUser =
            null;

        selectedGuild =
            null;

        localStorage.removeItem(
            "shadow_session"
        );

        console.log(
            "👋 Logged out."
        );

        window.location.href =
            window.location.pathname;
    }
}

// =========================================================
// PAGE NAVIGATION
// =========================================================

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
        top:
            0,

        behavior:
            "smooth"
    });
}

// =========================================================
// OPEN SERVER FROM DATA ATTRIBUTE
// =========================================================

document.addEventListener(
    "click",
    event => {

        const target =
            event.target.closest(
                "[data-open-server]"
            );

        if (target) {

            openServerScreen();
        }
    }
);

// =========================================================
// DOM READY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkDiscordLogin();

        setupRipples();
        setupSwitches();
        setupCardTilt();
        setupHeroParallax();
        setupOnlineAnimation();
        setupInputEffects();
        setupKeyboardShortcuts();
        setupScrollEffects();
        setupMobileNavigation();
        animateInitialCounters();

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

// =========================================================
// RIPPLE
// =========================================================

function setupRipples() {

    document
        .querySelectorAll(
            "button"
        )
        .forEach(
            button => {

                if (
                    button.dataset.rippleBound
                ) {
                    return;
                }

                button.dataset.rippleBound =
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
        650
    );
}

// =========================================================
// SWITCHES
// =========================================================

function setupSwitches() {

    document
        .querySelectorAll(
            ".switch input"
        )
        .forEach(
            toggle => {

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

// =========================================================
// CARD TILT
// =========================================================

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
                        `perspective(800px)
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
}

// =========================================================
// HERO PARALLAX
// =========================================================

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
                `${50 + moveX}% ${50 + moveY}%`;

            const symbol =
                hero.querySelector(
                    ".hero-symbol"
                );

            if (symbol) {

                symbol.style.transform =
                    `translate(
                        ${moveX * 0.6}px,
                        ${moveY * 0.6}px
                    )`;
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

// =========================================================
// ONLINE ANIMATION
// =========================================================

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

// =========================================================
// INITIAL COUNTERS
// =========================================================

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

// =========================================================
// INPUT EFFECTS
// =========================================================

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

// =========================================================
// KEYBOARD SHORTCUTS
// =========================================================

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

                openServerScreen();
            }
        }
    );
}

// =========================================================
// SCROLL EFFECT
// =========================================================

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
            passive:
                true
        }
    );
}

// =========================================================
// MOBILE NAV
// =========================================================

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

// =========================================================
// TOAST
// =========================================================

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

// =========================================================
// SAVE SETTINGS
// =========================================================

function saveSettings() {

    showToast(
        "💾 Settings saved successfully!"
    );
}

// =========================================================
// CREATE POLL
// =========================================================

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

// =========================================================
// THEME
// =========================================================

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
        `🎨 Theme changed to ${theme}`
    );
}

// =========================================================
// LOAD SAVED THEME
// =========================================================

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

// =========================================================
// VISIBILITY CHANGE
// =========================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            !document.hidden &&
            currentUser
        ) {

            loadRealStats();
        }
    }
);

// =========================================================
// THEME ON START
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    loadSavedTheme
);
