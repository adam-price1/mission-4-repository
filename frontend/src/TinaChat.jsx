import React, { useState } from "react";
import axios from "axios";

function TinaChat() {
  const [messages, setMessages] = useState([
    {
      from: "Tina",
      text: "Hi! I’m Tina, your AI Insurance Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");

  // ✅ dynamic backend URL (works locally or in Docker)
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "Me", text: input }]);
    const currentMessage = input; // keep a copy
    setInput(""); // clear immediately for responsiveness

    try {
      const res = await axios.post(`${backendUrl}/api/chat`, {
        message: currentMessage,
      });
      setMessages((prev) => [...prev, { from: "Tina", text: res.data.reply }]);
    } catch (err) {
      console.error("Chat error:", err.message);
      setMessages((prev) => [
        ...prev,
        { from: "Tina", text: "Sorry, I couldn’t reach the server." },
      ]);
    }
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        padding: 20,
        borderRadius: 8,
        boxShadow: "0 0 10px #ccc",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#004aad" }}>
        Tina – Your AI Insurance Policy Assistant
      </h2>
      <div
        style={{
          height: 300,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ margin: "5px 0" }}>
            <strong>{m.from}:</strong> {m.text}
          </div>
        ))}
      </div>
      <input
        style={{ width: "75%", padding: 5 }}
        type="text"
        value={input}
        placeholder="Type your message..."
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button
        style={{ marginLeft: 10, padding: "5px 10px" }}
        onClick={sendMessage}
      >
        Submit
      </button>
    </div>
  );
}

export default TinaChat;
