# StartupDeck AI

> **Self-hosted, open-source AI for business validation, market analysis, and pitch deck generation. 100% privacy-first.**

---

## 🚀 Overview

StartupDeck AI is a world-class, open-source web app for validating business ideas, analyzing markets, and generating professional pitch decks—powered entirely by open-source LLMs (Ollama, Mistral, LLaMA, etc.).

- **No proprietary APIs** (no OpenAI, Gemini, Claude, etc.)
- **All data stays local**—your ideas never leave your server
- **Modern, beautiful UI** inspired by award-winning design
- **Ready for entrepreneurs, makers, and investors**

---

## ✨ Features

- **AI-Powered Business Validation**: Automated scoring (0-100), SWOT, TAM/SAM/SOM, competitor analysis, actionable recommendations
- **Pitch Deck Generator**: Instantly create investor-ready, 10-slide decks (export/share)
- **Modern UI/UX**: Gradients, animations, responsive, accessible
- **Self-Hosted & Private**: All processing is local; no data sharing
- **Freemium Auth System**: Anonymous trial, sign up for more
- **Open-Source LLMs**: Ollama backend, supports Mistral, LLaMA, etc.
- **Database-Backed**: PostgreSQL with Drizzle ORM
- **No API Keys Required**: 100% open-source stack

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Wouter, React Query
- **Backend**: Node.js, Express, Ollama (local LLM), Drizzle ORM, PostgreSQL
- **Authentication**: Session-based, OAuth-ready, usage tracking
- **Deployment**: Vercel (frontend), local/Colab/HF Spaces for backend

---

## 📸 Screenshots

> _Add screenshots or GIFs of the landing page, validation, and pitch deck UI here._

---

## ⚡ Quick Start

### 1. Clone the Repo
```bash
git clone https://github.com/trynayash/startupdeckai.git
cd startupdeckai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment
- Copy `.env.example` to `.env` and fill in your PostgreSQL and Ollama settings.
- Start Ollama locally (see [Ollama docs](https://ollama.com/)).

### 4. Run the App
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 🧩 Project Structure

- `client/` — React frontend (UI, pages, components)
- `server/` — Express backend (API, LLM, DB)
- `shared/` — Shared TypeScript schemas

---

## 🧠 How It Works

1. **Describe Your Idea**: Enter your business concept
2. **AI Analysis**: Market size, competition, audience, business model
3. **Validation Score**: Get actionable insights and a go/wait/pivot recommendation
4. **Pitch Deck**: Instantly generate a 10-slide, investor-ready deck

---

## 🔒 Privacy & Security
- All AI processing is local (Ollama)
- No data leaves your server
- No third-party API keys required

---

## 🛳️ Deployment
- **Frontend**: Deploy to Vercel, Netlify, or your own server
- **Backend**: Run locally, on Colab, or HF Spaces
- **Database**: PostgreSQL (Neon, Supabase, or self-hosted)

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push and open a PR

---

## 📄 License

MIT — free for personal and commercial use.

---

## 🙏 Credits
- Inspired by [StartupDeck](https://startupdeck.ai/)
- Built with [Ollama](https://ollama.com/), [shadcn/ui](https://ui.shadcn.com/), [Drizzle ORM](https://orm.drizzle.team/), and more

---

## 🌐 Links
- [Live Demo](#) <!-- Add your live link here -->
- [Ollama](https://ollama.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/)

---

> _Ready to validate your next big idea? Start with StartupDeck AI!_ 