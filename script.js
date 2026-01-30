let display = document.getElementById("display");

function append(value) {
  display.value += value;
}

function clearDisplay() {
  display.value = "";
}

function deleteLast() {
  display.value = display.value.slice(0, -1);
}

function calculate() {
  try {
    display.value = eval(display.value);
  } catch {
    display.value = "Error";
  }
}

document.addEventListener("keydown", (e) => {
  if (
    (e.key >= "0" && e.key <= "9") ||
    e.key === "+" ||
    e.key === "-" ||
    e.key === "*" ||
    e.key === "/" ||
    e.key === "."
  ) {
    append(e.key);
  }

  if (e.key === "Enter") {
    e.preventDefault();
    calculate();
  }

  if (e.key === "Backspace") {
    deleteLast();
  }

  if (e.key === "Escape") {
    clearDisplay();
  }
});
