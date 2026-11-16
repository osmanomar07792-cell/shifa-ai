const chat = document.getElementById("chat");
const form = document.getElementById("chatForm");
const input = document.getElementById("message");
const newChat = document.getElementById("newChat");

let messages = [];

function addMessage(role, content) {
  const item = document.createElement("div");
  item.style.cssText = `
    padding:14px;
    margin:12px 0;
    border-radius:12px;
    line-height:1.9;
    white-space:pre-wrap;
    background:${role === "user" ? "#e5f4f5" : "#f2f5f6"};
  `;

  const label = document.createElement("strong");
  label.textContent = role === "user" ? "شما" : "شفا AI";

  const message = document.createElement("p");
  message.textContent = content;

  item.append(label, message);
  chat.appendChild(item);
  item.scrollIntoView({ behavior: "smooth" });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";
  messages.push({ role: "user", content: text });

  const loading = document.createElement("p");
  loading.textContent = "شفا AI در حال پاسخ‌گویی است...";
  chat.appendChild(loading);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await response.json();
    loading.remove();

    if (!response.ok) {
      throw new Error(data.error || "خطا در دریافت پاسخ");
    }

    addMessage("assistant", data.reply);
    messages.push({ role: "assistant", content: data.reply });

  } catch (error) {
    loading.remove();
    addMessage("assistant", error.message || "ارتباط با سرور برقرار نشد.");
    console.error(error);
  }
});

newChat.addEventListener("click", () => {
  messages = [];
  chat.innerHTML = `
    <section class="welcome">
      <h1>به شفا AI خوش آمدید</h1>
      <p>دستیار هوشمند شما به زبان دری و انگلیسی</p>
      <p>چگونه می‌توانم کمک‌تان کنم؟</p>
    </section>
  `;
});
