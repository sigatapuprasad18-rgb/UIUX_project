# MindWallet — Money Made Simple 💳

> An inclusive, human-centered personal finance platform built for accessibility, cognitive load reduction, and proactive decision support.

---

## 🌟 Overview

**MindWallet** transforms personal finance from passive transaction tracking into an intuitive, decision-oriented experience. Designed following **Human-Computer Interaction (HCI)**, **User Experience (UX)**, and **WCAG Accessibility** principles, MindWallet accommodates users of all abilities — including elderly users, visually impaired users, color-blind users, and individuals with lower digital literacy.

---

## ✨ Key Features & Core Modules

1. **Overview Dashboard**: Net balance overview, interactive Financial Health Score meter, budget progress highlights, quick action shortcuts, and recent transaction log.
2. **Income & Expense Tracker**: Transaction management with category recognition, search by merchant, date filters, transaction type filtering (Income vs. Expense), and modal logging.
3. **Budget Planner**: Visual category spending thresholds (`Groceries`, `Housing`, `Utilities`, `Dining out`, `Subscriptions`, `Entertainment`, `Transport`, `Shopping`) with color-coded alerts (`HEALTHY`, `WARNING`, `CRITICAL`).
4. **Savings Goals**: Piggy bank mental model, goal target percentage tracking, deposit modal, and estimated completion time calculators.
5. **Financial Health Score**: Dynamic diagnostic score ($0-100$) evaluating Savings Rate ($25\%$), Budget Discipline ($25\%$), Emergency Cushion ($20\%$), Subscription Burden ($15\%$), and Impulse Control ($15\%$).
6. **Subscription Manager**: Monthly and annual recurring burn rate tracking with cancellation savings simulator.
7. **Spending Analytics**: Category distribution visual progress meters and comparative monthly flow diagrams.
8. **Smart Insights**: Behavioral financial nudges designed to reduce stress and prevent impulse spending.
9. **Purchase Simulator ("Can I Afford This?")**: Cognitive decision tool calculating price impact, net balance after purchase, savings goal delay (+days), and plain-language HCI impulse recommendations (`Proceed Safe`, `Wait 30 Days`, or `Avoid Purchase`).
10. **Monthly Reports**: Clean, printable bank statement generator.
11. **Settings & Preferences**: User mode selection, visual themes, font scaling controls, and sample data reset.

---

## ♿ User Modes & Accessibility (WCAG Compliant)

- **Standard Mode**: Full-featured responsive layout.
- **Accessible Mode**: Enforces high contrast color palette and scaled base typography.
- **Senior Mode**: Enforces a minimum base font of $19\text{px}$, expanded touch targets ($52\text{px}+$ min height), higher line spacing, and hides dense secondary metadata.
- **Simplified Mode**: Applies progressive disclosure by hiding non-essential secondary details for lower cognitive load.
- **Accessibility Control Panel (`♿`)**: Live High Contrast toggle, Reduced Motion toggle, and Text Scaling ($A+/A-$).

---

## 📁 Project Structure

```text
uiux_project/
├── index.html            # Main HTML Shell & App Entry Point
├── Mindwallet.html       # Prototype Layout Reference
├── css/
│   └── style.css         # Complete Design System & Accessibility Stylesheet
├── js/
│   ├── app.js            # App Controller, Router & Event Listeners
│   ├── store.js          # Central Reactive Store & LocalStorage Persistence
│   └── views/
│       ├── dashboard.js   # Dashboard Module
│       ├── transactions.js# Income & Expense Log Module
│       ├── budget.js     # Budget Planner Module
│       ├── savings.js    # Savings Goals Module
│       ├── health.js     # Financial Health Score Module
│       ├── subscriptions.js # Subscription Manager Module
│       ├── analytics.js  # Spending Analytics Module
│       ├── insights.js   # Behavioral Smart Insights Module
│       ├── simulator.js  # "Can I Afford This?" Simulator Module
│       ├── reports.js    # Monthly Statements Generator Module
│       └── settings.js   # User Modes & System Preferences Module
├── .gitignore            # Git Ignore Rules
└── README.md             # Documentation
```

---

## 🚀 How to Run Locally

### Option 1: Live Server (VS Code Extension)
1. Open the project folder in **VS Code**.
2. Right-click `index.html` and click **"Open with Live Server"**.

### Option 2: Python HTTP Server
```bash
cd uiux_project
python -m http.server 8000
```
Open your browser at `http://localhost:8000/index.html`.

### Option 3: Node / npx
```bash
npx serve .
```

---

## 🎨 Design System

- **Primary**: Deep Navy (`#10233F`)
- **Accent**: Emerald Green (`#1E9E75`)
- **Warning**: Warm Orange (`#F5A524`)
- **Alert**: Red (`#DC3545`)
- **Background**: Light Gray (`#F4F6F8`)
- **Typography**: `Poppins` & `Inter`
