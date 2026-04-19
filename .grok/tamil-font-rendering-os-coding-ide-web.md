## Tamil Font Rendering Fix Guide (Arch Linux) ##
  
**Especially for complex ligatures like புளிமாந்தண்ணிழல் / புளிமாநறுநிழல்**

```markdown
# Tamil Font Rendering Fix on Arch Linux

## 1. System-wide Fix (Do this first)

```bash
# Install Noto Tamil fonts (already done? still run)
sudo pacman -S noto-fonts noto-fonts-extra noto-fonts-emoji

# Create Tamil priority config
mkdir -p ~/.config/fontconfig/conf.d
cat > ~/.config/fontconfig/conf.d/99-tamil-font.conf << EOF
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
    <match target="font">
        <test qual="any" name="lang" compare="eq">
            <string>ta</string>
        </test>
        <edit name="family" mode="prepend_first">
            <string>Noto Sans Tamil</string>
        </edit>
    </match>
</fontconfig>
EOF

# Refresh font cache
fc-cache -fv
```

**Restart your PC** or at least log out and log in.

---

## 2. Browser Fix (Brave)

1. Open Brave → paste in address bar:  
   `brave://settings/fonts`
2. Set these fonts:
   - **Standard font** → `Noto Sans Tamil`
   - **Sans-serif font** → `Noto Sans Tamil UI` ← **Best for ligatures**
   - **Serif font** → `Noto Serif Tamil`
   - **Fixed-width font** → `Noto Sans Tamil`
3. Restart Brave completely (Menu → Exit).

---

## 3. Code Editor / IDE Fix

### VS Code
```json
// Press Ctrl+, → search "font family"
"editor.fontFamily": "'Noto Sans Tamil', 'Noto Sans Mono', monospace",
"editor.fontLigatures": true
```

### Other Editors
- **Gedit / Kate**: Preferences → Font → Select **Noto Sans Tamil**
- **Neovim / Terminal editors**: Use terminal font `Noto Sans Tamil`

---

**Quick Test Text** (copy-paste anywhere):
```
புளிமாந்தண்ணிழல்
புளிமாநறுநிழல்
கருவிளந்தண்ணிழல்
தேமாந்தண்பூ
```

