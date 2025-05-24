import "./style.css";
const API_BASE_URL = "http://localhost:3030";

const DOM = {
  loginForm: document.getElementById("loginForm"),
  username: document.getElementById("usernameInput"),
  password: document.getElementById("passwordInput"),
  errorMessage: document.getElementById("error"),
  loginButton: document.getElementById("loginButton"),
};

function resetLoginButton() {
  DOM.loginButton.disabled = false;
  DOM.loginButton.textContent = "Login";
  DOM.loginButton.className =
    " w-[250px] bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2";
  DOM.loginButton.setAttribute("aria-disabled", "false");
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function showError(message) {
  DOM.errorMessage.textContent = message;
  DOM.errorMessage.classList.remove("error-hidden");
  DOM.errorMessage.classList.add("error-visible");
}

function clearError() {
  DOM.errorMessage.textContent = "";
  DOM.errorMessage.classList.remove("error-visible");
  DOM.errorMessage.classList.add("error-hidden");
}

async function handleLogin(e) {
  e.preventDefault();

  if (
    !DOM.loginForm ||
    !DOM.username ||
    !DOM.password ||
    !DOM.errorMessage ||
    !DOM.loginButton
  ) {
    console.error("One or more DOM elements not found");
    return;
  }

  const username = DOM.username.value.trim();
  const password = DOM.password.value.trim();

  // Validate username (6-12 chars, alphanumeric only)
  if (!/^[a-zA-Z0-9]{6,12}$/.test(username)) {
    showError("Username must be 6–12 alphanumeric characters");
    return;
  }

  // Validate password (6-15 chars, at least one letter and one number, special characters allowed)
  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*\-_+=]{6,15}$/;
  if (!passwordRegex.test(password)) {
    console.log(
      "Password validation failed:",
      password,
      passwordRegex.test(password)
    );
    showError(
      "Wrong password"
    );
    return;
  }

  clearError();
  DOM.loginButton.disabled = true;
  DOM.loginButton.textContent = "Logging in...";
  DOM.loginButton.className =
    " w-[250px] bg-blue-300 text-black py-2 px-4 rounded-md cursor-not-allowed opacity-50";
  DOM.loginButton.setAttribute("aria-disabled", "true");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const loginResponse = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
      credentials: "include",
    });

    clearTimeout(timeoutId);
    const responseData = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(responseData.errorMessage || "Login failed");
    }

    if (responseData.redirectUrl && isValidUrl(responseData.redirectUrl)) {
      window.location.href = responseData.redirectUrl;
    } else {
      throw new Error("Invalid redirect URL");
    }
  } catch (error) {
    showError(error.message || "An error occurred");
    resetLoginButton();
  }
}

function initializeLoginForm() {
  if (DOM.loginForm) {
    DOM.loginForm.addEventListener("submit", handleLogin);
  } else {
    console.error("Login form not found");
  }
}

document.addEventListener("DOMContentLoaded", initializeLoginForm);
