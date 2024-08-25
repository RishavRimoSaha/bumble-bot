# 🚀 bumble-bot

A Python-based automation tool using Playwright for Bumble. This bot automatically swipes right on profiles and extends matches by interacting with the "Extend 24 hrs" button. It simulates human-like interactions to minimize detection and streamline Bumble match management.

## ⚙️ Features

- **Automatic Right Swipes**: The bot automatically swipes right on Bumble profiles, helping you maximize your match potential.
- **Match Extension**: Automatically extends your matches by interacting with the "Extend 24 hrs" button.
- **Human-Like Interactions**: Simulates human-like behavior by adding random delays, movements, and keyboard interactions to avoid detection.
- **Error Handling & Retries**: Automatically retries failed operations and handles common errors to ensure smooth functioning.
- **Customizable Delays**: Allows customization of delays between actions for more realistic interactions.

## 🛠️ How It Works

1. **Login Automation**: The bot navigates to the Bumble login page and waits for manual phone number input due to CAPTCHA restrictions.
2. **Swiping Logic**: After successful login, the bot simulates arrow key presses to swipe right on profiles.
3. **Match Detection**: The bot scans for match bubbles, identifies those that are expiring, and interacts with them to extend the match.
4. **Random Human-Like Behavior**: Random mouse movements, keyboard presses, and delays are introduced to mimic real user behavior.

## 🚀 Usage

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/RishavRimoSaha/bumble-bot.git
   ```
2. **Navigate to the Project Directory**:
   ```bash
   cd bumble-bot
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Run the Bot**:
   ```bash
   python bumble_swipe_right.py
   ```

## 📝 Example Commands

To run the basic swiping bot:
```bash
python bumble_swipe_right.py
```

To run the bot with match extension functionality:
```bash
python bumble_swipe_right_extend_matches.py
```

## ❗ Limitations

- **Manual Input Required**: Due to CAPTCHA, the bot cannot fully automate login and requires manual phone number input.
- **Bumble Web App Only**: This bot only works with Bumble’s web version, not the mobile app.

## 🛡️ License

**This project is strictly for personal use only.**

- **No Redistribution**: You are not permitted to distribute, share, or host this code on any platform other than your personal repository.
- **No Modification**: You are not allowed to modify, fork, or create derivative works based on this code.
- **No Commercial Use**: This code may not be used for any commercial purposes.

**Violation of these terms may result in legal action.**

## 📞 Support

If you have any questions or run into any issues, please contact me directly.

---


