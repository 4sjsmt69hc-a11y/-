"use strict";

/* =========================================================
   要素取得
========================================================= */

const display = document.getElementById("display");
const calculator = document.querySelector(".calculator");
const buttons = document.querySelectorAll(".calculator button");
const canvas = document.getElementById("particles");

if (!display || !calculator) {
    throw new Error("電卓のHTML要素が見つかりません。");
}

const context = canvas?.getContext("2d") ?? null;

/* =========================================================
   電卓の状態
========================================================= */

let currentValue = "0";
let previousValue = null;
let currentOperator = null;
let shouldOverwrite = false;

let lastOperator = null;
let lastOperand = null;

/* =========================================================
   パーティクルの状態
========================================================= */

let particles = [];
let particleAnimationId = null;

/* =========================================================
   Canvas設定
========================================================= */

function resizeCanvas() {
    if (!canvas || !context) {
        return;
    }

    const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvas.width = Math.floor(
        window.innerWidth * pixelRatio
    );

    canvas.height = Math.floor(
        window.innerHeight * pixelRatio
    );

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

/* =========================================================
   表示処理
========================================================= */

function formatForDisplay(value) {
    if (value === "ERROR") {
        return "ERROR";
    }

    if (value === "-0") {
        return "0";
    }

    if (value.length <= 12) {
        return value;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "ERROR";
    }

    return number.toExponential(6);
}

function updateDisplay() {
    display.textContent = formatForDisplay(currentValue);

    if (typeof display.animate !== "function") {
        return;
    }

    display.animate(
        [
            {
                transform: "translateY(2px) scale(1.025)",
                filter: "brightness(1.45)"
            },
            {
                transform: "translateY(0) scale(1)",
                filter: "brightness(1)"
            }
        ],
        {
            duration: 160,
            easing: "ease-out"
        }
    );
}

/* =========================================================
   数字入力
========================================================= */

function inputNumber(number) {
    if (
        currentValue === "ERROR" ||
        shouldOverwrite
    ) {
        currentValue = number;
        shouldOverwrite = false;
        return;
    }

    if (currentValue === "0") {
        currentValue = number;
        return;
    }

    if (currentValue === "-0") {
        currentValue = `-${number}`;
        return;
    }

    if (currentValue.length >= 16) {
        return;
    }

    currentValue += number;
}

function inputDecimal() {
    if (
        currentValue === "ERROR" ||
        shouldOverwrite
    ) {
        currentValue = "0.";
        shouldOverwrite = false;
        return;
    }

    if (!currentValue.includes(".")) {
        currentValue += ".";
    }
}

/* =========================================================
   計算処理
========================================================= */

function normalizeResult(number) {
    if (!Number.isFinite(number)) {
        return "ERROR";
    }

    const rounded =
        Math.round(
            (number + Number.EPSILON) *
            1_000_000_000_000
        ) /
        1_000_000_000_000;

    return String(rounded);
}

function performOperation(
    first,
    second,
    operator
) {
    switch (operator) {
        case "+":
            return first + second;

        case "-":
            return first - second;

        case "*":
            return first * second;

        case "/":
            return second === 0
                ? null
                : first / second;

        default:
            return second;
    }
}

function chooseOperator(operator) {
    if (currentValue === "ERROR") {
        clearCalculator();
        return;
    }

    /*
       演算子を連続で押した場合は、
       最後に押した演算子へ差し替える。
    */
    if (
        currentOperator !== null &&
        shouldOverwrite
    ) {
        currentOperator = operator;
        return;
    }

    /*
       すでに計算途中なら、その時点までを先に計算。
       例：2 + 3 × → 5 ×
    */
    if (
        currentOperator !== null &&
        previousValue !== null &&
        !shouldOverwrite
    ) {
        calculate(false);

        if (currentValue === "ERROR") {
            updateDisplay();
            return;
        }
    }

    previousValue = currentValue;
    currentOperator = operator;
    shouldOverwrite = true;

    lastOperator = null;
    lastOperand = null;
}

/* =========================================================
   イコール・連続計算
========================================================= */

function calculate(showFlash = true) {
    if (currentValue === "ERROR") {
        return;
    }

    let operatorToUse = currentOperator;
    let firstNumber;
    let secondNumber;

    if (
        operatorToUse !== null &&
        previousValue !== null
    ) {
        firstNumber =
            Number.parseFloat(previousValue);

        /*
           2 + = のように、数値入力前に＝を押した場合は
           2 + 2 として扱う。
        */
        const secondValue =
            shouldOverwrite
                ? previousValue
                : currentValue;

        secondNumber =
            Number.parseFloat(secondValue);

        lastOperator = operatorToUse;
        lastOperand = secondValue;
    } else if (
        lastOperator !== null &&
        lastOperand !== null
    ) {
        operatorToUse = lastOperator;

        firstNumber =
            Number.parseFloat(currentValue);

        secondNumber =
            Number.parseFloat(lastOperand);
    } else {
        return;
    }

    if (
        !Number.isFinite(firstNumber) ||
        !Number.isFinite(secondNumber)
    ) {
        setError();

        if (showFlash) {
            triggerResultFlash(false);
        }

        return;
    }

    const result = performOperation(
        firstNumber,
        secondNumber,
        operatorToUse
    );

    if (result === null) {
        setError();

        if (showFlash) {
            triggerResultFlash(false);
        }

        return;
    }

    currentValue = normalizeResult(result);
    previousValue = null;
    currentOperator = null;
    shouldOverwrite = true;

    if (showFlash) {
        triggerResultFlash(true);
    }
}

function setError() {
    currentValue = "ERROR";
    previousValue = null;
    currentOperator = null;
    shouldOverwrite = true;
    lastOperator = null;
    lastOperand = null;
}

/* =========================================================
   補助操作
========================================================= */

function clearCalculator() {
    currentValue = "0";
    previousValue = null;
    currentOperator = null;
    shouldOverwrite = false;
    lastOperator = null;
    lastOperand = null;
}

function backspace() {
    if (currentValue === "ERROR") {
        clearCalculator();
        return;
    }

    if (shouldOverwrite) {
        return;
    }

    if (
        currentValue.length <= 1 ||
        (
            currentValue.startsWith("-") &&
            currentValue.length === 2
        )
    ) {
        currentValue = "0";
        return;
    }

    currentValue = currentValue.slice(0, -1);

    if (
        currentValue === "" ||
        currentValue === "-"
    ) {
        currentValue = "0";
    }
}

function convertToPercent() {
    if (currentValue === "ERROR") {
        return;
    }

    const number =
        Number.parseFloat(currentValue);

    if (!Number.isFinite(number)) {
        return;
    }

    currentValue =
        normalizeResult(number / 100);

    shouldOverwrite = true;
}

function toggleSign() {
    if (currentValue === "ERROR") {
        return;
    }

    if (currentValue === "0") {
        currentValue = "-0";
        return;
    }

    currentValue =
        currentValue.startsWith("-")
            ? currentValue.slice(1)
            : `-${currentValue}`;
}

/* =========================================================
   ボタン押下演出
========================================================= */

function animateButton(button) {
    button.classList.remove("is-pressed");

    void button.offsetWidth;

    button.classList.add("is-pressed");

    window.setTimeout(() => {
        button.classList.remove("is-pressed");
    }, 165);
}

function triggerResultFlash(success) {
    if (
        typeof calculator.animate !==
        "function"
    ) {
        return;
    }

    calculator.animate(
        [
            {
                filter:
                    success
                        ? "brightness(1.06)"
                        : "brightness(0.96)"
            },
            {
                filter:
                    success
                        ? "brightness(1.18)"
                        : "brightness(0.72)"
            },
            {
                filter: "brightness(1)"
            }
        ],
        {
            duration: success ? 320 : 420,
            easing: "ease-out"
        }
    );
}

/* =========================================================
   パーティクル
========================================================= */

function createParticles(button) {
    if (!canvas || !context) {
        return;
    }

    /*
       数字と演算ボタンで発生。
       銀ボタンと0ボタンでは発生させない。
    */
    if (
        button.classList.contains("utility-key") ||
        button.classList.contains("zero-key")
    ) {
        return;
    }

    const rect =
        button.getBoundingClientRect();

    const originX =
        rect.left + rect.width / 2;

    const originY =
        rect.top + rect.height / 2;

    let count = 8;

    if (
        button.classList.contains(
            "operator-equal"
        )
    ) {
        count = 16;
    } else if (
        button.classList.contains(
            "operator-key"
        )
    ) {
        count = 10;
    }

    for (
        let index = 0;
        index < count;
        index += 1
    ) {
        const angle =
            Math.random() *
            Math.PI *
            2;

        const speed =
            1.05 +
            Math.random() *
            2.5;

        particles.push({
            x: originX,
            y: originY,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed -
                0.55,

            radius:
                1.1 +
                Math.random() *
                2.2,

            life: 1,

            decay:
                0.026 +
                Math.random() *
                0.024
        });
    }

    startParticleAnimation();
}

function startParticleAnimation() {
    if (
        !context ||
        particleAnimationId !== null
    ) {
        return;
    }

    const renderParticles = () => {
        context.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );

        particles = particles.filter(
            (particle) =>
                particle.life > 0
        );

        for (const particle of particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;

            particle.vx *= 0.99;
            particle.vy += 0.028;
            particle.life -= particle.decay;

            context.beginPath();

            context.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );

            context.fillStyle =
                `rgba(42, 215, 255, ${Math.max(
                    particle.life,
                    0
                )})`;

            context.shadowColor =
                "rgba(0, 151, 255, 0.96)";

            context.shadowBlur = 12;

            context.fill();
        }

        context.shadowBlur = 0;

        if (particles.length > 0) {
            particleAnimationId =
                window.requestAnimationFrame(
                    renderParticles
                );
        } else {
            context.clearRect(
                0,
                0,
                window.innerWidth,
                window.innerHeight
            );

            particleAnimationId = null;
        }
    };

    particleAnimationId =
        window.requestAnimationFrame(
            renderParticles
        );
}

/* =========================================================
   ボタン処理
========================================================= */

function handleButton(button) {
    const number = button.dataset.number;
    const action = button.dataset.action;
    const value = button.dataset.value;

    animateButton(button);
    createParticles(button);

    if (number !== undefined) {
        if (number === ".") {
            inputDecimal();
        } else {
            inputNumber(number);
        }
    }

    switch (action) {
        case "operator":
            chooseOperator(value);
            break;

        case "equal":
            calculate();
            break;

        case "clear":
            clearCalculator();
            break;

        case "backspace":
            backspace();
            break;

        case "percent":
            convertToPercent();
            break;

        case "sign":
            toggleSign();
            break;

        default:
            break;
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

/* =========================================================
   キーボード対応
========================================================= */

function findButtonForKeyboardKey(key) {
    if (/^[0-9]$/.test(key)) {
        return document.querySelector(
            `[data-number="${key}"]`
        );
    }

    if (
        key === "." ||
        key === ","
    ) {
        return document.querySelector(
            '[data-number="."]'
        );
    }

    if (
        ["+", "-", "*", "/"].includes(key)
    ) {
        return document.querySelector(
            `[data-action="operator"][data-value="${key}"]`
        );
    }

    if (
        key === "Enter" ||
        key === "="
    ) {
        return document.querySelector(
            '[data-action="equal"]'
        );
    }

    if (key === "Backspace") {
        return document.querySelector(
            '[data-action="backspace"]'
        );
    }

    if (
        key === "Escape" ||
        key === "Delete"
    ) {
        return document.querySelector(
            '[data-action="clear"]'
        );
    }

    if (key === "%") {
        return document.querySelector(
            '[data-action="percent"]'
        );
    }

    return null;
}

document.addEventListener(
    "keydown",
    (event) => {
        const button =
            findButtonForKeyboardKey(
                event.key
            );

        if (!button) {
            return;
        }

        event.preventDefault();

        handleButton(button);
    }
);

/* =========================================================
   初期表示
========================================================= */

updateDisplay();
