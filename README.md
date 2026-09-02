# QuickPizza Performance Testing Framework

A modular, highly scalable load-testing framework built with **Grafana k6**. This project simulates concurrent user journeys against the QuickPizza demo application, tracking system reliability and API performance under load.

The architecture separates configurations, business logic handlers (scenarios), and authentication layers to mirror professional Page Object Model (POM) engineering patterns.

---

## 🏗️ Repository Architecture

The project employs a modular separation of concerns to maximize code reuse, readability, and long-term maintainability:

```text
K6-Performance-Testing/
├── config/
│   └── options.js         # Load profiles (scenarios, stages, and thresholds)
├── helpers/
│   └── auth.js            # Whitespace-insensitive Regex token scraping engine
├── scenarios/
│   ├── homepage.js        # User flow: Landing page navigation loop
│   └── pizza.js           # User flow: Pizza recommendation API load engine
├── .gitignore             # Filters out auto-generated HTML metrics dashboards
├── homepage_view.js       # Main runtime test orchestrator & execution path
└── README.md              # Technical blueprint and engineering journey logs
```

---

## 🚀 Getting Started

### Prerequisites
* Install **k6** locally via Homebrew (macOS):
  ```bash
  brew install k6
  ```

### Installation & Initialization
1. Clone or navigate to your local repository directory:
   ```bash
   cd "/Users/anthony/Documents/QA - Automation/K6-Performance-Testing/"
   ```
2. Initialize local version tracking and ignore setup:
   ```bash
   git init
   git add .
   git commit -m "feat: complete modular performance project architecture"
   ```

### Running the Performance Test
Execute the test orchestrator without flags to automatically run the full workflow lifecycle (`setup` -> `scenarios` -> `teardown`):
```bash
k6 run homepage_view.js
```

---

## 📈 Load Profile Configurations

The framework splits execution traffic into two distinct, parallel execution profiles managed by **k6 Scenarios**:

1. **`homepage_load` (Ramping VUs)**
   * **Target:** `BASE_URL` (Root UI Layout)
   * **Pattern:** Ramps smoothly from 0 to 5 Virtual Users over 5s, sustains 5 active users for 10s, and ramps back down to 0 over 5s.
   * **Intent:** Mimics random spikes in standard browser discovery patterns.

2. **`create_pizza_load` (Constant VUs)**
   * **Target:** `/api/pizza` (Backend Recommendation Microservice)
   * **Pattern:** Pins exactly **2 static Virtual Users** to loop execution sequentially for an uninterrupted 20s window.
   * **Intent:** Isolates high-frequency backend computational load.

### Performance Thresholds
* **`http_req_duration`**: 95% of all network calls across both scenarios must resolve under **500ms** (`p(95)<500`) to guarantee an acceptable service level validation score.

---

## 🛡️ Git & Workspace Governance

To maintain a clean and lightweight testing environment, the framework uses strict `.gitignore` rules to isolate telemetry records from repository histories:

* Blocks heavy auto-generated performance reports (`*.html`).
* Masks system environment metadata cache logs (`.DS_Store`).
* Protects local authentication files containing hidden environment overrides (`.env`).

### Clean Staging Commands
If you accidentally track a heavy HTML report dashboard asset, use the file-safe cache untrack sequence to strip it from git history memory without destroying your hard drive workspace copy:
```bash
git rm --cached report1.html
git add .
git commit -m "chore: implement strict workspace filtering boundaries"
```
---
## 🧮 Code Mechanics & Architectural Breakdowns

To ensure the framework remains accessible for engineers coming from minimal JavaScript backgrounds, this section outlines the underlying logic behind our custom data engines:

### 1. Dynamic Range Math (`scenarios/pizza.js`)
To simulate a real user selecting random bounds on the advanced menu, we generate custom calories using this structural blueprint:
```javascript
Math.floor(Math.random() * (MAX - MIN + 1)) + MIN
```
* **Range Calculation:** `(1200 - 500 + 1)` calculates a pool size of `701` possible integers (including the upper limit boundary).
* **Decimal Truncation (`Math.floor`):** `Math.random()` rolls an arbitrary decimal value. Passing it to `Math.floor()` chops off the fractional remainders and rounds the value down to a clean, whole integer between `0` and `700`.
* **Upward Floor Shift (`+ 500`):** Shifting the baseline integer ensure our values map precisely to realistic pizza configurations between `500` and `1200` calories.

### 2. Data Flattening & Serialization
Web servers cannot parse live, active JavaScript object trees over network lines. They can only interpret strings of plain text:
* **`JSON.stringify()`**: Serializes and flattens dynamic multi-line arrays (like your `excludedTools` lists) into flat text payload blocks (`'{"excludedTools":["scissors"]}'`) capable of streaming over HTTP protocols.
* **`JSON.parse()`**: Executed inside our fallback authentication layer. It performs the exact opposite role—un-flattening the server's raw text responses back into navigateable JavaScript data structures so our script can extract tokens dynamically.

### 3. Whitespace-Insensitive Regular Expressions (`helpers/auth.js`)
Modern single-page applications shift layouts or inject varying spacing characters across deployment updates. To keep our `setup()` token scraping robust, our regex engine breaks down as follows:
```text
/token\s*:\s*["']([A-Za-z0-9]+)["']/
```
* **`\s*`**: Matches zero or more consecutive space or tab characters, neutralizing any server-side formatting updates.
* **`([A-Za-z0-9]+)`**: Forms a strict **Capture Group** isolating alphanumeric keys, which are then picked via a logical `||` (OR) utility and passed directly to your scenario headers as an authorized token credential.
