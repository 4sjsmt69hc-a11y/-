"use strict";

const display =
    document.getElementById("display");

const buttons =
    document.querySelectorAll(
        ".calculator button"
    );

const canvas =
    document.getElementById("particles");

const context =
    canvas.getContext("2d");

let currentValue = "0";
let previousValue = null;
let currentOperator = null;
let shouldOverwrite = false;

let particles = [];
let animationFrameId = null;

/* =====================================
   Canvas
===================================== */

function resizeCanvas() {
    const pixelRatio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        window.innerWidth *
        pixelRatio;

    canvas.height =
        window.innerHeight *
        pixelRatio;

    canvas.style.width =
        `${window.innerWidth}px`;

    canvas.style.height =
        `${window.innerHeight}px`;

    context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );
}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();

/* =====================================
   表示
===================================== */

function formatForDisplay(value) {
    if (value === "ERROR") {
        return value;
    }

    if (value.length <= 10) {
        return value;
    }

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return value;
    }

    return number.toExponential(5);
}

function updateDisplay() {
    display.textContent =
        formatForDisplay(
            currentValue
        );

    display.animate(
        [
            {
                transform: "scale(1.025)",
                filter: "brightness(1.6)"
            },
            {
                transform: "scale(1)",
                filter: "brightness(1)"
            }
        ],
        {
            duration: 170,
            easing: "ease-out"
        }
    );
}

/* =====================================
   数字入力
===================================== */

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

    if (currentValue.length >= 16) {
        return;
    }

    currentValue += number;
}

/* =====================================
   小数
===================================== */

function inputDecimal() {
    if (
        currentValue === "ERROR" ||
        shouldOverwrite
    ) {
        currentValue = "0.";
        shouldOverwrite = false;
        return;
    }

    if (
        !currentValue.includes(".")
    ) {
        currentValue += ".";
    }
}

/* =====================================
   演算子
===================================== */

function chooseOperator(operator) {
    if (
        currentValue === "ERROR"
    ) {
        clearCalculator();
        return;
    }

    if (
        currentOperator !== null &&
        !shouldOverwrite
    ) {
        calculate();
    }

    previousValue =
        currentValue;

    currentOperator =
        operator;

    shouldOverwrite =
        true;
}

/* =====================================
   計算
===================================== */

function calculate() {
    if (
        previousValue === null ||
        currentOperator === null ||
        currentValue === "ERROR"
    ) {
        return;
    }

    const first =
        Number.parseFloat(
            previousValue
        );

    const second =
        Number.parseFloat(
            currentValue
        );

    let result;

    switch (currentOperator) {
        case "+":
            result = first + second;
            break;

        case "-":
            result = first - second;
            break;

        case "*":
            result = first * second;
            break;

        case "/":
            result =
                second === 0
                    ? "ERROR"
                    : first / second;
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

    currentValue =
        String(result);

    previousValue = null;
    currentOperator = null;
    shouldOverwrite = true;
}

/* =====================================
   補助機能
===================================== */

function clearCalculator() {
    currentValue = "0";
    previousValue = null;
    currentOperator = null;
    shouldOverwrite = false;
}

function backspace() {
    if (
        shouldOverwrite ||
        currentValue === "ERROR"
    ) {
        return;
    }

    if (
        currentValue.length <= 1
    ) {
        currentValue = "0";
        return;
    }

    currentValue =
        currentValue.slice(
            0,
            -1
        );

    if (
        currentValue === "-"
    ) {
        currentValue = "0";
    }
}

function convertToPercent() {
    if (
        currentValue === "ERROR"
    ) {
        return;
    }

    currentValue =
        String(
            Number.parseFloat(
                currentValue
            ) / 100
        );
}

function toggleSign() {
    if (
        currentValue === "0" ||
        currentValue === "ERROR"
    ) {
        return;
    }

    currentValue =
        currentValue.startsWith("-")
            ? currentValue.slice(1)
            : `-${currentValue}`;
}

/* =====================================
   ボタン演出
===================================== */

function animateButton(button) {
    button.classList.add(
        "is-pressed"
    );

    window.setTimeout(
        () => {
            button.classList.remove(
                "is-pressed"
            );
        },
        160
    );
}

/* =====================================
   パーティクル
===================================== */

function createParticles(button) {
    if (
        button.classList.contains(
            "zero-key"
        )
    ) {
        return;
    }

    const rect =
        button.getBoundingClientRect();

    const centerX =
        rect.left +
        rect.width / 2;

    const centerY =
        rect.top +
        rect.height / 2;

    const particleCount =
        button.classList.contains(
            "equal-key"
        )
            ? 14
            : 8;

    for (
        let index = 0;
        index < particleCount;
        index += 1
    ) {
        const angle =
            Math.random() *
            Math.PI *
            2;

        const speed =
            0.9 +
            Math.random() *
            2.4;

        particles.push({
            x: centerX,
            y: centerY,

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed -
                0.6,

            radius:
                1.2 +
                Math.random() *
                2.3,

            life: 1,

            decay:
                0.025 +
                Math.random() *
                0.025
        });
    }

    startParticleAnimation();
}

function startParticleAnimation() {
    if (animationFrameId !== null) {
        return;
    }

    function renderParticles() {
        context.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );

        particles =
            particles.filter(
                (particle) =>
                    particle.life > 0
            );

        particles.forEach(
            (particle) => {
                particle.x +=
                    particle.vx;

                particle.y +=
                    particle.vy;

                particle.vy += 0.025;

                particle.life -=
                    particle.decay;

                context.beginPath();

                context.arc(
                    particle.x,
                    particle.y,
                    particle.radius,
                    0,
                    Math.PI * 2
                );

                context.fillStyle =
                    `rgba(75, 235, 255, ${particle.life})`;

                context.shadowColor =
                    "rgba(55, 231, 255, 0.9)";

                context.shadowBlur = 10;

                context.fill();
            }
        );

        context.shadowBlur = 0;

        if (particles.length > 0) {
            animationFrameId =
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

            animationFrameId = null;
        }
    }

    animationFrameId =
        window.requestAnimationFrame(
            renderParticles
        );
}

/* =====================================
   ボタン入力
===================================== */

function handleButton(button) {
    const number =
        button.dataset.number;

    const action =
        button.dataset.action;

    const value =
        button.dataset.value;

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

buttons.forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                handleButton(button);
            }
        );
    }
);

/* =====================================
   キーボード
===================================== */

document.addEventListener(
    "keydown",
    (event) => {
        let target = null;

        if (
            /^[0-9]$/.test(event.key)
        ) {
            target =
                document.querySelector(
                    `[data-number="${event.key}"]`
                );
        }

        if (event.key === ".") {
            target =
                document.querySelector(
                    '[data-number="."]'
                );
        }

        if (
            ["+", "-", "*", "/"]
                .includes(event.key)
        ) {
            target =
                document.querySelector(
                    `[data-action="operator"][data-value="${event.key}"]`
                );
        }

        if (
            event.key === "Enter" ||
            event.key === "="
        ) {
            target =
                document.querySelector(
                    '[data-action="equal"]'
                );
        }

        if (
            event.key === "Backspace"
        ) {
            target =
                document.querySelector(
                    '[data-action="backspace"]'
                );
        }

        if (
            event.key === "Escape"
        ) {
            target =
                document.querySelector(
                    '[data-action="clear"]'
                );
        }

        if (event.key === "%") {
            target =
                document.querySelector(
                    '[data-action="percent"]'
                );
        }

        if (target) {
            event.preventDefault();
            handleButton(target);
        }
    }
);

updateDisplay();
