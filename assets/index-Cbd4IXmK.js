(function () {
  const n = document.createElement("link").relList;
  if (n && n.supports && n.supports("modulepreload")) return;
  for (const t of document.querySelectorAll('link[rel="modulepreload"]')) a(t);
  new MutationObserver((t) => {
    for (const r of t)
      if (r.type === "childList")
        for (const i of r.addedNodes)
          i.tagName === "LINK" && i.rel === "modulepreload" && a(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function s(t) {
    const r = {};
    return (
      t.integrity && (r.integrity = t.integrity),
      t.referrerPolicy && (r.referrerPolicy = t.referrerPolicy),
      t.crossOrigin === "use-credentials"
        ? (r.credentials = "include")
        : t.crossOrigin === "anonymous"
        ? (r.credentials = "omit")
        : (r.credentials = "same-origin"),
      r
    );
  }
  function a(t) {
    if (t.ep) return;
    t.ep = !0;
    const r = s(t);
    fetch(t.href, r);
  }
})();
const u = "https://959f-14-96-14-58.ngrok-free.app ",
  e = {
    loginForm: document.getElementById("loginForm"),
    username: document.getElementById("usernameInput"),
    password: document.getElementById("passwordInput"),
    errorMessage: document.getElementById("error"),
    loginButton: document.getElementById("loginButton"),
  };
let d = null;
async function f() {
  try {
    d = (
      await (await fetch(`${u}/csrf-token`, { credentials: "include" })).json()
    ).csrfToken;
  } catch (o) {
    console.error("Failed to fetch CSRF token:", o);
  }
}
function g() {
  (e.loginButton.disabled = !1),
    (e.loginButton.textContent = "Login"),
    (e.loginButton.className =
      " w-[250px] bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"),
    e.loginButton.setAttribute("aria-disabled", "false");
}
function m(o) {
  try {
    return new URL(o), !0;
  } catch {
    return !1;
  }
}
function c(o) {
  (e.errorMessage.textContent = o),
    e.errorMessage.classList.remove("error-hidden"),
    e.errorMessage.classList.add("error-visible");
}
function p() {
  (e.errorMessage.textContent = ""),
    e.errorMessage.classList.remove("error-visible"),
    e.errorMessage.classList.add("error-hidden");
}
async function h(o) {
  if ((o.preventDefault(), !d)) {
    c("Security token not available. Please refresh the page.");
    return;
  }
  if (
    !e.loginForm ||
    !e.username ||
    !e.password ||
    !e.errorMessage ||
    !e.loginButton
  ) {
    console.error("One or more DOM elements not found");
    return;
  }
  const n = e.username.value.trim(),
    s = e.password.value.trim();
  if (!/^[a-zA-Z0-9]{6,12}$/.test(n)) {
    c("Username must be 6–12 alphanumeric characters");
    return;
  }
  const a = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*\-_+=]{6,15}$/;
  if (!a.test(s)) {
    console.log("Password validation failed:", s, a.test(s)),
      c("Wrong password");
    return;
  }
  p(),
    (e.loginButton.disabled = !0),
    (e.loginButton.textContent = "Logging in..."),
    (e.loginButton.className =
      " w-[250px] bg-blue-300 text-black py-2 px-4 rounded-md cursor-not-allowed opacity-50"),
    e.loginButton.setAttribute("aria-disabled", "true");
  try {
    const t = new AbortController(),
      r = setTimeout(() => t.abort(), 2e4),
      i = await fetch(`${u}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": d },
        body: JSON.stringify({ username: n, password: s }),
        signal: t.signal,
        credentials: "include",
      });
    clearTimeout(r);
    const l = await i.json();
    if (!i.ok) throw new Error(l.errorMessage || "Login failed");
    if (l.redirectUrl && m(l.redirectUrl)) window.location.href = l.redirectUrl;
    else throw new Error("Invalid redirect URL");
  } catch (t) {
    c(t.message || "An error occurred"), g();
  }
}
function y() {
  e.loginForm
    ? (f(), e.loginForm.addEventListener("submit", h))
    : console.error("Login form not found");
}
document.addEventListener("DOMContentLoaded", y);
