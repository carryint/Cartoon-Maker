# 🎨 CartoonMaker AI (Cartoon-Maker)

> **Create realistic and expressive cartoon videos with AI from characters, scripts, and story prompts.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github&logoColor=white)](https://github.com/carryint/Cartoon-Maker.git)

---

## ✨ Overview

**CartoonMaker AI** is a complete, full-featured cartoon video creation studio that turns simple story concepts, character profiles, or raw screenplays into animated cartoon videos.

It features an end-to-end creative pipeline:
1. **AI Script & Screenplay Director**: Transforms natural language prompts into formatted screenplays with structured scenes, camera angles, emotions, and sound cues.
2. **Character Studio & Consistency Vault**: Generates 2D/3D cartoon characters across 6 art styles with matching 9-emotion expression sheets, custom color palettes, and voice persona tuning.
3. **Storyboard Director**: Visual shot-by-shot sequencer with customizable background environments, camera movements (Wide, Dynamic Pan, Close-Up, Dutch Angle), and transitions.
4. **Multi-Track Interactive Timeline**: DAW-style multi-track timeline covering Scene Cuts, Character Lip-Sync Tracks, Sound FX, BGM music loops, and Subtitles.
5. **Real-Time Video Canvas Player**: Real-time canvas compositor rendering animated character breathing, talking lip-sync animations, particle layers (stars, bubbles, speed-lines, hearts, rain), and TikTok-style glowing subtitles.
6. **Video Exporter**: In-browser WebM/MP4 video rendering, Subtitle (.SRT) export, and full project archive JSON export.

---

## 🚀 Key Features

- 🎭 **6 Visual Cartoon Styles**:
  - **Pixar 3D**: Glossy 3D CGI animated feature film look.
  - **Classic 2D Toon**: Saturday morning cartoon style.
  - **Anime Chibi**: Cute expressive eyes and pastel aesthetics.
  - **Claymation**: Tactile stop-motion plasticine feel.
  - **Comic Book**: Bold ink lines, dramatic halftones, and superhero vibes.
  - **Cyberpunk Toon**: Glowing neon lights and high-tech anime styling.

- 🗣️ **Multi-Character Speech & Lip-Sync**:
  - Speech synthesis powered by Web Speech API + ElevenLabs / OpenAI TTS bridges.
  - Dynamic pitch and rate modulation per character persona.
  - Real-time mouth movements and talking animation synced to dialogue timestamps.

- 🔊 **Procedural Web Audio Cartoon FX & BGM**:
  - Built-in sound synthesizers for classic cartoon sound effects (*boing*, *whoosh*, *pop*, *laser*, *fanfare*, *punch*, *thunder*, *sparkle*).
  - Continuous procedural cartoon BGM synthesizers (*Playful Adventure*, *Comedy Mischief*, *Epic Heroic*, *Spooky Mystery*, *Chill Lo-Fi*, *Action Rush*).

- 📱 **Multi-Aspect Ratio Export**:
  - **16:9 Landscape**: YouTube, TV, Desktop videos.
  - **9:16 Portrait**: TikTok, YouTube Shorts, Instagram Reels.
  - **1:1 Square**: Instagram Feed & Social Media cards.

- ⚡ **Zero-Key & Multi-Provider AI Support**:
  - Runs 100% out of the box with the built-in Smart Procedural Engine (no API keys required).
  - Optional support for **Google Gemini (1.5 Flash / 2.0)**, **OpenAI (GPT-4o)**, and **Pollinations AI**.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4
- **Icons & UI**: Lucide React, Glassmorphism design system
- **Rendering & Animation**: HTML5 2D Canvas Engine, WebCodecs / MediaRecorder API
- **Audio & Speech**: Web Audio API Procedural Synthesizer, Web Speech Synthesis API
- **Animations & Effects**: Canvas Confetti, CSS Keyframe Glow Shaders

---

## 📦 Quick Start & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/carryint/Cartoon-Maker.git
cd Cartoon-Maker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
The compiled static assets will be ready in the `dist/` directory.

---

## 📝 Screenplay Format Guide

You can type or paste formatted screenplays directly into the **Screenplay Editor** tab:

```text
[SCENE 1: THE LAB OF WONDERS]
PIP (excited): Hey Nova! Look at what I just found in this crate!
NOVA (thinking): Pip, do not press any buttons before I calibrate the scanner!

[SCENE 2: THE DISCOVERY]
PIP (surprised): Whoa! It opened a portal to the candy planet!
NOVA (cool): Recalibrating hyper-drive... and packing extra napkins!
```

---

## 🚢 Deploying to GitHub

To deploy changes to the repository:

```bash
git remote add origin https://github.com/carryint/Cartoon-Maker.git
git branch -M main
git add .
git commit -m "feat: AI Cartoon Maker Platform"
git push -u origin main
```

---

## 📄 License

MIT License. Free to use for personal and commercial projects.
