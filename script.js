* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --bg: #07070c;
    --sidebar: rgba(10, 10, 16, 0.92);
    --card: rgba(16, 16, 25, 0.78);
    --card-solid: #101019;
    --card2: #151521;
    --border: rgba(255, 255, 255, 0.075);
    --border-hover: rgba(139, 92, 246, 0.45);

    --text: #f7f7fb;
    --muted: #858594;
    --muted2: #5f5f6c;

    --purple: #8b5cf6;
    --purple2: #6d3df0;
    --purple-light: #a78bfa;

    --green: #36e58a;
    --red: #ff4d67;

    --shadow:
        0 25px 70px rgba(0, 0, 0, 0.4);

    --ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}

html {
    scroll-behavior: smooth;
}

body {
    font-family:
        Inter,
        Arial,
        Helvetica,
        sans-serif;

    background:
        radial-gradient(
            circle at 75% 5%,
            rgba(139, 92, 246, 0.12),
            transparent 30%
        ),
        radial-gradient(
            circle at 15% 85%,
            rgba(109, 61, 240, 0.07),
            transparent 30%
        ),
        var(--bg);

    color: var(--text);

    min-height: 100vh;

    overflow-x: hidden;
}

/* =========================
   AMBIENT BACKGROUND
========================= */

.ambient {
    position: fixed;
    width: 450px;
    height: 450px;

    border-radius: 50%;

    filter: blur(120px);

    pointer-events: none;

    opacity: 0.12;

    z-index: -5;

    animation:
        ambientFloat 12s ease-in-out infinite;
}

.ambient-one {
    background: var(--purple);
    top: -180px;
    right: -100px;
}

.ambient-two {
    background: #4f46e5;
    bottom: -220px;
    left: -150px;

    animation-delay: -5s;
}

.ambient-three {
    background: #7c3aed;
    top: 45%;
    right: 25%;

    width: 250px;
    height: 250px;

    opacity: 0.06;

    animation-delay: -8s;
}

@keyframes ambientFloat {
    0%,
    100% {
        transform: translate3d(0, 0, 0);
    }

    50% {
        transform: translate3d(30px, -25px, 0);
    }
}

.grid-overlay {
    position: fixed;
    inset: 0;

    pointer-events: none;

    z-index: -4;

    opacity: 0.12;

    background-image:
        linear-gradient(
            rgba(255, 255, 255, 0.025) 1px,
            transparent 1px
        ),
        linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.025) 1px,
            transparent 1px
        );

    background-size: 55px 55px;

    mask-image:
        linear-gradient(
            to bottom,
            black,
            transparent 85%
        );
}

/* =========================
   LOGIN
========================= */

#loginScreen {
    position: fixed;
    inset: 0;

    z-index: 99999;

    display: flex;
    align-items: center;
    justify-content: center;

    background:
        radial-gradient(
            circle at center,
            rgba(139, 92, 246, 0.13),
            transparent 38%
        ),
        rgba(5, 5, 9, 0.97);

    backdrop-filter: blur(10px);
}

.login-glow {
    position: absolute;

    width: 350px;
    height: 350px;

    border-radius: 50%;

    background: var(--purple);

    filter: blur(150px);

    opacity: 0.12;

    animation: loginGlow 5s ease-in-out infinite;
}

@keyframes loginGlow {
    0%,
    100% {
        transform: scale(0.9);
        opacity: 0.08;
    }

    50% {
        transform: scale(1.1);
        opacity: 0.18;
    }
}

.login-card {
    position: relative;

    width: min(440px, calc(100% - 40px));

    padding: 45px 36px;

    text-align: center;

    border-radius: 26px;

    background:
        linear-gradient(
            145deg,
            rgba(27, 27, 39, 0.94),
            rgba(12, 12, 18, 0.97)
        );

    border: 1px solid var(--border);

    box-shadow:
        0 40px 100px rgba(0, 0, 0, 0.65),
        0 0 80px rgba(139, 92, 246, 0.08);

    animation:
        loginCardIn 0.7s var(--ease);
}

@keyframes loginCardIn {
    from {
        opacity: 0;
        transform:
            translateY(25px)
            scale(0.96);
    }

    to {
        opacity: 1;
        transform:
            translateY(0)
            scale(1);
    }
}

.login-logo-wrap {
    width: 105px;
    height: 105px;

    margin: 0 auto 20px;

    padding: 5px;

    border-radius: 29px;

    background:
        linear-gradient(
            135deg,
            var(--purple),
            transparent,
            var(--purple2)
        );

    box-shadow:
        0 0 45px rgba(139, 92, 246, 0.2);
}

.login-logo {
    width: 100%;
    height: 100%;

    object-fit: cover;

    border-radius: 24px;

    display: block;
}

.login-status {
    display: inline-flex;

    align-items: center;

    gap: 6px;

    margin-bottom: 12px;

    color: var(--green);

    font-size: 9px;
    font-weight: 800;

    letter-spacing: 1.5px;
}

.login-card h1 {
    margin-bottom: 12px;

    font-size: 29px;
}

.login-card p {
    color: var(--muted);

    line-height: 1.7;

    margin-bottom: 28px;

    font-size: 13px;
}

.discord-login-btn {
    position: relative;

    width: 100%;

    border: none;

    border-radius: 12px;

    padding: 15px 18px;

    background:
        linear-gradient(
            135deg,
            #5865f2,
            #4752c4
        );

    color: white;

    font-size: 15px;
    font-weight: 700;

    cursor: pointer;

    overflow: hidden;

    box-shadow:
        0 12px 35px rgba(88, 101, 242, 0.25);

    transition:
        transform 0.25s var(--ease),
        filter 0.25s ease,
        box-shadow 0.25s ease;
}

.discord-login-btn:hover {
    transform: translateY(-3px);

    filter: brightness(1.08);

    box-shadow:
        0 18px 45px rgba(88, 101, 242, 0.35);
}

.discord-login-btn:active {
    transform: scale(0.98);
}

.discord-login-btn span:first-child {
    margin-right: 7px;
}

.button-arrow {
    position: absolute;

    right: 18px;

    transition: transform 0.25s ease;
}

.discord-login-btn:hover .button-arrow {
    transform: translateX(4px);
}

.login-small {
    display: block;

    margin-top: 18px;

    color: var(--muted2);

    font-size: 11px;
}

/* =========================
   SERVER SELECTOR
========================= */

#serverScreen {
    display: none;

    position: fixed;
    inset: 0;

    z-index: 99998;

    align-items: center;
    justify-content: center;

    background:
        radial-gradient(
            circle at center,
            rgba(139, 92, 246, 0.1),
            transparent 40%
        ),
        #07070c;

    padding: 30px;

    overflow: auto;
}

.server-select-card {
    width: min(800px, 100%);

    background:
        linear-gradient(
            145deg,
            rgba(22, 22, 31, 0.98),
            rgba(10, 10, 15, 0.98)
        );

    border: 1px solid var(--border);

    border-radius: 24px;

    padding: 30px;

    box-shadow: var(--shadow);
}

.server-heading {
    display: flex;

    align-items: center;

    gap: 15px;

    margin-bottom: 25px;
}

.server-logo {
    width: 62px;
    height: 62px;

    border-radius: 17px;

    overflow: hidden;

    border: 1px solid var(--border);

    box-shadow:
        0 0 25px rgba(139, 92, 246, 0.15);
}

.server-logo img {
    width: 100%;
    height: 100%;

    object-fit: cover;
}

.server-heading h1 {
    margin: 3px 0;

    font-size: 25px;
}

.server-heading p {
    color: var(--muted);

    font-size: 12px;
}

/* =========================
   SIDEBAR
========================= */

.sidebar {
    position: fixed;

    left: 0;
    top: 0;
    bottom: 0;

    width: 255px;

    padding: 23px 14px;

    background:
        linear-gradient(
            180deg,
            rgba(12, 12, 19, 0.96),
            rgba(8, 8, 13, 0.97)
        );

    backdrop-filter: blur(22px);

    border-right: 1px solid var(--border);

    display: flex;
    flex-direction: column;

    z-index: 10;

    animation:
        sidebarIn 0.7s var(--ease);

    overflow: hidden;
}

.sidebar::after {
    content: "";

    position: absolute;

    top: 0;
    right: 0;

    width: 1px;
    height: 100%;

    background:
        linear-gradient(
            transparent,
            rgba(139, 92, 246, 0.4),
            transparent
        );

    opacity: 0.5;
}

.sidebar-glow {
    position: absolute;

    top: -150px;
    left: -150px;

    width: 350px;
    height: 350px;

    border-radius: 50%;

    background: var(--purple);

    filter: blur(120px);

    opacity: 0.05;

    pointer-events: none;
}

@keyframes sidebarIn {
    from {
        opacity: 0;
        transform: translateX(-25px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* =========================
   BRAND
========================= */

.brand {
    display: flex;

    align-items: center;

    gap: 12px;

    padding:
        5px 10px 28px;
}

.brand-icon {
    width: 44px;
    height: 44px;

    border-radius: 13px;

    overflow: hidden;

    flex-shrink: 0;

    border: 1px solid var(--border);

    background: #161620;

    box-shadow:
        0 0 25px rgba(139, 92, 246, 0.12);

    transition:
        transform 0.3s var(--ease),
        border-color 0.3s ease,
        box-shadow 0.3s ease;
}

.brand-icon:hover {
    transform:
        rotate(-5deg)
        scale(1.08);

    border-color:
        var(--purple);

    box-shadow:
        0 0 35px rgba(139, 92, 246, 0.3);
}

.brand-icon img {
    width: 100%;
    height: 100%;

    object-fit: cover;
}

.brand h1 {
    font-size: 16px;
}

.brand-info span {
    color: var(--muted2);

    font-size: 8px;

    letter-spacing: 1.3px;
}

/* =========================
   NAV
========================= */

.nav-label {
    color: var(--muted2);

    font-size: 8px;
    font-weight: 800;

    letter-spacing: 1.8px;

    padding:
        0 13px 9px;
}

nav {
    display: flex;

    flex-direction: column;

    gap: 4px;
}

.nav-btn {
    position: relative;

    display: flex;

    align-items: center;

    gap: 12px;

    width: 100%;

    overflow: hidden;

    border: 1px solid transparent;

    background: transparent;

    color: var(--muted);

    padding: 12px 13px;

    border-radius: 10px;

    text-align: left;

    font-size: 13px;

    cursor: pointer;

    transition:
        background 0.25s ease,
        color 0.25s ease,
        transform 0.25s var(--ease),
        border-color 0.25s ease;
}

.nav-btn::before {
    content: "";

    position: absolute;

    left: -120%;

    top: 0;

    width: 100%;
    height: 100%;

    background:
        linear-gradient(
            90deg,
            transparent,
            rgba(139, 92, 246, 0.12),
            transparent
        );

    transition: 0.55s ease;
}

.nav-btn:hover::before {
    left: 120%;
}

.nav-btn:hover {
    background: rgba(139, 92, 246, 0.06);

    color: white;

    transform: translateX(3px);

    border-color:
        rgba(139, 92, 246, 0.08);
}

.nav-btn.active {
    background:
        linear-gradient(
            90deg,
            rgba(139, 92, 246, 0.18),
            rgba(139, 92, 246, 0.035)
        );

    color: white;

    border-color:
        rgba(139, 92, 246, 0.13);

    box-shadow:
        inset 3px 0 var(--purple),
        0 8px 25px rgba(0, 0, 0, 0.12);
}

.nav-icon {
    width: 20px;

    text-align: center;

    color: var(--purple-light);

    font-size: 16px;

    transition:
        transform 0.25s ease;
}

.nav-btn:hover .nav-icon {
    transform:
        scale(1.15)
        rotate(-5deg);
}

/* =========================
   BOT STATUS
========================= */

.sidebar-bottom {
    margin-top: auto;
}

.bot-status {
    position: relative;

    display: flex;

    align-items: center;

    gap: 9px;

    padding: 11px;

    border-radius: 13px;

    background:
        rgba(17, 17, 25, 0.75);

    border: 1px solid var(--border);

    transition:
        transform 0.3s var(--ease),
        border-color 0.3s ease,
        box-shadow 0.3s ease;
}

.bot-status:hover {
    transform: translateY(-2px);

    border-color:
        rgba(139, 92, 246, 0.3);

    box-shadow:
        0 15px 35px rgba(0, 0, 0, 0.25);
}

.status-avatar-wrap {
    position: relative;

    flex-shrink: 0;
}

.status-avatar {
    width: 35px;
    height: 35px;

    border-radius: 10px;

    object-fit: cover;

    border: 1px solid var(--border);
}

.status-dot {
    position: absolute;

    right: -2px;
    bottom: -2px;

    width: 10px;
    height: 10px;

    background: var(--green);

    border: 2px solid #101019;

    border-radius: 50%;

    box-shadow:
        0 0 10px var(--green);

    animation:
        statusPulse 2s infinite;
}

@keyframes statusPulse {
    0%,
    100% {
        box-shadow:
            0 0 5px var(--green);
    }

    50% {
        box-shadow:
            0 0 18px var(--green);
    }
}

.bot-status-info {
    min-width: 0;
}

.bot-status strong {
    display: block;

    font-size: 12px;
}

.bot-status small {
    color: var(--green);

    font-size: 9px;

    font-weight: 700;
}

.status-bars {
    display: flex;

    align-items: flex-end;

    gap: 2px;

    margin-left: auto;
}

.status-bars i {
    width: 2px;

    height: 6px;

    background: var(--green);

    border-radius: 2px;

    animation:
        barPulse 1s ease-in-out infinite;
}

.status-bars i:nth-child(2) {
    height: 10px;
    animation-delay: 0.15s;
}

.status-bars i:nth-child(3) {
    height: 7px;
    animation-delay: 0.3s;
}

@keyframes barPulse {
    50% {
        opacity: 0.35;
        transform: scaleY(0.5);
    }
}

/* =========================
   MAIN
========================= */

.main {
    margin-left: 255px;

    min-height: 100vh;

    padding:
        0 40px 60px;

    animation:
        mainIn 0.7s ease;
}

@keyframes mainIn {
    from {
        opacity: 0;
        transform: translateY(12px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* =========================
   TOPBAR
========================= */

.topbar {
    height: 90px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    border-bottom:
        1px solid var(--border);

    margin-bottom: 30px;
}

.eyebrow,
.section-kicker {
    color: var(--purple-light);

    font-size: 9px;

    font-weight: 800;

    letter-spacing: 2px;
}

.topbar h2 {
    margin-top: 4px;

    font-size: 22px;
}

.mobile-title {
    display: none;
}

.user-area {
    display: flex;

    align-items: center;

    gap: 15px;
}

.connection-pill {
    display: flex;

    align-items: center;

    gap: 7px;

    padding:
        7px 11px;

    border-radius: 20px;

    background:
        rgba(54, 229, 138, 0.06);

    border:
        1px solid rgba(54, 229, 138, 0.15);

    color: var(--green);

    font-size: 9px;

    font-weight: 700;
}

.connection-pill span {
    width: 6px;
    height: 6px;

    border-radius: 50%;

    background: var(--green);

    box-shadow:
        0 0 8px var(--green);

    animation:
        statusPulse 2s infinite;
}

.user-profile {
    display: flex;

    align-items: center;

    gap: 9px;
}

.avatar {
    width: 38px;
    height: 38px;

    border-radius: 12px;

    display: flex;

    align-items: center;
    justify-content: center;

    background:
        linear-gradient(
            135deg,
            #1b1b26,
            #11111a
        );

    border: 1px solid var(--border);

    transition:
        transform 0.3s ease,
        border-color 0.3s ease,
        box-shadow 0.3s ease;
}

.avatar:hover {
    transform: scale(1.08);

    border-color: var(--purple);

    box-shadow:
        0 0 25px rgba(139, 92, 246, 0.25);
}

.user-info strong {
    display: block;

    font-size: 12px;
}

.user-info small {
    color: var(--muted);

    font-size: 9px;
}

/* =========================
   PAGES
========================= */

.page {
    display: none;
}

.page.active {
    display: block;

    animation:
        pageIn 0.45s var(--ease);
}

@keyframes pageIn {
    from {
        opacity: 0;
        transform:
            translateY(14px)
            scale(0.995);
    }

    to {
        opacity: 1;
        transform:
            translateY(0)
            scale(1);
    }
}

/* =========================
   HERO
========================= */

.hero {
    position: relative;

    min-height: 310px;

    padding: 40px;

    border:
        1px solid var(--border);

    border-radius: 22px;

    background-image:
        linear-gradient(
            90deg,
            rgba(7, 7, 12, 0.96) 0%,
            rgba(7, 7, 12, 0.82) 42%,
            rgba(7, 7, 12, 0.3) 100%
        ),
        url("banner.png");

    background-size: cover;

    background-position: center;

    display: flex;

    align-items: center;

    justify-content: space-between;

    overflow: hidden;

    isolation: isolate;

    transition:
        transform 0.4s var(--ease),
        border-color 0.4s ease,
        box-shadow 0.4s ease;
}

.hero::before {
    content: "";

    position: absolute;

    inset: 0;

    background:
        linear-gradient(
            110deg,
            transparent 30%,
            rgba(139, 92, 246, 0.1),
            transparent 70%
        );

    background-size: 200% 100%;

    animation:
        heroSweep 7s ease-in-out infinite;

    pointer-events: none;
}

@keyframes heroSweep {
    0%,
    100% {
        background-position: -100% 0;
    }

    50% {
        background-position: 200% 0;
    }
}

.hero:hover {
    border-color:
        rgba(139, 92, 246, 0.35);

    box-shadow:
        0 30px 80px rgba(0, 0, 0, 0.35);
}

.hero-shine {
    position: absolute;

    inset: 0;

    pointer-events: none;

    background:
        radial-gradient(
            circle at 82% 45%,
            rgba(139, 92, 246, 0.3),
            transparent 32%
        );

    animation:
        heroGlow 5s ease-in-out infinite;
}

@keyframes heroGlow {
    0%,
    100% {
        opacity: 0.5;
    }

    50% {
        opacity: 1;
    }
}

.hero-content {
    position: relative;

    z-index: 2;

    max-width: 650px;
}

.hero-tag {
    display: inline-flex;

    align-items: center;

    gap: 7px;

    color: var(--green);

    font-size: 9px;

    font-weight: 800;

    letter-spacing: 1.4px;
}

.pulse-dot {
    width: 6px;
    height: 6px;

    border-radius: 50%;

    background: var(--green);

    box-shadow:
        0 0 12px var(--green);

    animation:
        statusPulse 2s infinite;
}

.hero h1 {
    margin: 15px 0 10px;

    font-size: 40px;

    letter-spacing: -1px;
}

.hero h1 span {
    color: var(--purple-light);

    text-shadow:
        0 0 35px rgba(139, 92, 246, 0.35);
}

.hero p {
    color: #c0c0c9;

    max-width: 560px;

    line-height: 1.65;

    font-size: 13px;

    margin-bottom: 24px;
}

.hero-actions {
    display: flex;

    gap: 10px;
}

.hero-symbol {
    position: relative;

    z-index: 2;

    width: 150px;
    height: 150px;

    margin-right: 25px;

    display: flex;

    align-items: center;
    justify-content: center;

    animation:
        floatingLogo 4s ease-in-out infinite;
}

.hero-symbol img {
    position: relative;

    z-index: 3;

    width: 115px;
    height: 115px;

    object-fit: cover;

    border-radius: 27px;

    border:
        1px solid rgba(255, 255, 255, 0.12);

    box-shadow:
        0 0 60px rgba(139, 92, 246, 0.25);
}

.logo-ring {
    position: absolute;

    border:
        1px solid rgba(139, 92, 246, 0.25);

    border-radius: 50%;
}

.ring-one {
    width: 145px;
    height: 145px;

    animation:
        ringRotate 12s linear infinite;
}

.ring-two {
    width: 180px;
    height: 180px;

    border-style: dashed;

    opacity: 0.35;

    animation:
        ringRotateReverse 18s linear infinite;
}

@keyframes ringRotate {
    to {
        transform: rotate(360deg);
    }
}

@keyframes ringRotateReverse {
    to {
        transform: rotate(-360deg);
    }
}

@keyframes floatingLogo {
    0%,
    100% {
        transform:
            translateY(0)
            rotate(0deg);
    }

    50% {
        transform:
            translateY(-8px)
            rotate(1deg);
    }
}

/* =========================
   BUTTONS
========================= */

.primary-btn,
.secondary-btn {
    position: relative;

    overflow: hidden;

    border-radius: 10px;

    padding: 12px 17px;

    font-weight: 700;

    font-size: 12px;

    cursor: pointer;

    transition:
        transform 0.25s var(--ease),
        box-shadow 0.25s ease,
        filter 0.25s ease;
}

.primary-btn {
    border: none;

    background:
        linear-gradient(
            135deg,
            var(--purple),
            var(--purple2)
        );

    color: white;

    box-shadow:
        0 10px 30px rgba(109, 61, 240, 0.22);
}

.primary-btn::before {
    content: "";

    position: absolute;

    top: 0;
    left: -130%;

    width: 80%;
    height: 100%;

    background:
        linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.3),
            transparent
        );

    transform: skewX(-20deg);

    transition: 0.6s;
}

.primary-btn:hover::before {
    left: 140%;
}

.primary-btn:hover {
    transform:
        translateY(-3px)
        scale(1.02);

    box-shadow:
        0 15px 40px rgba(109, 61, 240, 0.35);

    filter: brightness(1.08);
}

.secondary-btn {
    background:
        rgba(255, 255, 255, 0.04);

    color: white;

    border:
        1px solid var(--border);
}

.secondary-btn:hover {
    transform: translateY(-3px);

    border-color:
        rgba(139, 92, 246, 0.35);

    background:
        rgba(139, 92, 246, 0.08);
}

/* =========================
   STATS
========================= */

.stats-grid {
    display: grid;

    grid-template-columns:
        repeat(4, 1fr);

    gap: 14px;

    margin: 18px 0;
}

.stat-card {
    position: relative;

    overflow: hidden;

    display: flex;

    align-items: center;

    gap: 13px;

    min-height: 105px;

    padding: 18px;

    background:
        linear-gradient(
            145deg,
            rgba(18, 18, 27, 0.9),
            rgba(12, 12, 19, 0.85)
        );

    border:
        1px solid var(--border);

    border-radius: 15px;

    transition:
        transform 0.3s var(--ease),
        border-color 0.3s ease,
        box-shadow 0.3s ease;
}

.stat-card:hover {
    transform:
        translateY(-6px);

    border-color:
        rgba(139, 92, 246, 0.4);

    box-shadow:
        0 20px 45px rgba(0, 0, 0, 0.25),
        0 0 30px rgba(139, 92, 246, 0.07);
}

.stat-glow {
    position: absolute;

    right: -50px;
    top: -50px;

    width: 110px;
    height: 110px;

    border-radius: 50%;

    background:
        var(--purple);

    filter: blur(45px);

    opacity: 0.06;

    transition: 0.4s;
}

.stat-card:hover .stat-glow {
    opacity: 0.18;
}

.stat-icon {
    width: 45px;
    height: 45px;

    flex-shrink: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 12px;

    background:
        rgba(139, 92, 246, 0.1);

    color: var(--purple-light);

    font-size: 19px;

    transition:
        transform 0.3s var(--ease),
        box-shadow 0.3s ease;
}

.stat-card:hover .stat-icon {
    transform:
        scale(1.12)
        rotate(-5deg);

    box-shadow:
        0 0 25px rgba(139, 92, 246, 0.14);
}

.stat-info span {
    display: block;

    color: var(--muted2);

    font-size: 8px;

    font-weight: 800;

    letter-spacing: 1px;

    margin-bottom: 4px;
}

.stat-info strong {
    display: block;

    font-size: 19px;
}

.stat-info small {
    display: block;

    margin-top: 4px;

    color: var(--muted2);

    font-size: 8px;
}

.stat-info small b {
    color: var(--green);
}

/* =========================
   CONTENT
========================= */

.content-grid {
    display: grid;

    grid-template-columns:
        1.4fr 1fr;

    gap: 18px;
}

.panel {
    position: relative;

    background:
        linear-gradient(
            145deg,
            rgba(18, 18, 27, 0.9),
            rgba(11, 11, 17, 0.86)
        );

    border:
        1px solid var(--border);

    border-radius: 16px;

    padding: 22px;

    transition:
        transform 0.3s var(--ease),
        border-color 0.3s ease,
        box-shadow 0.3s ease;
}

.panel:hover {
    border-color:
        rgba(139, 92, 246, 0.2);

    box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.18);
}

.panel-header {
    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    margin-bottom: 18px;
}

.panel-label {
    display: block;

    color: var(--purple-light);

    font-size: 8px;

    font-weight: 800;

    letter-spacing: 1.6px;

    margin-bottom: 5px;
}

.panel h3 {
    font-size: 15px;
}

.panel-header p,
.section-title p {
    color: var(--muted);

    font-size: 11px;

    margin-top: 5px;
}

.panel-status {
    color: var(--green);

    font-size: 8px;

    font-weight: 800;

    padding:
        6px 8px;

    border-radius: 20px;

    background:
        rgba(54, 229, 138, 0.05);

    border:
        1px solid rgba(54, 229, 138, 0.12);
}

/* =========================
   FEATURES
========================= */

.feature-list {
    display: flex;

    flex-direction: column;
}

.feature {
    display: flex;

    align-items: center;

    gap: 12px;

    padding: 13px 0;

    border-bottom:
        1px solid rgba(255, 255, 255, 0.045);

    transition:
        padding 0.25s ease,
        background 0.25s ease;
}

.feature:last-child {
    border-bottom: none;
}

.feature:hover {
    padding-left: 7px;
    padding-right: 7px;

    background:
        rgba(139, 92, 246, 0.025);
}

.feature-icon {
    width: 34px;
    height: 34px;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 9px;

    background:
        rgba(139, 92, 246, 0.08);

    color: var(--purple-light);

    transition:
        transform 0.25s ease;
}

.feature:hover .feature-icon {
    transform:
        scale(1.1)
        rotate(-4deg);
}

.feature div {
    flex: 1;
}

.feature strong {
    display: block;

    font-size: 12px;
}

.feature small {
    color: var(--muted);

    font-size: 10px;
}

.enabled {
    color: var(--green);

    font-size: 8px;

    text-shadow:
        0 0 10px rgba(54, 229, 138, 0.25);
}

/* =========================
   QUICK ACTIONS
========================= */

.quick-actions {
    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 9px;
}

.quick-actions button {
    min-height: 80px;

    display: flex;

    flex-direction: column;

    align-items: flex-start;

    justify-content: center;

    gap: 8px;

    border:
        1px solid var(--border);

    background:
        rgba(255, 255, 255, 0.025);

    color: white;

    padding: 15px;

    border-radius: 11px;

    cursor: pointer;

    text-align: left;

    font-size: 11px;

    transition:
        transform 0.25s var(--ease),
        border-color 0.25s ease,
        background 0.25s ease,
        box-shadow 0.25s ease;
}

.quick-actions button span {
    color: var(--purple-light);

    font-size: 19px;
}

.quick-actions button:hover {
    border-color:
        rgba(139, 92, 246, 0.35);

    background:
        rgba(139, 92, 246, 0.08);

    transform:
        translateY(-4px);

    box-shadow:
        0 10px 30px rgba(139, 92, 246, 0.1);
}

/* =========================
   SECTION TITLE
========================= */

.section-title {
    margin-bottom: 25px;
}

.section-title h1 {
    margin-top: 5px;

    font-size: 27px;

    letter-spacing: -0.5px;
}

/* =========================
   SETTINGS
========================= */

.settings-grid {
    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 17px;
}

.setting-card {
    position: relative;

    min-height: 185px;
}

.big-icon {
    display: block;

    margin-bottom: 14px;

    font-size: 29px;

    transition:
        transform 0.3s var(--ease);
}

.setting-card:hover .big-icon {
    transform:
        scale(1.12)
        rotate(-5deg);
}

.setting-card h3 {
    margin-bottom: 8px;

    font-size: 15px;
}

.setting-card p {
    color: var(--muted);

    max-width: 360px;

    line-height: 1.55;

    font-size: 11px;
}

.setting-card .switch {
    position: absolute;

    right: 20px;
    top: 20px;
}

/* =========================
   SWITCH
========================= */

.switch {
    position: relative;

    display: inline-block;

    width: 47px;
    height: 25px;

    flex-shrink: 0;
}

.switch input {
    width: 0;
    height: 0;

    opacity: 0;
}

.switch span {
    position: absolute;

    inset: 0;

    cursor: pointer;

    border-radius: 30px;

    background:
        #292934;

    transition: 0.3s;
}

.switch span::before {
    content: "";

    position: absolute;

    left: 3px;
    top: 3px;

    width: 19px;
    height: 19px;

    border-radius: 50%;

    background: white;

    box-shadow:
        0 2px 5px rgba(0, 0, 0, 0.3);

    transition:
        0.3s var(--ease);
}

.switch input:checked + span {
    background:
        var(--purple);

    box-shadow:
        0 0 18px rgba(139, 92, 246, 0.3);
}

.switch input:checked + span::before {
    transform:
        translateX(22px);
}

/* =========================
   SETTING ROW
========================= */

.setting-row {
    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 20px;

    padding: 19px 0;

    border-bottom:
        1px solid rgba(255, 255, 255, 0.055);
}

.setting-row:first-child {
    padding-top: 0;
}

.setting-row:last-of-type {
    margin-bottom: 20px;
}

.setting-row h3 {
    font-size: 13px;
}

.setting-row p {
    color: var(--muted);

    font-size: 10px;

    margin-top: 5px;
}

/* =========================
   INPUTS
========================= */

.number-input,
.text-input,
select {
    background:
        #0a0a10;

    color: white;

    border:
        1px solid var(--border);

    border-radius: 9px;

    padding:
        11px 12px;

    outline: none;

    transition:
        border-color 0.25s ease,
        box-shadow 0.25s ease,
        transform 0.25s ease;
}

.number-input:focus,
.text-input:focus,
select:focus {
    border-color:
        var(--purple);

    box-shadow:
        0 0 20px rgba(139, 92, 246, 0.12);
}

.number-input {
    width: 90px;
}

.text-input {
    width: 100%;

    margin: 10px 0;

    font-size: 12px;
}

select {
    min-width: 150px;

    font-size: 11px;
}

/* =========================
   GAMES
========================= */

.game-panel {
    margin-top: 18px;
}

.game-row {
    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 15px;

    padding: 20px 0;

    border-bottom:
        1px solid rgba(255, 255, 255, 0.055);

    transition:
        padding 0.25s ease,
        background 0.25s ease;
}

.game-row:hover {
    padding-left: 8px;
    padding-right: 8px;

    background:
        rgba(139, 92, 246, 0.025);
}

.game-row:last-child {
    border-bottom: none;
}

.game-row > div {
    display: flex;

    align-items: center;

    gap: 13px;
}

.game-icon {
    width: 45px;
    height: 45px;

    display: flex;

    align-items: center;
    justify-content: center;

    border-radius: 12px;

    background:
        rgba(139, 92, 246, 0.09);

    font-size: 20px;

    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.game-row:hover .game-icon {
    transform:
        scale(1.1)
        rotate(-5deg);

    box-shadow:
        0 0 25px rgba(139, 92, 246, 0.14);
}

.game-row h3 {
    font-size: 13px;
}

.game-row p {
    color: var(--muted);

    font-size: 10px;

    margin-top: 5px;
}

/* =========================
   ONLINE
========================= */

.online-badge {
    display: inline-flex;

    align-items: center;

    gap: 5px;

    margin-top: 20px;

    color: var(--green);

    font-size: 10px;

    font-weight: 800;

    text-shadow:
        0 0 10px rgba(54, 229, 138, 0.3);

    animation:
        onlineGlow 2s ease-in-out infinite;
}

@keyframes onlineGlow {
    0%,
    100% {
        opacity: 0.65;
    }

    50% {
        opacity: 1;
    }
}

/* =========================
   POLLS
========================= */

.poll-options {
    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 10px;
}

#pollMessage {
    margin-top: 15px;

    color: var(--green);

    font-size: 11px;
}

/* =========================
   TOAST
========================= */

.toast {
    position: fixed;

    right: 25px;
    bottom: 25px;

    z-index: 100000;

    min-width: 230px;

    padding:
        13px 17px;

    border-radius: 11px;

    background:
        rgba(20, 20, 28, 0.95);

    backdrop-filter:
        blur(15px);

    border:
        1px solid var(--green);

    color: white;

    font-size: 12px;

    box-shadow:
        0 15px 45px rgba(0, 0, 0, 0.4);

    transform:
        translateY(100px);

    opacity: 0;

    transition:
        0.35s var(--ease);
}

.toast.show {
    transform:
        translateY(0);

    opacity: 1;
}

/* =========================
   RIPPLE
========================= */

.click-ripple {
    position: absolute;

    width: 10px;
    height: 10px;

    border-radius: 50%;

    background:
        rgba(255, 255, 255, 0.25);

    transform:
        translate(-50%, -50%)
        scale(0);

    animation:
        rippleEffect 0.6s ease-out;

    pointer-events: none;
}

@keyframes rippleEffect {
    to {
        transform:
            translate(-50%, -50%)
            scale(25);

        opacity: 0;
    }
}

/* =========================
   SCROLLBAR
========================= */

::-webkit-scrollbar {
    width: 7px;
}

::-webkit-scrollbar-track {
    background:
        #07070c;
}

::-webkit-scrollbar-thumb {
    background:
        #292934;

    border-radius:
        20px;
}

::-webkit-scrollbar-thumb:hover {
    background:
        var(--purple);
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1100px) {

    .stats-grid {
        grid-template-columns:
            1fr 1fr;
    }

    .content-grid {
        grid-template-columns:
            1fr;
    }

}

@media (max-width: 800px) {

    .sidebar {
        width: 70px;

        padding:
            15px 8px;
    }

    .brand {
        justify-content: center;

        padding-bottom: 25px;
    }

    .brand-info,
    .nav-btn > span:not(.nav-icon),
    .bot-status-info,
    .status-bars,
    .nav-label {
        display: none;
    }

    .nav-btn {
        justify-content: center;

        padding:
            14px 5px;
    }

    .sidebar-bottom {
        display: flex;

        justify-content: center;
    }

    .bot-status {
        padding: 8px;
    }

    .main {
        margin-left: 70px;

        padding:
            0 20px 40px;
    }

    .hero {
        min-height: 300px;

        padding: 28px;
    }

    .hero-symbol {
        display: none;
    }

    .hero h1 {
        font-size: 31px;
    }

    .settings-grid {
        grid-template-columns:
            1fr;
    }

}

@media (max-width: 550px) {

    .stats-grid {
        grid-template-columns:
            1fr;
    }

    .topbar {
        height: 75px;
    }

    .connection-pill,
    .user-area .user-info {
        display: none;
    }

    .hero {
        padding: 24px;

        min-height: 290px;
    }

    .hero h1 {
        font-size: 28px;
    }

    .hero p {
        font-size: 12px;
    }

    .hero-actions {
        flex-direction: column;

        align-items: stretch;
    }

    .quick-actions {
        grid-template-columns:
            1fr;
    }

    .poll-options {
        grid-template-columns:
            1fr;
    }

    .setting-row {
        align-items: flex-start;
    }

    .section-title h1 {
        font-size: 23px;
    }

    .main {
        padding:
            0 14px 35px;
    }

    .topbar {
        margin-bottom: 22px;
    }

}
