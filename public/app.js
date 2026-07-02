// ===== MindTrack frontend =====
const H_START = 6, H_END = 30.5;          // 6h sáng -> 6h30 sáng hôm sau
const SPAN = H_END - H_START;
const pct = h => ((h - H_START) / SPAN) * 100;

const fmt = h => {
  const hh = Math.floor(h % 24);
  const mm = Math.round((h % 1) * 60);
  return `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
};

let STATE = null;

async function boot(){
  const res = await fetch("/api/timeline");
  STATE = await res.json();
  renderRuler();
  renderHero();
  renderSchedule();
  renderPhysical();
  renderMood();
  renderPlayhead();
  maybeEscalate();
}

// ---- Ruler ----
function renderRuler(){
  const r = document.getElementById("ruler");
  for(let h=H_START; h<=H_END; h+=3){
    const t = document.createElement("div");
    t.className = "tick";
    t.style.left = pct(h) + "%";
    t.textContent = fmt(h);
    r.appendChild(t);
  }
}

// ---- Hero ----
function renderHero(){
  const {insight, baseline} = STATE;
  const head = document.getElementById("status-headline");
  const sub  = document.getElementById("status-sub");
  if(insight.doubleCrisis){
    head.textContent = "Cần chú ý hôm nay";
    head.style.color = "var(--coral)";
    sub.textContent = "AI phát hiện tín hiệu căng thẳng chồng lấn giữa lịch thi, nhịp tim và cảm xúc. Đây là gợi ý hỗ trợ, không phải chẩn đoán y tế.";
  } else {
    head.textContent = "Nhịp sinh học ổn định";
    sub.textContent = "AI đã học baseline của bạn qua 14 ngày và đang theo dõi độ lệch theo thời gian thực.";
  }
  const m = document.getElementById("hero-metrics");
  const cards = [
    {v:baseline.restingHR, u:"bpm", l:"Nhịp tim nghỉ (baseline)", warn:false},
    {v:insight.avgExamHR, u:"bpm", l:`Nhịp tim giờ thi (+${insight.hrRisePct}%)`, warn:insight.hrRisePct>=15},
    {v:baseline.sleepHours, u:"h", l:"Giấc ngủ trung bình", warn:false},
    {v:insight.negativeMoods, u:"", l:"Check-in tiêu cực hôm nay", warn:insight.negativeMoods>=2},
  ];
  m.innerHTML = cards.map(c=>`
    <div class="metric ${c.warn?"warn":""}">
      <div class="m-val">${c.v}<small> ${c.u}</small></div>
      <div class="m-lbl">${c.l}</div>
    </div>`).join("");
}

// ---- Track 1 ----
function renderSchedule(){
  const lane = document.getElementById("lane-schedule");
  STATE.schedule.forEach(s=>{
    const el = document.createElement("div");
    const danger = STATE.insight.dangerZones.some(z=>s.start<z.end && s.end>z.start);
    el.className = `block ${s.type} ${danger?"danger":""}`;
    el.style.left = pct(s.start)+"%";
    el.style.width = (pct(s.end)-pct(s.start))+"%";
    el.innerHTML = `<div class="b-lbl">${s.label}</div><div class="b-time">${fmt(s.start)}–${fmt(s.end)}</div>`;
    lane.appendChild(el);
  });
}

// ---- Track 2 ----
function renderPhysical(){
  const svg = document.getElementById("hr-svg");
  const W=1000, HT=64;
  svg.setAttribute("viewBox",`0 0 ${W} ${HT}`);
  const pts = STATE.heartRate;
  const hrs = pts.map(p=>p.hr);
  const min = Math.min(...hrs)-4, max = Math.max(...hrs)+4;
  const x = h => ((h-H_START)/SPAN)*W;
  const y = v => HT - ((v-min)/(max-min))*(HT-8) - 4;
  let d = pts.map((p,i)=>`${i?"L":"M"}${x(p.t).toFixed(1)} ${y(p.hr).toFixed(1)}`).join(" ");
  const area = d + ` L ${x(pts.at(-1).t)} ${HT} L ${x(pts[0].t)} ${HT} Z`;

  // vùng nguy hiểm
  const zones = STATE.insight.dangerZones.map(z=>{
    const zx = x(z.start), zw = x(z.end)-x(z.start);
    return `<rect x="${zx}" y="0" width="${zw}" height="${HT}" fill="url(#dz)"/>`;
  }).join("");

  svg.innerHTML = `
    <defs>
      <linearGradient id="hrg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(58,214,197,.35)"/>
        <stop offset="100%" stop-color="rgba(58,214,197,0)"/>
      </linearGradient>
      <pattern id="dz" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill="rgba(255,93,93,.10)"/>
        <rect width="5" height="10" fill="rgba(255,93,93,.20)"/>
      </pattern>
    </defs>
    ${zones}
    <path d="${area}" fill="url(#hrg)"/>
    <path d="${d}" fill="none" stroke="var(--teal)" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
  `;
  // đổi màu đoạn nhịp tim trong vùng nguy hiểm
  STATE.insight.dangerZones.forEach(z=>{
    const seg = pts.filter(p=>p.t>=z.start && p.t<=z.end);
    if(seg.length<2) return;
    const dd = seg.map((p,i)=>`${i?"L":"M"}${x(p.t).toFixed(1)} ${y(p.hr).toFixed(1)}`).join(" ");
    const path = document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d",dd); path.setAttribute("fill","none");
    path.setAttribute("stroke","var(--coral)"); path.setAttribute("stroke-width","2.4");
    path.setAttribute("vector-effect","non-scaling-stroke");
    svg.appendChild(path);
  });

  // giấc ngủ
  const sl = document.getElementById("lane-sleep");
  STATE.sleep.forEach(s=>{
    const seg=document.createElement("div");
    seg.className=`sleep-seg sleep-${s.stage}`;
    seg.style.left=pct(s.start)+"%";
    seg.style.width=(pct(s.end)-pct(s.start))+"%";
    seg.title=`${s.stage.toUpperCase()} · ${fmt(s.start)}–${fmt(s.end)}`;
    sl.appendChild(seg);
  });
}

// ---- Track 3 ----
function renderMood(){
  const lane=document.getElementById("lane-mood");
  const emoji={good:"😊",neutral:"😐",bad:"😞"};
  STATE.moods.forEach(m=>{
    const el=document.createElement("div");
    el.className=`mood-pt ${m.mood}`;
    el.style.left=pct(m.t)+"%";
    el.innerHTML=`${emoji[m.mood]}<span class="mood-tip">${fmt(m.t)} · ${m.note}</span>`;
    lane.appendChild(el);
  });
}

function renderPlayhead(){
  const now = 16.3; // giờ hiện tại giả lập (vừa xong buổi thi)
  document.getElementById("playhead").style.left = `calc(120px + ${pct(now)}% * (100% - 120px) / 100%)`;
  // đơn giản hoá: đặt theo tỉ lệ trong vùng lane
  const ph=document.getElementById("playhead");
  ph.style.left="";
  ph.style.marginLeft="120px";
  ph.style.insetInlineStart=`calc(120px + (100% - 120px) * ${pct(now)/100})`;
}

// ---- Escalation ----
function maybeEscalate(){
  const e = STATE.insight.escalation;
  if(e.level==="none") return;
  showEscalation(e);
}
function showEscalation(e){
  const box=document.getElementById("escalation");
  box.className=`escalation ${e.level==="severe"?"severe-box":""}`;
  box.innerHTML=`
    <div class="esc-level ${e.level}">Mức: ${({light:"Nhẹ",medium:"Trung bình",severe:"Nặng"})[e.level]}</div>
    <h4>${e.title}</h4>
    <p>${e.message}</p>
    <div class="esc-actions">
      ${e.actions.map(a=>`<button data-kind="${a.kind}">${a.label}</button>`).join("")}
    </div>`;
  requestAnimationFrame(()=>box.classList.add("show"));
  box.querySelectorAll("button").forEach(b=>{
    b.onclick=()=>handleAction(b.dataset.kind);
  });
}
function handleAction(kind){
  if(kind==="breathing") openBreathing();
  if(kind==="counsel") alert("Đang mở lịch đặt hẹn với Phòng tham vấn tâm lý của trường…");
}

// ---- Check-in ----
let pickedEmoji="";
document.getElementById("emoji-row").addEventListener("click",e=>{
  const b=e.target.closest("button"); if(!b)return;
  document.querySelectorAll("#emoji-row button").forEach(x=>x.classList.remove("sel"));
  b.classList.add("sel"); pickedEmoji=b.dataset.e;
});
document.getElementById("checkin-send").onclick=async()=>{
  const text=document.getElementById("checkin-text").value;
  const res=await fetch("/api/checkin",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({text,emoji:pickedEmoji})});
  const d=await res.json();
  const out=document.getElementById("checkin-result");
  const cls=d.score>0?"pos":d.score===0?"neu":"neg";
  out.innerHTML=`<span class="tag ${cls}">${d.sentiment}</span> Điểm tâm lý: <b>${d.score}</b>`;
  if(d.redFlag && d.resources){
    showSevere(d.resources);
  } else if(d.score<=-2){
    showEscalation({level:"light",title:"Có vẻ bạn đang mệt",message:"Thử một bài tập thở ngắn nhé.",
      actions:[{kind:"breathing",label:"Thở Box Breathing (2 phút)"}]});
  }
};
function showSevere(r){
  const box=document.getElementById("escalation");
  box.className="escalation severe-box";
  box.innerHTML=`
    <div class="esc-level severe">Bản đồ cứu trợ · Ưu tiên con người</div>
    <h4>Bạn không đơn độc</h4>
    <p>${r.note}</p>
    <div class="hotline">${r.hotlinePhone}</div>
    <p>${r.hotlineName} · ${r.campusHealth}</p>`;
  requestAnimationFrame(()=>box.classList.add("show"));
}

// ---- PSS ----
const pssQ=[
  "Trong tuần qua, bạn thấy khó kiểm soát những việc quan trọng?",
  "Bạn thấy căng thẳng và bồn chồn?",
  "Mọi việc dồn đến mức bạn không thể xử lý xuể?",
  "Bạn thấy tự tin xử lý được vấn đề cá nhân?"
];
const pssPick={};
(function buildPSS(){
  const box=document.getElementById("pss-items");
  pssQ.forEach((q,i)=>{
    const row=document.createElement("div");row.className="pss-item";
    row.innerHTML=`<p>${q}</p><div class="pss-scale">${[0,1,2,3,4].map(n=>`<button data-i="${i}" data-n="${n}">${n}</button>`).join("")}</div>`;
    box.appendChild(row);
  });
  box.addEventListener("click",e=>{
    const b=e.target.closest("button"); if(!b)return;
    const i=b.dataset.i;
    box.querySelectorAll(`button[data-i="${i}"]`).forEach(x=>x.classList.remove("sel"));
    b.classList.add("sel"); pssPick[i]=+b.dataset.n;
  });
})();
document.getElementById("pss-send").onclick=async()=>{
  const answers=pssQ.map((_,i)=>pssPick[i]??0);
  const res=await fetch("/api/pss",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answers})});
  const d=await res.json();
  document.getElementById("pss-result").innerHTML=`
    Điểm PSS: <b>${d.pssScore}</b> — mức <b>${d.band}</b><br>
    AI tự suy luận: <b>${d.aiInferred}</b>
    <div class="match-bar"><div class="match-fill" id="mf"></div></div>
    <span class="muted">Độ trùng khớp AI ↔ PSS: <b>${d.matchPercent}%</b> — càng cao càng đáng tin cậy.</span>`;
  requestAnimationFrame(()=>document.getElementById("mf").style.width=d.matchPercent+"%");
};

// ---- Breathing modal ----
let breatheTimer=null;
function openBreathing(){
  document.getElementById("breathing").classList.remove("hidden");
  const c=document.getElementById("breathe-circle"), t=document.getElementById("breathe-text");
  const steps=[["Hít vào",true],["Giữ",true],["Thở ra",false],["Giữ",false]];
  let i=0;
  const tick=()=>{const[label,exp]=steps[i%4];t.textContent=label;c.classList.toggle("expand",exp);i++;};
  tick(); breatheTimer=setInterval(tick,4000);
}
function closeBreathing(){clearInterval(breatheTimer);document.getElementById("breathing").classList.add("hidden");}

// ---- Modals wiring ----
document.getElementById("privacy-btn").onclick=()=>document.getElementById("privacy").classList.remove("hidden");
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=e=>{
  const m=e.target.closest(".modal");m.classList.add("hidden");
  if(m.id==="breathing")closeBreathing();
});
document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{
  if(e.target===m){m.classList.add("hidden");if(m.id==="breathing")closeBreathing();}
}));
document.getElementById("export-data").onclick=()=>note("Đã tạo file dữ liệu sinh học (.json) — sẵn sàng tải về.");
document.getElementById("share-data").onclick=()=>note("Đã bật chia sẻ timeline với chuyên gia tâm lý của trường.");
document.getElementById("delete-data").onclick=()=>{if(confirm("Xóa vĩnh viễn toàn bộ dữ liệu? Không thể hoàn tác."))note("Tài khoản & dữ liệu đã được xóa vĩnh viễn.");};
function note(t){document.getElementById("privacy-note").textContent=t;}

boot();
