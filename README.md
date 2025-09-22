# Password Manager Extension

A simple and secure Chrome extension to store and manage your website passwords locally using strong encryption.

## Features

- Unlock the extension with a **master password**
- Add and save credentials (website, username, password)
- Passwords are **encrypted** with AES-GCM using your master password
- All data is stored **locally** in your browser (Chrome extension storage)
- View, copy, and delete saved accounts
- User-friendly interface


## Setup & Installation

1. **Clone or download this repository:**

   ```sh
   git clone https://github.com/Subho-29X/password-manager-extension.git
   ```

2. **Load the extension in Chrome:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the folder containing this repository

3. **Open the extension:**
   - Click on the Password Manager icon in your toolbar
   - Enter a master password to unlock

## Usage

1. **Set your master password**: This password is used to encrypt/decrypt all your saved passwords.
2. **Add new credentials**: Enter the website, username, and password, then click "Save".
3. **View accounts**: Saved accounts will appear in the list after unlocking with the correct master password.
4. **Copy password**: Use the "Copy" button to copy a password to your clipboard.
5. **Delete account**: Use the "Delete" button to remove an account from storage.

> _**Note:** If you forget your master password, your stored passwords cannot be recovered!_

## Security

- Passwords are encrypted in your browser before storage using the Web Crypto API (AES-GCM with PBKDF2).
- All data is kept locally; no data is sent or stored externally.

## Files

- `popup.html`: Main extension popup UI
- `popup.js`: All logic (encryption, saving, loading, UI handlers)
- `style.css`: Styling for the popup


---

Made with ❤️ by [Subho-29X](https://github.com/Subho-29X)
