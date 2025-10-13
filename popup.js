let masterKey = "";

// Crypto helper functions using Web Crypto API
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptPassword(password, masterPassword) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(masterPassword, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(password)
  );

  // Combine salt, iv, and encrypted data
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);

  return Array.from(result)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function decryptPassword(encryptedHex, masterPassword) {
  try {
    const encrypted = new Uint8Array(
      encryptedHex.match(/.{2}/g).map((byte) => parseInt(byte, 16))
    );

    const salt = encrypted.slice(0, 16);
    const iv = encrypted.slice(16, 28);
    const data = encrypted.slice(28);

    const key = await deriveKey(masterPassword, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    return "🔒 Wrong key";
  }
}

// Unlock with master password
document.getElementById("unlockBtn").addEventListener("click", async () => {
  masterKey = document.getElementById("masterKey").value;
  if (masterKey.trim() !== "") {
    document.getElementById("mainUI").style.display = "block";
    await loadAccounts();
  }
});

// Save password
document.getElementById("saveBtn").addEventListener("click", async () => {
  const website = document.getElementById("website").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!website || !username || !password || !masterKey) {
    alert("Fill all fields and unlock with master key!");
    return;
  }

  try {
    const encryptedPassword = await encryptPassword(password, masterKey);

    chrome.storage.local.get(["accounts"], (result) => {
      let accounts = result.accounts || [];
      accounts.push({ website, username, password: encryptedPassword });

      chrome.storage.local.set({ accounts }, () => {
        alert("Saved!");
        loadAccounts();
        // Clear form
        document.getElementById("website").value = "";
        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
      });
    });
  } catch (error) {
    alert("Error encrypting password: " + error.message);
  }
});

// Load accounts
async function loadAccounts() {
  chrome.storage.local.get(["accounts"], async (result) => {
    const accounts = result.accounts || [];
    const list = document.getElementById("accountList");
    list.innerHTML = "";

    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      let li = document.createElement("li");

      const decrypted = await decryptPassword(acc.password, masterKey);

      li.innerHTML = `
        <div>
          <b>${acc.website}</b><br>
          ${acc.username} : ${decrypted}
        </div>
        <div class="button-container">
          <button class="copy-btn" onclick="copyPassword('${decrypted}', ${i})">Copy</button>
          <button class="delete-btn" onclick="deleteAccount(${i})">Delete</button>
        </div>
      `;
      list.appendChild(li);
    }
  });
}

// Copy password using Chrome's API
function copyPassword(text, index) {
  if (text === " Wrong key ! ") {
    alert("Cannot copy - wrong master key!");
    return;
  }

  // Use Chrome's offscreen document for clipboard access
  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("Password copied");
    })
    .catch(() => {
      // Fallback: create a temporary textarea
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("Password copied.");
    });
}

// Delete account
function deleteAccount(index) {
  if (confirm("Are you sure you want to delete this account?")) {
    chrome.storage.local.get(["accounts"], (result) => {
      let accounts = result.accounts || [];
      accounts.splice(index, 1);
      chrome.storage.local.set({ accounts }, () => {
        loadAccounts();
      });
    });
  }
}

// Clear form when master key changes
document.getElementById("masterKey").addEventListener("input", () => {
  document.getElementById("mainUI").style.display = "none";
  masterKey = "";
});
