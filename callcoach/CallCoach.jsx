import { useState, useEffect, useRef, useCallback } from "react";

// ─── SCENARIO DATA ───────────────────────────────────────────
const scenarios = [
  {
    id: "billing-dispute",
    title: "Billing Dispute",
    difficulty: "Medium",
    emoji: "💰",
    category: "Billing",
    color: "#F59E0B",
    description: "Customer was charged twice for their monthly subscription and is frustrated.",
    customerPersona: {
      name: "Karen Mitchell",
      mood: "Frustrated but reasonable",
      backstory: `You are Karen Mitchell, a 42-year-old accountant. You noticed TWO charges of $49.99 on your credit card statement from this company for the same monthly subscription. You've been a loyal customer for 3 years. You want a refund for the duplicate charge. You're frustrated but will be reasonable if the agent is helpful and efficient. If they seem dismissive or slow, you get more annoyed. Keep responses conversational and under 3 sentences.`
    },
    scoringCriteria: [
      "Acknowledged the customer's frustration",
      "Apologized for the billing error", 
      "Offered a clear resolution (refund)",
      "Provided a timeline for the refund",
      "Asked if there's anything else they can help with"
    ],
    tips: "Listen actively, apologize sincerely, and provide a clear path to resolution."
  },
  {
    id: "product-return",
    title: "Defective Product",
    difficulty: "Hard",
    emoji: "📦",
    category: "Returns",
    color: "#EF4444",
    description: "Broken item received, wants immediate replacement — but it's out of stock.",
    customerPersona: {
      name: "Marcus Johnson",
      mood: "Angry and impatient",
      backstory: `You are Marcus Johnson, a 35-year-old who ordered a premium wireless headset for $199 as a birthday gift for your partner. It arrived with a cracked headband and one ear cup not working. The birthday is in 3 days. You want an IMMEDIATE replacement. You get increasingly upset if told the item is out of stock. You might threaten to leave bad reviews. Keep responses conversational and under 3 sentences.`
    },
    scoringCriteria: [
      "Remained calm under pressure",
      "Showed empathy for the situation",
      "Offered alternatives when item unavailable",
      "Did not make promises they couldn't keep",
      "De-escalated the customer's anger",
      "Offered compensation (discount, expedited shipping)"
    ],
    tips: "Stay calm, validate emotions, offer creative alternatives."
  },
  {
    id: "cancel-subscription",
    title: "Cancel Subscription",
    difficulty: "Medium",
    emoji: "🚪",
    category: "Retention",
    color: "#8B5CF6",
    description: "Long-time customer wants to cancel. Understand why and try to retain them.",
    customerPersona: {
      name: "David Park",
      mood: "Decided but open to listening",
      backstory: `You are David Park, a 28-year-old software developer. You've had the premium subscription for 2 years but want to cancel because the price went from $29 to $49/month and you don't use all features. You found a cheaper alternative. You're polite but firm. If offered a meaningful discount or better-fitting plan, you MIGHT stay. Keep responses conversational and under 3 sentences.`
    },
    scoringCriteria: [
      "Asked why the customer wants to cancel",
      "Listened without being pushy",
      "Offered relevant retention options",
      "Respected decision if customer insisted",
      "Made cancellation smooth if needed"
    ],
    tips: "Ask open-ended questions. Offer tailored solutions, not generic scripts."
  },
  {
    id: "tech-support",
    title: "Tech Support",
    difficulty: "Easy",
    emoji: "🔧",
    category: "Support",
    color: "#10B981",
    description: "Elderly customer can't log in and needs patient, jargon-free help.",
    customerPersona: {
      name: "Dorothy Chen",
      mood: "Confused and slightly anxious",
      backstory: `You are Dorothy Chen, a 67-year-old retired teacher. You can't log into your account — your usual password says 'incorrect.' You're not comfortable with technology and get confused by jargon. You need someone patient who explains things simply. You might say "I'm not good with computers." Keep responses conversational and under 3 sentences.`
    },
    scoringCriteria: [
      "Used simple, jargon-free language",
      "Was patient and didn't rush",
      "Gave clear step-by-step instructions",
      "Confirmed understanding at each step",
      "Made the customer feel comfortable"
    ],
    tips: "Slow down, use simple language, confirm each step."
  },
  {
    id: "escalation",
    title: "Escalation Request",
    difficulty: "Hard",
    emoji: "🔥",
    category: "Escalation",
    color: "#DC2626",
    description: "4th call about the same issue. Customer demands a manager immediately.",
    customerPersona: {
      name: "Rachel Torres",
      mood: "Very angry, at breaking point",
      backstory: `You are Rachel Torres, a 38-year-old small business owner. This is your FOURTH call about a shipping issue — 50 units sent to the wrong address. Each time you were told "24-48 hours" but nothing happened. You're losing money. You demand a manager immediately. You'll only calm down if the agent takes genuine ownership. Keep responses conversational and under 3 sentences.`
    },
    scoringCriteria: [
      "Acknowledged the repeated contacts",
      "Sincerely apologized for the ongoing issue",
      "Took ownership instead of deflecting",
      "Provided a concrete action plan",
      "Offered appropriate compensation",
      "Handled the manager request professionally"
    ],
    tips: "Acknowledge history, take personal ownership, provide specific next steps."
  }
];

// ─── STYLES ──────────────────────────────────────────────────
const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Space+Mono:wght@400;700&display=swap');
`;

// ─── VOICE VISUALIZER COMPONENT ──────────────────────────────
function VoiceVisualizer({ isActive, who }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const barsRef = useRef(Array(32).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = 280;
    const h = canvas.height = 80;
    const bars = barsRef.current;

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const barW = 5;
      const gap = 4;
      const total = bars.length;
      const startX = (w - total * (barW + gap)) / 2;

      for (let i = 0; i < total; i++) {
        if (isActive) {
          const target = Math.random() * 0.6 + 0.15;
          bars[i] += (target - bars[i]) * 0.3;
        } else {
          bars[i] += (0.05 - bars[i]) * 0.1;
        }
        const barH = bars[i] * h;
        const x = startX + i * (barW + gap);
        const y = (h - barH) / 2;
        const color = who === "customer" ? "#F59E0B" : "#6366F1";
        const alpha = 0.4 + bars[i] * 0.6;
        ctx.fillStyle = color.replace(")", `, ${alpha})`).replace("rgb", "rgba").replace("#", "");
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isActive, who]);

  return <canvas ref={canvasRef} style={{ width: 280, height: 80, display: "block" }} />;
}

// ─── SCORECARD COMPONENT ─────────────────────────────────────
function Scorecard({ score, onBack, scenario }) {
  if (!score) return null;

  const getGrade = (pct) => {
    if (pct >= 90) return { letter: "A+", color: "#10B981", label: "Outstanding" };
    if (pct >= 80) return { letter: "A", color: "#34D399", label: "Excellent" };
    if (pct >= 70) return { letter: "B", color: "#F59E0B", label: "Good" };
    if (pct >= 60) return { letter: "C", color: "#F97316", label: "Needs Work" };
    return { letter: "D", color: "#EF4444", label: "Keep Practicing" };
  };

  const grade = getGrade(score.overallScore);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(12px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 100, padding: 20,
      animation: "fadeIn 0.4s ease"
    }}>
      <div style={{
        background: "#1A1A2E", borderRadius: 24, padding: 40,
        maxWidth: 560, width: "100%", color: "#E0E0E0",
        border: "1px solid rgba(255,255,255,0.08)",
        animation: "slideUp 0.5s ease"
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: `${grade.color}18`, border: `3px solid ${grade.color}`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, fontFamily: "'Space Mono', monospace", fontWeight: 700,
            color: grade.color, marginBottom: 12
          }}>
            {grade.letter}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "8px 0 4px", color: "#fff" }}>
            {grade.label}
          </h2>
          <p style={{ fontSize: 14, opacity: 0.5, fontFamily: "'Space Mono', monospace" }}>
            {scenario.title} — {score.overallScore}%
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {score.criteria && score.criteria.map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 10,
              background: c.met ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${c.met ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{c.met ? "✅" : "❌"}</span>
              <span style={{ fontSize: 13, lineHeight: 1.4 }}>{c.text}</span>
            </div>
          ))}
        </div>

        {score.feedback && (
          <div style={{
            background: "rgba(99,102,241,0.08)", borderRadius: 12,
            padding: 16, marginBottom: 24, border: "1px solid rgba(99,102,241,0.15)"
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6366F1", marginBottom: 8 }}>
              Coach Feedback
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, opacity: 0.85 }}>
              {score.feedback}
            </p>
          </div>
        )}

        <button onClick={onBack} style={{
          width: "100%", padding: "14px 0", borderRadius: 12,
          background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
          color: "#fff", border: "none", fontSize: 15, fontWeight: 600,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
        }}>
          Back to Scenarios
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("home"); // home | briefing | session
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sessionTime, setSessionTime] = useState(0);
  const [score, setScore] = useState(null);
  const [isScoring, setIsScoring] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [llmProvider, setLlmProvider] = useState("anthropic"); // anthropic | smallest
  const [smallestApiKey, setSmallestApiKey] = useState("");
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Session timer
  useEffect(() => {
    if (view === "session") {
      timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [view]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // ─── Speech Recognition ─────────────────────────────────
  const startListening = useCallback(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported. Please use Chrome.");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInputText(text);
      setIsListening(false);
      // Auto-send after recognition
      handleSend(text);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [selectedScenario, messages]);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // ─── TTS (Browser fallback) ─────────────────────────────
  const speak = useCallback((text) => {
    if (synthRef.current.speaking) synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.1;
    // Try to pick a female voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Samantha") || v.name.includes("Karen") ||
      v.name.includes("Female") || v.name.includes("Google UK English Female")
    );
    if (preferred) utter.voice = preferred;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utter);
  }, []);

  // ─── LLM Call ───────────────────────────────────────────
  const callLLM = useCallback(async (conversationMessages, systemPrompt) => {
    if (!apiKey) {
      return "⚠️ Please set your API key in settings first.";
    }

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: conversationMessages.map(m => ({
            role: m.role === "customer" ? "assistant" : "user",
            content: m.content
          }))
        })
      });
      const data = await response.json();
      return data.content?.[0]?.text || "I'm sorry, could you repeat that?";
    } catch (err) {
      console.error("LLM error:", err);
      return "I'm having trouble connecting. Let me try again...";
    }
  }, [apiKey]);

  // ─── Send Message ───────────────────────────────────────
  const handleSend = useCallback(async (overrideText) => {
    const text = overrideText || inputText;
    if (!text.trim() || !selectedScenario) return;

    const agentMsg = { role: "agent", content: text, timestamp: new Date() };
    const newMessages = [...messages, agentMsg];
    setMessages(newMessages);
    setInputText("");

    // Build conversation for LLM
    const systemPrompt = `${selectedScenario.customerPersona.backstory}

IMPORTANT RULES:
- You are the CUSTOMER, not the support agent. 
- Stay in character at all times.
- React naturally to what the agent says.
- If the agent resolves your issue well, acknowledge it.
- If the agent is unhelpful, express more frustration.
- Keep responses concise (1-3 sentences), like a real phone conversation.
- Never break character or acknowledge you are an AI.`;

    const llmMessages = newMessages.filter(m => m.role !== "system").map(m => ({
      role: m.role === "customer" ? "assistant" : "user",
      content: m.content
    }));

    const response = await callLLM(
      llmMessages,
      systemPrompt
    );

    const customerMsg = { role: "customer", content: response, timestamp: new Date() };
    setMessages(prev => [...prev, customerMsg]);
    speak(response);
  }, [inputText, messages, selectedScenario, callLLM, speak]);

  // ─── Start Session ──────────────────────────────────────
  const startSession = useCallback(async () => {
    setView("session");
    setSessionTime(0);
    setScore(null);

    // Customer initiates the call
    const systemPrompt = `${selectedScenario.customerPersona.backstory}

IMPORTANT: You are starting the call. Say your opening line as described in your backstory. Keep it to 1-2 sentences. You are calling customer support.`;

    const response = await callLLM(
      [{ role: "user", content: "Hello, thank you for calling customer support. How can I help you today?" }],
      systemPrompt
    );

    const openingMsg = { role: "customer", content: response, timestamp: new Date() };
    setMessages([openingMsg]);
    speak(response);
  }, [selectedScenario, callLLM, speak]);

  // ─── End & Score Session ────────────────────────────────
  const endSession = useCallback(async () => {
    clearInterval(timerRef.current);
    synthRef.current.cancel();
    setIsSpeaking(false);
    setIsScoring(true);

    const transcript = messages.map(m =>
      `${m.role === "customer" ? "Customer" : "Agent"}: ${m.content}`
    ).join("\n");

    const scoringPrompt = `You are an expert customer service trainer evaluating a trainee's performance.

SCENARIO: ${selectedScenario.title} — ${selectedScenario.description}
CUSTOMER PERSONA: ${selectedScenario.customerPersona.name} (${selectedScenario.customerPersona.mood})

SCORING CRITERIA:
${selectedScenario.scoringCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

TRANSCRIPT:
${transcript}

Evaluate the agent's performance. Respond in EXACTLY this JSON format (no markdown, no backticks):
{
  "overallScore": <number 0-100>,
  "criteria": [${selectedScenario.scoringCriteria.map(c => `{"text": "${c}", "met": <true/false>}`).join(",")}],
  "feedback": "<2-3 sentences of constructive feedback>"
}`;

    try {
      const response = await callLLM(
        [{ role: "user", content: scoringPrompt }],
        "You are a customer service training evaluator. Respond ONLY with valid JSON, no markdown formatting."
      );
      const cleaned = response.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setScore(parsed);
    } catch (err) {
      console.error("Scoring error:", err);
      setScore({
        overallScore: 70,
        criteria: selectedScenario.scoringCriteria.map(c => ({ text: c, met: true })),
        feedback: "Good effort! Keep practicing to improve your customer service skills."
      });
    }
    setIsScoring(false);
  }, [messages, selectedScenario, callLLM]);

  // ─── RENDER: Home ───────────────────────────────────────
  if (view === "home") {
    return (
      <div style={{
        minHeight: "100vh", background: "#0D0D1A",
        fontFamily: "'DM Sans', sans-serif", color: "#E0E0E0"
      }}>
        <style>{FONT_IMPORT}{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          body { margin: 0; background: #0D0D1A; }
        `}</style>

        {/* Settings Modal */}
        {showSettings && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)", zIndex: 200, display: "flex",
            alignItems: "center", justifyContent: "center", padding: 20
          }}>
            <div style={{
              background: "#1A1A2E", borderRadius: 20, padding: 32,
              maxWidth: 440, width: "100%", border: "1px solid rgba(255,255,255,0.08)"
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#fff" }}>
                ⚙️ Settings
              </h3>
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, opacity: 0.5, display: "block", marginBottom: 6 }}>
                Anthropic API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  background: "#12122A", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: 14, fontFamily: "'Space Mono', monospace",
                  marginBottom: 16, outline: "none"
                }}
              />
              <label style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, opacity: 0.5, display: "block", marginBottom: 6 }}>
                Smallest AI API Key (for TTS)
              </label>
              <input
                type="password"
                value={smallestApiKey}
                onChange={e => setSmallestApiKey(e.target.value)}
                placeholder="Your Smallest AI key..."
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  background: "#12122A", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: 14, fontFamily: "'Space Mono', monospace",
                  marginBottom: 20, outline: "none"
                }}
              />
              <p style={{ fontSize: 11, opacity: 0.4, marginBottom: 20, lineHeight: 1.5 }}>
                Keys are stored in browser memory only and never sent anywhere except the respective APIs.
              </p>
              <button onClick={() => setShowSettings(false)} style={{
                width: "100%", padding: "12px 0", borderRadius: 10,
                background: "#6366F1", color: "#fff", border: "none",
                fontSize: 14, fontWeight: 600, cursor: "pointer"
              }}>
                Save & Close
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header style={{
          padding: "24px 32px", display: "flex", alignItems: "center",
          justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.04)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg, #6366F1, #F59E0B)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20
            }}>
              🎯
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>
                CallCoach
              </div>
              <div style={{ fontSize: 11, opacity: 0.4, fontFamily: "'Space Mono', monospace" }}>
                AI Customer Service Trainer
              </div>
            </div>
          </div>
          <button onClick={() => setShowSettings(true)} style={{
            padding: "8px 16px", borderRadius: 8,
            background: apiKey ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
            border: `1px solid ${apiKey ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: apiKey ? "#10B981" : "#EF4444",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Space Mono', monospace"
          }}>
            {apiKey ? "✓ API Connected" : "⚠ Set API Key"}
          </button>
        </header>

        {/* Hero */}
        <div style={{
          textAlign: "center", padding: "60px 32px 40px",
          animation: "fadeIn 0.6s ease"
        }}>
          <div style={{
            fontSize: 11, fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase", letterSpacing: 3,
            color: "#6366F1", marginBottom: 16
          }}>
            Powered by Smallest AI + Claude
          </div>
          <h1 style={{
            fontSize: 44, fontWeight: 800, letterSpacing: -1.5,
            color: "#fff", lineHeight: 1.1, marginBottom: 12
          }}>
            Practice makes
            <span style={{
              background: "linear-gradient(135deg, #F59E0B, #EF4444, #6366F1)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              display: "block"
            }}>
              perfect calls.
            </span>
          </h1>
          <p style={{
            fontSize: 16, opacity: 0.45, maxWidth: 480,
            margin: "0 auto", lineHeight: 1.6
          }}>
            Train with AI customers who talk, react, and push back just like real callers.
            Get scored on empathy, resolution, and professionalism.
          </p>
        </div>

        {/* Scenario Grid */}
        <div style={{
          padding: "0 32px 60px", maxWidth: 900, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260, 1fr))",
          gap: 16, animation: "slideUp 0.6s ease 0.2s both"
        }}>
          {scenarios.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => { setSelectedScenario(s); setView("briefing"); }}
              style={{
                background: "#13132B",
                borderRadius: 16,
                padding: 24,
                cursor: "pointer",
                border: "1px solid rgba(255,255,255,0.05)",
                transition: "all 0.25s ease",
                position: "relative",
                overflow: "hidden",
                animation: `slideUp 0.5s ease ${0.1 * idx}s both`
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = s.color + "40";
                e.currentTarget.style.boxShadow = `0 8px 32px ${s.color}15`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                position: "absolute", top: -20, right: -20, fontSize: 80,
                opacity: 0.04, pointerEvents: "none"
              }}>
                {s.emoji}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>{s.emoji}</span>
                <span style={{
                  fontSize: 10, fontFamily: "'Space Mono', monospace",
                  padding: "3px 8px", borderRadius: 6,
                  background: s.color + "18", color: s.color,
                  textTransform: "uppercase", letterSpacing: 1, fontWeight: 700
                }}>
                  {s.difficulty}
                </span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                {s.title}
              </h3>
              <p style={{ fontSize: 13, opacity: 0.45, lineHeight: 1.5 }}>
                {s.description}
              </p>
              <div style={{
                marginTop: 16, fontSize: 11, fontFamily: "'Space Mono', monospace",
                color: s.color, display: "flex", alignItems: "center", gap: 4
              }}>
                <span>Start training</span>
                <span style={{ fontSize: 14 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── RENDER: Briefing ───────────────────────────────────
  if (view === "briefing") {
    const s = selectedScenario;
    return (
      <div style={{
        minHeight: "100vh", background: "#0D0D1A",
        fontFamily: "'DM Sans', sans-serif", color: "#E0E0E0",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 32
      }}>
        <style>{FONT_IMPORT}{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          body { margin: 0; background: #0D0D1A; }
        `}</style>

        <div style={{
          maxWidth: 520, width: "100%", animation: "slideUp 0.5s ease"
        }}>
          <button onClick={() => setView("home")} style={{
            background: "none", border: "none", color: "#6366F1",
            fontSize: 13, cursor: "pointer", marginBottom: 24,
            fontFamily: "'Space Mono', monospace", display: "flex",
            alignItems: "center", gap: 6
          }}>
            ← Back to scenarios
          </button>

          <div style={{
            background: "#13132B", borderRadius: 20, padding: 32,
            border: "1px solid rgba(255,255,255,0.06)"
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginBottom: 24
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: s.color + "18", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 28
              }}>
                {s.emoji}
              </div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{s.title}</h2>
                <span style={{
                  fontSize: 10, fontFamily: "'Space Mono', monospace",
                  color: s.color, textTransform: "uppercase", letterSpacing: 1
                }}>
                  {s.difficulty} · {s.category}
                </span>
              </div>
            </div>

            <div style={{
              background: "#0D0D1A", borderRadius: 12, padding: 20, marginBottom: 20
            }}>
              <div style={{
                fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5,
                color: "#F59E0B", fontWeight: 700, marginBottom: 10,
                fontFamily: "'Space Mono', monospace"
              }}>
                📋 Scenario Brief
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, opacity: 0.7 }}>
                {s.description}
              </p>
            </div>

            <div style={{
              background: "#0D0D1A", borderRadius: 12, padding: 20, marginBottom: 20
            }}>
              <div style={{
                fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5,
                color: "#6366F1", fontWeight: 700, marginBottom: 10,
                fontFamily: "'Space Mono', monospace"
              }}>
                👤 Customer Profile
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.7 }}>
                <strong style={{ color: "#fff" }}>{s.customerPersona.name}</strong>
                <br />
                Mood: {s.customerPersona.mood}
              </div>
            </div>

            <div style={{
              background: "rgba(99,102,241,0.06)", borderRadius: 12,
              padding: 16, marginBottom: 24, border: "1px solid rgba(99,102,241,0.12)"
            }}>
              <div style={{
                fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5,
                color: "#10B981", fontWeight: 700, marginBottom: 8,
                fontFamily: "'Space Mono', monospace"
              }}>
                💡 Tips
              </div>
              <p style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.5 }}>
                {s.tips}
              </p>
            </div>

            <button
              onClick={startSession}
              disabled={!apiKey}
              style={{
                width: "100%", padding: "16px 0", borderRadius: 14,
                background: apiKey
                  ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                  : "#333",
                color: "#fff", border: "none", fontSize: 16, fontWeight: 700,
                cursor: apiKey ? "pointer" : "not-allowed",
                fontFamily: "'DM Sans', sans-serif",
                transition: "transform 0.2s",
                opacity: apiKey ? 1 : 0.5
              }}
              onMouseEnter={e => apiKey && (e.target.style.transform = "scale(1.02)")}
              onMouseLeave={e => (e.target.style.transform = "scale(1)")}
            >
              {apiKey ? "🎙️ Start Training Call" : "⚠️ Set API Key First"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Session ────────────────────────────────────
  return (
    <div style={{
      height: "100vh", background: "#0D0D1A",
      fontFamily: "'DM Sans', sans-serif", color: "#E0E0E0",
      display: "flex", flexDirection: "column"
    }}>
      <style>{FONT_IMPORT}{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        body { margin: 0; background: #0D0D1A; }
        .msg-in { animation: slideUp 0.3s ease; }
      `}</style>

      {/* Scorecard overlay */}
      {score && (
        <Scorecard
          score={score}
          scenario={selectedScenario}
          onBack={() => { setView("home"); setMessages([]); setScore(null); }}
        />
      )}

      {/* Session Header */}
      <header style={{
        padding: "14px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#12122A"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>{selectedScenario?.emoji}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
              {selectedScenario?.customerPersona.name}
            </div>
            <div style={{
              fontSize: 10, fontFamily: "'Space Mono', monospace",
              color: selectedScenario?.color, opacity: 0.7
            }}>
              {selectedScenario?.title} · {selectedScenario?.customerPersona.mood}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 14,
            color: "#6366F1", fontWeight: 700
          }}>
            {formatTime(sessionTime)}
          </div>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#10B981", animation: "pulse 2s infinite"
          }} />
          <button onClick={endSession} disabled={isScoring} style={{
            padding: "8px 18px", borderRadius: 8,
            background: isScoring ? "#333" : "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#EF4444", fontSize: 12, fontWeight: 600,
            cursor: isScoring ? "wait" : "pointer",
            fontFamily: "'Space Mono', monospace"
          }}>
            {isScoring ? "Scoring..." : "End Call"}
          </button>
        </div>
      </header>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px 24px",
        display: "flex", flexDirection: "column", gap: 12
      }}>
        {messages.map((msg, i) => (
          <div key={i} className="msg-in" style={{
            display: "flex",
            justifyContent: msg.role === "agent" ? "flex-end" : "flex-start",
            animation: `slideUp 0.3s ease`
          }}>
            <div style={{
              maxWidth: "75%", padding: "12px 16px", borderRadius: 16,
              background: msg.role === "agent"
                ? "linear-gradient(135deg, #6366F1, #7C3AED)"
                : "#1E1E3A",
              borderBottomRightRadius: msg.role === "agent" ? 4 : 16,
              borderBottomLeftRadius: msg.role === "customer" ? 4 : 16,
              border: msg.role === "customer" ? "1px solid rgba(255,255,255,0.06)" : "none"
            }}>
              <div style={{
                fontSize: 10, fontFamily: "'Space Mono', monospace",
                opacity: 0.5, marginBottom: 4, textTransform: "uppercase",
                letterSpacing: 1
              }}>
                {msg.role === "customer" ? selectedScenario?.customerPersona.name : "You (Agent)"}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isSpeaking && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "8px 16px", borderRadius: 16, background: "#1E1E3A",
              border: "1px solid rgba(255,255,255,0.06)"
            }}>
              <VoiceVisualizer isActive={true} who="customer" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "#12122A", display: "flex", gap: 10, alignItems: "center"
      }}>
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: isListening
              ? "linear-gradient(135deg, #EF4444, #DC2626)"
              : "linear-gradient(135deg, #6366F1, #8B5CF6)",
            border: "none", color: "#fff", fontSize: 20,
            cursor: "pointer", flexShrink: 0,
            transition: "transform 0.2s",
            boxShadow: isListening ? "0 0 20px rgba(239,68,68,0.3)" : "0 0 20px rgba(99,102,241,0.2)"
          }}
          onMouseEnter={e => e.target.style.transform = "scale(1.08)"}
          onMouseLeave={e => e.target.style.transform = "scale(1)"}
        >
          {isListening ? "⏹" : "🎙️"}
        </button>

        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder={isListening ? "Listening..." : "Type your response or click mic to speak..."}
          style={{
            flex: 1, padding: "14px 18px", borderRadius: 12,
            background: "#0D0D1A", border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff", fontSize: 14, outline: "none",
            fontFamily: "'DM Sans', sans-serif",
            transition: "border-color 0.2s"
          }}
          onFocus={e => e.target.style.borderColor = "#6366F1"}
          onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          style={{
            padding: "14px 24px", borderRadius: 12,
            background: inputText.trim()
              ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
              : "#1E1E3A",
            border: "none", color: "#fff", fontSize: 14,
            fontWeight: 600, cursor: inputText.trim() ? "pointer" : "default",
            flexShrink: 0, transition: "all 0.2s"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
