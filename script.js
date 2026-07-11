const display = document.querySelector("#display");
const expressionDisplay = document.querySelector("#expression");
const keys = document.querySelectorAll(".key");

let current = "0";
let previous = null;
let operator = null;
let waitingForOperand = false;
let justCalculated = false;

const operatorSymbols = {
  "+": "+",
  "−": "−",
  "×": "×",
  "÷": "÷"
};

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  const absoluteValue = Math.abs(value);

  if (
    absoluteValue >= 1e10 ||
    (absoluteValue > 0 && absoluteValue < 1e-7)
  ) {
    return value
      .toExponential(7)
      .replace(/\.0+e/, "e");
  }

  return Number(value.toPrecision(12)).toString();
}

function updateDisplay() {
  display.textContent = current;

  if (previous !== null && operator) {
    expressionDisplay.textContent =
      `${formatNumber(previous)} ${operatorSymbols[operator]}`;
  } else {
    expressionDisplay.textContent = "";
  }
}

function inputDigit(digit) {
  if (
    current === "Error" ||
    waitingForOperand ||
    justCalculated
  ) {
    current = digit;
    waitingForOperand = false;
    justCalculated = false;
    return;
  }

  if (current === "0") {
    current = digit;
  } else if (current.length < 12) {
    current += digit;
  }
}

function inputDecimal() {
  if (
    current === "Error" ||
    waitingForOperand ||
    justCalculated
  ) {
    current = "0.";
    waitingForOperand = false;
    justCalculated = false;
    return;
  }

  if (!current.includes(".")) {
    current += ".";
  }
}

function calculate(firstNumber, secondNumber, selectedOperator) {
  switch (selectedOperator) {
    case "+":
      return firstNumber + secondNumber;

    case "−":
      return firstNumber - secondNumber;

    case "×":
      return firstNumber * secondNumber;

    case "÷":
      return secondNumber === 0
        ? NaN
        : firstNumber / secondNumber;

    default:
      return secondNumber;
  }
}

function chooseOperator(nextOperator) {
  const inputValue = Number(current);

  if (!Number.isFinite(inputValue)) {
    clearAll();
    return;
  }

  if (operator && waitingForOperand) {
    operator = nextOperator;
    updateDisplay();
    return;
  }

  if (previous === null) {
    previous = inputValue;
  } else if (operator) {
    const result = calculate(
      previous,
      inputValue,
      operator
    );

    current = formatNumber(result);

    if (current === "Error") {
      previous = null;
      operator = null;
      waitingForOperand = false;
      updateDisplay();
      return;
    }

    previous = Number(current);
  }

  operator = nextOperator;
  waitingForOperand = true;
  justCalculated = false;
}

function equals() {
  if (
    previous === null ||
    !operator ||
    current === "Error"
  ) {
    return;
  }

  const inputValue = Number(current);
  const firstNumber = previous;
  const usedOperator = operator;

  const result = calculate(
    firstNumber,
    inputValue,
    usedOperator
  );

  expressionDisplay.textContent =
    `${formatNumber(firstNumber)} ` +
    `${operatorSymbols[usedOperator]} ` +
    `${formatNumber(inputValue)} ＝`;

  current = formatNumber(result);

  previous = null;
  operator = null;
  waitingForOperand = false;
  justCalculated = true;

  display.textContent = current;
}

function clearAll() {
  current = "0";
  previous = null;
  operator = null;
  waitingForOperand = false;
  justCalculated = false;

  updateDisplay();
}

function deleteLast() {
  if (
    waitingForOperand ||
    justCalculated ||
    current === "Error"
  ) {
    return;
  }

  current =
    current.length > 1
      ? current.slice(0, -1)
      : "0";

  if (current === "-") {
    current = "0";
  }
}

function percent() {
  if (current === "Error") {
    return;
  }

  current = formatNumber(Number(current) / 100);
  justCalculated = true;
}

function handleKey(key) {
  const value = key.dataset.value;
  const action = key.dataset.action;
  const nextOperator = key.dataset.operator;

  if (value !== undefined) {
    inputDigit(value);
  }

  if (nextOperator) {
    chooseOperator(nextOperator);
  }

  switch (action) {
    case "decimal":
      inputDecimal();
      break;

    case "equals":
      equals();
      return;

    case "clear":
      clearAll();
      return;

    case "delete":
      deleteLast();
      break;

    case "percent":
      percent();
      break;
  }

  updateDisplay();
}

keys.forEach((key) => {
  key.addEventListener("click", () => {
    handleKey(key);
  });
});

document.addEventListener("keydown", (event) => {
  const keyboardOperatorMap = {
    "/": "÷",
    "*": "×",
    "-": "−",
    "+": "+"
  };

  let targetKey = null;

  if (/^[0-9]$/.test(event.key)) {
    targetKey = document.querySelector(
      `[data-value="${event.key}"]`
    );
  } else if (keyboardOperatorMap[event.key]) {
    targetKey = document.querySelector(
      `[data-operator="${keyboardOperatorMap[event.key]}"]`
    );
  } else if (
    event.key === "." ||
    event.key === ","
  ) {
    targetKey = document.querySelector(
      '[data-action="decimal"]'
    );
  } else if (
    event.key === "Enter" ||
    event.key === "="
  ) {
    targetKey = document.querySelector(
      '[data-action="equals"]'
    );
  } else if (event.key === "Escape") {
    targetKey = document.querySelector(
      '[data-action="clear"]'
    );
  } else if (event.key === "Backspace") {
    targetKey = document.querySelector(
      '[data-action="delete"]'
    );
  } else if (event.key === "%") {
    targetKey = document.querySelector(
      '[data-action="percent"]'
    );
  }

  if (!targetKey) {
    return;
  }

  event.preventDefault();

  targetKey.classList.add("is-pressed");

  setTimeout(() => {
    targetKey.classList.remove("is-pressed");
  }, 110);

  handleKey(targetKey);
});

updateDisplay();
