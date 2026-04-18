## Branch Responsibilities – Tamil Pollinator Theme 🌸🐝🦋

Your default branch **`malar`** (மலர் = flower) is the stable heart of the project.

Every other branch represents a **pollinator** that consumes “honey” (data/logic) and spreads “pollen” (features/value) back to the flower.  
This naming keeps the repo poetic, memorable, and instantly understandable.

### Responsibility Map

| Git Branch          | Tamil Name                  | English Insect     | Primary Responsibility                          | Typical Work |
|---------------------|-----------------------------|--------------------|--------------------------------------------------|--------------|
| `theni`            | தேனீ                       | Honey bee         | Core backend logic & “honey production”         | Business rules, APIs, data processing, database, authentication, heavy computation |
| `pattampoochi`     | பட்டாம்பூச்சி              | Butterfly         | Frontend beauty & pollen spreading              | UI/UX, components, animations, responsive design, user flows |
| `minminipoochi`    | மின்மினிப்பூச்சி            | Firefly           | Real-time, monitoring & “glowing” features      | Notifications, WebSockets, logging, observability, dark mode, experimental features |
| `andhupoochi`      | அந்துப்பூச்சி              | Moth              | Night-time / batch / heavy lifting tasks        | Cron jobs, ETL pipelines, offline processing, SEO, analytics exports |
| `kulavi`           | குளவி                      | Wasp              | Security, validation & protection               | Auth guards, rate limiting, input sanitization, error handling, firewall logic |

### Daily Workflow Example

```bash
git checkout malar
git checkout -b theni          # ← working on core API
# ... make commits ...
git checkout malar
git merge theni --no-ff
