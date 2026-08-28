// 🌑 ShadowDashboard
// Discord OAuth + Session + Server Selector + Premium UI
// ShadowBot Dashboard

const BACKEND_URL =
    "https://shadowapi.jonhcena-co.workers.dev";


// =========================================================
// GLOBAL STATE
// =========================================================

let shadowStatsInterval = null;
let shadowToastTimer = null;

let currentUser = null;
let currentGuilds = [];
let selectedGuild = null;

let dashboardSession = null;


// =========================================================
// SESSION
// =========================================================

function loadSession() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const urlSession =
        params.get("session");

    if (urlSession) {

        dashboardSession =
            urlSession;

        try {

            sessionStorage.setItem(
                "shadow_session",
                urlSession
            );

        } catch (error) {

            console.warn(
                "Session storage unavailable."
            );
        }

    } else {

        try {

            dashboardSession =
                sessionStorage.getItem(
                    "shadow_session"
                );

        } catch (error) {

            dashboardSession = null;
        }
    }

    return dashboardSession;
}


// =========================================================
// DISCORD LOGIN
// =========================================================

function loginWithDiscord() {

    console.log(
        "🔐 Opening Discord OAuth..."
    );

    window.location.href =
        BACKEND_URL +
        "/auth/discord";
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

    if (dashboardSession) {

        headers["Authorization"] =
            `Bearer ${dashboardSession}`;
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
// CHECK DISCORD LOGIN
// =========================================================

async function checkDiscordLogin() {

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const loginStatus =
            params.get("login");


        // =========================
        // FAILED LOGIN
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

            showLoginScreen();

            cleanURL();

            showToast(
                "❌ Discord login failed."
            );

            return;
        }


        // =========================
        // LOAD SESSION
        // =========================

        loadSession();

        if (!dashboardSession) {

            console.log(
                "🔒 No dashboard session found."
            );

            showLoginScreen();

            return;
        }


        // =========================
        // CHECK USER
        // =========================

        console.log(
            "🔍 Checking Discord session..."
        );

        const response =
            await apiFetch(
                "/api/me"
            );


        if (!response.ok) {

            console.log(
                "🔒 Session invalid:",
                response.status
            );

            clearSession();

            showLoginScreen();

            return;
        }


        const data =
            await response.json();


        console.log(
            "📡 Session response:",
            data
        );


        if (
            !data.loggedIn ||
            !data.user
        ) {

            clearSession();

            showLoginScreen();

            return;
        }


        // =========================
        // LOGGED IN
        // =========================

        currentUser =
            data.user;


        console.log(
            "✅ Logged in as:",
            currentUser.username
        );


        const username =
            currentUser.global_name ||
            currentUser.username ||
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
            currentUser
        );


        hideLoginScreen();


        // =========================
        // LOAD SERVERS
        // =========================

        await loadGuilds();


        // =========================
        // SHOW SERVER SELECTOR
        // =========================

        const storedGuild =
            sessionStorage.getItem(
                "shadow_selected_guild"
            );

        if (storedGuild) {

            const guildExists =
                currentGuilds.some(
                    guild =>
                        String(guild.id) ===
                        String(storedGuild)
                );

            if (guildExists) {

                await selectServer(
                    storedGuild,
                    false
                );

            } else {

                openServerScreen();
            }

        } else {

            openServerScreen();
        }


        // =========================
        // LOAD STATS
        // =========================

        await loadRealStats();


        // =========================
        // WELCOME
        // =========================

        if (
            loginStatus === "success"
        ) {

            showToast(
                `👋 Welcome, ${username}!`
            );
        }


        cleanURL();

    } catch (error) {

        console.error(
            "❌ Login check failed:",
            error
        );

        clearSession();

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
// SESSION CLEAR
// =========================================================

function clearSession() {

    dashboardSession = null;
    currentUser = null;
    selectedGuild = null;

    try {

        sessionStorage.removeItem(
            "shadow_session"
        );

        sessionStorage.removeItem(
            "shadow_selected_guild"
        );

    } catch (error) {

        console.warn(
            "Could not clear session storage."
        );
    }
}


// =========================================================
// ELEMENT TEXT
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

    if (!dashboardSession) {
        return;
    }

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
            !Number.isFinite(members) ||
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
                "❌ Member stat not found."
            );

            return;
        }


        const previous =
            Number(
                memberNumber.dataset.realMembers ||
                0
            );


        memberNumber.dataset.realMembers =
            String(members);


        animateNumberChange(
            memberNumber,
            previous,
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


    return document.querySelector(
        ".stat-card strong"
    );
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

        } else {

            element.textContent =
                to.toLocaleString();
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


    let avatarURL = null;


    if (
        typeof user.avatar ===
        "string" &&
        user.avatar.startsWith("http")
    ) {

        avatarURL =
            user.avatar;

    } else if (
        user.avatar &&
        user.id
    ) {

        avatarURL =
            `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;

    } else if (
        user.id
    ) {

        avatarURL =
            `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator || 0) % 5}.png`;
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


    img.onerror = () => {

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
                "❌ Failed to load guilds:",
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


        updateServerSelects(
            guilds
        );


        console.log(
            `✅ Loaded ${guilds.length} manageable servers.`
        );

    } catch (error) {

        console.error(
            "❌ Guild loading failed:",
            error
        );
    }
}


// =========================================================
// SERVER SELECT DROPDOWNS
// =========================================================

function updateServerSelects(
    guilds
) {

    const selectors =
        document.querySelectorAll(
            "#serverSelect, .server-select"
        );


    selectors.forEach(
        select => {

            select.innerHTML =
                "";


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";

            option.textContent =
                "Select a server";


            select.appendChild(
                option
            );


            guilds.forEach(
                guild => {

                    const serverOption =
                        document.createElement(
                            "option"
                        );


                    serverOption.value =
                        guild.id;


                    serverOption.textContent =
                        guild.name;


                    select.appendChild(
                        serverOption
                    );
                }
            );
        }
    );
}


// =========================================================
// SERVER SELECTOR SCREEN
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

                <div class="server-empty-icon">
                    🏠
                </div>

                <h3>
                    No manageable servers
                </h3>

                <p>
                    You need Administrator permission
                    to manage a server with ShadowBot.
                </p>

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
                                ? `
                                    <span class="server-badge owner">
                                        👑 OWNER
                                    </span>
                                  `
                                : ""
                        }

                        ${
                            (
                                guild.permissions &&
                                (
                                    BigInt(
                                        guild.permissions
                                    ) &
                                    BigInt(8)
                                ) !==
                                BigInt(0)
                            )
                                ? `
                                    <span class="server-badge admin">
                                        🛡️ ADMIN
                                    </span>
                                  `
                                : ""
                        }

                    </div>

                </div>

                <button
                    class="manage-server-btn"
                    type="button"
                >
                    Manage
                </button>
            `;


            const button =
                card.querySelector(
                    ".manage-server-btn"
                );


            if (button) {

                button.addEventListener(
                    "click",
                    () => {

                        selectServer(
                            guild.id,
                            true
                        );
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
// FILTER SERVERS
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


    let visible =
        0;


    cards.forEach(
        card => {

            const name =
                card
                    .querySelector(
                        ".server-name"
                    )
                    ?.textContent
                    .toLowerCase() || "";


            const show =
                name.includes(
                    query
                );


            card.style.display =
                show
                    ? "flex"
                    : "none";


            if (show) {
                visible++;
            }
        }
    );


    const oldEmpty =
        document.querySelector(
            "#serverList .search-empty"
        );


    if (oldEmpty) {
        oldEmpty.remove();
    }


    if (
        cards.length &&
        visible === 0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "server-empty search-empty";


        empty.innerHTML = `

            <div class="server-empty-icon">
                🔎
            </div>

            <h3>
                No matching servers
            </h3>

            <p>
                Try another server name.
            </p>
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
// SELECT SERVER
// =========================================================

async function selectServer(
    guildId,
    hideSelector = true
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
                "❌ Could not select server."
            );

            return;
        }


        selectedGuild =
            currentGuilds.find(
                guild =>
                    String(guild.id) ===
                    String(guildId)
            ) || data;


        try {

            sessionStorage.setItem(
                "shadow_selected_guild",
                guildId
            );

        } catch (error) {

            console.warn(
                "Could not save selected server."
            );
        }


        console.log(
            "🏠 Selected server:",
            data
        );


        updateSelectedServerUI(
            selectedGuild
        );


        if (
            hideSelector
        ) {

            closeServerScreen();
        }


        showPage(
            "overview"
        );


        showToast(
            `🏠 ${data.name || "Server"} selected`
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
// UPDATE SELECTED SERVER UI
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
// OPEN SERVER SCREEN
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

        setTimeout(
            () => {
                search.focus();
            },
            120
        );
    }
}


// =========================================================
// CLOSE SERVER SCREEN
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
// CLEAN URL
// =========================================================

function cleanURL() {

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );
}


// =========================================================
// LOGOUT
// =========================================================

async function logout() {

    try {

        if (dashboardSession) {

            await apiFetch(
                "/auth/logout",
                {
                    method:
                        "POST"
                }
            );
        }

    } catch (error) {

        console.error(
            "❌ Logout failed:",
            error
        );

    } finally {

        clearSession();

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


    window.scrollTo(
        {
            top:
                0,

            behavior:
                "smooth"
        }
    );
}


// =========================================================
// OPEN SERVER BUTTONS
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

    document
        .querySelectorAll(
            ".stat-card, .setting-card, .game-panel"
        )
        .forEach(
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
                            ) * -3;


                        const rotateY =
                            (
                                x /
                                rect.width -
                                0.5
                            ) * 3;


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
// ONLINE
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
// SERVER DROPDOWNS
// =========================================================

function setupServerSelects() {

    document.addEventListener(
        "change",
        event => {

            if (
                event.target.matches(
                    "#serverSelect, .server-select"
                )
            ) {

                selectServer(
                    event.target.value
                );
            }
        }
    );
}


// =========================================================
// KEYBOARD
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
// SCROLL EFFECTS
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
// MOBILE
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

            const button =
                event.target.closest(
                    ".nav-btn"
                );


            if (
                button &&
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
// POLL
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
// LOAD THEME
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
// PAGE VISIBILITY
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
// DOM READY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSession();

        loadSavedTheme();

        checkDiscordLogin();

        setupRipples();
        setupSwitches();
        setupCardTilt();
        setupHeroParallax();
        setupOnlineAnimation();
        setupInputEffects();
        setupServerSelects();
        setupKeyboardShortcuts();
        setupScrollEffects();
        setupMobileNavigation();


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
