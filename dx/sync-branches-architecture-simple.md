# sync-branches Architecture Diagram

```mermaid
flowchart TD
    Start([Start]) --> Collect[PHASE 1: COLLECT<br>Detect branch, status, PRs]
    Collect --> Plan[PHASE 2: BUILD PLAN<br>Create action list]
    Plan --> Validate[PHASE 3: VALIDATE<br>Check remote + state]
    Validate --> Sync[PHASE 4: SYNC<br>reset --hard malar for all]
    Sync --> Push{PUSH=1?}
    Push -->|Yes| PushAll[Push all branches]
    Push -->|No| Done
    PushAll --> Done([Done])

    style Collect fill:#e3f2fd,stroke:#1976d2,color:#1a237e
    style Plan fill:#e0f7fa,stroke:#00838f,color:#004d40
    style Validate fill:#fff8e1,stroke:#f57c00,color:#e65100
    style Sync fill:#e8f5e9,stroke:#388e3c,color:#1b5e20
```

## Key Design Principles

- **Only active PR branches are skipped**
- **All other branches use `git reset --hard origin/malar`**
- **File-based plan storage** for reliability
- **Vibrant truecolor output** for excellent terminal experience

---

## State Machine Flow

```
COLLECT → BUILD PLAN → VALIDATE → SYNC → DONE
```

This tool follows a clean state machine pattern with predictable transitions between phases.