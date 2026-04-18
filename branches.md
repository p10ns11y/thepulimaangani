## Branch Responsibilities – Tamil Pollinator Theme 🌸🐝🦋

Your default branch `**malar**` (மலர் = flower) is the stable heart of the project.

Every pollinator branch consumes “honey” (data/logic) and spreads “pollen” (features/value) back to the flower.  
We have now **added** the three new butterfly-variant branches you requested (`thithali`, `thumpi`, `vandhu`) with responsibilities tailored to their unique poetic and cultural flavour.

### Full Responsibility Map (Updated)


| Git Branch       | Tamil Name       | English Insect                             | Primary Responsibility                                | Typical Work                                                                                                             |
| ---------------- | ---------------- | ------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `theni`          | தேனீ             | Honey bee                                  | Core logic & “honey production”               | Business rules, APIs, data processing, database, authentication, heavy computation                                       |
| `pattampoochi`   | பட்டாம்பூச்சி    | Butterfly                                  | General frontend beauty & pollen spreading            | UI/UX, components, animations, responsive design, user flows                                                             |
| `vannathupoochi` | வண்ணத்துப்பூச்சி | Colorful butterfly                         | Visual design system, color themes & aesthetic polish | Color palettes, theming, branding consistency, accessibility & high-fidelity visual design, CSS variables, design tokens |
| `thithali`       | திதலி            | Butterfly (new)                         | Rapid UI prototyping & delightful micro-interactions  | Quick frontend experiments, user-experience tests, smooth animations, playful interactions                               |
| `minminipoochi`  | மின்மினிப்பூச்சி | Firefly                                    | Real-time, monitoring & “glowing” features            | Notifications, WebSockets, logging, observability, dark mode, experimental features                                      |
| `andhupoochi`    | அந்துப்பூச்சி    | Moth                                       | Night-time / batch / heavy lifting tasks              | Cron jobs, ETL pipelines, offline processing, SEO, analytics exports                                                     |
| `kulavi`         | குளவி            | Wasp                                       | Security, validation & protection                     | Auth guards, rate limiting, input sanitization, error handling, firewall logic                                           |
| `thithali`       | திதலி            | Butterfly (modern)                         | Rapid UI prototyping & delightful micro-interactions  | Quick frontend experiments, user-experience tests, smooth animations, playful interactions                               |
| `thumpi`         | தும்பி           | Five-winged flower insect (Sangam classic) | AI agents, intelligent systems & deep architecture    | Experimental AI, smart agents, foundational system design, complex logic layers                                          |
| `vandhu`         | வண்டு            | Beetle / robust pollinator                 | System integrations & cross-module “pollination”      | Third-party integrations, data syncing, API connections, module linking, robust data flows                               |


### Why these new names fit perfectly

- `**thithali`** → Modern, light and fluttering — ideal for fast, beautiful UI experiments.
- `**thumpi**` → Ancient Sangam literature name (the classic “flower-hovering” insect) — carries deep wisdom and intelligence, perfect for AI and architecture.
- `**vandhu**` → Strong, buzzing, hard-working pollinator — excellent for connecting everything together reliably.

### Why `vannathupoochi` fits perfectly

- It is the richest, most vibrant Tamil name for butterfly (literally “colorful flower-insect”).  
- It now owns the **visual soul** of the project — everything that makes the app look alive, harmonious and beautiful.  
- No overlap: `pattampoochi` stays general frontend, `thithali` stays for fast experiments, while `vannathupoochi` focuses purely on color, theme, and polished aesthetics.

### Daily Workflow Example

```bash
git checkout malar
git checkout -b thithali          # ← rapid UI prototyping sprint
# ... make commits ...
git checkout malar
git merge thithali --no-ff
```

