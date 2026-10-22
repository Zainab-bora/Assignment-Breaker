# 📚 Assignment Breaker

**Paste an assignment. Get a day-by-day plan.**

Assignment Breaker is a small AI-powered web app that turns an overwhelming assignment brief into a realistic, step-by-step checklist spread across the days left before the deadline.

**Live demo:** (https://assignment-breaker.vercel.app/)

---

## The Problem

This project was built for my friend Kashaf who studies Pharmacy, a student whovalways starts assignments the night before because they don't know where to begin and how much time to give to each topic of assigment as a whole.

Big assignments feel impossible to start. Assignment Breaker removes that first barrier by splitting the work into small, doable tasks, so the student always knows exactly what to do today.

## Features

- **AI task planner:** paste any assignment brief, pick a deadline, and get tasks grouped day by day, each with an estimated time.
- **Progress tracker:** tick off tasks as you finish them and watch the progress bar fill up.
- **Loading animation:** live status messages and a progress bar while the plan is generated.
- **Start fresh anytime:** a quick option to begin a new assignment, plus a "next assignment" button once everything is done.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Vercel Serverless Function (`/api/plan.js`)
- **AI:** Google Gemini API, with automatic retry and model fallback when a model is busy
- **Hosting:** Vercel

The API key is kept on the server, so it is never exposed in the browser.

## Project Structure

```
assignment-breaker/
├── api/
│   └── plan.js        # Serverless function that calls Gemini
├── src/
│   ├── App.jsx        # Main UI and logic
│   ├── App.css        # Styling
│   └── main.jsx
├── .env               # API key (not committed)
├── package.json
└── README.md
```

## Team

Built by **Zainab** and **Muzammil** for [hackathon name].

- Zainab: [GitHub link]
- Muzammil: [GitHub link]
