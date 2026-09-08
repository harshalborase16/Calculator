const display = document.getElementById("display");
const subDisplay = document.getElementById("sub-display");
const buttons = document.querySelectorAll(".btn");
const themeBtns = document.querySelectorAll(".theme-btn");

let isNewCalculation = false;

// ==========================================================================
// Theme Switcher & Persistence
// ==========================================================================
function setTheme(themeName) {
  document.body.className = themeName === "aurora" ? "" : `theme-${themeName}`;
  themeBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.theme === themeName);
  });
  localStorage.setItem("calc_theme", themeName);
}

// Initialize theme from localStorage or default to aurora
const savedTheme = localStorage.getItem("calc_theme") || "aurora";
setTheme(savedTheme);

themeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    setTheme(btn.dataset.theme);
  });
});

// ==========================================================================
// Display Animation Triggers
// ==========================================================================
function triggerPop() {
  display.classList.remove("pop-animation");
  void display.offsetWidth; // Trigger reflow
  display.classList.add("pop-animation");
}

function triggerShake() {
  display.classList.remove("shake-animation");
  void display.offsetWidth;
  display.classList.add("shake-animation");
}

function triggerResultPulse() {
  display.classList.remove("result-pulse");
  void display.offsetWidth;
  display.classList.add("result-pulse");
}

// ==========================================================================
// Calculator Core Functions
// ==========================================================================
function append(value) {
  // If calculation just completed and user types a number, start fresh
  if (isNewCalculation && !["+", "-", "*", "/", "%"].includes(value)) {
    display.value = "";
    subDisplay.textContent = "";
    isNewCalculation = false;
  } else if (isNewCalculation) {
    isNewCalculation = false;
  }

  // Prevent multiple consecutive operators
  const lastChar = display.value.slice(-1);
  if (["+", "-", "*", "/", "%"].includes(value) && ["+", "-", "*", "/", "%"].includes(lastChar)) {
    display.value = display.value.slice(0, -1) + value;
    triggerPop();
    return;
  }

  display.value += value;
  triggerPop();
}

function clearDisplay() {
  display.value = "";
  subDisplay.textContent = "";
  isNewCalculation = false;
  triggerPop();
}

function deleteLast() {
  if (isNewCalculation) {
    clearDisplay();
    return;
  }
  display.value = display.value.slice(0, -1);
  triggerPop();
}

function calculate() {
  if (!display.value) return;

  const expression = display.value;
  try {
    // Format percentages (e.g. 50% -> (50*0.01))
    let formattedExpr = expression.replace(/(\d+(\.\d+)?)%/g, "($1*0.01)");
    
    // Evaluate sanitized expression
    // Only permit numbers, math operators, decimal points, and parentheses
    if (/[^0-9+\-*/.() ]/.test(formattedExpr)) {
      throw new Error("Invalid Input");
    }

    const result = Function(`"use strict"; return (${formattedExpr})`)();

    if (!isFinite(result)) {
      display.value = "Error";
      triggerShake();
      return;
    }

    // Format output to avoid excessive floating decimals
    const roundedResult = Number.isInteger(result)
      ? result
      : parseFloat(result.toFixed(8));

    subDisplay.textContent = `${expression} =`;
    display.value = roundedResult;
    isNewCalculation = true;
    triggerResultPulse();
  } catch {
    display.value = "Error";
    triggerShake();
    isNewCalculation = true;
  }
}

// ==========================================================================
// Dynamic Click Ripple Effect
// ==========================================================================
function createRipple(event, button) {
  const circle = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  const rect = button.getBoundingClientRect();
  const x = (event.clientX || rect.left + radius) - rect.left - radius;
  const y = (event.clientY || rect.top + radius) - rect.top - radius;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${x}px`;
  circle.style.top = `${y}px`;
  circle.classList.add("ripple");

  const existingRipple = button.querySelector(".ripple");
  if (existingRipple) {
    existingRipple.remove();
  }

  button.appendChild(circle);
  setTimeout(() => circle.remove(), 550);
}

buttons.forEach((btn) => {
  btn.addEventListener("pointerdown", (e) => {
    createRipple(e, btn);
  });
});

// ==========================================================================
// Keyboard Input & Visual Sync
// ==========================================================================
document.addEventListener("keydown", (e) => {
  let key = e.key;

  if (key === "Enter" || key === "=") {
    e.preventDefault();
    key = "Enter";
    calculate();
  } else if (key === "Escape") {
    clearDisplay();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (
    (key >= "0" && key <= "9") ||
    key === "+" ||
    key === "-" ||
    key === "*" ||
    key === "/" ||
    key === "." ||
    key === "%"
  ) {
    append(key);
  }

  // Trigger visual press on matching button
  const matchingBtn = document.querySelector(`button[data-key="${key}"]`);
  if (matchingBtn) {
    matchingBtn.classList.add("active-press");
    createRipple({}, matchingBtn);
  }
});

document.addEventListener("keyup", (e) => {
  let key = e.key;
  if (key === "=") key = "Enter";
  const matchingBtn = document.querySelector(`button[data-key="${key}"]`);
  if (matchingBtn) {
    matchingBtn.classList.remove("active-press");
  }
});
