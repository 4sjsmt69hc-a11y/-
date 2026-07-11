const display = document.getElementById("display");
const buttons = document.querySelectorAll(".buttons button");

let current = "0";
let previous = null;
let operator = null;
let overwrite = false;

function updateDisplay() {
    display.textContent = current;
}

function inputNumber(value) {

    if (overwrite) {
        current = value;
        overwrite = false;
        return;
    }

    if (current === "0") {
        current = value;
    } else {
        current += value;
    }
}

function inputDecimal() {

    if (!current.includes(".")) {
        current += ".";
    }

}

function setOperator(op) {

    if (operator !== null) {
        calculate();
    }

    previous = current;
    operator = op;
    overwrite = true;
}

function calculate() {

    if (previous === null || operator === null) return;

    const a = parseFloat(previous);
    const b = parseFloat(current);

    let result;

    switch (operator) {

        case "+":
            result = a + b;
            break;

        case "-":
            result = a - b;
            break;

        case "*":
            result = a * b;
            break;

        case "/":
            result = b === 0 ? "ERROR" : a / b;
            break;

    }

    current = String(result);

    operator = null;
    previous = null;
    overwrite = true;
}

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const number = button.dataset.number;
        const action = button.dataset.action;
        const value = button.dataset.value;

        if (number !== undefined) {

            if (number === ".") {
                inputDecimal();
            } else {
                inputNumber(number);
            }

        }

        if (action === "operator") {
            setOperator(value);
        }

        if (action === "equal") {
            calculate();
        }

        if (action === "clear") {

            current = "0";
            previous = null;
            operator = null;
            overwrite = false;

        }

        if (action === "backspace") {

            if (!overwrite) {

                current = current.slice(0, -1);

                if (current.length === 0) {
                    current = "0";
                }

            }

        }

        if (action === "percent") {

            current = String(parseFloat(current) / 100);

        }

        updateDisplay();

    });

});

updateDisplay();
