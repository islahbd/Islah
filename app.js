// লোডার লুকানোর ফাংশন - পেজ লোড হওয়ার পর লোডার হাইড হবে
window.addEventListener("load", function() {
  setTimeout(function() {
    document.getElementById("loader").style.display = "none";
  }, 1500);
});

// বায়োগ্রাফি সেকশন টগল করার ফাংশন
function toggleDropdown() {
  const content = document.getElementById("dropdownContent");
  content.classList.toggle("open");
}

// মেইন ক্যালেন্ডার ফাংশনালিটি
document.addEventListener("DOMContentLoaded", function() {
  // ইভেন্ট ডাটা অ্যারে - সব ইভেন্টের তথ্য এখানে সংরক্ষিত
  const eventData = [
    {
      title: "প্রথম বৃহস্পতিবার",
      dayType: "বৃহস্পতিবার",
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
      dayType: "রবিবার",
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
      dayType: "বৃহস্পতিবার",
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
      dayType: "শুক্রবার",
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
      dayType: "সোমবার",
      weekNumber: "all",
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
      dayType: "শুক্রবার",
      weekNumber: "all",
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

  // দিনের ম্যাপিং - বাংলা দিনের নাম থেকে সংখ্যায় রূপান্তর
  const daysMap = { 
    "রবিবার": 0, 
    "সোমবার": 1, 
    "মঙ্গলবার": 2, 
    "বুধবার": 3, 
    "বৃহস্পতিবার": 4, 
    "শুক্রবার": 5, 
    "শনিবার": 6 
  };

  // মাসের নামের অ্যারে
  const months = [
    "জানুয়ারী", "ফেব্রুয়ারী", "মার্চ", "এপ্রিল", 
    "মে", "জুন", "জুলাই", "আগস্ট", 
    "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];

  // বর্তমান তারিখ নির্ধারণ
  const currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  const container = document.getElementById("eventContainer");

  // মাসের মধ্যে তারিখের সপ্তাহ সংখ্যা নির্ণয়ের ফাংশন
  function getWeekNumberInMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    
    // প্রথম দিনের সপ্তাহের দিন (0-6, রবি-শনি)
    const firstDayOfWeek = firstDay.getDay();
    
    // তারিখের সাপেক্ষে সপ্তাহ সংখ্যা গণনা
    return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
  }

  // মাসে নির্দিষ্ট দিনের কততম বার আসছে তা নির্ণয়ের ফাংশন
  function getNthDayInMonth(date, dayOfWeek) {
    const month = date.getMonth();
    const year = date.getFullYear();
    let count = 0;
    let nthDay = 0;
    
    // মাসের সব তারিখ চেক করা
    for (let i = 1; i <= new Date(year, month + 1, 0).getDate(); i++) {
      const currentDate = new Date(year, month, i);
      if (currentDate.getDay() === dayOfWeek) {
        count++;
        if (currentDate.getDate() === date.getDate()) {
          nthDay = count;
          break;
        }
      }
    }
    
    return nthDay;
  }

  // ক্যালেন্ডার জেনারেট করার ফাংশন (নেভিগেশন সহ)
  function generateCalendarWithNav(month, year, dayType, weekNumber, eventIndex) {
    const calendarContainer = document.createElement("div");
    calendarContainer.className = "calendar-container";
    
    // নেভিগেশন বার তৈরি
    const navDiv = document.createElement("div");
    navDiv.className = "calendar-nav";
    
    // বাম দিকের তীর (পূর্বের মাস)
    const leftArrow = document.createElement("span");
    leftArrow.className = "nav-arrow";
    leftArrow.innerHTML = "&larr;";
    leftArrow.onclick = () => {
      const newMonth = month === 0 ? 11 : month - 1;
      const newYear = month === 0 ? year - 1 : year;
      updateCalendar(newMonth, newYear, eventIndex);
    };
    
    // মাসের টাইটেল
    const monthTitle = document.createElement("span");
    monthTitle.className = "month-title";
    monthTitle.textContent = `${months[month]} ${year}`;
    
    // ডান দিকের তীর (পরের মাস)
    const rightArrow = document.createElement("span");
    rightArrow.className = "nav-arrow";
    rightArrow.innerHTML = "&rarr;";
    rightArrow.onclick = () => {
      const newMonth = month === 11 ? 0 : month + 1;
      const newYear = month === 11 ? year + 1 : year;
      updateCalendar(newMonth, newYear, eventIndex);
    };
    
    navDiv.appendChild(leftArrow);
    navDiv.appendChild(monthTitle);
    navDiv.appendChild(rightArrow);
    calendarContainer.appendChild(navDiv);
    
    // মাসের প্রথম দিন এবং মাসের মোট দিন সংখ্যা
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
    
    // টেবিল তৈরি
    let table = document.createElement("table");
    table.className = "calendar";
    
    // টেবিল হেডার (দিনের নাম)
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");
    days.forEach(day => {
      let th = document.createElement("th");
      th.textContent = day;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // ক্যালেন্ডার বডি
    let tbody = document.createElement("tbody");
    let date = 1;
    
    // ৬ সারি (সপ্তাহ) তৈরি
    for (let i = 0; i < 6; i++) {
      if (date > daysInMonth) break;
      
      let row = document.createElement("tr");
      
      // ৭ কলাম (দিন) তৈরি
      for (let j = 0; j < 7; j++) {
        let cell = document.createElement("td");
        if (i === 0 && j < firstDay) {
          cell.textContent = "";
        } else if (date > daysInMonth) {
          cell.textContent = "";
        } else {
          cell.textContent = date;
          
          // আজকের তারিখ হাইলাইট
          if (year === currentDate.getFullYear() && 
              month === currentDate.getMonth() && 
              date === currentDate.getDate()) {
            cell.classList.add("today");
          }
          
          // ইভেন্টের তারিখ হাইলাইট
          const cellDate = new Date(year, month, date);
          const dayOfWeek = cellDate.getDay();
          
          if (weekNumber === "all" && dayOfWeek === dayType) {
            // সাপ্তাহিক ইভেন্ট (প্রতি সপ্তাহে)
            cell.classList.add("highlight");
            const eventText = document.createElement("div");
            eventText.className = "event-text";
            eventText.textContent = "";
            cell.appendChild(eventText);
          } 
          else if (weekNumber !== "all" && dayOfWeek === dayType) {
            // নির্দিষ্ট সপ্তাহের ইভেন্ট
            const nthDay = getNthDayInMonth(cellDate, dayType);
            
            if (nthDay === weekNumber) {
              cell.classList.add("highlight");
              const eventText = document.createElement("div");
              eventText.className = "event-text";
              eventText.textContent = "";
              cell.appendChild(eventText);
            }
          }
          
          date++;
        }
        row.appendChild(cell);
      }
      tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    calendarContainer.appendChild(table);
    
    return calendarContainer;
  }

  // ক্যালেন্ডার আপডেট করার ফাংশন (মাস পরিবর্তন হলে)
  function updateCalendar(month, year, eventIndex) {
    const event = eventData[eventIndex];
    const calendarContainer = document.getElementById(`calendar-${eventIndex}`);
    
    // পুরানো ক্যালেন্ডার ক্লিয়ার
    while (calendarContainer.firstChild) {
      calendarContainer.removeChild(calendarContainer.firstChild);
    }
    
    // নতুন ক্যালেন্ডার জেনারেট
    const newCalendar = generateCalendarWithNav(
      month, 
      year, 
      daysMap[event.dayType], 
      event.weekNumber, 
      eventIndex
    );
    
    calendarContainer.appendChild(newCalendar);
  }

  // সব ক্যালেন্ডারকে বর্তমান মাসে রিসেট করার ফাংশন
  function resetAllCalendarsToCurrentMonth() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    eventData.forEach((event, index) => {
      const calendarContainer = document.getElementById(`calendar-${index}`);
      if (calendarContainer) {
        // পুরানো ক্যালেন্ডার ক্লিয়ার
        while (calendarContainer.firstChild) {
          calendarContainer.removeChild(calendarContainer.firstChild);
        }
        
        // নতুন ক্যালেন্ডার জেনারেট (বর্তমান মাসে)
        const newCalendar = generateCalendarWithNav(
          currentMonth,
          currentYear,
          daysMap[event.dayType],
          event.weekNumber,
          index
        );
        
        calendarContainer.appendChild(newCalendar);
      }
    });
  }

  // ইভেন্ট বাটন এবং ডিটেইলস তৈরি করার ফাংশন
  function createEventButtonsAndDetails() {
    eventData.forEach((event, index) => {
      // ইভেন্ট বাটন তৈরি
      const btn = document.createElement("button");
      btn.className = "event-button";
      btn.innerText = event.title;
      
      // ডিটেইলস কন্টেইনার তৈরি
      const detailDiv = document.createElement("div");
      detailDiv.className = "event-details";
      detailDiv.id = `details-${index}`;
      
      // ফ্লেক্স কন্টেইনার তৈরি (লোকেশন এবং ক্যালেন্ডারের জন্য)
      const detailsContainer = document.createElement("div");
      detailsContainer.className = "details-container";
      
      // লোকেশন ইনফো ডিভ
      const locationInfo = document.createElement("div");
      locationInfo.className = "location-info";
      
      // ইভেন্ট ডিটেইলস যোগ করা
      event.details.forEach((d, i) => {
        const detailItem = document.createElement("div");
        detailItem.className = "detail-item";
        detailItem.innerHTML = `
          <h3> 
<lord-icon
    src="https://cdn.lordicon.com/ebfcponz.json"
    trigger="loop"
    delay="500"
    colors="primary:#66a1ee,secondary:#ffc738,tertiary:#109121,quaternary:#c74b16,quinary:#ffffff"
    style="width:30px;height:30px">
</lord-icon> স্থানঃ ${d.location}</h3>

          <p>
<lord-icon
    src="https://cdn.lordicon.com/sgtmgpft.json"
    trigger="loop"
    delay="500"
    colors="primary:#3a3347,secondary:#ffffff,tertiary:#109121,quaternary:#c74b16"
    style="width:25px;height:25px">
</lord-icon><strong> সময়ঃ</strong> ${d.time}</p>

          <p>
<lord-icon
    src="https://cdn.lordicon.com/hjpkcwgj.json"
    trigger="loop"
    delay="500"
    colors="primary:#3a3347,secondary:#66a1ee,tertiary:#ffc738"
    style="width:25px;height:25px">
</lord-icon><strong> যাতায়াতঃ</strong> ${d.route}</p>

          <p>
<lord-icon
    src="https://cdn.lordicon.com/fzxfahqr.json"
    trigger="loop"
    delay="500"
    colors="primary:#ffffff,secondary:#66a1ee"
    style="width:25px;height:25px">
</lord-icon><strong> যোগাযোগঃ</strong> ${d.contact}</p><br>
          <a class="map-button" href="${d.map}" target="_blank">Google Map এ দেখুন</a>
        `;
        locationInfo.appendChild(detailItem);
      });
      
      // ক্যালেন্ডার কন্টেইনার তৈরি
      const calendarContainer = document.createElement("div");
      calendarContainer.id = `calendar-${index}`;
      calendarContainer.className = "calendar-container";
      
      // প্রাথমিক ক্যালেন্ডার জেনারেট (বর্তমান মাসে)
      const initialCalendar = generateCalendarWithNav(
        currentMonth,
        currentYear,
        daysMap[event.dayType],
        event.weekNumber,
        index
      );
      
      calendarContainer.appendChild(initialCalendar);
      
      detailsContainer.appendChild(locationInfo);
      detailsContainer.appendChild(calendarContainer);
      detailDiv.appendChild(detailsContainer);
      
      container.appendChild(btn);
      container.appendChild(detailDiv);

      // বাটন ক্লিক হ্যান্ডলার
      btn.onclick = () => {
        const isActive = detailDiv.classList.contains("active");
        
        // প্রথমে সব ক্যালেন্ডারকে বর্তমান মাসে রিসেট
        resetAllCalendarsToCurrentMonth();
        
        // অন্য সব ডিটেইলস বন্ধ করা
        document.querySelectorAll(".event-details").forEach(d => {
          d.classList.remove("active");
        });
        
        document.querySelectorAll(".event-button").forEach(b => {
          b.classList.remove("active");
        });
        
        // যদি একটিভ না থাকে তবে এটি খোলা
        if (!isActive) {
          btn.classList.add("active");
          setTimeout(() => {
            detailDiv.classList.add("active");
          }, 50);
        }
      };
    });
  }

  // ইভেন্ট বাটন এবং ডিটেইলস তৈরি
  createEventButtonsAndDetails();

  /* =======================
     ✅ বয়ান উইজেট ফাংশনালিটি
     ======================= */
  function setDates(){
    const weekdays=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const today=new Date();
    const tomorrow=new Date(today); tomorrow.setDate(today.getDate()+1);
    const dat=new Date(today);      dat.setDate(today.getDate()+2);

    // আজ
    document.getElementById('todayWeekday').textContent=weekdays[today.getDay()];
    document.getElementById('todayMonth').textContent=months[today.getMonth()];
    document.getElementById('todayDay').textContent=today.getDate();

    // আগামীকাল
    document.getElementById('tomorrowWeekday').textContent=weekdays[tomorrow.getDay()];
    document.getElementById('tomorrowMonth').textContent=months[tomorrow.getMonth()];
    document.getElementById('tomorrowDay').textContent=tomorrow.getDate();

    // পরশু
    document.getElementById('dayAfterTomorrowWeekday').textContent=weekdays[dat.getDay()];
    document.getElementById('dayAfterTomorrowMonth').textContent=months[dat.getMonth()];
    document.getElementById('dayAfterTomorrowDay').textContent=dat.getDate();
  }

  /* =======================
     ✅ ইভেন্ট টেক্সট থেকে সময়/ফোন বের করা
     ======================= */
  function extractInfo(description){
    const info={time:'',phone:''};
    if(!description) return info;
    const timeMatch=description.match(/tm:(.*?)(\n|$)/i);
    const phoneMatch=description.match(/ph:(.*?)(\n|$)/i);
    if(timeMatch) info.time=timeMatch[1].trim();
    if(phoneMatch) info.phone=phoneMatch[1].trim();
    return info;
  }

  /* =======================
     ✅ সময় ফরম্যাট (বাংলা লোকেল)
     ======================= */
  function formatTime(iso){
    const d=new Date(iso);
    return d.toLocaleTimeString('bn-BD',{hour:'2-digit',minute:'2-digit'});
  }

  /* =======================
     ✅ নির্দিষ্ট তারিখের ইভেন্ট ফেচ
     ======================= */
  async function fetchEvents(date,containerId){
    const apiKey='AIzaSyAYh4kx90B9zw2Qo0DTcNx5IDIMwwxlfUk';
    const calendarId=encodeURIComponent('ashikpushpo07@gmail.com');

    // লোকাল ডে রেঞ্জ (Dhaka) – toISOString হলে UTC তে যাবে, গুগল ঠিকমত বুঝে
    const timeMin=new Date(date); timeMin.setHours(0,0,0,0);
    const timeMax=new Date(date); timeMax.setHours(23,59,59,999);

    const url=`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?`+
              `key=${apiKey}&timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}`+
              `&singleEvents=true&orderBy=startTime&maxResults=50`;

    const cardsContainer=document.getElementById(containerId);
    try{
      const res=await fetch(url);
      const data=await res.json();

      cardsContainer.innerHTML='';

      if(!data.items || data.items.length===0){
        cardsContainer.innerHTML='<div class="card"><div><h3>আজ কোনো মজলিস নেই</h3></div></div>';
        return;
      }

      data.items.forEach(ev=>{
        const {time,phone}=extractInfo(ev.description);
        const start=ev.start?.dateTime?formatTime(ev.start.dateTime):(ev.start?.date?'সারাদিন':'সময় উল্লেখ নেই');
        const card=document.createElement('div');
        card.className='card';
        card.innerHTML=`
          <div>
            <h3>${ev.summary||'Majlis Location'}</h3>
            <p>সময়: ${time || start}</p>
            <p>যোগাযোগ: ${phone || 'ফোন নম্বর দেওয়া নেই'}</p>
          </div>
        `;
        cardsContainer.appendChild(card);
      });
    }catch(e){
      console.error(e);
      cardsContainer.innerHTML='<div class="card"><div><h3>ইভেন্ট লোডিং এ সমস্যা হচ্ছে</h3></div></div>';
    }
  }

  /* =======================
     ✅ তিন দিনের সব ইভেন্ট লোড
     ======================= */
  async function fetchAllEvents(){
    const today=new Date();
    const tomorrow=new Date(today); tomorrow.setDate(today.getDate()+1);
    const dat=new Date(today);      dat.setDate(today.getDate()+2);

    await Promise.all([
      fetchEvents(today,'todayCards'),
      fetchEvents(tomorrow,'tomorrowCards'),
      fetchEvents(dat,'dayAfterTomorrowCards')
    ]);
  }

  /* =======================
     ✅ স্লাইড নেভিগেশন (ভার্টিক্যাল)
     - প্রতিটি স্লাইডকে (index - currentIndex)*100% ট্রান্সলেট করা হবে
     - ফলে কখনই মেইন কন্টেইনারের বাইরে যাবে না
     ======================= */
  function setupSlides(){
    const slides=[...document.querySelectorAll('.widget-slide')];
    const dots=[...document.querySelectorAll('.dot')];

    // ডিফল্ট: আজকের বয়ান (index 0) – আপনার চাহিদা অনুযায়ী স্ক্রোল করে আগামীকাল (1), তারপর পরশু (2)
    let currentIndex=0;

    // প্রাথমিক পজিশন সেট
    function positionSlides(){
      slides.forEach((s,i)=>{ s.style.transform=`translateY(${(i-currentIndex)*100}%)`; });
      dots.forEach((d,i)=> d.classList.toggle('active', i===currentIndex));
    }
    positionSlides();

    // ডট ক্লিক
    dots.forEach(dot=>{
      dot.addEventListener('click',()=>{
        currentIndex=parseInt(dot.dataset.index,10);
        positionSlides();
      });
    });

    // টাচ সোয়াইপ (উপর/নিচ)
    let startY=0, moved=false;
    const wrap=document.getElementById('widgetSlides');

    wrap.addEventListener('touchstart',e=>{ startY=e.touches[0].clientY; moved=false; },{passive:true});
    wrap.addEventListener('touchmove',e=>{
      if(Math.abs(e.touches[0].clientY-startY)>8) moved=true;
    },{passive:true});
    wrap.addEventListener('touchend',e=>{
      if(!moved) return;
      const endY=e.changedTouches[0].clientY;
      const diff=startY-endY;
      if(diff>40 && currentIndex<slides.length-1){ currentIndex++; }
      else if(diff<-40 && currentIndex>0){ currentIndex--; }
      positionSlides();
    },{passive:true});

    // মাউস হুইল (ঐচ্ছিক, স্মুথ)
    let wheelLock=false;
    wrap.addEventListener('wheel',e=>{
      if(wheelLock) return;
      wheelLock=true;
      setTimeout(()=>wheelLock=false,350);
      if(e.deltaY>0 && currentIndex<slides.length-1){ currentIndex++; positionSlides(); }
      else if(e.deltaY<0 && currentIndex>0){ currentIndex--; positionSlides(); }
    },{passive:true});
  }

  /* =======================
     ✅ ইনিট
     ======================= */
  setDates();
  fetchAllEvents();
  setupSlides();
});