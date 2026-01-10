import { useState, useEffect, useRef } from "react";
import styles from "./Assistant.module.css";

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your AI Academic Assistant. Ask me anything related to your university or academics.",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user's message
    const userMsg = {
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/assistant/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();

      const botMsg = {
        sender: "bot",
        text: data.answer || "Sorry, I couldn't find an answer for that.",
        source: data.source,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error:", error);
      const botErrorMsg = {
        sender: "bot",
        text: "Oops! Something went wrong. Please try again.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botErrorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.assistantPage}>
      <div className={styles.assistantContainer}>
        {/* Chat Header */}
        <div className={styles.chatHeader}>
          <div className={styles.headerContent}>
            <div className={styles.aiAvatar}>
              <i className="bi bi-robot"></i>
              <span className={styles.statusDot}></span>
            </div>
            <div className={styles.headerInfo}>
              <h2 className={styles.headerTitle}>AI Academic Assistant</h2>
              <p className={styles.headerStatus}>
                <span className={styles.onlineIndicator}>●</span>
                Online - Ready to help
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.headerButton} title="Clear chat">
              <i className="bi bi-trash"></i>
            </button>
            <button className={styles.headerButton} title="Settings">
              <i className="bi bi-gear"></i>
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className={styles.chatMessages}>
          <div className={styles.messagesContainer}>
            {/* Welcome Banner */}
            <div className={styles.welcomeBanner}>
              <div className={styles.welcomeIcon}>
                <i className="bi bi-stars"></i>
              </div>
              <h3 className={styles.welcomeTitle}>Welcome to AI Assistant</h3>
              <p className={styles.welcomeText}>
                Get instant help with your academic questions. Ask about any subject
                and receive detailed explanations.
              </p>
              <div className={styles.suggestedQuestions}>
                <button className={styles.suggestedButton}>
                  <i className="bi bi-lightbulb"></i>
                  What courses are available?
                </button>
                <button className={styles.suggestedButton}>
                  <i className="bi bi-lightbulb"></i>
                  How do I submit assignments?
                </button>
                <button className={styles.suggestedButton}>
                  <i className="bi bi-lightbulb"></i>
                  Explain calculus derivatives
                </button>
              </div>
            </div>

            {/* Messages */}
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${styles.messageWrapper} ${
                  msg.sender === "bot" ? styles.botMessage : styles.userMessage
                }`}
              >
                {msg.sender === "bot" && (
                  <div className={styles.botAvatar}>
                    <i className="bi bi-robot"></i>
                  </div>
                )}
                
                <div className={styles.messageBubble}>
                  <div className={styles.messageContent}>
                    <p className={styles.messageText}>{msg.text}</p>
                  </div>
                  <div className={styles.messageFooter}>
                    <span className={styles.messageTime}>
                      <i className="bi bi-clock"></i>
                      {msg.time}
                    </span>
                    {msg.source && (
                      <span
                        className={`${styles.sourceBadge} ${
                          msg.source === "database"
                            ? styles.sourceDatabase
                            : styles.sourceAI
                        }`}
                      >
                        {msg.source === "database" ? (
                          <>
                            <i className="bi bi-book"></i>
                            Knowledge Base
                          </>
                        ) : (
                          <>
                            <i className="bi bi-stars"></i>
                            AI Generated
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {msg.sender === "user" && (
                  <div className={styles.userAvatar}>
                    <i className="bi bi-person"></i>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className={`${styles.messageWrapper} ${styles.botMessage}`}>
                <div className={styles.botAvatar}>
                  <i className="bi bi-robot"></i>
                </div>
                <div className={styles.messageBubble}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef}></div>
          </div>
        </div>

        {/* Chat Input */}
        <div className={styles.chatInput}>
          <div className={styles.inputContainer}>
            <button className={styles.attachButton} title="Attach file">
              <i className="bi bi-paperclip"></i>
            </button>
            <textarea
              className={styles.inputField}
              placeholder="Type your question here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              rows="1"
            />
            <button
              className={styles.sendButton}
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              title="Send message"
            >
              {isTyping ? (
                <div className={styles.buttonSpinner}></div>
              ) : (
                <i className="bi bi-send-fill"></i>
              )}
            </button>
          </div>
          <div className={styles.inputFooter}>
            <p className={styles.inputHint}>
              <i className="bi bi-info-circle"></i>
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
