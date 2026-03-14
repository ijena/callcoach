# 🎯 CallCoach — AI Customer Service Training Simulator

**Built for the Smallest AI Hackathon**

Train your customer service team with AI-powered customers that talk, react, and push back just like real callers. Get scored on empathy, resolution, and professionalism.

![Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Stack](https://img.shields.io/badge/Smallest_AI-FF6B00?style=flat)
![Stack](https://img.shields.io/badge/Claude-6366F1?style=flat)

---

## How It Works

1. **Pick a Scenario** — Choose from 5 difficulty-rated customer scenarios (billing disputes, angry customers, tech support, etc.)
2. **Read the Brief** — Get context on who you're talking to and tips for handling the situation
3. **Start the Call** — The AI customer initiates the conversation in character
4. **Respond via Voice or Text** — Use your microphone (Chrome) or type your response
5. **Get Scored** — End the call to receive a detailed performance scorecard with per-criteria feedback

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  React App   │────▶│  Node.js API │────▶│  Claude API      │
│  (Frontend)  │     │  (Backend)   │     │  (AI Customer +  │
│              │◀────│              │◀────│   Scoring)       │
└──────┬───────┘     └──────┬───────┘     └──────────────────┘
       │                    │
       │ Web Speech API     │              ┌──────────────────┐
       │ (STT in browser)   └─────────────▶│  Smallest AI     │
       │                                   │  Waves (TTS)     │
       │ Browser TTS                       │  Atoms (Agents)  │
       │ (fallback)                        └──────────────────┘
```

### Integration Points

| Component | Technology | Purpose |
|-----------|-----------|---------|
| LLM (Customer AI) | Claude via Anthropic API | Generates in-character customer responses and scores performance |
| Text-to-Speech | Smallest AI Waves API (with browser TTS fallback) | Gives the AI customer a natural voice |
| Speech-to-Text | Web Speech API (Chrome) | Lets the trainee speak naturally |
| Frontend | React (Vite) | Interactive training interface |
| Backend | Node.js + Express | API proxying and session management |

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- A Smallest AI API key ([smallest.ai](https://smallest.ai))

### 2. Clone & Install

```bash
# Create the project
npx create-vite@latest callcoach -- --template react
cd callcoach

# Install dependencies
npm install

# For the backend
npm install express cors dotenv
```

### 3. Set Up the Frontend

Replace `src/App.jsx` with the contents of **`CallCoach.jsx`** from this project.

### 4. Set Up the Backend

Copy **`server.js`** to your project root, then:

```bash
# Create .env file
cat > .env << 'EOF'
ANTHROPIC_API_KEY=sk-ant-your-key-here
SMALLEST_API_KEY=your-smallest-ai-key-here
PORT=3001
EOF
```

### 5. Run It

```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — Backend  
node server.js
```

Open `http://localhost:5173` and click **Set API Key** to enter your Anthropic key.

---

## Using Smallest AI

### Waves TTS (Text-to-Speech)

The app uses Smallest AI's Waves API to give the AI customer a realistic voice. The backend endpoint `/api/tts` handles this:

```javascript
// Client-side: play AI customer voice via Smallest AI
const playVoice = async (text) => {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId: 'emily' })
  });
  const audioBlob = await res.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  new Audio(audioUrl).play();
};
```

### Atoms Agents (Advanced)

For phone-based training, you can use Smallest AI's Atoms to create a full voice agent that calls the trainee's phone:

```javascript
import { AtomsClient, Configuration } from 'smallestai';

const config = new Configuration({ accessToken: process.env.SMALLEST_API_KEY });
const client = new AtomsClient(config);

// Create a training customer agent
const agent = await client.createAgent({
  displayName: "Karen Mitchell - Billing Dispute",
  voiceId: "emily",
  language: "en",
  // The customer persona prompt
  systemPrompt: scenario.customerPersona.backstory
});

// Place an outbound training call
const call = await client.placeCall({
  agentId: agent.id,
  phoneNumber: "+1234567890"  // trainee's phone
});
```

---

## Scenarios Included

| Scenario | Difficulty | Customer | Key Challenge |
|----------|-----------|----------|---------------|
| 💰 Billing Dispute | Medium | Karen Mitchell | Double-charged, wants refund |
| 📦 Defective Product | Hard | Marcus Johnson | Broken gift, item out of stock |
| 🚪 Cancel Subscription | Medium | David Park | Price increase, found alternative |
| 🔧 Tech Support | Easy | Dorothy Chen | Can't log in, not tech-savvy |
| 🔥 Escalation Request | Hard | Rachel Torres | 4th call, demands manager |

### Adding Custom Scenarios

Edit the `scenarios` array in `CallCoach.jsx`:

```javascript
{
  id: "your-scenario",
  title: "Your Scenario Title",
  difficulty: "Easy|Medium|Hard",
  emoji: "🎯",
  category: "Category",
  color: "#hexcolor",
  description: "Brief description shown on the card.",
  customerPersona: {
    name: "Customer Name",
    mood: "Their emotional state",
    backstory: "Detailed persona prompt for the AI..."
  },
  scoringCriteria: [
    "Criterion 1",
    "Criterion 2"
  ],
  tips: "Helpful tips shown before the call."
}
```

---

## Hackathon Demo Tips

1. **Start with the Easy scenario** (Tech Support) to show the basic flow
2. **Then jump to Hard** (Escalation) to show how the AI adapts to different emotions
3. **Show the scorecard** — judges love seeing measurable training outcomes
4. **Mention the Smallest AI integration** — Waves for TTS, Atoms potential for phone-based training
5. **Talk about the business case** — companies spend $1,200+ per employee on CS training

---

## Tech Stack

- **React** — Frontend UI with voice visualization
- **Vite** — Fast dev server and bundling
- **Node.js + Express** — Backend API
- **Claude (Anthropic)** — AI customer personas and performance scoring
- **Smallest AI Waves** — High-quality text-to-speech
- **Smallest AI Atoms** — Voice agent platform (advanced integration)
- **Web Speech API** — Browser-native speech recognition

---

## License

MIT — Built for the Smallest AI Hackathon 2026
