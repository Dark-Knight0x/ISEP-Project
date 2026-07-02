// ===== MindTrack — mock data & page navigation =====
// Everything here is fake/sample data wired up purely on the frontend
// so each sidebar item has something real to look at.

/* ---------------------------------------------------------------
   1) PAGE NAVIGATION
--------------------------------------------------------------- */
const pageTitles = {
  overview: ["Thursday · Jul 02", "Good afternoon, Doan"],
  timeline: ["Full timeline", "Browse your week"],
  journal:  ["Mood journal", "Every check-in, in one place"],
  report:   ["Weekly report", "Jun 26 – Jul 02"],
  anon:     ["Anonymous space", "Exam week, together"],
  settings: ["Settings", "Your account, your rules"],
};

function goToPage(name){
  document.querySelectorAll(".nav-item").forEach(a=>a.classList.toggle("active", a.dataset.page===name));
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("hidden", p.id !== `page-${name}`));
  const [eyebrow, title] = pageTitles[name] || [];
  if(eyebrow) document.getElementById("topbar-eyebrow").textContent = eyebrow;
  if(title) document.getElementById("topbar-title").textContent = title;
  window.scrollTo({top:0, behavior:"smooth"});
}

document.querySelectorAll(".nav-item[data-page]").forEach(a=>{
  a.addEventListener("click", ()=> goToPage(a.dataset.page));
});

/* ---------------------------------------------------------------
   2) TIMELINE PAGE — mock week of days
--------------------------------------------------------------- */
const WEEK = [
  { key:"mon", label:"Mon", date:"Jun 29", peakHR:96, restHR:64, sleep:7.2, moodAvg:1, danger:0,
    schedule:[
      {label:"Data Structures lecture", time:"07:30–09:30", type:"class"},
      {label:"Study group", time:"10:00–11:30", type:"class"},
      {label:"Lunch", time:"12:00–13:00", type:"meal"},
      {label:"Part-time job", time:"14:00–18:00", type:"work"},
      {label:"Sleep", time:"23:00–06:30", type:"sleep"},
    ],
    moods:[{emoji:"😊", note:"Good start to the week", time:"08:10", tag:"pos"},
           {emoji:"😐", note:"A bit tired after work", time:"18:30", tag:"neu"}]
  },
  { key:"tue", label:"Tue", date:"Jun 30", peakHR:101, restHR:65, sleep:6.8, moodAvg:0, danger:0,
    schedule:[
      {label:"Algorithms lecture", time:"07:30–09:30", type:"class"},
      {label:"Lab TA shift", time:"09:30–11:00", type:"class"},
      {label:"Lunch", time:"12:00–13:00", type:"meal"},
      {label:"Group project meeting", time:"15:00–16:30", type:"work"},
      {label:"Sleep", time:"23:30–06:00", type:"sleep"},
    ],
    moods:[{emoji:"😐", note:"Busy but manageable", time:"09:00", tag:"neu"},
           {emoji:"😐", note:"Project meeting ran long", time:"16:45", tag:"neu"}]
  },
  { key:"wed", label:"Wed", date:"Jul 01", peakHR:104, restHR:65, sleep:6.1, moodAvg:-1, danger:1,
    schedule:[
      {label:"Networks lecture", time:"07:30–09:30", type:"class"},
      {label:"Exam review session", time:"13:00–14:30", type:"exam"},
      {label:"Part-time job", time:"18:00–22:00", type:"work"},
      {label:"Sleep", time:"23:45–05:45", type:"sleep"},
    ],
    moods:[{emoji:"😐", note:"Nervous about tomorrow's exam", time:"14:40", tag:"neu"},
           {emoji:"😞", note:"Long shift, low energy", time:"22:10", tag:"neg"}]
  },
  { key:"thu", label:"Thu", date:"Jul 02", peakHR:112, restHR:63, sleep:6.4, moodAvg:-1.5, danger:1,
    schedule:[
      {label:"Calculus II", time:"07:00–09:00", type:"class"},
      {label:"Lab TA shift", time:"09:30–11:00", type:"class"},
      {label:"Calculus exam", time:"13:00–14:30", type:"exam"},
      {label:"Dinner", time:"18:00–18:30", type:"meal"},
      {label:"Sleep", time:"23:30–05:30", type:"sleep"},
    ],
    moods:[{emoji:"😊", note:"Good, ready for lab", time:"08:40", tag:"pos"},
           {emoji:"😐", note:"A bit nervous before the exam", time:"12:50", tag:"neu"},
           {emoji:"😞", note:"Exam was harder than expected, tired", time:"14:35", tag:"neg"},
           {emoji:"😢", note:"Heart still racing", time:"18:10", tag:"neg"}]
  },
  { key:"fri", label:"Fri", date:"Jul 03", peakHR:90, restHR:64, sleep:7.5, moodAvg:1, danger:0,
    schedule:[
      {label:"Elective seminar", time:"09:00–11:00", type:"class"},
      {label:"Lunch with friends", time:"12:00–13:00", type:"meal"},
      {label:"Free study block", time:"14:00–16:00", type:"class"},
      {label:"Sleep", time:"23:00–06:30", type:"sleep"},
    ],
    moods:[{emoji:"😊", note:"Relieved the exam is over", time:"09:30", tag:"pos"},
           {emoji:"😊", note:"Nice catch-up with friends", time:"13:10", tag:"pos"}]
  },
  { key:"sat", label:"Sat", date:"Jul 04", peakHR:82, restHR:62, sleep:8.1, moodAvg:2, danger:0,
    schedule:[
      {label:"Morning run", time:"07:00–07:40", type:"work"},
      {label:"Family lunch", time:"12:00–13:30", type:"meal"},
      {label:"Sleep", time:"23:30–07:30", type:"sleep"},
    ],
    moods:[{emoji:"😊", note:"Slept in, feels great", time:"09:15", tag:"pos"}]
  },
  { key:"sun", label:"Sun", date:"Jul 05", peakHR:80, restHR:62, sleep:7.8, moodAvg:1.5, danger:0,
    schedule:[
      {label:"Assignment work", time:"10:00–13:00", type:"class"},
      {label:"Meal prep", time:"18:00–19:00", type:"meal"},
      {label:"Sleep", time:"23:00–06:45", type:"sleep"},
    ],
    moods:[{emoji:"😊", note:"Calm before the new week", time:"20:00", tag:"pos"}]
  },
];

function renderDayChips(){
  const wrap = document.getElementById("day-chips");
  wrap.innerHTML = WEEK.map(d=>`<span class="chip${d.key==='thu'?' active':''}" data-day="${d.key}">${d.label} · ${d.date}</span>`).join("");
  wrap.querySelectorAll(".chip").forEach(c=>{
    c.addEventListener("click", ()=>{
      wrap.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
      c.classList.add("active");
      renderDay(c.dataset.day);
    });
  });
}

function renderDay(key){
  const d = WEEK.find(x=>x.key===key);
  document.getElementById("day-title").textContent = `${d.label==='Thu'?'Thursday':d.label} · ${d.date}`;
  document.getElementById("day-stats").innerHTML = `
    <div class="metric ${d.peakHR>=105?'warn':''}"><div class="m-val">${d.peakHR}<small> bpm</small></div><div class="m-lbl">Peak heart rate</div></div>
    <div class="metric"><div class="m-val">${d.restHR}<small> bpm</small></div><div class="m-lbl">Resting heart rate</div></div>
    <div class="metric"><div class="m-val">${d.sleep}<small> h</small></div><div class="m-lbl">Sleep</div></div>
    <div class="metric ${d.danger?'warn':''}"><div class="m-val">${d.danger}<small></small></div><div class="m-lbl">Danger zones</div></div>
  `;
  document.getElementById("day-moods").innerHTML = d.moods.map(m=>`
    <li><span class="j-emoji">${m.emoji}</span><div class="j-body"><div class="j-note">${m.note}</div><div class="j-meta">${d.date} · ${m.time}</div></div>
    <span class="tag ${m.tag}">${m.tag==='pos'?'+1':m.tag==='neu'?'0':'−1'}</span></li>`).join("");
  document.getElementById("day-schedule").innerHTML = d.schedule.map(s=>`
    <li class="${(s.type==='exam')?'danger':''}"><span class="ms-dot ${s.type}"></span><span class="ms-lbl">${s.label}</span><span class="ms-time">${s.time}</span></li>`).join("");
}

/* ---------------------------------------------------------------
   3) MOOD JOURNAL PAGE — 14-day mock history
--------------------------------------------------------------- */
const JOURNAL = [
  {date:"Today", time:"14:35", emoji:"😞", note:"Exam was harder than expected, tired", score:-2, tag:"neg"},
  {date:"Today", time:"12:50", emoji:"😐", note:"A bit nervous before the exam", score:0, tag:"neu"},
  {date:"Today", time:"08:40", emoji:"😊", note:"Good, ready for lab", score:1, tag:"pos"},
  {date:"Yesterday", time:"22:10", emoji:"😞", note:"Long shift, low energy", score:-1, tag:"neg"},
  {date:"Yesterday", time:"14:40", emoji:"😐", note:"Nervous about tomorrow's exam", score:0, tag:"neu"},
  {date:"Jun 30", time:"16:45", emoji:"😐", note:"Project meeting ran long", score:0, tag:"neu"},
  {date:"Jun 30", time:"09:00", emoji:"😐", note:"Busy but manageable", score:0, tag:"neu"},
  {date:"Jun 29", time:"18:30", emoji:"😐", note:"A bit tired after work", score:0, tag:"neu"},
  {date:"Jun 29", time:"08:10", emoji:"😊", note:"Good start to the week", score:1, tag:"pos"},
  {date:"Jun 27", time:"20:00", emoji:"😊", note:"Calm weekend, caught up on sleep", score:2, tag:"pos"},
  {date:"Jun 26", time:"19:20", emoji:"😢", note:"Overwhelmed with assignments due Monday", score:-2, tag:"neg"},
  {date:"Jun 25", time:"13:10", emoji:"😊", note:"Nice lunch with friends", score:1, tag:"pos"},
  {date:"Jun 24", time:"09:30", emoji:"😊", note:"Feeling rested and focused", score:1, tag:"pos"},
  {date:"Jun 22", time:"21:40", emoji:"😞", note:"Couldn't sleep, mind racing about midterms", score:-2, tag:"neg"},
];

function renderJournal(filter="all"){
  const list = document.getElementById("journal-full-list");
  const items = filter==="all" ? JOURNAL : JOURNAL.filter(j=>j.tag===filter);
  list.innerHTML = items.map(j=>`
    <li><span class="j-emoji">${j.emoji}</span>
      <div class="j-body"><div class="j-note">${j.note}</div><div class="j-meta">${j.date} · ${j.time}</div></div>
      <span class="tag ${j.tag}">${j.score>0?'+':''}${j.score}</span></li>`).join("");
}
function renderJournalStats(){
  const avg = (JOURNAL.reduce((a,j)=>a+j.score,0)/JOURNAL.length).toFixed(1);
  const pos = JOURNAL.filter(j=>j.tag==="pos").length;
  const neg = JOURNAL.filter(j=>j.tag==="neg").length;
  document.getElementById("journal-stats").innerHTML = `
    <div class="metric"><div class="m-val">${JOURNAL.length}</div><div class="m-lbl">Total check-ins (14d)</div></div>
    <div class="metric"><div class="m-val">${avg}</div><div class="m-lbl">Average mood score</div></div>
    <div class="metric"><div class="m-val">${pos}</div><div class="m-lbl">Positive check-ins</div></div>
    <div class="metric warn"><div class="m-val">${neg}</div><div class="m-lbl">Negative check-ins</div></div>
  `;
}
document.getElementById("journal-filters").addEventListener("click", e=>{
  const c = e.target.closest(".chip"); if(!c) return;
  document.querySelectorAll("#journal-filters .chip").forEach(x=>x.classList.remove("active"));
  c.classList.add("active");
  renderJournal(c.dataset.filter);
});

/* ---------------------------------------------------------------
   4) WEEKLY REPORT PAGE
--------------------------------------------------------------- */
function renderReport(){
  document.getElementById("report-stats").innerHTML = `
    <div class="metric"><div class="m-val">64<small> bpm</small></div><div class="m-lbl">Avg resting HR</div></div>
    <div class="metric warn"><div class="m-val">97<small> bpm</small></div><div class="m-lbl">Avg peak HR (exams)</div></div>
    <div class="metric"><div class="m-val">7.1<small> h</small></div><div class="m-lbl">Avg sleep</div></div>
    <div class="metric warn"><div class="m-val">4</div><div class="m-lbl">Negative check-ins</div></div>
  `;
  document.getElementById("report-heatmap").innerHTML = `
    <div class="heat-row"><span class="heat-rowlabel">Morning</span>
      <i class="heat-cell l1"></i><i class="heat-cell l2"></i><i class="heat-cell l1"></i><i class="heat-cell l3"></i><i class="heat-cell l2"></i><i class="heat-cell l0"></i><i class="heat-cell l0"></i></div>
    <div class="heat-row"><span class="heat-rowlabel">Afternoon</span>
      <i class="heat-cell l2"></i><i class="heat-cell l1"></i><i class="heat-cell l3"></i><i class="heat-cell l4"></i><i class="heat-cell l3"></i><i class="heat-cell l1"></i><i class="heat-cell l0"></i></div>
    <div class="heat-row"><span class="heat-rowlabel">Evening</span>
      <i class="heat-cell l1"></i><i class="heat-cell l0"></i><i class="heat-cell l2"></i><i class="heat-cell l2"></i><i class="heat-cell l1"></i><i class="heat-cell l0"></i><i class="heat-cell l0"></i></div>
    <div class="heat-daylabels"><span></span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
  `;
  const trend = [
    {d:"Mon", v:64}, {d:"Tue", v:65}, {d:"Wed", v:65}, {d:"Thu", v:70},
    {d:"Fri", v:64}, {d:"Sat", v:62}, {d:"Sun", v:62},
  ];
  const max = Math.max(...trend.map(t=>t.v));
  document.getElementById("report-trend").innerHTML = trend.map(t=>`
    <div class="trend-row"><span class="tr-lbl">${t.d}</span>
      <div class="tr-track"><div class="tr-fill${t.v>=68?' high':''}" style="width:${(t.v/max)*100}%"></div></div>
      <span class="tr-val">${t.v} bpm</span></div>`).join("");
  document.getElementById("report-insights").innerHTML = `
    <div class="insight-item"><div class="insight-ic ic-sleep">🌙</div><div>
      <div class="insight-t">Going to bed 30 minutes earlier on Sundays noticeably lowered your resting heart rate on Monday.</div>
      <div class="insight-tag">Sleep</div></div></div>
    <div class="insight-item"><div class="insight-ic ic-breath">🫁</div><div>
      <div class="insight-t">Thursday's exam pushed your heart rate 19% above baseline — the sharpest spike of the week.</div>
      <div class="insight-tag">Heart rate</div></div></div>
    <div class="insight-item"><div class="insight-ic ic-sched">📚</div><div>
      <div class="insight-t">3 of 4 negative check-ins this week landed right after an exam or a long work shift.</div>
      <div class="insight-tag">Schedule</div></div></div>
  `;
}

/* ---------------------------------------------------------------
   5) ANONYMOUS SPACE PAGE
--------------------------------------------------------------- */
const POSTS = [
  {avatar:"K21", cls:"avatar-a", time:"2 hours ago", tag:"Exam stress", likes:14,
    text:"Just finished my Calculus exam, my heart was pounding 😅 Anyone have tips for breathing mid-exam?"},
  {avatar:"K22", cls:"avatar-b", time:"5 hours ago", tag:"Sleep", likes:9,
    text:"Schedule's packed this week — started sleeping before 11pm and my daytime heart rate feels a lot better."},
  {avatar:"K20", cls:"avatar-a", time:"7 hours ago", tag:"Breathing", likes:21,
    text:"Box breathing before my presentation actually worked. Didn't expect a 4-4-4-4 count to help that much."},
  {avatar:"K21", cls:"avatar-b", time:"Yesterday", tag:"Exam stress", likes:31,
    text:"Three exams this week and I can feel it. Anyone else's app flagging a 'danger zone' non-stop? lol"},
  {avatar:"K23", cls:"avatar-a", time:"Yesterday", tag:"General", likes:6,
    text:"Small win: made it to every lecture this week despite the deadlines. Celebrating the small stuff."},
  {avatar:"K22", cls:"avatar-b", time:"2 days ago", tag:"Sleep", likes:17,
    text:"Naps between classes are underrated. 20 minutes and I'm a different person."},
  {avatar:"K20", cls:"avatar-a", time:"3 days ago", tag:"Exam stress", likes:12,
    text:"Anyone want to form a study group for finals? Kind of tired of studying alone in the library."},
  {avatar:"K21", cls:"avatar-b", time:"3 days ago", tag:"General", likes:8,
    text:"Reminder that the campus counseling office has walk-in hours on Wednesdays. Free and confidential."},
];

function renderAnon(filter="All"){
  const list = document.getElementById("anon-list");
  const items = filter==="All" ? POSTS : POSTS.filter(p=>p.tag===filter);
  list.innerHTML = items.map(p=>`
    <div class="community-post">
      <div class="cp-head"><span class="cp-avatar ${p.cls}">${p.avatar}</span><span class="cp-time">${p.time}</span></div>
      <p>"${p.text}"</p>
      <span class="cp-tag">${p.tag}</span>
      <div class="cp-likes">❤ ${p.likes} students felt the same</div>
    </div>`).join("");
}
document.getElementById("anon-filters").addEventListener("click", e=>{
  const c = e.target.closest(".chip"); if(!c) return;
  document.querySelectorAll("#anon-filters .chip").forEach(x=>x.classList.remove("active"));
  c.classList.add("active");
  renderAnon(c.dataset.filter);
});
document.getElementById("composer-tags").addEventListener("click", e=>{
  const c = e.target.closest(".chip"); if(!c) return;
  document.querySelectorAll("#composer-tags .chip").forEach(x=>x.classList.remove("active"));
  c.classList.add("active");
});
document.getElementById("composer-post").addEventListener("click", ()=>{
  const text = document.getElementById("composer-text").value.trim();
  if(!text) return;
  const tag = document.querySelector("#composer-tags .chip.active")?.dataset.tag || "General";
  POSTS.unshift({avatar:"You", cls:"avatar-a", time:"Just now", tag, likes:0, text});
  document.getElementById("composer-text").value = "";
  document.querySelectorAll("#anon-filters .chip").forEach(x=>x.classList.remove("active"));
  document.querySelector('#anon-filters .chip[data-filter="All"]').classList.add("active");
  renderAnon("All");
});

/* ---------------------------------------------------------------
   6) SETTINGS PAGE
--------------------------------------------------------------- */
document.querySelectorAll("#page-settings .switch").forEach(sw=>{
  sw.addEventListener("click", ()=> sw.classList.toggle("on"));
});
function note(t){ document.getElementById("settings-note").textContent = t; }
document.getElementById("settings-export").addEventListener("click", ()=> note("Created a biological data export (.json) — ready to download."));
document.getElementById("settings-share").addEventListener("click", ()=> note("Timeline sharing with the campus counselor has been turned on."));
document.getElementById("settings-delete").addEventListener("click", ()=>{
  if(confirm("Permanently delete all your data? This can't be undone.")) note("Account & data have been permanently deleted.");
});

/* ---------------------------------------------------------------
   INIT
--------------------------------------------------------------- */
renderDayChips();
renderDay("thu");
renderJournalStats();
renderJournal("all");
renderReport();
renderAnon("All");
