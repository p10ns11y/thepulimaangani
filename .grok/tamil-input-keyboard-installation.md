## Tamil Transliteration Keyboard on Arch Linux ##

**(Phonetic / Tamil99 – type English letters, get தமிழ் script)**

Example: `amma` → **அம்மா**, `vanakkam` → **வணக்கம்**, `thaa` → **தா**

### Best Method: **IBus + m17n** (most stable for Tamil phonetic)

#### 1. Install the packages
```bash
sudo pacman -Syu ibus ibus-m17n m17n-db m17n-lib
```

#### 2. Set environment variables (permanent)
Create/edit `~/.xprofile` (or `~/.profile` if you use login shell):
```bash
cat >> ~/.xprofile << EOF
export GTK_IM_MODULE=ibus
export QT_IM_MODULE=ibus
export XMODIFIERS=@im=ibus
export INPUT_METHOD=ibus
EOF
```

#### 3. Autostart IBus
Add this line to your desktop environment / window manager autostart (or `~/.xinitrc` if you use startx):
```bash
ibus-daemon -drxR &
```

#### 4. Configure Tamil input methods
```bash
ibus-setup
```

- Go to **Input Method** tab → **Add**
- Search for **tamil**
- Add these (recommended order):
  - **Tamil (phonetic)** or **Tamil (m17n)**
  - **Tamil99** (government standard phonetic layout)
  - English (US) as first input source

- Click **OK**

#### 5. Test it
- Restart your session (log out and log in) or run `ibus-daemon -drxR`
- Press **Super + Space** to switch between English ↔ Tamil
- Start typing in any app (Brave, VS Code, LibreOffice, etc.)

**Quick test text:**
```
vanakkam da mapla
thalaivar vararu
```

### Alternative: Fcitx5 (if you prefer modern Wayland-friendly method)

```bash
sudo pacman -S fcitx5-im fcitx5-configtool fcitx5-table-other
```

Then:
- Add environment variables (`GTK_IM_MODULE=fcitx` etc.)
- Run `fcitx5-configtool`
- Add **Tamil (Remington)** or **Tamil (table)**

**Which one to choose?**  
- **IBus** → Best Tamil phonetic/Tamil99 experience (recommended for most users)  
- **Fcitx5** → Lighter, better on Wayland/Hyprland

