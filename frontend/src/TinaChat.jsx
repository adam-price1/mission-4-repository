import React, { useState } from "react";
import axios from "axios";
import "./tina.css";

export default function TinaChat() {
  const [messages, setMessages] = useState([
    {
      sender: "Tina",
      text: "I’m Tina. I help you to choose the right insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { sender: "Me", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages.map((m) => ({
      role: m.sender === "Tina" ? "tina" : "user",
      text: m.text,
    }));

    try {
      const { data } = await axios.post("http://localhost:5000/chat", {
        message: userMsg.text,
        history,
      });
      setMessages((prev) => [...prev, { sender: "Tina", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "Tina", text: "Oops, there was a problem." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap">
      <h2>Tina – Your AI Insurance Policy Assistant</h2>
      <div className="chatbox">
        {messages.map((m, i) => (
          <p key={i} className={m.sender === "Me" ? "me" : "tina"}>
            <strong>{m.sender}:</strong> {m.text}
          </p>
        ))}
        {loading && (
          <p className="tina">
            <em>Tina is typing…</em>
          </p>
        )}
      </div>
      <div className="inputrow">
        <input
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading}>
          Submit
        </button>
      </div>
    </div>
  );
}
