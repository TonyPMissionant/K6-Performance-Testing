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

## 🗺️ Architectural Evolution & Debugging Log

This section chronicles our real-world peer-to-peer debugging journey, tracking how we bypassed complex platform-level hurdles to achieve a **100% green pass rate**:

### Phase 1: UI Text Assertions on API Paths (False Alarms)
* **The Failure:** The test suite returned consistent 404 validation alarms when hitting page steps, dumping massive strings of HTML (`<!DOCTYPE html...`) to standard output.
* **The Root Cause:** A logic mismatch. The script was targeting a contact template endpoint (`/contacts.php`), but the verification check was explicitly testing for a `"Blog"` string. Because a contacts layout doesn't mention blog properties, it triggered false metrics failures.
* **The Fix:** Realigned endpoint URLs and updated assertions to validate strings relevant to the specific page content (e.g., looking for `"Contact"` text payloads on contact forms).

### Phase 2: Single Page Application (SPA) Login Walls
* **The Failure:** Automated `submitForm()` utilities accidentally defaulted to appending credentials directly into query strings (`/login?username=default&password=12345678`), causing the server to bypass execution. Subsequent direct posts simply re-downloaded static frontend layouts.
* **The Root Cause:** QuickPizza runs as a modern, decoupled SvelteKit Single Page Application. SPAs do not process credentials on human-facing navigation paths. They catch field actions inside background JavaScript handlers and map inputs down to distinct data APIs.
* **The Fix:** Sidestepped the frontend wrapper and mapped raw `http.post` actions directly down to the deep backend user token handler path: `/api/users/token/login`.

### Phase 3: The Cryptic `Unexpected token <` Crash
* **The Failure:** The k6 compilation sequence frequently failed at launch with a critical parsing exception: `Unexpected token < looking for beginning of value`.
* **The Root Cause:** When local variables break or external requests hit a corporate firewall boundary (such as hitting `grafana.com` instead of the demo application endpoint), k6 defaults its internal routing fallback engine directly back to its main domain `https://k6.io`. The marketing site replies with an HTML template. When `JSON.parse()` attempts to convert HTML (which starts with a `<` character), the compiler crashes before any virtual users spawn.
* **The Fix:** Leveraged `k6 inspect` to confirm script structural schema integrity, wrapped JSON parsing methods in protective `try...catch` loops, and leveraged the `--no-setup` flag during isolated runtime diagnostic verification passes.

### Phase 4: Bypassing Infra-Layer Security Challenges
* **The Failure:** Under high loop frequency, requests were intercepted and dropped by a 3rd-party deployment layout wall returning a cryptic HTML tag attribute identifier (`data-dpl-id="..."`).
* **The Root Cause:** The hosting platform's threat detection suite flagged raw, accelerated k6 traffic pools as a rogue distributed bot swarm. It intercepted the connection to protect server database tables from arbitrary load scripts.
* **The Fix:** Configured detailed header parameters including real browser metadata fingerprints (`User-Agent`) and explicitly forced an `Accept: application/json` constraint rule. This masked the performance test as standard, verified desktop user traffic.

### Phase 5: The Safari Network Trace Breakthrough
* **The Failure:** The pizza generator action continuously registered complete failure rates under load (`0 / ✗ 39`).
* **The Root Cause:** Intercepting live traffic via **Safari Web Inspector** exposed three strict backend microservice rules that we had previously been guessing:
  1. The server enforces a **Dynamic Security Token** (`Authorization: Token ...`) that expires after 7 days, turning any hardcoded keys into ticking time bombs.
  2. The input schema requires a strict character length constraint payload string of exactly **161 bytes**.
  3. The backend returns variables nested deeply inside a parental `.pizza.` object schema wrapper, meaning standard top-level JSON data checks failed.
* **The Fix:** Configured the payload attributes to match the 161-byte template exactly, re-mapped assertions to walk down the parental `.pizza.` property nesting tree, and switched to a dynamic token allocation layout.

### Phase 6: Automated Lifecycles via Runtime Regex
* **The Failure:** Relying on active session keys generated by Safari required manual browser capture intervention steps every single week.
* **The Root Cause:** The site security profile shifts keys continuously to prevent automated access spoofing.
* **The Fix:** Implemented a global k6 **`setup()` function** that runs exactly once before testing tracks fire up. It triggers a baseline network call to the root server, uses a **whitespace-insensitive Regular Expression** (`/token\s*:\s*["']([A-Za-z0-9]+)["']/`) to scrape the active session key out of the live window object string, and distributes the fresh token down to every active Virtual User dynamically.

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
