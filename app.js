// --- ১. ফটো স্লাইডার লজিক (Smooth Infinite Loop) ---
let currentSlide = 0;
const track = document.getElementById('slider-track');
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');

if (track && slides.length > 0) {
    // Clone first slide manually and append to track for infinite look
    const firstClone = slides[0].cloneNode(true);
    track.appendChild(firstClone);
}

function updateSlide(animate = true) {
    if (!track) return;

    if (animate) {
        track.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    } else {
        track.style.transition = 'none';
    }

    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Manage indicators (only for original slides)
    const activeIndex = currentSlide % slides.length;
    indicators.forEach((ind, index) => {
        ind.classList.toggle('opacity-100', index === activeIndex);
        ind.classList.toggle('opacity-50', index !== activeIndex);
    });
}

function nextSlide() {
    if (!slides.length) return;
    currentSlide++;
    updateSlide(true);
}

// Handle transition end for seamless loop
if (track) {
    track.addEventListener('transitionend', () => {
        if (currentSlide === slides.length) {
            currentSlide = 0;
            updateSlide(false); // Silent jump back to original first slide
        }
    });
}

// Auto slide every 4 seconds
setInterval(nextSlide, 4000);

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
                const startDate = new Date(event.start.dateTime || event.start.date);
                const dateKey = getLocalDateKey(startDate); // Fixed: Use local date key
                if (!eventsByDay[dateKey]) {
                    eventsByDay[dateKey] = [];
                }
                eventsByDay[dateKey].push(event);
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

            return {
                label: day.label,
                dateInfo: dateInfo,
                events: processedEvents,
                hasEvent: processedEvents.length > 0
            };
        });

        renderBayanWidget();

    } catch (error) {
        console.error('Error fetching calendar:', error);
        container.innerHTML = '<div class="text-center text-red-500 py-10">সূচী লোড করতে সমস্যা হয়েছে।</div>';
    }
}

function renderBayanWidget() {
    const container = document.getElementById('schedule-container');
    if (!container || bayanEventsData.length === 0) return;

    const data = bayanEventsData[currentBayanIndex];
    const opacityClass = data.hasEvent ? '' : 'opacity-70';

    let html = '<div class="bayan-card hover-card ' + opacityClass + '">';
    html += '  <div class="bayan-nav-btns">';
    html += '    <button class="bayan-nav-btn" onclick="prevBayan()"><i class="fas fa-chevron-up"></i></button>';
    html += '    <button class="bayan-nav-btn" onclick="nextBayan()"><i class="fas fa-chevron-down"></i></button>';
    html += '  </div>';

    html += '  <div class="bayan-header">';
    html += '    <h2>' + data.label + '</h2>';
    html += '  </div>';
    html += '  <div class="bayan-body">';
    html += '    <div class="bayan-date-box">';
    html += '      <div class="bayan-day-month"><span class="bayan-day-name">' + data.dateInfo.dayName + '</span> ' + data.dateInfo.month + '</div>';
    html += '      <div class="bayan-date-num">' + data.dateInfo.date + '</div>';
    html += '    </div>';

    html += '    <div class="bayan-events-wrapper" style="flex: 1; display: flex; flex-direction: column; gap: 8px;">';

    if (data.hasEvent) {
        data.events.forEach(event => {
            html += '    <div class="bayan-info-box">';
            html += '      <div class="bayan-location">' + event.location + '</div>';
            html += '      <div class="bayan-details">';
            html += '        <div><span class="label">সময়:</span> ' + event.time + '</div>';
            html += '        <div><span class="label">যোগাযোগ:</span> ' + event.contact + '</div>';
            html += '      </div>';
            html += '    </div>';
        });
    } else {
        const emptyMessage = data.label.includes('আজ') ? 'আজ কোনো মজলিস নেই' :
            (data.label.includes('আগামীকাল') ? 'আগামীকাল কোনো মজলিস নেই' : 'পরশুদিন কোনো মজলিস নেই');
        html += '    <div class="bayan-info-box flex items-center py-6">';
        html += '      <div class="text-base font-bold text-gray-800">' + emptyMessage + '</div>';
        html += '    </div>';
    }

    html += '    </div>'; // end wrapper
    html += '  </div>';
    html += '</div>';

    container.innerHTML = html;
}

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
                location: "মাদরাসা মারকাযুন নূর, চাঁদপুর",
                route: "চাঁদপুর জেলা প্রশাসকের কার্যালয়ের অপর পাশে, জনতা ব্যাংকের উপরে",
                contact: "মাওলানা আতিকুর রহমান- +8801914586540",
                map: "https://maps.app.goo.gl/tejSV1qFwEPo1Su28"
            },
            {
                time: "এশার পূর্ব মুহূর্তে",
                location: "মাদরাসা মারকাযুস সুন্নাহ, কচুয়া, চাঁদপুর",
                route: "কচুয়া, সুবিতপুর বাসস্ট্যান্ড থেকে ৩০০ গজ পূর্বে মারকাযুস সুন্নাহ।",
                contact: "হাফেজ আব্দুর রশীদ সাহেব - +8801895241780",
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
                location: "বেহাকৈর প্রাইমারি স্কুল জামে মসজিদ, কাঁচপুর, নারায়ণগঞ্জ",
                route: "বেহাকৈর প্রাইমারি স্কুল সংলগ্ন জামে মসজিদ।",
                contact: "ইয়াসিন সাহেব +8801991746446",
                map: "https://maps.app.goo.gl/fFqTLKMtUL17xmcf9"
            }
        ]
    },
    {
        title: "তৃতীয় বৃহস্পতিবার",
        dayOfWeek: 4, // Thursday
        weekNumber: 3,
        details: [
            {
                time: "বাদ আসর",
                location: "জামেআ মারকাযুল ইহসান ঢাকা",
                route: "পাইটি, ডেমরা, ঢাকা (যাত্রাবাড়ী চৌরাস্তা থেকে ডেমরা রোডে কোনাপাড়া ও স্টাফ-কোয়ার্টার এর মাঝামাঝি মহাসড়ক সংলগ্ন)",
                contact: " মাওলানা আশেকে এলাহী- +8801314803334, মাওলানা জুনাইদ মুস্তফা- +8801951259064",
                map: "https://g.co/kgs/siLvRtc"
            }
        ]
    },
    {
        title: "তৃতীয় শুক্রবার",
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
                location: "মাদরাসা মারকাযুল ইহসান ঢাকা।",
                route: "যাত্রাবাড়ী/ দয়াগঞ্জ/ সায়েদাবাদ মোড় থেকে ৫ মিনিটের দুরত্বে ৬নং শহীদ ফারুক সড়ক, আল-আরাফাহ ইসলামী ব্যাংকের উপরে, পশ্চিম যাত্রাবাড়ী, ঢাকা।",
                contact: "মাওলানা আশেকে এলাহী- +8801314803334, মাওলানা জুনাইদ মুস্তফা- +8801951259064",
                map: "https://g.co/kgs/4fqjVzX"
            }
        ]
    },
    {
        title: "প্রতি শুক্রবার",
        dayOfWeek: 5, // Friday
        weekNumber: 'all',
        details: [
            {
                time: "জুমার বয়ান ও নামাজ",
                location: "বাইতুল আমান স্টীমারঘাট জামে মসজিদ, বাদামতলী।",
                route: "বাবু বাজার ব্রিজ সংলগ্ন বুড়িগঙ্গা নদীর পাড়ে অবস্থিত।",
                contact: "মাওলানা আশেকে এলাহী- +8801314803334",
                map: "https://g.co/kgs/285Dztc"
            }
        ]
    }
];

let calCurrentDate = new Date();

function renderMajlisCalendar() {
    const container = document.getElementById('majlis-calendar-container');
    if (!container) return;

    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();

    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let calendarHTML = `
        <div class="calendar-header">
            <div>
                <span class="calendar-header-month">${monthNames[month]}</span>
            </div>
            <div class="calendar-header-controls">
                <span class="calendar-header-year">${year}</span>
                <button onclick="changeMonth(-1)" class="calendar-nav-btn"><i class="fas fa-chevron-left"></i></button>
                <button onclick="changeMonth(1)" class="calendar-nav-btn"><i class="fas fa-chevron-right"></i></button>
            </div>
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
        calendarHTML += `<div class="${classes}" ${onClick}>${day}</div>`;
    }

    calendarHTML += `</div>`;
    container.innerHTML = calendarHTML;
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
            <h4 class="font-bold text-slate-800 text-base mb-3 border-b border-slate-100 pb-2">${event.title}</h4>
        `;

        event.details.forEach(detail => {
            bodyHTML += `
                <div class="majlis-detail-card space-y-3 mb-4">
                    <div class="flex gap-4 items-center">
                        <i class="far fa-clock text-emerald-500 w-5"></i>
                        <div><p class="text-[10px] uppercase font-bold">সময়</p><p class="text-sm font-bold text-slate-700">${detail.time}</p></div>
                    </div>
                    <div class="flex gap-4 items-center">
                        <i class="fas fa-map-marker-alt text-blue-500 w-5"></i>
                        <div><p class="text-[10px] uppercase font-bold">স্থান</p><p class="text-sm font-bold text-slate-700">${detail.location}</p></div>
                    </div>
                    <div class="flex gap-4 items-center">
                        <i class="fas fa-route text-amber-500 w-5"></i>
                        <div><p class="text-[10px] uppercase font-bold">যাতায়াত</p><p class="text-xs text-slate-500 leading-tight">${detail.route}</p></div>
                    </div>
                    <div class="flex gap-4 items-center">
                        <i class="fas fa-phone-alt text-purple-500 w-5"></i>
                        <div><p class="text-[10px] uppercase font-bold">যোগাযোগ</p><p class="text-sm font-bold text-slate-700">${detail.contact}</p></div>
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

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchBayanSchedule();
    renderMajlisCalendar();
});
