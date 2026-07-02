const API_KEY = "YOUR_GEMINI_API_KEY";

const messages = document.getElementById("chatMessages");
const chatBox = document.getElementById("chatBox");
const chatToggle = document.getElementById("chatToggle");
const closeChat = document.getElementById("closeChat");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// Ẩn chat khi mở web
chatBox.style.display = "none";

// Mở chat
chatToggle.addEventListener("click", () => {
  chatBox.style.display = "flex";
  chatToggle.style.display = "none";
  messageInput.focus();
});

// Đóng chat
closeChat.addEventListener("click", () => {
  chatBox.style.display = "none";
  chatToggle.style.display = "block";
});

// Click nút gửi
sendBtn.addEventListener("click", sendMessage);

// Enter để gửi
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function addMessage(role, text) {
  const div = document.createElement("div");

  div.className = role;

  if (role === "ai") {
    div.innerHTML = marked.parse(text);
  } else {
    div.innerText = text;
  }

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
  const text = messageInput.value.trim();

  if (!text) return;

  addMessage("user", text);

  messageInput.value = "";

  const prompt = `
You are MindTrack AI Companion.

You are NOT a doctor.

Current dashboard:

Baseline RHR: 63 bpm
Current RHR: 78 bpm
Sleep: 6.4 hours
Negative check-ins: 2
PSS Score: 21
Exam today: Yes

Student message:
"${text}"

Reply under 120 words.

Use markdown.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    console.log(data);

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Không nhận được phản hồi từ AI.";

    addMessage("ai", reply);
  } catch (err) {
    console.error(err);

    addMessage("ai", "❌ Không thể kết nối tới Gemini.");
  }
}
