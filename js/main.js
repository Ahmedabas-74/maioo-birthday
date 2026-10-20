/* ==========================================================================
   1. DEFAULT CONFIGURATION & STATE
   ========================================================================== */
const DEFAULT_CONFIG = {
    targetDateCairo: "2026-10-20T00:00:00+03:00", // Oct 20, 2026 Cairo Midnight
    letterTitle: "Happy Birthday, My Dearest MAIOO",
    letterBody: "I don’t know where to begin or what to say, but first of all, happy birthday to the most wonderful May in the world!\n\nMay you always be the most successful businesswoman out there. I truly hope to see you soon, absolutely taking the world by storm.\n\nOn another note, you are the most beautiful flower I have ever seen, with your lovely spirit and your beautiful smile.",
    photos: {
        'frame-hero': { title: "Opening Portrait", caption: "The quiet radiance of a brand new chapter.", color: "#5A1F2B", text: "MAIOO HERO PORTRAIT" },
        'frame-strip-1': { title: "Little Girl #1", caption: "Even back then, your smile could light up any room.", color: "#161413", text: "CHILDHOOD 01" },
        'frame-strip-2': { title: "Little Girl #2", caption: "A little girl with big dreams, and look at you now.", color: "#1B2A44", text: "CHILDHOOD 02" },
        'frame-strip-3': { title: "Little Girl #3", caption: "Some people are born sunshine, and you are one of them.", color: "#5A1F2B", text: "CHILDHOOD 03" },
        'frame-strip-4': { title: "Little Girl #4", caption: "The world was always waiting for you, May.", color: "#161413", text: "CHILDHOOD 04" },
        'frame-growing-1': { title: "Growing Up Polaroid", caption: "Gentle steps and big dreams.", color: "#C8743A", text: "GROWING UP 01" },
        'frame-growing-2': { title: "Growing Up Frame", caption: "Unforgettable seasons.", color: "#161413", text: "GROWING UP 02" },
        'frame-growing-3': { title: "Growing Up Full-Bleed", caption: "A heart that illuminates every room.", color: "#1B2A44", text: "GROWING UP 03" },
        'frame-crt': { title: "CRT Analog Screen", caption: "Analog memory captured on video tape.", color: "#0B0A0A", text: "CRT RETRO PLAYBACK" },
        'frame-today-oval': { title: "Oval Locket", caption: "Held timelessly in gold & silver.", color: "#5A1F2B", text: "TODAY LOCKET" },
        'frame-today-main': { title: "Present Day Feature", caption: "Radiant, kind, and unstoppable.", color: "#161413", text: "PRESENT DAY FEATURE" },
        'frame-ending': { title: "Final Closing Frame", caption: "A quiet wish for an extraordinary year ahead.", color: "#C8743A", text: "FINAL CLOSING WISH" }
    }
};

// App state
let state = {
    config: DEFAULT_CONFIG,
    unlocked: false,
    audioPlaying: false,
    currentLightboxIdx: 0,
    photoKeys: Object.keys(DEFAULT_CONFIG.photos).filter(k => k !== 'frame-crt')};

/* ==========================================================================
   2. SVG ARTWORK & PLACEHOLDER GENERATOR (NO EXTERNAL BROKEN URLS)
   ========================================================================== */
function generateSVGPlaceholder(key, customText, bgColor) {
    const item = state.config.photos[key] || { text: key, color: '#161413' };
    const bg = bgColor || item.color || '#161413';
    const label = customText || item.text || 'MAIOO ARCHIVE';
    
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="100%" height="100%" fill="${bg}"/>
        <circle cx="400" cy="250" r="120" fill="#EFE6D6" opacity="0.08"/>
        <path d="M400 170 C420 120, 500 120, 500 200 C500 270, 400 330, 400 330 C400 330, 300 270, 300 200 C300 120, 380 120, 400 170 Z" fill="#C8743A" opacity="0.25"/>
        <text x="50%" y="50%" font-family="Cormorant Garamond, serif" font-size="28" fill="#EFE6D6" text-anchor="middle" dominant-baseline="middle" letter-spacing="4">${label}</text>
        <text x="50%" y="58%" font-family="Inter, sans-serif" font-size="14" fill="#A9A59C" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">MAIOO MEMORY ARCHIVE · 2026</text>
        <line x1="250" y1="380" x2="550" y2="380" stroke="#C8743A" stroke-width="1" opacity="0.4"/>
    </svg>`;

    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
}

function getPhotoSrc(key) {
    if (typeof PHOTO_PATHS !== 'undefined' && PHOTO_PATHS[key]) {
        return PHOTO_PATHS[key];
    }
    const photo = state.config.photos[key];
    if (photo && photo.customUrl) {
        return photo.customUrl;
    }
    return generateSVGPlaceholder(key);
}

/* ==========================================================================
   3. BACKGROUND MUSIC (FIXED TRACK + SPINNING DISC)
   ========================================================================== */
const MUSIC_PATH = 'audio/music.mp3';
const MUSIC_VOLUME = 0.7;
let bgMusic = null;

const MUSIC_TRIGGER_EVENTS = ['wheel', 'scroll', 'touchstart', 'touchmove', 'touchend', 'pointerdown', 'click', 'keydown'];

function setVinylSpinning(isSpinning) {
    const vinyl = document.getElementById('vinyl-icon');
    if (!vinyl) return;
    vinyl.classList.toggle('animate-spin-slow', isSpinning);
}

function startMusic() {
    if (!bgMusic || !bgMusic.paused) return;
    bgMusic.play().catch(() => { /* المتصفح لسه مانع، هنحاول تاني مع أول تفاعل */ });
}

function initBackgroundMusic() {
    bgMusic = new Audio(MUSIC_PATH);
    bgMusic.loop = true;
    bgMusic.volume = MUSIC_VOLUME;
    bgMusic.preload = 'auto';

    const removeTriggers = () => {
        MUSIC_TRIGGER_EVENTS.forEach(evt => window.removeEventListener(evt, startMusic, true));
    };

    bgMusic.addEventListener('playing', () => {
        state.audioPlaying = true;
        setVinylSpinning(true);
        removeTriggers();
    });
    bgMusic.addEventListener('pause', () => {
        state.audioPlaying = false;
        setVinylSpinning(false);
    });

    MUSIC_TRIGGER_EVENTS.forEach(evt => window.addEventListener(evt, startMusic, { capture: true, passive: true }));

    // محاولة تشغيل فورية (بتنجح بس لو المتصفح سمح)
    startMusic();
}

/* ==========================================================================
   4. COUNTDOWN ENGINE & GATE LOGIC
   ========================================================================== */
function computeCountdown() {
    const target = new Date(state.config.targetDateCairo).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
        document.getElementById('cnt-days').textContent = "00";
        document.getElementById('cnt-hours').textContent = "00";
        document.getElementById('cnt-minutes').textContent = "00";
        document.getElementById('cnt-seconds').textContent = "00";
        return true; // Target reached
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('cnt-days').textContent = String(days).padStart(2, '0');
    document.getElementById('cnt-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cnt-minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('cnt-seconds').textContent = String(seconds).padStart(2, '0');

    return false;
}

function startCountdownTimer() {
    computeCountdown();
    setInterval(computeCountdown, 1000);
}

/* ==========================================================================
   5. UNLOCK SHUTTER SEQUENCE
   ========================================================================== */
function triggerUnlockSequence() {
    const gate = document.getElementById('gate-section');
    const shutter = document.getElementById('shutter-overlay');
    const main = document.getElementById('main-archive');
    const headline = document.getElementById('shutter-headline');

    gate.classList.add('opacity-0');
    setTimeout(() => {
        gate.classList.add('hidden');
        shutter.classList.remove('hidden');
        shutter.classList.add('shutter-opening');

        // Reveal Calligraphic Headline halfway through
        setTimeout(() => {
            headline.classList.remove('opacity-0');
        }, 800);

        // Transition into main content
        setTimeout(() => {
            shutter.classList.add('opacity-0');
            setTimeout(() => {
                shutter.classList.add('hidden');
                main.classList.remove('opacity-0');
                state.unlocked = true;
                startMusic();
            }, 800);
        }, 3500);

    }, 800);
}

/* ==========================================================================
   6. RENDER DYNAMIC PHOTOS & SECTIONS
   ========================================================================== */
function renderArchiveContent() {
    // Hero
    document.getElementById('img-hero').src = getPhotoSrc('frame-hero');
    
    // Little Girl Film Strip
    const filmContainer = document.getElementById('film-strip-scroll');
    filmContainer.innerHTML = '';
    
    const stripKeys = ['frame-strip-1', 'frame-strip-2', 'frame-strip-3', 'frame-strip-4'];
    stripKeys.forEach((key, index) => {
        const photo = state.config.photos[key];
        const card = document.createElement('div');
        card.className = "flex-shrink-0 w-72 sm:w-80 bg-base-charcoal p-4 rounded-xl border border-silver-antique/20 shadow-xl snap-center group cursor-pointer";
        card.onclick = () => openLightbox(key);
        card.innerHTML = `
            <div class="flex justify-between items-center text-[9px] font-sans text-silver-antique mb-2">
                <span>FRAME 0${index + 1}</span>
                <span>MAIOO · 2026</span>
            </div>
            <div class="aspect-[4/5] bg-base-dark rounded-lg overflow-hidden mb-3">
                <img src="${getPhotoSrc(key)}" alt="${photo.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
            </div>
            <p class="font-serif italic text-text-ivory text-sm text-center">${photo.caption}</p>
        `;
        filmContainer.appendChild(card);
    });

    // Growing up photos
    document.getElementById('img-growing-1').src = getPhotoSrc('frame-growing-1');
    document.getElementById('img-growing-2').src = getPhotoSrc('frame-growing-2');
    document.getElementById('img-growing-3').src = getPhotoSrc('frame-growing-3');

    // CRT Screen photo
    const crtVideo = document.getElementById('crt-screen-video');
    crtVideo.poster = getPhotoSrc('frame-crt');
    if (typeof CRT_VIDEO_PATH !== 'undefined' && CRT_VIDEO_PATH && !crtVideo.getAttribute('src')) {
        crtVideo.src = CRT_VIDEO_PATH;
        crtVideo.play().catch(() => {});
    }
    // Present Day
    document.getElementById('img-today-oval').src = getPhotoSrc('frame-today-oval');
    document.getElementById('img-today-main').src = getPhotoSrc('frame-today-main');

    // Letter
    document.getElementById('letter-display-title').textContent = state.config.letterTitle;
    const letterContainer = document.getElementById('letter-display-body');
    letterContainer.innerHTML = state.config.letterBody.split('\n\n').map(p => `<p>${p}</p>`).join('');

    // Ending photo
    document.getElementById('img-ending').src = getPhotoSrc('frame-ending');

    // Populate shutter strip preview cards
    const shutterStrip = document.getElementById('shutter-strip');
    shutterStrip.innerHTML = '';
    stripKeys.forEach(k => {
        const img = document.createElement('div');
        img.className = "w-48 h-64 bg-base-charcoal border border-silver-antique/30 rounded-lg overflow-hidden flex-shrink-0 shadow-2xl";
        img.innerHTML = `<img src="${getPhotoSrc(k)}" class="w-full h-full object-cover">`;
        shutterStrip.appendChild(img);
    });
}

/* ==========================================================================
   7. LIGHTBOX CONTROLLER
   ========================================================================== */
function openLightbox(key) {
    const idx = state.photoKeys.indexOf(key);
    if (idx !== -1) {
        state.currentLightboxIdx = idx;
        updateLightboxView();
        document.getElementById('lightbox-modal').classList.remove('hidden');
    }
}

function updateLightboxView() {
    const key = state.photoKeys[state.currentLightboxIdx];
    const photo = state.config.photos[key] || {};
    document.getElementById('lightbox-img').src = getPhotoSrc(key);
    document.getElementById('lightbox-caption').textContent = photo.caption || photo.title || '';
    document.getElementById('lightbox-counter').textContent = `${state.currentLightboxIdx + 1} / ${state.photoKeys.length}`;
}

function initLightboxEvents() {
    document.getElementById('close-lightbox').onclick = () => {
        document.getElementById('lightbox-modal').classList.add('hidden');
    };
    document.getElementById('lightbox-prev').onclick = () => {
        state.currentLightboxIdx = (state.currentLightboxIdx - 1 + state.photoKeys.length) % state.photoKeys.length;
        updateLightboxView();
    };
    document.getElementById('lightbox-next').onclick = () => {
        state.currentLightboxIdx = (state.currentLightboxIdx + 1) % state.photoKeys.length;
        updateLightboxView();
    };
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('lightbox-modal').classList.contains('hidden')) return;
        if (e.key === 'Escape') document.getElementById('lightbox-modal').classList.add('hidden');
        if (e.key === 'ArrowLeft') document.getElementById('lightbox-prev').click();
        if (e.key === 'ArrowRight') document.getElementById('lightbox-next').click();
    });
}

/* ==========================================================================
   9. CRT STATIC REWIND EFFECT & UTILS
   ========================================================================== */
function initCRTControls() {
    const btn = document.getElementById('btn-crt-rewind');
    const staticOverlay = document.getElementById('crt-static');
    const crtVideo = document.getElementById('crt-screen-video');
    btn.onclick = () => {
        staticOverlay.classList.add('active');
        if (crtVideo && crtVideo.getAttribute('src')) {
            crtVideo.currentTime = 0;
            crtVideo.play().catch(() => {});
        }
        setTimeout(() => {
            staticOverlay.classList.remove('active');
            showToast("VCR Rewind sequence complete.");
        }, 400);
    };
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = "bg-base-charcoal border border-copper-mark/60 text-text-ivory px-4 py-2 rounded-full text-xs font-sans shadow-2xl transition-all duration-300 transform translate-y-4 opacity-0";
    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0', '-translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ==========================================================================
   10. INITIALIZATION
   ========================================================================== */
window.onload = function() {
    startCountdownTimer();
    renderArchiveContent();
    initLightboxEvents();
    initBackgroundMusic();
    initCRTControls();

    // Check URL parameters for ?preview=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('preview')) {
        document.getElementById('btn-unlock-preview').click();
    }

    // Button Event Listeners
    document.getElementById('btn-unlock-preview').onclick = () => {
        triggerUnlockSequence();
    };

    document.getElementById('btn-skip-shutter').onclick = () => {
        document.getElementById('shutter-overlay').classList.add('hidden');
        document.getElementById('gate-section').classList.add('hidden');
        document.getElementById('main-archive').classList.remove('opacity-0');
        state.unlocked = true;
        startMusic();
    };

    document.getElementById('btn-replay-opening').onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('gate-section').classList.remove('hidden', 'opacity-0');
        document.getElementById('main-archive').classList.add('opacity-0');
    };

    document.getElementById('btn-share-link').onclick = () => {
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = window.location.href;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        showToast("Archive link copied to clipboard!");
    };
};