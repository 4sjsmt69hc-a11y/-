const display = document.getElementById("display");

const buttons = document.querySelectorAll(
    ".control-panel button"
);

let current = "0";
let previous = null;
let operator = null;
let overwrite = false;

/* ==============================
   表示
============================== */

function updateDisplay() {
    display.textContent = current;

    display.animate(
        [
            {
                filter: "brightness(1.7)",
                transform: "scale(1.025)"
            },
            {
                filter: "brightness(1)",
                transform: "scale(1)"
            }
        ],
        {
            duration: 180,
            easing: "ease-out"
        }
    );
}

/* ==============================
   数字入力
============================== */

function inputNumber(value) {
    if (
        current === "ERROR" ||
        overwrite
    ) {
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

/* ==============================
   小数点
============================== */

function inputDecimal() {
    if (
        current === "ERROR" ||
        overwrite
    ) {
        current = "0.";
        overwrite = false;
        return;
    }

    if (!current.includes(".")) {
        current += ".";
    }
}

/* ==============================
   演算子
============================== */

function setOperator(nextOperator) {
    if (current === "ERROR") {
        clearCalculator();
        return;
    }

    if (
        operator !== null &&
        !overwrite
    ) {
        calculate();
    }

    previous = current;
    operator = nextOperator;
    overwrite = true;
}

/* ==============================
   計算
============================== */

function calculate() {
    if (
        previous === null ||
        operator === null ||
        current === "ERROR"
    ) {
        return;
    }

    const firstNumber =
        Number.parseFloat(previous);

    const secondNumber =
        Number.parseFloat(current);

    let result;

    switch (operator) {
        case "+":
            result =
                firstNumber +
                secondNumber;
            break;

        case "-":
            result =
                firstNumber -
                secondNumber;
            break;

        case "*":
            result =
                firstNumber *
                secondNumber;
            break;

        case "/":
            if (secondNumber === 0) {
                result = "ERROR";
            } else {
                result =
                    firstNumber /
                    secondNumber;
            }
            break;

        default:
            return;
    }

    if (
        typeof result === "number"
    ) {
        result =
            Math.round(
                result *
                1_000_000_000_000
            ) /
            1_000_000_000_000;
    }

    current = String(result);

    previous = null;
    operator = null;
    overwrite = true;
}

/* ==============================
   クリア
============================== */

function clearCalculator() {
    current = "0";
    previous = null;
    operator = null;
    overwrite = false;
}

/* ==============================
   一文字削除
============================== */

function backspace() {
    if (
        overwrite ||
        current === "ERROR"
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

/* ==============================
   パーセント
============================== */

function percent() {
    if (current === "ERROR") {
        return;
    }

    current = String(
        Number.parseFloat(current) /
        100
    );
}

/* ==============================
   正負切り替え
============================== */

function toggleSign() {
    if (
        current === "0" ||
        current === "ERROR"
    ) {
        return;
    }

    current = current.startsWith("-")
        ? current.slice(1)
        : `-${current}`;
}

/* ==============================
   押下時の発光
============================== */

function animateButton(button) {
    button.classList.add(
        "is-pressed"
    );

    window.setTimeout(() => {
        button.classList.remove(
            "is-pressed"
        );
    }, 170);
}

/* ==============================
   ボタン処理
============================== */

function handleButton(button) {
    const number =
        button.dataset.number;

    const action =
        button.dataset.action;

    const value =
        button.dataset.value;

    animateButton(button);

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
        clearCalculator();
    }

    if (action === "backspace") {
        backspace();
    }

    if (action === "percent") {
        percent();
    }

    if (action === "sign") {
        toggleSign();
    }

    updateDisplay();
}

buttons.forEach((button) => {
    button.addEventListener(
        "click",
        () => {
            handleButton(button);
        }
    );
});

/* ==============================
   キーボード操作
============================== */

document.addEventListener(
    "keydown",
    (event) => {
        let targetButton = null;

        if (/^[0-9]$/.test(event.key)) {
            targetButton =
                document.querySelector(
                    `[data-number="${event.key}"]`
                );
        }

        if (event.key === ".") {
            targetButton =
                document.querySelector(
                    '[data-number="."]'
                );
        }

        const operatorKeys = {
            "+": "+",
            "-": "-",
            "*": "*",
            "/": "/"
        };

        if (
            operatorKeys[event.key]
        ) {
            targetButton =
                document.querySelector(
                    `[data-action="operator"][data-value="${operatorKeys[event.key]}"]`
                );
        }

        if (
            event.key === "Enter" ||
            event.key === "="
        ) {
            targetButton =
                document.querySelector(
                    '[data-action="equal"]'
                );
        }

        if (
            event.key === "Backspace"
        ) {
            targetButton =
                document.querySelector(
                    '[data-action="backspace"]'
                );
        }

        if (
            event.key === "Escape"
        ) {
            targetButton =
                document.querySelector(
                    '[data-action="clear"]'
                );
        }

        if (event.key === "%") {
            targetButton =
                document.querySelector(
                    '[data-action="percent"]'
                );
        }

        if (targetButton) {
            event.preventDefault();
            handleButton(targetButton);
        }
    }
);

updateDisplay();
