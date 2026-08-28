// 🌑 ShadowDashboard
// Navigation + Discord OAuth + Cookie Session + Animations + Toasts + Backend
// Premium UI interactions + REAL DISCORD MEMBER COUNT

const BACKEND_URL = "https://shadowapi.jonhcena-co.workers.dev";


// =========================
// GLOBAL STATE
// =========================

let shadowStatsInterval = null;
let shadowToastTimer = null;
let currentUser = null;
let currentGuilds = [];
let selectedGuild = null;


// =========================
// DISCORD LOGIN
// =========================

function loginWithDiscord() {
    console.log("🔐 Opening Discord OAuth...");
    window.location.href = BACKEND_URL + "/auth/discord";
}


// =========================
// API REQUEST
// =========================

async function apiFetch(endpoint, options = {}) {
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


// =========================
// CHECK DISCORD LOGIN
// =========================

async function checkDiscordLogin() {
    try {
        const params = new URLSearchParams(window.location.search);
        const loginStatus = params.get("login");

        if (
            loginStatus === "failed" ||
            loginStatus === "error" ||
            loginStatus === "cancelled"
        ) {
            console.error(
                "❌ Discord OAuth failed:",
                loginStatus
            );

            cleanURL();

            showToast("❌ Discord login failed.");
            return;
        }

        console.log("🔍 Checking Discord session...");

        const response = await apiFetch("/api/me");

        if (!response.ok) {
            console.log(
                "🔒 No valid dashboard session:",
                response.status
            );

            showLoginScreen();
            return;
        }

        const data = await response.json();

        console.log("📡 Session response:", data);

        if (data.loggedIn && data.user) {
            currentUser = data.user;

            console.log(
                "✅ Logged in as:",
                data.user.username
            );

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

            updateUserAvatar(data.user);

            hideLoginScreen();

            await loadGuilds();
            await loadRealStats();

            if (loginStatus === "success") {
                showToast(`👋 Welcome, ${username}!`);
            }

            cleanURL();
            return;
        }

        console.log(
            "🔒 Backend says user is not logged in."
        );

        showLoginScreen();

    } catch (error) {
        console.error(
            "❌ Login check failed:",
            error
        );

        showLoginScreen();
    }
}


// =========================
// LOGIN SCREEN HELPERS
// =========================

function showLoginScreen() {
    const loginScreen =
        document.getElementById("loginScreen");

    if (loginScreen) {
        loginScreen.style.display = "flex";
    }
}

function hideLoginScreen() {
    const loginScreen =
        document.getElementById("loginScreen");

    if (loginScreen) {
        loginScreen.style.display = "none";
    }
}


// =========================
// ELEMENT TEXT HELPER
// =========================

function updateElementText(
    id,
    value
) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// =========================
// LOAD REAL DISCORD STATS
// =========================

async function loadRealStats() {
    try {
        console.log(
            "📊 Loading real Discord member count..."
        );

        const response =
            await apiFetch("/stats");

        if (!response.ok) {
            console.error(
                "❌ Stats request failed:",
                response.status
            );

            return;
        }

        const data =
            await response.json();

        console.log(
            "📊 Real ShadowBot stats:",
            data
        );

        const members =
            Number(data.members);

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
                "❌ Could not find Members stat element."
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

        if (previousValue !== members) {
            animateNumberChange(
                memberNumber,
                previousValue,
                members,
                650
            );
        } else {
            memberNumber.textContent =
                members.toLocaleString();
        }

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
            "❌ Failed to load real stats:",
            error
        );
    }
}


// =========================
// FIND MEMBERS STAT
// =========================

function findMemberStatElement() {
    const statCards =
        document.querySelectorAll(
            ".stat-card"
        );

    for (const card of statCards) {
        const label =
            card.textContent
                .toLowerCase();

        if (
            label.includes("members") ||
            label.includes("member")
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

    const strongElements =
        document.querySelectorAll(
            ".stat-card strong"
        );

    return strongElements.length
        ? strongElements[0]
        : null;
}


// =========================
// NUMBER ANIMATION
// =========================

function animateNumberChange(
    element,
    from,
    to,
    duration = 700
) {
    if (!element) return;

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
                (time - start) / duration,
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
                (to - from) * eased
            );

        element.textContent =
            value.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(frame);
        }
    }

    requestAnimationFrame(frame);
}


// =========================
// UPDATE USER AVATAR
// =========================

function updateUserAvatar(user) {
    const avatar =
        document.getElementById(
            "userAvatar"
        );

    if (!avatar) return;

    let avatarURL = null;

    if (
        typeof user.avatar === "string" &&
        user.avatar.startsWith("http")
    ) {
        avatarURL = user.avatar;
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
                user.discriminator || 0
            );

        avatarURL =
            `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`;
    }

    if (!avatarURL) {
        avatar.textContent = "👤";
        return;
    }

    avatar.innerHTML = "";

    const img =
        document.createElement("img");

    img.src = avatarURL;
    img.alt = "Discord Avatar";
    img.width = 128;
    img.height = 128;
    img.loading = "eager";

    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "inherit";
    img.draggable = false;

    img.onerror = () => {
        avatar.textContent = "👤";
    };

    avatar.appendChild(img);
}


// =========================
// LOAD DISCORD SERVERS
// =========================

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

        console.log(
            "🏠 Discord servers:",
            data
        );

        const guilds =
            Array.isArray(data.guilds)
                ? data.guilds
                : [];

        currentGuilds = guilds;

        updateServerSelects(guilds);
        renderServerScreen(guilds);

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


// =========================
// UPDATE SERVER SELECTS
// =========================

function updateServerSelects(guilds) {
    const selectors =
        document.querySelectorAll(
            "#serverSelect, .server-select"
        );

    selectors.forEach(select => {
        if (!select) return;

        select.innerHTML = "";

        const defaultOption =
            document.createElement(
                "option"
            );

        defaultOption.value = "";
        defaultOption.textContent =
            "Select a server";

        select.appendChild(
            defaultOption
        );

        guilds.forEach(guild => {
            const option =
                document.createElement(
                    "option"
                );

            option.value = guild.id;
            option.textContent = guild.name;

            select.appendChild(option);
        });
    });
}


// =========================
// RENDER SERVER SCREEN
// =========================

function renderServerScreen(guilds) {
    const serverList =
        document.getElementById(
            "serverList"
        );

    if (!serverList) return;

    serverList.innerHTML = "";

    if (!guilds.length) {
        serverList.innerHTML = `
            <div class="server-empty">
                <div class="server-empty-icon">🏠</div>
                <h3>No servers found</h3>
                <p>You don't have any servers available to manage.</p>
            </div>
        `;

        return;
    }

    guilds.forEach(guild => {
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
                guild.icon.startsWith("http")
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
                            ? `<span class="server-badge bot">✓ BOT</span>`
                            : `<span class="server-badge not-installed">⚠ BOT NOT INSTALLED</span>`
                    }

                </div>

            </div>

            <button
                class="manage-server-btn"
                data-guild-id="${escapeHTML(guild.id)}"
                type="button"
            >
                Manage
            </button>
        `;

        const manageButton =
            card.querySelector(
                ".manage-server-btn"
            );

        if (manageButton) {
            manageButton.addEventListener(
                "click",
                () => {
                    selectServer(
                        guild.id
                    );
                }
            );
        }

        serverList.appendChild(card);
    });
}


// =========================
// ESCAPE HTML
// =========================

function escapeHTML(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================
// FILTER SERVERS
// =========================

function filterServers() {
    const search =
        document.getElementById(
            "serverSearch"
        );

    if (!search) return;

    const cards =
        document.querySelectorAll(
            "#serverList .server-card"
        );

    const query =
        search.value
            .trim()
            .toLowerCase();

    let visibleCount = 0;

    cards.forEach(card => {
        const name =
            card.querySelector(
                ".server-name"
            )
            ?.textContent
            .toLowerCase() || "";

        const visible =
            name.includes(query);

        card.style.display =
            visible
                ? "flex"
                : "none";

        if (visible) {
            visibleCount++;
        }
    });

    const existingEmpty =
        document.querySelector(
            "#serverList .search-empty"
        );

    if (existingEmpty) {
        existingEmpty.remove();
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
            .getElementById("serverList")
            ?.appendChild(empty);
    }
}


// =========================
// SELECT SERVER
// =========================

async function selectServer(guildId) {
    if (!guildId) return;

    try {
        const response =
            await apiFetch(
                `/api/guild/${encodeURIComponent(guildId)}`
            );

        const data =
            await response.json();

        if (!response.ok) {
            showToast(
                "❌ Could not select server."
            );

            console.error(
                "Server selection failed:",
                data
            );

            return;
        }

        selectedGuild =
            currentGuilds.find(
                guild =>
                    String(guild.id) ===
                    String(guildId)
            ) || data;

        console.log(
            "🏠 Selected server:",
            data
        );

        const serverScreen =
            document.getElementById(
                "serverScreen"
            );

        if (serverScreen) {
            serverScreen.style.opacity = "0";

            setTimeout(() => {
                serverScreen.style.display =
                    "none";

                serverScreen.style.opacity =
                    "";
            }, 180);
        }

        updateSelectedServerUI(
            selectedGuild
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


// =========================
// SELECTED SERVER UI
// =========================

function updateSelectedServerUI(guild) {
    if (!guild) return;

    document
        .querySelectorAll(
            "[data-selected-server]"
        )
        .forEach(element => {
            element.textContent =
                guild.name || "Selected Server";
        });
}


// =========================
// OPEN SERVER SCREEN
// =========================

function openServerScreen() {
    const serverScreen =
        document.getElementById(
            "serverScreen"
        );

    if (!serverScreen) return;

    serverScreen.style.display =
        "flex";

    requestAnimationFrame(() => {
        serverScreen.style.opacity = "1";
    });

    const search =
        document.getElementById(
            "serverSearch"
        );

    if (search) {
        search.focus();
    }
}


// =========================
// CLOSE SERVER SCREEN
// =========================

function closeServerScreen() {
    const serverScreen =
        document.getElementById(
            "serverScreen"
        );

    if (!serverScreen) return;

    serverScreen.style.opacity = "0";

    setTimeout(() => {
        serverScreen.style.display =
            "none";

        serverScreen.style.opacity =
            "";
    }, 180);
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
        console.log(
            "👋 Logged out."
        );

        currentUser = null;
        selectedGuild = null;

        window.location.href =
            window.location.pathname;
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

    pages.forEach(page => {
        page.classList.remove(
            "active"
        );
    });

    navButtons.forEach(btn => {
        btn.classList.remove(
            "active"
        );
    });

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

        requestAnimationFrame(() => {
            page.classList.add(
                "page-enter"
            );
        });
    }

    if (button) {
        button.classList.add(
            "active"
        );
    } else {
        navButtons.forEach(btn => {
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
        });
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
// QUICK SERVER OPEN
// =========================

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


// =========================
// DOM READY
// =========================

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
        setupServerSelects();
        setupKeyboardShortcuts();
        setupScrollEffects();
        setupMobileNavigation();
        animateInitialCounters();

        setTimeout(() => {
            document.body.classList.add(
                "dashboard-loaded"
            );
        }, 100);

        console.log(
            "🌑 ShadowDashboard loaded successfully."
        );
    }
);


// =========================
// RIPPLE EFFECTS
// =========================

function setupRipples() {
    document
        .querySelectorAll(
            "button"
        )
        .forEach(button => {
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
        });
}


function createButtonRipple(
    element,
    event
) {
    if (!element) return;

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

    setTimeout(() => {
        ripple.remove();
    }, 650);
}


// =========================
// SWITCHES
// =========================

function setupSwitches() {
    document
        .querySelectorAll(
            ".switch input"
        )
        .forEach(toggle => {

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
        });
}


// =========================
// CARD TILT
// =========================

function setupCardTilt() {
    const cards =
        document.querySelectorAll(
            ".stat-card, .setting-card, .game-panel"
        );

    cards.forEach(card => {
        card.addEventListener(
            "mousemove",
            event => {
                if (
                    window.innerWidth < 850
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
                        y / rect.height -
                        0.5
                    ) * -3;

                const rotateY =
                    (
                        x / rect.width -
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
    });
}


// =========================
// HERO PARALLAX
// =========================

function setupHeroParallax() {
    const hero =
        document.querySelector(
            ".hero"
        );

    if (!hero) return;

    hero.addEventListener(
        "mousemove",
        event => {
            if (
                window.innerWidth < 850
            ) {
                return;
            }

            const rect =
                hero.getBoundingClientRect();

            const x =
                (
                    event.clientX -
                    rect.left
                ) / rect.width;

            const y =
                (
                    event.clientY -
                    rect.top
                ) / rect.height;

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


// =========================
// ONLINE ANIMATION
// =========================

function setupOnlineAnimation() {
    const online =
        document.querySelector(
            ".online-badge"
        );

    if (!online) return;

    setInterval(() => {
        online.classList.add(
            "status-pulse"
        );

        setTimeout(() => {
            online.classList.remove(
                "status-pulse"
            );
        }, 350);
    }, 2500);
}


// =========================
// INITIAL COUNTERS
// =========================

function animateInitialCounters() {
    document
        .querySelectorAll(
            ".stat-card strong"
        )
        .forEach(number => {

            const card =
                number.closest(
                    ".stat-card"
                );

            const cardText =
                card
                    ?.textContent
                    .toLowerCase() || "";

            if (
                cardText.includes(
                    "members"
                ) ||
                cardText.includes(
                    "member"
                )
            ) {
                return;
            }

            const text =
                number.textContent.trim();

            const match =
                text.match(
                    /^([\d,]+)$/
                );

            if (!match) return;

            const target =
                Number(
                    match[1].replace(
                        /,/g,
                        ""
                    )
                );

            if (!target) return;

            animateNumberChange(
                number,
                0,
                target,
                850
            );
        });
}


// =========================
// INPUT GLOW
// =========================

function setupInputEffects() {
    document
        .querySelectorAll(
            ".text-input, .number-input, select, input:not([type='checkbox'])"
        )
        .forEach(input => {

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
        });
}


// =========================
// SERVER SELECTS
// =========================

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


// =========================
// KEYBOARD SHORTCUTS
// =========================

function setupKeyboardShortcuts() {
    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {
                closeServerScreen();
            }

            if (
                event.ctrlKey &&
                event.key.toLowerCase() === "k"
            ) {
                event.preventDefault();

                const search =
                    document.getElementById(
                        "serverSearch"
                    );

                if (search) {
                    openServerScreen();
                    search.focus();
                }
            }
        }
    );
}


// =========================
// SCROLL EFFECTS
// =========================

function setupScrollEffects() {
    const topbar =
        document.querySelector(
            ".topbar"
        );

    if (!topbar) return;

    window.addEventListener(
        "scroll",
        () => {
            if (
                window.scrollY > 12
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


// =========================
// MOBILE NAVIGATION
// =========================

function setupMobileNavigation() {
    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    if (!sidebar) return;

    document.addEventListener(
        "click",
        event => {

            const navButton =
                event.target.closest(
                    ".nav-btn"
                );

            if (
                navButton &&
                window.innerWidth <= 850
            ) {
                sidebar.classList.remove(
                    "mobile-open"
                );
            }
        }
    );
}


// =========================
// TOAST
// =========================

function showToast(message) {
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

    question.value = "";
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


// =========================
// LOAD SAVED THEME
// =========================

function loadSavedTheme() {
    try {
        const theme =
            localStorage.getItem(
                "shadow-theme"
            );

        if (!theme) return;

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


// =========================
// PAGE VISIBILITY
// =========================

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


// =========================
// LOAD THEME ON START
// =========================

document.addEventListener(
    "DOMContentLoaded",
    loadSavedTheme
);
