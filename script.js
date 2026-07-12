"use strict";

/* =========================================================
   YUUKA CALCULATOR v7
   script.js
   前半
========================================================= */

/* =========================================================
   要素取得
========================================================= */

const display =
    document.getElementById("display");

const calculator =
    document.querySelector(".calculator");

const buttons =
    document.querySelectorAll(
        ".calculator button"
    );

const canvas =
    document.getElementById("particles");

const context =
    canvas.getContext("2d");

/* =========================================================
   電卓状態
========================================================= */

let currentValue = "0";

let previousValue = null;

let currentOperator = null;

let shouldOverwrite = false;

let lastOperator = null;

let lastOperand = null;

/* =========================================================
   パーティクル
========================================================= */

let particles = [];

let animationId = null;

/* =========================================================
   Canvas
========================================================= */

function resizeCanvas() {

    const ratio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        window.innerWidth *
        ratio;

    canvas.height =
        window.innerHeight *
        ratio;

    canvas.style.width =
        window.innerWidth + "px";

    canvas.style.height =
        window.innerHeight + "px";

    context.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();

/* =========================================================
   表示
========================================================= */

function formatValue(value){

    if(value==="ERROR"){
        return value;
    }

    if(value.length<=12){
        return value;
    }

    const number =
        Number(value);

    if(
        !Number.isFinite(number)
    ){
        return "ERROR";
    }

    return number.toExponential(6);

}

function updateDisplay(){

    display.textContent =
        formatValue(currentValue);

    display.animate(
        [
            {
                transform:
                    "translateY(2px) scale(1.03)",

                filter:
                    "brightness(1.45)"
            },
            {
                transform:
                    "translateY(0) scale(1)",

                filter:
                    "brightness(1)"
            }
        ],
        {
            duration:170,
            easing:"ease-out"
        }
    );

}

/* =========================================================
   数字入力
========================================================= */

function inputNumber(number){

    if(
        currentValue==="ERROR"||
        shouldOverwrite
    ){

        currentValue=number;

        shouldOverwrite=false;

        return;

    }

    if(currentValue==="0"){

        currentValue=number;

        return;

    }

    if(currentValue.length>=16){
        return;
    }

    currentValue+=number;

}

function inputDecimal(){

    if(
        shouldOverwrite||
        currentValue==="ERROR"
    ){

        currentValue="0.";

        shouldOverwrite=false;

        return;

    }

    if(
        !currentValue.includes(".")
    ){

        currentValue+=".";

    }

}

/* =========================================================
   計算
========================================================= */

function normalize(number){

    if(
        !Number.isFinite(number)
    ){
        return "ERROR";
    }

    return String(

        Math.round(

            (
                number+
                Number.EPSILON
            )*
            1000000000000

        )/
        1000000000000

    );

}

function operate(
    a,
    b,
    op
){

    switch(op){

        case "+":
            return a+b;

        case "-":
            return a-b;

        case "*":
            return a*b;

        case "/":

            if(b===0){
                return null;
            }

            return a/b;

        default:

            return b;

    }

}

function chooseOperator(op){

    if(
        currentValue==="ERROR"
    ){

        clearCalculator();

        return;

    }

    if(
        currentOperator &&
        !shouldOverwrite
    ){

        calculate();

    }

    previousValue=currentValue;

    currentOperator=op;

    shouldOverwrite=true;

    lastOperator=null;

    lastOperand=null;

}

function calculate(){

    let op=currentOperator;

    let first;

    let second;

    if(
        op!==null &&
        previousValue!==null
    ){

        first=
            parseFloat(
                previousValue
            );

        second=
            parseFloat(
                currentValue
            );

        lastOperator=op;

        lastOperand=currentValue;

    }

    else if(
        lastOperator!==null
    ){

        op=lastOperator;

        first=
            parseFloat(
                currentValue
            );

        second=
            parseFloat(
                lastOperand
            );

    }

    else{

        return;

    }

    const result=
        operate(
            first,
            second,
            op
        );

    currentValue=

        result===null

        ? "ERROR"

        : normalize(result);

    currentOperator=null;

    previousValue=null;

    shouldOverwrite=true;

    flashResult(
        currentValue!=="ERROR"
    );

}
/* =========================================================
   補助機能
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

    currentValue =
        currentValue.slice(0, -1);

}

function percent() {

    if (currentValue === "ERROR") {

        return;

    }

    currentValue =
        normalize(
            Number(currentValue) / 100
        );

    shouldOverwrite = true;

}

function toggleSign() {

    if (
        currentValue === "0" ||
        currentValue === "ERROR"
    ) {

        return;

    }

    if (
        currentValue.startsWith("-")
    ) {

        currentValue =
            currentValue.slice(1);

    }

    else {

        currentValue =
            "-" + currentValue;

    }

}

/* =========================================================
   ボタン演出
========================================================= */

function animateButton(button) {

    button.classList.remove(
        "is-pressed"
    );

    void button.offsetWidth;

    button.classList.add(
        "is-pressed"
    );

    setTimeout(() => {

        button.classList.remove(
            "is-pressed"
        );

    }, 160);

}

function flashResult(success) {

    calculator.animate(

        [

            {

                filter:

                    success

                    ? "brightness(1.08)"

                    : "brightness(.95)"

            },

            {

                filter:

                    success

                    ? "brightness(1.18)"

                    : "brightness(.75)"

            },

            {

                filter:
                    "brightness(1)"

            }

        ],

        {

            duration:320,

            easing:"ease-out"

        }

    );

}

/* =========================================================
   パーティクル
========================================================= */

function createParticles(button){

    if(
        button.classList.contains("utility-key") ||
        button.classList.contains("zero-key")
    ){
        return;
    }

    const rect =
        button.getBoundingClientRect();

    const x =
        rect.left +
        rect.width/2;

    const y =
        rect.top +
        rect.height/2;

    let count = 8;

    if(
        button.classList.contains("equal")
    ){

        count = 18;

    }

    for(
        let i=0;
        i<count;
        i++
    ){

        const angle =
            Math.random() *
            Math.PI * 2;

        const speed =
            1 +
            Math.random()*2.8;

        particles.push({

            x,

            y,

            vx:
                Math.cos(angle)*
                speed,

            vy:
                Math.sin(angle)*
                speed,

            radius:
                1.5+
                Math.random()*2,

            life:1,

            decay:
                .025+
                Math.random()*.02

        });

    }

    if(animationId===null){

        animationId=
            requestAnimationFrame(
                renderParticles
            );

    }

}

function renderParticles(){

    context.clearRect(

        0,
        0,

        window.innerWidth,

        window.innerHeight

    );

    particles=
        particles.filter(

            p=>p.life>0

        );

    particles.forEach(

        p=>{

            p.x+=p.vx;

            p.y+=p.vy;

            p.vx*=.99;

            p.vy+=.03;

            p.life-=p.decay;

            context.beginPath();

            context.arc(

                p.x,

                p.y,

                p.radius,

                0,

                Math.PI*2

            );

            context.fillStyle=

                `rgba(0,140,255,${p.life})`;

            context.shadowColor=
                "#2cbcff";

            context.shadowBlur=12;

            context.fill();

        }

    );

    context.shadowBlur=0;

    if(
        particles.length
    ){

        animationId=
            requestAnimationFrame(
                renderParticles
            );

    }

    else{

        animationId=null;

    }

}

/* =========================================================
   ボタン処理
========================================================= */

function handleButton(button){

    animateButton(button);

    createParticles(button);

    const number =
        button.dataset.number;

    const action =
        button.dataset.action;

    const value =
        button.dataset.value;

    if(number!==undefined){

        if(number==="."){

            inputDecimal();

        }

        else{

            inputNumber(number);

        }

    }

    switch(action){

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

            percent();

            break;

        case "sign":

            toggleSign();

            break;

    }

    updateDisplay();

}

buttons.forEach(button=>{

    button.addEventListener(

        "click",

        ()=>handleButton(button)

    );

});

/* =========================================================
   キーボード
========================================================= */

document.addEventListener(

    "keydown",

    event=>{

        const key=
            event.key;

        let button=null;

        if(
            /^[0-9]$/.test(key)
        ){

            button=document.querySelector(

                `[data-number="${key}"]`

            );

        }

        else if(
            key==="."
        ){

            button=document.querySelector(

                '[data-number="."]'

            );

        }

        else if(
            ["+","-","*","/"].includes(key)
        ){

            button=document.querySelector(

                `[data-action="operator"][data-value="${key}"]`

            );

        }

        else if(
            key==="Enter"||
            key==="="
        ){

            button=document.querySelector(

                '[data-action="equal"]'

            );

        }

        else if(
            key==="Backspace"
        ){

            button=document.querySelector(

                '[data-action="backspace"]'

            );

        }

        else if(
            key==="Delete"||
            key==="Escape"
        ){

            button=document.querySelector(

                '[data-action="clear"]'

            );

        }

        if(!button){

            return;

        }

        event.preventDefault();

        handleButton(button);

    }

);

/* =========================================================
   初期化
========================================================= */

updateDisplay();
