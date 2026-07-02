import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, "..", "public")));

// ---------------------------------------------------------------------------
// LỚP DỮ LIỆU MÔ PHỎNG (thực tế sẽ đến từ API thiết bị đeo + DB lịch trình)
// ---------------------------------------------------------------------------

// Track 1 — Lịch trình (dữ liệu tĩnh)
const schedule = [
  { id: "s1", start: 7.0,  end: 11.0, label: "Ca học sáng", type: "class" },
  { id: "s2", start: 11.5, end: 12.5, label: "Ăn trưa",     type: "meal" },
  { id: "s3", start: 13.5, end: 16.0, label: "Thi Giải tích", type: "exam" },
  { id: "s4", start: 18.0, end: 22.0, label: "Làm thêm",     type: "work" },
  { id: "s5", start: 23.5, end: 30.5, label: "Giấc ngủ",     type: "sleep" }
];

// Baseline cá nhân do AI học trong 14 ngày đầu (Giai đoạn 1)
const baseline = {
  restingHR: 68,      // nhịp tim nghỉ trung bình
  sleepHours: 7.5,
  bedtime: 23.5,
  daysLearned: 14
};

// Track 2 — Thể chất: sinh chuỗi nhịp tim theo giờ, cấy độ lệch trong giờ thi
function buildHeartRate() {
  const points = [];
  for (let h = 6; h <= 30; h += 0.5) {
    let hr = baseline.restingHR + Math.round((Math.random() - 0.5) * 6);
    const inExam = h >= 13.5 && h <= 16.0;
    const inSleep = h >= 23.5;
    if (inExam) hr += 18 + Math.round(Math.random() * 8);   // căng thẳng khi thi
    if (inSleep) hr -= 10;
    points.push({ t: h, hr });
  }
  return points;
}

// Track 2 — Giấc ngủ (giai đoạn REM / Deep)
const sleep = [
  { start: 23.5, end: 25.0, stage: "light" },
  { start: 25.0, end: 26.5, stage: "deep" },
  { start: 26.5, end: 28.0, stage: "rem" },
  { start: 28.0, end: 30.5, stage: "light" }
];

const steps = { total: 6420, byHour: [420, 880, 1200, 300, 150, 2100, 900, 470] };

// Track 3 — Tâm lý: các điểm chạm micro check-in
const moods = [
  { t: 8.0,  mood: "neutral", note: "Bình thường", score: 0 },
  { t: 12.5, mood: "good",    note: "Ổn, đã ăn no", score: 1 },
  { t: 16.2, mood: "bad",     note: "Mệt, làm bài không tốt", score: -2 },
  { t: 21.0, mood: "bad",     note: "Kiệt sức", score: -2 }
];

// ---------------------------------------------------------------------------
// AI: PHÁT HIỆN ĐỘ LỆCH (Giai đoạn 2) + CƠ CHẾ LEO THANG
// ---------------------------------------------------------------------------
function analyze(hrPoints) {
  const examHR = hrPoints.filter(p => p.t >= 13.5 && p.t <= 16.0);
  const avgExamHR = Math.round(examHR.reduce((a, p) => a + p.hr, 0) / examHR.length);
  const hrRisePct = Math.round(((avgExamHR - baseline.restingHR) / baseline.restingHR) * 100);

  const negativeMoods = moods.filter(m => m.score <= -2).length;
  const hasExamCluster = schedule.some(s => s.type === "exam");

  // Công thức kích hoạt "Khủng hoảng kép"
  const doubleCrisis = hasExamCluster && hrRisePct >= 15 && negativeMoods >= 2;

  // Vùng nguy hiểm để tô màu timeline
  const dangerZones = [];
  if (hrRisePct >= 15) dangerZones.push({ start: 13.5, end: 16.0, level: "high" });

  let escalation;
  if (doubleCrisis) {
    escalation = {
      level: "medium",
      title: "Phát hiện dấu hiệu căng thẳng kéo dài",
      message: "Nhịp tim nghỉ của bạn tăng cao trong giờ thi kèm phản hồi tiêu cực. Đây là gợi ý, không phải chẩn đoán y tế.",
      actions: [
        { kind: "breathing", label: "Thở Box Breathing (2 phút)" },
        { kind: "counsel", label: "Đặt lịch Phòng tham vấn tâm lý của trường" }
      ]
    };
  } else if (hrRisePct >= 15) {
    escalation = {
      level: "light",
      title: "Nhịp tim tăng trong lúc căng thẳng",
      message: "Thử một bài tập thở ngắn để hạ nhịp tim.",
      actions: [{ kind: "breathing", label: "Thở Box Breathing (2 phút)" }]
    };
  } else {
    escalation = { level: "none", title: "Ổn định", message: "Chưa phát hiện độ lệch bất thường.", actions: [] };
  }

  return { avgExamHR, hrRisePct, negativeMoods, doubleCrisis, dangerZones, escalation };
}

// Tài nguyên cứu trợ — dùng khi phát hiện ý định tự hại (mức Nặng)
const crisisResources = {
  hotlineName: "Đường dây nóng Ngày Mai",
  hotlinePhone: "096.306.1414",
  campusHealth: "Phòng Y tế nội khu",
  note: "AI tạm dừng phân tích. Con người thực là cầu nối cuối cùng. Nếu bạn đang gặp nguy hiểm tức thời, hãy gọi ngay."
};

// ---------------------------------------------------------------------------
// ROUTES
// ---------------------------------------------------------------------------
app.get("/api/timeline", (req, res) => {
  const heartRate = buildHeartRate();
  const insight = analyze(heartRate);
  res.json({ baseline, schedule, heartRate, sleep, steps, moods, insight });
});

// Micro check-in: nhận emoji/câu ngắn, NLP thô đánh giá cảm xúc
app.post("/api/checkin", (req, res) => {
  const { text = "", emoji = "" } = req.body;
  const negWords = ["mệt", "kiệt", "chán", "buồn", "áp lực", "stress", "sợ", "tệ", "không ổn"];
  const t = text.toLowerCase();
  let score = 0;
  if (emoji === "😊" || emoji === "🙂") score = 1;
  if (emoji === "😐") score = 0;
  if (emoji === "😞" || emoji === "😢") score = -2;
  if (negWords.some(w => t.includes(w))) score -= 2;
  const isTerse = text.trim().length > 0 && text.trim().length < 4;
  if (isTerse) score -= 1; // trả lời cộc lốc

  // Phát hiện tín hiệu tự hại -> trả ngay tài nguyên cứu trợ
  const selfHarm = ["tự hại", "tự tử", "kết thúc", "biến mất", "không muốn sống"];
  const redFlag = selfHarm.some(w => t.includes(w));

  res.json({
    score,
    sentiment: score > 0 ? "tích cực" : score === 0 ? "trung tính" : "tiêu cực",
    redFlag,
    resources: redFlag ? crisisResources : null
  });
});

// Thang đo PSS — đối chiếu với suy luận AI (Validation)
app.post("/api/pss", (req, res) => {
  const { answers = [] } = req.body; // mảng 0-4
  const raw = answers.reduce((a, b) => a + b, 0);
  let band = raw <= 13 ? "Thấp" : raw <= 26 ? "Trung bình" : "Cao";
  // AI tự suy luận điểm từ dữ liệu thiết bị (giả lập)
  const aiInferred = 22;
  const match = Math.max(0, 100 - Math.abs(raw - aiInferred) * 3);
  res.json({ pssScore: raw, band, aiInferred, matchPercent: match });
});

app.get("/api/crisis-resources", (req, res) => res.json(crisisResources));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MindTrack chạy tại http://localhost:${PORT}`));
