/* ==========================================================================
   FOUNDRY STUDIO — script.js
   Vanilla JavaScript only. No frameworks, no libraries, no build step.
   Handles: mobile nav toggle, dark/light theme toggle, contact form.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. Mobile navigation hamburger toggle
     ------------------------------------------------------------------ */
  function initNavToggle() {
    const toggleBtn = document.getElementById("navToggle");
    const navList = document.getElementById("primaryNavList");

    if (!toggleBtn || !navList) return;

    function closeMenu() {
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.setAttribute("aria-label", "Open menu");
      navList.dataset.state = "closed";
    }

    function openMenu() {
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.setAttribute("aria-label", "Close menu");
      navList.dataset.state = "open";
    }

    toggleBtn.addEventListener("click", function () {
      const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close the menu after a nav link is activated (mobile UX nicety)
    navList.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        closeMenu();
      }
    });

    // Close the menu with Escape, and return focus to the toggle button
    document.addEventListener("keydown", function (event) {
      const isOpen = toggleBtn.getAttribute("aria-expanded") === "true";
      if (event.key === "Escape" && isOpen) {
        closeMenu();
        toggleBtn.focus();
      }
    });

    // If the viewport grows past tablet, make sure the mobile menu
    // state doesn't stay stuck open behind the now-visible desktop nav.
    const tabletQuery = window.matchMedia("(min-width: 768px)");
    function handleViewportChange(event) {
      if (event.matches) {
        closeMenu();
      }
    }
    if (typeof tabletQuery.addEventListener === "function") {
      tabletQuery.addEventListener("change", handleViewportChange);
    } else if (typeof tabletQuery.addListener === "function") {
      // Safari < 14 fallback
      tabletQuery.addListener(handleViewportChange);
    }
  }

  /* ------------------------------------------------------------------
     2. Dark / light theme toggle
     ------------------------------------------------------------------ */
  function initThemeToggle() {
    const root = document.documentElement;
    const themeToggle = document.getElementById("themeToggle");
    const STORAGE_KEY = "foundry-theme";

    if (!themeToggle) return;

    function applyTheme(theme) {
      if (theme === "dark") {
        root.setAttribute("data-theme", "dark");
        themeToggle.setAttribute("aria-pressed", "true");
        themeToggle.setAttribute("aria-label", "Switch to light theme");
      } else {
        root.removeAttribute("data-theme");
        themeToggle.setAttribute("aria-pressed", "false");
        themeToggle.setAttribute("aria-label", "Switch to dark theme");
      }
    }

    function getStoredTheme() {
      try {
        return window.localStorage.getItem(STORAGE_KEY);
      } catch (err) {
        // localStorage may be unavailable (privacy mode, etc.) — degrade gracefully
        return null;
      }
    }

    function storeTheme(theme) {
      try {
        window.localStorage.setItem(STORAGE_KEY, theme);
      } catch (err) {
        // Ignore storage failures; theme just won't persist across visits
      }
    }

    // Determine initial theme: saved preference, else system preference
    const stored = getStoredTheme();
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = stored || (prefersDark ? "dark" : "light");
    applyTheme(initialTheme);

    themeToggle.addEventListener("click", function () {
      const isDark = root.getAttribute("data-theme") === "dark";
      const nextTheme = isDark ? "light" : "dark";
      applyTheme(nextTheme);
      storeTheme(nextTheme);
    });
  }

  /* ------------------------------------------------------------------
     3. Contact form: validation + inline success message
     ------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const alertBox = document.getElementById("formAlert");
    const fields = {
      name: {
        input: document.getElementById("name"),
        errorEl: document.getElementById("name-error"),
        validate: function (value) {
          return value.trim().length >= 2 ? "" : "Please enter your name.";
        }
      },
      email: {
        input: document.getElementById("email"),
        errorEl: document.getElementById("email-error"),
        validate: function (value) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailPattern.test(value.trim())
            ? ""
            : "Please enter a valid email address.";
        }
      },
      message: {
        input: document.getElementById("message"),
        errorEl: document.getElementById("message-error"),
        validate: function (value) {
          return value.trim().length >= 10
            ? ""
            : "Please add a few more details (10+ characters).";
        }
      }
    };

    function setFieldError(field, errorMessage) {
      const row = field.input.closest(".form-row");
      field.errorEl.textContent = errorMessage;
      if (row) {
        row.classList.toggle("has-error", Boolean(errorMessage));
      }
      field.input.setAttribute("aria-invalid", errorMessage ? "true" : "false");
    }

    function validateField(fieldKey) {
      const field = fields[fieldKey];
      const errorMessage = field.validate(field.input.value);
      setFieldError(field, errorMessage);
      return errorMessage === "";
    }

    // Validate on blur for immediate, non-intrusive feedback
    Object.keys(fields).forEach(function (fieldKey) {
      fields[fieldKey].input.addEventListener("blur", function () {
        validateField(fieldKey);
      });
    });

    function showSuccessAlert(name) {
      alertBox.textContent =
        "Thanks, " + name + "! Your message has been sent. We'll reply within two working days.";
      alertBox.hidden = false;
    }

    function hideAlert() {
      alertBox.hidden = true;
      alertBox.textContent = "";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      hideAlert();

      const results = Object.keys(fields).map(validateField);
      const allValid = results.every(Boolean);

      if (!allValid) {
        // Move focus to the first invalid field for keyboard/screen-reader users
        const firstInvalidKey = Object.keys(fields).find(function (key) {
          return fields[key].errorEl.textContent !== "";
        });
        if (firstInvalidKey) {
          fields[firstInvalidKey].input.focus();
        }
        return;
      }

      const submittedName = fields.name.input.value.trim();

      // In a production build this is where a fetch() call to a backend
      // or form-handling service would go. Here we simulate a successful
      // submission so the interaction can be demonstrated end-to-end.
      showSuccessAlert(submittedName);
      form.reset();

      Object.keys(fields).forEach(function (fieldKey) {
        setFieldError(fields[fieldKey], "");
      });
    });
  }

  /* ------------------------------------------------------------------
     4. Footer year
     ------------------------------------------------------------------ */
  function initFooterYear() {
    const yearEl = document.getElementById("footerYear");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  /* ------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    initThemeToggle();
    initContactForm();
    initFooterYear();
  });
})();
