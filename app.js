// --- ১. ফটো স্লাইডার লজিক (Smooth Infinite Loop) ---
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

// --- ২. ডায়নামিক বয়ান উইজেট লজিক (Google Calendar API) ---

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
                if (event.start.dateTime) {
                    // ---- Timed event: show only on the day it starts ----
                    const start = new Date(event.start.dateTime);
                    const dateKey = getLocalDateKey(start);
                    if (!eventsByDay[dateKey]) eventsByDay[dateKey] = [];
                    eventsByDay[dateKey].push(event);
                } else {
                    // ---- All-day event: end.date is EXCLUSIVE per Google Calendar API ----
                    // e.g., an event on Apr 3 has start.date="2026-04-03" & end.date="2026-04-04"
                    // So we loop from start up to (but NOT including) end
                    let current = new Date(event.start.date + 'T00:00:00');
                    const endDay = new Date(event.end.date + 'T00:00:00');

                    while (current < endDay) {
                        const dateKey = getLocalDateKey(current);
                        if (!eventsByDay[dateKey]) eventsByDay[dateKey] = [];
                        eventsByDay[dateKey].push(event);
                        current.setDate(current.getDate() + 1);
                    }
                }
            });
        }

        const dayLabels = [
            { offset: 0, label: 'আজকের বয়ান' },
            { offset: 1, label: 'আগামীকালের বয়ান' },
            { offset: 2, label: 'পরশুদিনের বয়ান' }
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
                    location: event.summary || 'বয়ান',
                    time: time,
                    contact: contact
                };
            });

            // Merge static Majlis events
            const dayOfWeek = date.getDay();
            const nthOccurrence = Math.ceil(date.getDate() / 7);
            if (typeof majlisEventData !== 'undefined') {
                const staticEvents = majlisEventData.filter(e => {
                    if (e.dayOfWeek !== dayOfWeek) return false;
                    if (Array.isArray(e.weekNumber)) return e.weekNumber.includes(nthOccurrence);
                    if (e.weekNumber === 'all') return true;
                    return e.weekNumber === nthOccurrence;
                });

                staticEvents.forEach(se => {
                    se.details.forEach(detail => {
                        // Deduplication: Check if Google Calendar event overlaps with the static event's location
                        const isDuplicate = processedEvents.some(pe => {
                            const staticLocWords = detail.location.split(/[\s,।]+/).filter(w => w.length > 2);
                            return staticLocWords.some(w => pe.location.includes(w) || pe.time.includes(w));
                        });

                        if (!isDuplicate) {
                            processedEvents.push({
                                location: se.title + ' - ' + detail.location,
                                time: detail.time,
                                contact: detail.contact
                            });
                        }
                    });
                });
            }

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
        wrapperHtml += '<div class="bayan-events-wrapper">';

        if (data.hasEvent) {
            data.events.forEach(event => {
                const hasMultiple = data.events.length > 1;
                const symbol = hasMultiple ? '<i class="fas fa-circle text-[6px] mr-2 text-emerald-600"></i>' : '';
                const indentClass = hasMultiple ? 'pl-4' : '';
                wrapperHtml += `<div class="bayan-info-box"><div class="bayan-location">${symbol}${event.location}</div><div class="bayan-details ${indentClass}"><div><span class="label">সময়:</span> ${event.time}</div><div><span class="label">যোগাযোগ:</span> ${event.contact}</div></div></div>`;
            });
        } else {
            const msg = data.label.includes('আজ') ? 'আজ কোনো মজলিস নেই' : (data.label.includes('আগামীকাল') ? 'আগামীকাল কোনো মজলিস নেই' : 'পরশুদিন কোনো মজলিস নেই');
            wrapperHtml += `<div class="bayan-info-box flex items-center py-3"><div class="text-base font-medium text-gray-800">${msg}</div></div>`;
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

// --- ৩. স্ক্রল এবং মডাল ফাংশন ---
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
        title: "প্রথম বৃহস্পতিবার",
        dayOfWeek: 4, // Thursday
        weekNumber: 1,
        details: [
            {
                time: "বাদ আসর",
                location: "মাদরাসা মারকায়ুন নূর, চাঁদপুর",
                route: "চাঁদপুর জেলা প্রশাসকের কার্যালয়ের অপর পাশে, জনতা ব্যাংকের উপরে",
                contact: "মাওলানা আতিকুর রহমান- +8801914586540",
                map: "https://maps.app.goo.gl/tejSV1qFwEPo1Su28"
            },
            {
                time: "এশার পূর্ব মুহূর্তে",
                location: "মাদরাসা মারকায়ুস সুন্নাহ, কচুয়া, চাঁদপুর",
                route: "কচুয়া, স্বিতপুর বাসস্ট্যান্ড থেকে ৩০০ গজ পূর্বে মারকায়ুস সুন্নাহ।",
                contact: "হাফেজ আব্দুল রশীদ সাহেব - +8801895241780",
                map: "https://maps.app.goo.gl/GLHhTni6zeMEhxKV7?g_st=aw"
            }
        ]
    },
    {
        title: "প্রথম রবিবার",
        dayOfWeek: 0, // Sunday
        weekNumber: 1,
        details: [
            {
                time: "বাদ মাগরিব",
                location: "বেহাকৈর প্রাইমারি স্কুল জামে মসজিদ, কাঁচপুর, নারায়ণগঞ্জ",
                route: "বেহাকৈর প্রাইমারি স্কুল সংলগ্ন জামে মসজিদ।",
                contact: "ইয়াসিন সাহেব +8801991746446",
                map: "https://maps.app.goo.gl/fFqTLKMtUL17xmcf9"
            }
        ]
    },
    {
        title: "তৃতীয় বৃহস্পতিবার",
        dayOfWeek: 4, // Thursday
        weekNumber: 3,
        details: [
            {
                time: "বাদ আসর",
                location: "জামেয়া মারকায়ুল ইহসান ঢাকা",
                route: "পাটি, ডেমরা, ঢাকা (যাত্রাবাড়ী চৌরাস্তা থেকে ডেমরা রোডে কোনাপাড়া ও স্টাফ-কোয়ার্টার এর মাঝামাঝি মহাসড়ক সংলগ্ন)",
                contact: " মাওলানা আশেকে এলাহী- +8801314803334, মাওলানা জুনাইদ মুস্তফা- +8801951259064",
                map: "https://g.co/kgs/siLvRtc"
            }
        ]
    },
    {
        title: "তৃতীয় শুক্রবার",
        dayOfWeek: 5, // Friday
        weekNumber: 3,
        details: [
            {
                time: "বাদ এশা",
                location: "জিনজিরা জুম্মা মসজিদ, কেরানীগঞ্জ।",
                route: "কেরানীগঞ্জ থেকে জিনজিরা মসজিদ।",
                contact: "মাওলানা আল-আমীন সাহেব- +8801920423471",
                map: "https://g.co/kgs/hWwQj8u"
            }
        ]
    },
    {
        title: "প্রতি সোমবার",
        dayOfWeek: 1, // Monday
        weekNumber: 'all',
        details: [
            {
                time: "আসর থেকে মাগরিব পর্যন্ত",
                location: "মাদরাসা মারকায়ুল ইহসান ঢাকা।",
                route: "যাত্রাবাড়ী/ দয়াগঞ্জ/ সায়েদাবাদ মোড় থেকে ৫ মিনিটের দূরত্বে ৬নং শহীদ ফারুক সড়ক, আল-আরাফাহ ইসলামী ব্যাংকের উপরে, পশ্চিম যাত্রাবাড়ী, ঢাকা।",
                contact: "মাওলানা আশেকে এলাহী- +8801314803334, মাওলানা জুনাইদ মুস্তফা- +8801951259064",
                map: "https://g.co/kgs/4fqjVzX"
            }
        ]
    },
    {
        title: "চতুর্থ শুক্রবার",
        dayOfWeek: 5, // Friday
        weekNumber: 4,
        details: [
            {
                time: "জুমার নামায ও বয়ান।",
                location: "বনশ্রী কেন্দ্রীয় জামে মসজিদ।",
                route: "ঢাকার যেকোনো স্থান থেকে রামপুরা BTV হয়ে বনশ্রী C ব্লকে গেলেই বনশ্রী কেন্দ্রীয় জামে মসজিদ।",
                contact: "মাওলানা আশেকে এলাহী সাহেব +8801314803334",
                map: "https://share.google/6QW4BYU4xfWtuWvbH"
            }
        ]
    },
    {
        title: "অন্যান্য শুক্রবার",
        dayOfWeek: 5, // Friday
        weekNumber: [1, 2, 3, 5],
        details: [
            {
                time: "জুমার বয়ান ও নামাজ",
                location: "বাইতুল আমান স্টিমারঘাট জামে মসজিদ, বাদামতলী।",
                route: "বাবু বাজার ব্রিজ সংলগ্ন বুড়িগঙ্গা নদীর পাড়ে অবস্থিত।",
                contact: "মাওলানা আশেকে এলাহী- +8801314803334",
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
            if (Array.isArray(event.weekNumber)) return event.weekNumber.includes(nthOccurrence);
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
            if (Array.isArray(event.weekNumber)) return event.weekNumber.includes(nthOccurrence);
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
        sidebar.innerHTML = '<div class="text-[10px] text-slate-400 text-center py-4">এই মাসে কোনো মজলিস নেই</div>';
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
            <div class="see-more-link" onclick='showMajlisDetails(${JSON.stringify(eventGroup.events).replace(/'/g, "&apos;")}, ${eventGroup.day}, "${eventGroup.monthName}")'>বিস্তারিত</div>
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

    title.innerText = `${day} ${monthName} - মজলিস বিস্তারিত`;

    let bodyHTML = '';
    events.forEach(event => {
        bodyHTML += `<div class="mb-5 last:mb-0">
            <h4 class="font-medium text-slate-800 text-base mb-3 border-b border-slate-100 pb-2">${event.title}</h4>
        `;

        event.details.forEach(detail => {
            bodyHTML += `
                <div class="majlis-detail-card space-y-3 mb-4">
                    <div class="flex gap-4 items-center">
                        <i class="far fa-clock text-emerald-500 w-5"></i>
                        <div><p class="text-[10px] uppercase font-medium">সময়</p><p class="text-sm font-medium text-slate-700">${detail.time}</p></div>
                    </div>
                    <div class="flex gap-4 items-center">
                        <i class="fas fa-map-marker-alt text-blue-500 w-5"></i>
                        <div><p class="text-[10px] uppercase font-medium">স্থান</p><p class="text-sm font-medium text-slate-700">${detail.location}</p></div>
                    </div>
                    <div class="flex gap-4 items-center">
                        <i class="fas fa-route text-amber-500 w-5"></i>
                        <div><p class="text-[10px] uppercase font-medium">যাতায়াত</p><p class="text-xs text-slate-500 leading-tight">${detail.route}</p></div>
                    </div>
                    <div class="flex gap-4 items-center">
                        <i class="fas fa-phone-alt text-purple-500 w-5"></i>
                        <div><p class="text-[10px] uppercase font-medium">যোগাযোগ</p><p class="text-sm font-medium text-slate-700">${detail.contact}</p></div>
                    </div>
                    <a href="${detail.map}" target="_blank" class="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 text-white rounded-xl font-medium hover:opacity-90 transition mt-2 text-sm italic">
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
