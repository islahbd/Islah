// --- à§§. à¦«à¦Ÿà§‹ à¦¸à§à¦²à¦¾à¦‡à¦¡à¦¾à¦° à¦²à¦œà¦¿à¦• (Smooth Infinite Loop) ---
let currentSlide = 0;
let track, slides, indicators;
let autoSlideInterval;

function getSliderElements() {
    track = document.getElementById('slider-track');
    slides = document.querySelectorAll('.slide:not(.clone-slide)');
    indicators = document.querySelectorAll('.indicator');
}

function initSlider() {
    getSliderElements();
    if (!track || slides.length === 0) return;

    // Force layout reflow
    void track.offsetWidth;

    // Cloning Guard: prevents duplicates
    const clones = track.querySelectorAll('.clone-slide');
    if (clones.length === 0) {
        const firstClone = slides[0].cloneNode(true);
        firstClone.classList.add('clone-slide');
        track.appendChild(firstClone);
    }

    currentSlide = 0;
    requestAnimationFrame(() => {
        updateSlide(false);
        resetAutoSlide();
    });
}

function resetAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
        if (window.nextSlide) window.nextSlide();
    }, 4000);
}

function updateSlide(animate = true) {
    if (!track) getSliderElements();
    if (!track) return;

    // Force Visibility
    track.style.display = 'flex';
    track.parentElement.style.display = 'block';

    if (animate) {
        track.style.transition = 'transform 1.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
    } else {
        track.style.transition = 'none';
    }

    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Manage indicators
    const activeIndex = currentSlide % slides.length;
    indicators.forEach((ind, index) => {
        ind.classList.toggle('opacity-100', index === activeIndex);
        ind.classList.toggle('opacity-50', index !== activeIndex);
    });
}

window.nextSlide = function () {
    if (!slides || !slides.length) return;

    // Jump to real first slide if we are currently on the clone (end)
    if (currentSlide >= slides.length) {
        currentSlide = 0;
        updateSlide(false);
        // Force reflow after silent jump
        void track.offsetWidth;
    }

    currentSlide++;
    updateSlide(true);
    resetAutoSlide();
}

window.prevSlide = function () {
    if (!slides || !slides.length) return;

    if (currentSlide <= 0) {
        // Jump to clone at end silently
        currentSlide = slides.length;
        updateSlide(false);
        // Force reflow
        void track.offsetWidth;

        // Then animate back to the last original slide
        setTimeout(() => {
            currentSlide--;
            updateSlide(true);
        }, 10);
    } else {
        currentSlide--;
        updateSlide(true);
    }
    resetAutoSlide();
}

window.goToSlide = function (index) {
    currentSlide = index;
    updateSlide(true);
    resetAutoSlide();
}

// --- Enhanced Scroll/Swipe/Drag Logic ---
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID = 0;

if (track) {
    // Touch Events
    track.addEventListener('touchstart', touchStart);
    track.addEventListener('touchend', touchEnd);
    track.addEventListener('touchmove', touchMove);

    // Mouse Events
    track.addEventListener('mousedown', touchStart);
    track.addEventListener('mouseup', touchEnd);
    track.addEventListener('mouseleave', touchEnd);
    track.addEventListener('mousemove', touchMove);
}

function touchStart(event) {
    isDragging = true;
    startPos = getPositionX(event);
    prevTranslate = -(currentSlide * track.parentElement.offsetWidth); // Baseline in pixels
    clearInterval(autoSlideInterval);
    track.style.transition = 'none';
}

function touchEnd() {
    if (!isDragging) return;
    isDragging = false;

    const trackWidth = track.parentElement.offsetWidth;
    const movedBy = currentTranslate - prevTranslate;

    // Threshold: 20% of slide width
    if (movedBy < -trackWidth * 0.2) {
        window.nextSlide();
    } else if (movedBy > trackWidth * 0.2) {
        window.prevSlide();
    } else {
        updateSlide(true); // Snap back
    }

    resetAutoSlide();
}

function touchMove(event) {
    if (isDragging) {
        const currentPosition = getPositionX(event);
        const diff = currentPosition - startPos;
        const trackWidth = track.parentElement.offsetWidth;

        currentTranslate = prevTranslate + diff;

        // Convert pixel translate to percentage for the transform
        const translatePercent = (currentTranslate / trackWidth) * 100;
        track.style.transform = `translateX(${translatePercent}%)`;
    }
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

// Handle transition end for seamless loop
if (track) {
    track.addEventListener('transitionend', () => {
        // If we reached the clone (at slides.length), jump back to the original first slide
        if (currentSlide >= slides.length) {
            currentSlide = 0;
            updateSlide(false);
        }
    });
}

// --- à§¨. à¦¡à¦¾à¦¯à¦¼à¦¨à¦¾à¦®à¦¿à¦• à¦¬à¦¯à¦¼à¦¾à¦¨ à¦‰à¦‡à¦œà§‡à¦Ÿ à¦²à¦œà¦¿à¦• (Google Calendar API) ---

const GOOGLE_API_KEY = 'AIzaSyAYh4kx90B9zw2Qo0DTcNx5IDIMwwxlfUk';
const CALENDAR_ID = 'ashikpushpo07@gmail.com';

let currentBayanIndex = 0;
let bayanEventsData = []; // To store processed event data for 3 days

// Helper to get local YYYY-MM-DD from a Date object
function getLocalDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

function formatBayanDate(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const parts = date.toLocaleDateString('en-US', options).replace(',', '').split(' ');
    return {
        dayName: parts[0] || '',
        month: parts[1] || '',
        date: parts[2] || ''
    };
}

async function fetchBayanSchedule() {
    const container = document.getElementById('schedule-container');
    if (!container) return;

    try {
        const now = new Date();
        const todayKey = getLocalDateKey(now);

        // Fetch start range
        const startTime = new Date(now);
        startTime.setHours(0, 0, 0, 0);
        const timeMin = startTime.toISOString();

        // Fetch end range (up to 4 days ahead to be safe)
        const endTime = new Date(now);
        endTime.setDate(endTime.getDate() + 5);
        const timeMax = endTime.toISOString();

        const url = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(CALENDAR_ID) + '/events?key=' + GOOGLE_API_KEY + '&timeMin=' + timeMin + '&timeMax=' + timeMax + '&singleEvents=true&orderBy=startTime';

        const response = await fetch(url);
        const data = await response.json();

        const eventsByDay = {};
        if (data.items) {
            data.items.forEach(event => {
                const start = new Date(event.start.dateTime || event.start.date);
                const end = new Date(event.end.dateTime || event.end.date);

                // Multi-day logic: iterate through each day from start to end
                let current = new Date(start);
                // Set to midnight local time for robust date comparison
                current.setHours(0, 0, 0, 0);

                while (current < end) {
                    const dateKey = getLocalDateKey(current);
                    if (!eventsByDay[dateKey]) {
                        eventsByDay[dateKey] = [];
                    }
                    eventsByDay[dateKey].push(event);

                    // Move to next day
                    current.setDate(current.getDate() + 1);
                }
            });
        }

        const dayLabels = [
            { offset: 0, label: 'à¦†à¦œà¦•à§‡à¦° à¦¬à§Ÿà¦¾à¦¨' },
            { offset: 1, label: 'à¦†à¦—à¦¾à¦®à§€à¦•à¦¾à¦²à§‡à¦° à¦¬à§Ÿà¦¾à¦¨' },
            { offset: 2, label: 'à¦ªà¦°à¦¶à§à¦¦à¦¿à¦¨à§‡à¦° à¦¬à§Ÿà¦¾à¦¨' }
        ];

        bayanEventsData = dayLabels.map(day => {
            const date = new Date(now);
            date.setDate(date.getDate() + day.offset);
            const dateKey = getLocalDateKey(date);
            const events = eventsByDay[dateKey] || [];
            const dateInfo = formatBayanDate(date);

            const processedEvents = events.map(event => {
                const desc = event.description || '';
                let time = '---';
                let contact = '---';
                const tmMatch = desc.match(/tm:\s*([^|ph:]+)/i);
                if (tmMatch) time = tmMatch[1].trim();
                const phMatch = desc.match(/ph:\s*(.+)/i);
                if (phMatch) contact = phMatch[1].trim();

                return {
                    location: event.summary || 'à¦¬à§Ÿà¦¾à¦¨',
                    time: time,
                    contact: contact
                };
            });

            return {
                label: day.label,
                dateInfo: dateInfo,
                events: processedEvents,
                hasEvent: processedEvents.length > 0
            };
        });

        renderBayanWidget();

    } catch (error) {
        console.error('Error fetching bayan schedule:', error);
    }
}

function renderBayanWidget() {
    const container = document.getElementById('schedule-container');
    if (!container || bayanEventsData.length === 0) return;

    // Build a horizontal scroll-snap wrapper with all 3 day cards
    let wrapperHtml = '<div id="bayan-swipe-wrapper" style="display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;gap:0;scrollbar-width:none;" onscroll="onBayanScroll(this)">';

    bayanEventsData.forEach((data, idx) => {
        const opacityClass = data.hasEvent ? '' : 'opacity-70';

        wrapperHtml += `<div class="bayan-card hover-card ${opacityClass}" style="min-width:100%;scroll-snap-align:start;box-sizing:border-box;">`;

        // Header
        wrapperHtml += `<div class="bayan-header"><div class="glow-pill"><span class="pill-text">${data.label}</span><i class="fas fa-calendar-check pill-icon"></i></div></div>`;

        // Body
        wrapperHtml += '<div class="bayan-body">';
        wrapperHtml += `<div class="bayan-date-box"><div class="bayan-day-month"><span class="bayan-day-name">${data.dateInfo.dayName}</span> ${data.dateInfo.month}</div><div class="bayan-date-num">${data.dateInfo.date}</div></div>`;

        // Events wrapper with max-height scroll
        wrapperHtml += '<div class="bayan-events-wrapper" style="flex:1;max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;scrollbar-width:none;">';

        if (data.hasEvent) {
            data.events.forEach(event => {
                wrapperHtml += `<div class="bayan-info-box"><div class="bayan-location">${event.location}</div><div class="bayan-details"><div><span class="label">à¦¸à¦®à¦¯à¦¼:</span> ${event.time}</div><div><span class="label">à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦—:</span> ${event.contact}</div></div></div>`;
            });
        } else {
            const msg = data.label.includes('à¦†à¦œ') ? 'à¦†à¦œ à¦•à§‹à¦¨à§‹ à¦®à¦œà¦²à¦¿à¦¸ à¦¨à§‡à¦‡' : (data.label.includes('à¦†à¦—à¦¾à¦®à§€à¦•à¦¾à¦²') ? 'à¦†à¦—à¦¾à¦®à§€à¦•à¦¾à¦² à¦•à§‹à¦¨à§‹ à¦®à¦œà¦²à¦¿à¦¸ à¦¨à§‡à¦‡' : 'à¦ªà¦°à¦¶à§à¦¦à¦¿à¦¨ à¦•à§‹à¦¨à§‹ à¦®à¦œà¦²à¦¿à¦¸ à¦¨à§‡à¦‡');
            wrapperHtml += `<div class="bayan-info-box flex items-center py-6"><div class="text-base font-bold text-gray-800">${msg}</div></div>`;
        }

        wrapperHtml += '</div>'; // end events-wrapper
        wrapperHtml += '</div>'; // end bayan-body
        wrapperHtml += '</div>'; // end bayan-card
    });

    wrapperHtml += '</div>'; // end swipe-wrapper

    // Dot indicators
    wrapperHtml += '<div style="display:flex;justify-content:center;gap:6px;margin-top:10px;" id="bayan-dots">';
    bayanEventsData.forEach((_, idx) => {
        const active = idx === 0 ? 'background:#10b981;' : 'background:#d1d5db;';
        wrapperHtml += `<div style="width:8px;height:8px;border-radius:50%;${active}transition:background 0.3s;" data-dot="${idx}"></div>`;
    });
    wrapperHtml += '</div>';

    container.innerHTML = wrapperHtml;
}

window.onBayanScroll = function(el) {
    const idx = Math.round(el.scrollLeft / el.offsetWidth);
    currentBayanIndex = idx;
    const dots = document.querySelectorAll('#bayan-dots [data-dot]');
    dots.forEach((dot, i) => {
        dot.style.background = i === idx ? '#10b981' : '#d1d5db';
    });
};

window.nextBayan = function () {
    currentBayanIndex = (currentBayanIndex + 1) % bayanEventsData.length;
    renderBayanWidget();
};

window.prevBayan = function () {
    currentBayanIndex = (currentBayanIndex - 1 + bayanEventsData.length) % bayanEventsData.length;
    renderBayanWidget();
};

// --- à§©. à¦¸à§à¦•à§à¦°à¦² à¦à¦¬à¦‚ à¦®à¦¡à¦¾à¦² à¦«à¦¾à¦‚à¦¶à¦¨ ---
function scrollToSection(id, event) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    if (id === 'header') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
}

function openModal() {
    const modal = document.getElementById('intro-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeModal() {
    const modal = document.getElementById('intro-modal');
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }
}

// --- Regular Eslahi Majlis Calendar Logic ---

const majlisEventData = [
    {
        title: "à¦ªà§à¦°à¦¥à¦® à¦¬à§ƒà¦¹à¦¸à§à¦ªà¦¤à¦¿à¦¬à¦¾à¦°",
        dayOfWeek: 4, // Thursday
        weekNumber: 1,
        details: [
            {
                time: "à¦¬à¦¾à¦¦ à¦†à¦¸à¦°",
                location: "à¦®à¦¾à¦¦à¦°à¦¾à¦¸à¦¾ à¦®à¦¾à¦°à¦•à¦¾à¦¯à§à¦¨ à¦¨à§‚à¦°, à¦šà¦¾à¦à¦¦à¦ªà§à¦°",
                route: "à¦šà¦¾à¦à¦¦à¦ªà§à¦° à¦œà§‡à¦²à¦¾ à¦ªà§à¦°à¦¶à¦¾à¦¸à¦•à§‡à¦° à¦•à¦¾à¦°à§à¦¯à¦¾à¦²à§Ÿà§‡à¦° à¦…à¦ªà¦° à¦ªà¦¾à¦¶à§‡, à¦œà¦¨à¦¤à¦¾ à¦¬à§à¦¯à¦¾à¦‚à¦•à§‡à¦° à¦‰à¦ªà¦°à§‡",
                contact: "à¦®à¦¾à¦“à¦²à¦¾à¦¨à¦¾ à¦†à¦¤à¦¿à¦•à§à¦° à¦°à¦¹à¦®à¦¾à¦¨- +8801914586540",
                map: "https://maps.app.goo.gl/tejSV1qFwEPo1Su28"
            },
            {
                time: "à¦à¦¶à¦¾à¦° à¦ªà§‚à¦°à§à¦¬ à¦®à§à¦¹à§‚à¦°à§à¦¤à§‡",
                location: "à¦®à¦¾à¦¦à¦°à¦¾à¦¸à¦¾ à¦®à¦¾à¦°à¦•à¦¾à¦¯à§à¦¸ à¦¸à§à¦¨à§à¦¨à¦¾à¦¹, à¦•à¦šà§à§Ÿà¦¾, à¦šà¦¾à¦à¦¦à¦ªà§à¦°",
                route: "à¦•à¦šà§à§Ÿà¦¾, à¦¸à§à¦¬à¦¿à¦¤à¦ªà§à¦° à¦¬à¦¾à¦¸à¦¸à§à¦Ÿà§à¦¯à¦¾à¦¨à§à¦¡ à¦¥à§‡à¦•à§‡ à§©à§¦à§¦ à¦—à¦œ à¦ªà§‚à¦°à§à¦¬à§‡ à¦®à¦¾à¦°à¦•à¦¾à¦¯à§à¦¸ à¦¸à§à¦¨à§à¦¨à¦¾à¦¹à¥¤",
                contact: "à¦¹à¦¾à¦«à§‡à¦œ à¦†à¦¬à§à¦¦à§à¦° à¦°à¦¶à§€à¦¦ à¦¸à¦¾à¦¹à§‡à¦¬ - +8801895241780",
                map: "https://maps.app.goo.gl/GLHhTni6zeMEhxKV7?g_st=aw"
            }
        ]
    },
    {
        title: "à¦ªà§à¦°à¦¥à¦® à¦°à¦¬à¦¿à¦¬à¦¾à¦°",
        dayOfWeek: 0, // Sunday
        weekNumber: 1,
        details: [
            {
                time: "à¦¬à¦¾à¦¦ à¦®à¦¾à¦—à¦°à¦¿à¦¬",
                location: "à¦¬à§‡à¦¹à¦¾à¦•à§ˆà¦° à¦ªà§à¦°à¦¾à¦‡à¦®à¦¾à¦°à¦¿ à¦¸à§à¦•à§à¦² à¦œà¦¾à¦®à§‡ à¦®à¦¸à¦œà¦¿à¦¦, à¦•à¦¾à¦à¦šà¦ªà§à¦°, à¦¨à¦¾à¦°à¦¾à§Ÿà¦£à¦—à¦žà§à¦œ",
                route: "à¦¬à§‡à¦¹à¦¾à¦•à§ˆà¦° à¦ªà§à¦°à¦¾à¦‡à¦®à¦¾à¦°à¦¿ à¦¸à§à¦•à§à¦² à¦¸à¦‚à¦²à¦—à§à¦¨ à¦œà¦¾à¦®à§‡ à¦®à¦¸à¦œà¦¿à¦¦à¥¤",
                contact: "à¦‡à§Ÿà¦¾à¦¸à¦¿à¦¨ à¦¸à¦¾à¦¹à§‡à¦¬ +8801991746446",
                map: "https://maps.app.goo.gl/fFqTLKMtUL17xmcf9"
            }
        ]
    },
    {
        title: "à¦¤à§ƒà¦¤à§€à§Ÿ à¦¬à§ƒà¦¹à¦¸à§à¦ªà¦¤à¦¿à¦¬à¦¾à¦°",
        dayOfWeek: 4, // Thursday
        weekNumber: 3,
        details: [
            {
                time: "à¦¬à¦¾à¦¦ à¦†à¦¸à¦°",
                location: "à¦œà¦¾à¦®à§‡à¦† à¦®à¦¾à¦°à¦•à¦¾à¦¯à§à¦² à¦‡à¦¹à¦¸à¦¾à¦¨ à¦¢à¦¾à¦•à¦¾",
                route: "à¦ªà¦¾à¦‡à¦Ÿà¦¿, à¦¡à§‡à¦®à¦°à¦¾, à¦¢à¦¾à¦•à¦¾ (à¦¯à¦¾à¦¤à§à¦°à¦¾à¦¬à¦¾à§œà§€ à¦šà§Œà¦°à¦¾à¦¸à§à¦¤à¦¾ à¦¥à§‡à¦•à§‡ à¦¡à§‡à¦®à¦°à¦¾ à¦°à§‹à¦¡à§‡ à¦•à§‹à¦¨à¦¾à¦ªà¦¾à§œà¦¾ à¦“ à¦¸à§à¦Ÿà¦¾à¦«-à¦•à§‹à§Ÿà¦¾à¦°à§à¦Ÿà¦¾à¦° à¦à¦° à¦®à¦¾à¦à¦¾à¦®à¦¾à¦à¦¿ à¦®à¦¹à¦¾à¦¸à§œà¦• à¦¸à¦‚à¦²à¦—à§à¦¨)",
                contact: " à¦®à¦¾à¦“à¦²à¦¾à¦¨à¦¾ à¦†à¦¶à§‡à¦•à§‡ à¦à¦²à¦¾à¦¹à§€- +8801314803334, à¦®à¦¾à¦“à¦²à¦¾à¦¨à¦¾ à¦œà§à¦¨à¦¾à¦‡à¦¦ à¦®à§à¦¸à§à¦¤à¦«à¦¾- +8801951259064",
                map: "https://g.co/kgs/siLvRtc"
            }
        ]
    },
    {
        title: "à¦¤à§ƒà¦¤à§€à§Ÿ à¦¶à§à¦•à§à¦°à¦¬à¦¾à¦°",
        dayOfWeek: 5, // Friday
        weekNumber: 3,
        details: [
            {
                time: "à¦¬à¦¾à¦¦ à¦à¦¶à¦¾",
                location: "à¦œà¦¿à¦¨à¦œà¦¿à¦°à¦¾ à¦œà§à¦®à§à¦®à¦¾ à¦®à¦¸à¦œà¦¿à¦¦, à¦•à§‡à¦°à¦¾à¦¨à§€à¦—à¦žà§à¦œà¥¤",
                route: "à¦•à§‡à¦°à¦¾à¦¨à§€à¦—à¦žà§à¦œ à¦¥à§‡à¦•à§‡ à¦œà¦¿à¦¨à¦œà¦¿à¦°à¦¾ à¦®à¦¸à¦œà¦¿à¦¦à¥¤",
                contact: "à¦®à¦¾à¦“à¦²à¦¾à¦¨à¦¾ à¦†à¦²-à¦†à¦®à§€à¦¨ à¦¸à¦¾à¦¹à§‡à¦¬- +8801920423471",
                map: "https://g.co/kgs/hWwQj8u"
            }
        ]
    },
    {
        title: "à¦ªà§à¦°à¦¤à¦¿ à¦¸à§‹à¦®à¦¬à¦¾à¦°",
        dayOfWeek: 1, // Monday
        weekNumber: 'all',
        details: [
            {
                time: "à¦†à¦¸à¦° à¦¥à§‡à¦•à§‡ à¦®à¦¾à¦—à¦°à¦¿à¦¬ à¦ªà¦°à§à¦¯à¦¨à§à¦¤",
                location: "à¦®à¦¾à¦¦à¦°à¦¾à¦¸à¦¾ à¦®à¦¾à¦°à¦•à¦¾à¦¯à§à¦² à¦‡à¦¹à¦¸à¦¾à¦¨ à¦¢à¦¾à¦•à¦¾à¥¤",
                route: "à¦¯à¦¾à¦¤à§à¦°à¦¾à¦¬à¦¾à§œà§€/ à¦¦à§Ÿà¦¾à¦—à¦žà§à¦œ/ à¦¸à¦¾à§Ÿà§‡à¦¦à¦¾à¦¬à¦¾à¦¦ à¦®à§‹à§œ à¦¥à§‡à¦•à§‡ à§« à¦®à¦¿à¦¨à¦¿à¦Ÿà§‡à¦° à¦¦à§à¦°à¦¤à§à¦¬à§‡ à§¬à¦¨à¦‚ à¦¶à¦¹à§€à¦¦ à¦«à¦¾à¦°à§à¦• à¦¸à§œà¦•, à¦†à¦²-à¦†à¦°à¦¾à¦«à¦¾à¦¹ à¦‡à¦¸à¦²à¦¾à¦®à§€ à¦¬à§à¦¯à¦¾à¦‚à¦•à§‡à¦° à¦‰à¦ªà¦°à§‡, à¦ªà¦¶à§à¦šà¦¿à¦® à¦¯à¦¾à¦¤à§à¦°à¦¾à¦¬à¦¾à§œà§€, à¦¢à¦¾à¦•à¦¾à¥¤",
                contact: "à¦®à¦¾à¦“à¦²à¦¾à¦¨à¦¾ à¦†à¦¶à§‡à¦•à§‡ à¦à¦²à¦¾à¦¹à§€- +8801314803334, à¦®à¦¾à¦“à¦²à¦¾à¦¨à¦¾ à¦œà§à¦¨à¦¾à¦‡à¦¦ à¦®à§à¦¸à§à¦¤à¦«à¦¾- +8801951259064",
                map: "https://g.co/kgs/4fqjVzX"
            }
        ]
    },
    {
        title: "à¦ªà§à¦°à¦¤à¦¿ à¦¶à§à¦•à§à¦°à¦¬à¦¾à¦°",
        dayOfWeek: 5, // Friday
        weekNumber: 'all',
        details: [
            {
                time: "à¦œà§à¦®à¦¾à¦° à¦¬à§Ÿà¦¾à¦¨ à¦“ à¦¨à¦¾à¦®à¦¾à¦œ",
                location: "à¦¬à¦¾à¦‡à¦¤à§à¦² à¦†à¦®à¦¾à¦¨ à¦¸à§à¦Ÿà§€à¦®à¦¾à¦°à¦˜à¦¾à¦Ÿ à¦œà¦¾à¦®à§‡ à¦®à¦¸à¦œà¦¿à¦¦, à¦¬à¦¾à¦¦à¦¾à¦®à¦¤à¦²à§€à¥¤",
                route: "à¦¬à¦¾à¦¬à§ à¦¬à¦¾à¦œà¦¾à¦° à¦¬à§à¦°à¦¿à¦œ à¦¸à¦‚à¦²à¦—à§à¦¨ à¦¬à§à§œà¦¿à¦—à¦™à§à¦—à¦¾ à¦¨à¦¦à§€à¦° à¦ªà¦¾à§œà§‡ à¦…à¦¬à¦¸à§à¦¥à¦¿à¦¤à¥¤",
                contact: "à¦®à¦¾à¦“à¦²à¦¾à¦¨à¦¾ à¦†à¦¶à§‡à¦•à§‡ à¦à¦²à¦¾à¦¹à§€- +8801314803334",
                map: "https://g.co/kgs/285Dztc"
            }
        ]
    }
];

let calCurrentDate = new Date();
let currentSidebarEventIndex = 0;
let sidebarEvents = [];
let majlisRotationInterval = null;
const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

function renderMajlisCalendar() {
    const container = document.getElementById('majlis-calendar-container');
    if (!container) return;

    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();

    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarHTML = `
        <div class="calendar-header">
            <button onclick="changeMonth(-1)" class="calendar-nav-btn"><i class="fas fa-chevron-left"></i></button>
            <div class="calendar-header-title">
                <span class="calendar-header-month">${monthNames[month]}</span>
                <span class="calendar-header-year">${year}</span>
            </div>
            <button onclick="changeMonth(1)" class="calendar-nav-btn"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="calendar-grid">
            ${daysShort.map(day => `<div class="calendar-day-label">${day}</div>`).join('')}
    `;

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const nthOccurrence = Math.ceil(day / 7);
        const isToday = new Date().toDateString() === date.toDateString();

        const events = majlisEventData.filter(event => {
            if (event.dayOfWeek !== dayOfWeek) return false;
            if (event.weekNumber === 'all') return true;
            return event.weekNumber === nthOccurrence;
        });

        const hasEvent = events.length > 0;
        const classes = [
            'calendar-day',
            isToday ? 'today' : '',
            hasEvent ? 'highlight' : ''
        ].filter(Boolean).join(' ');

        const onClick = hasEvent ? `onclick='showMajlisDetails(${JSON.stringify(events).replace(/'/g, "&apos;")}, ${day}, "${monthNames[month]}")'` : '';
        calendarHTML += `<div class="${classes}" data-day="${day}" ${onClick}>${day}</div>`;
    }

    calendarHTML += `</div>`;
    container.innerHTML = calendarHTML;
    renderMajlisSidebar();
}

function renderMajlisSidebar() {
    const sidebar = document.getElementById('sidebar-event-content');
    if (!sidebar) return;

    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();

    sidebarEvents = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const nthOccurrence = Math.ceil(day / 7);

        const events = majlisEventData.filter(event => {
            if (event.dayOfWeek !== dayOfWeek) return false;
            if (event.weekNumber === 'all') return true;
            return event.weekNumber === nthOccurrence;
        });

        if (events.length > 0) {
            sidebarEvents.push({
                day: day,
                monthName: monthNames[month],
                events: events
            });
        }
    }

    if (sidebarEvents.length > 0) {
        currentSidebarEventIndex = 0;
        updateSidebarDisplay();
        startMajlisRotation();
    } else {
        sidebar.innerHTML = '<div class="text-[10px] text-slate-400 text-center py-4">à¦à¦‡ à¦®à¦¾à¦¸à§‡ à¦•à§‹à¦¨à§‹ à¦®à¦œà¦²à¦¿à¦¸ à¦¨à§‡à¦‡</div>';
        if (majlisRotationInterval) clearInterval(majlisRotationInterval);
    }
}

function updateSidebarDisplay() {
    const container = document.getElementById('sidebar-event-content');
    if (!container || sidebarEvents.length === 0) return;

    const eventGroup = sidebarEvents[currentSidebarEventIndex];

    // Support multiple events in one day
    let eventsHtml = '';
    const dateObj = new Date(calCurrentDate.getFullYear(), calCurrentDate.getMonth(), eventGroup.day);
    const dayNameEN = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const monthNameEN = dateObj.toLocaleDateString('en-US', { month: 'short' });

    eventGroup.events.forEach(event => {
        event.details.forEach(detail => {
            eventsHtml += `
                <div class="sidebar-event-entry">
                    <span class="time">${detail.time}</span>
                    ${detail.location}
                </div>
            `;
        });
    });

    let html = `
        <div class="sidebar-event-card">
            <div class="sidebar-date-holder">
                <div class="sidebar-date-circle">
                    <div class="sidebar-day-month">
                        <span class="sidebar-day-name">${dayNameEN}</span> ${monthNameEN}
                    </div>
                    <div class="sidebar-date-large">${eventGroup.day}</div>
                </div>
            </div>
            <div id="sidebar-events-list">
                ${eventsHtml}
            </div>
            <div class="see-more-link" onclick='showMajlisDetails(${JSON.stringify(eventGroup.events).replace(/'/g, "&apos;")}, ${eventGroup.day}, "${eventGroup.monthName}")'>à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤</div>
        </div>
    `;

    container.innerHTML = html;

    // Sync with calendar
    document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('active-sidebar'));
    const dayEl = document.querySelector(`.calendar-day[data-day="${eventGroup.day}"]`);
    if (dayEl) {
        dayEl.classList.add('active-sidebar');
    }
}

function startMajlisRotation() {
    if (majlisRotationInterval) clearInterval(majlisRotationInterval);
    if (sidebarEvents.length <= 1) return;

    majlisRotationInterval = setInterval(() => {
        const currentCard = document.querySelector('.sidebar-event-card');
        if (currentCard) {
            currentCard.classList.add('fading-out');
            setTimeout(() => {
                currentSidebarEventIndex = (currentSidebarEventIndex + 1) % sidebarEvents.length;
                updateSidebarDisplay();
            }, 1500); // Give time for fade out
        } else {
            currentSidebarEventIndex = (currentSidebarEventIndex + 1) % sidebarEvents.length;
            updateSidebarDisplay();
        }
    }, 10000);
}

function changeMonth(delta) {
    calCurrentDate.setMonth(calCurrentDate.getMonth() + delta);
    renderMajlisCalendar();
}

function showMajlisDetails(events, day, monthName) {
    const modal = document.getElementById('majlis-modal');
    const title = document.getElementById('majlis-modal-title');
    const body = document.getElementById('majlis-modal-body');

    title.innerText = `${day} ${monthName} - à¦®à¦œà¦²à¦¿à¦¸ à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤`;

    let bodyHTML = '';
    events.forEach(event => {
        bodyHTML += `<div class="mb-5 last:mb-0">
            <h4 class="font-bold text-slate-800 text-base mb-3 border-b border-slate-100 pb-2">${event.title}</h4>
        `;

        event.details.forEach(detail => {
            bodyHTML += `
                <div class="majlis-detail-card space-y-3 mb-4">
                    <div class="flex gap-4 items-center">
                        <i class="far fa-clock text-emerald-500 w-5"></i>
                        <div><p class="text-[10px] uppercase font-bold">à¦¸à¦®à§Ÿ</p><p class="text-sm font-bold text-slate-700">${detail.time}</p></div>
                    </div>
                    <div class="flex gap-4 items-center">
                        <i class="fas fa-map-marker-alt text-blue-500 w-5"></i>
                        <div><p class="text-[10px] uppercase font-bold">à¦¸à§à¦¥à¦¾à¦¨</p><p class="text-sm font-bold text-slate-700">${detail.location}</p></div>
                    </div>
                    <div class="flex gap-4 items-center">
                        <i class="fas fa-route text-amber-500 w-5"></i>
                        <div><p class="text-[10px] uppercase font-bold">à¦¯à¦¾à¦¤à¦¾à§Ÿà¦¾à¦¤</p><p class="text-xs text-slate-500 leading-tight">${detail.route}</p></div>
                    </div>
                    <div class="flex gap-4 items-center">
                        <i class="fas fa-phone-alt text-purple-500 w-5"></i>
                        <div><p class="text-[10px] uppercase font-bold">à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦—</p><p class="text-sm font-bold text-slate-700">${detail.contact}</p></div>
                    </div>
                    <a href="${detail.map}" target="_blank" class="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 text-white rounded-xl font-bold hover:opacity-90 transition mt-2 text-sm italic">
                        <i class="fas fa-location-arrow"></i> Google Maps
                    </a>
                </div>
            `;
        });
        bodyHTML += `</div>`;
    });

    body.innerHTML = bodyHTML;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeMajlisModal() {
    const modal = document.getElementById('majlis-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // Remove class when it leaves the viewport to allow reset
                entry.target.classList.remove('active');
            }
        });
    }, { threshold: 0.1 });

    // Observe all elements with fly-in classes (Social cards, Bayan widget, etc.)
    const animatableElements = document.querySelectorAll('.social-card, [class*="fly-in-"]');
    animatableElements.forEach(el => {
        observer.observe(el);
    });
}

// Global initialization
function initAll() {
    fetchBayanSchedule();
    renderMajlisCalendar();
    initSlider();
    setupScrollAnimations();
}

document.addEventListener('DOMContentLoaded', initAll);

// Fix for slider hiding on back navigation (bfcache)
window.addEventListener('pageshow', (event) => {
    // Aggressive re-init with multiple triggers
    initSlider();

    // Second trigger with delay to handle layout shifts/delays
    setTimeout(initSlider, 100);
    setTimeout(initSlider, 500);
});
