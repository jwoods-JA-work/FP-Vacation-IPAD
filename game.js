let budget = Number(localStorage.getItem("budget")) || 4000;
let correctPath = [];
let currentStep = 0;
let canClickPath = false; // Tracks memory maze state flag cleanly

/* ---------------------------
   CUSTOM POPUP ENGINE
----------------------------*/
function gameAlert(message, nextAction) {
    const overlay = document.createElement("div");
    overlay.id = "custom-alert-overlay";

    const box = document.createElement("div");
    box.id = "custom-alert-box";

    const text = document.createElement("div");
    text.id = "custom-alert-text";
    text.innerHTML = message; 

    const btn = document.createElement("button");
    btn.id = "custom-alert-btn";
    btn.innerText = "OK";
    
    btn.onclick = () => {
        overlay.remove(); 
        
        if (typeof nextAction === "string") {
            window.location.href = nextAction;
        } 
        else if (typeof nextAction === "function") {
            nextAction();
        }
    };

    box.appendChild(text);
    box.appendChild(btn);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

/* ---------------------------
   INIT
----------------------------*/
function initGame() {
    if (!localStorage.getItem("budget")) {
        budget = 4000;
        localStorage.setItem("budget", budget);
    } else {
        budget = Number(localStorage.getItem("budget"));
    }

    updateBudgetUI();
    setupMaze();
}

/* ---------------------------
   UI UPDATE & GAME OVER CHECK
----------------------------*/
function updateBudgetUI() {
    const amount = document.querySelector(".amount");
    if (amount) {
        amount.textContent = budget.toLocaleString();
    }

    if (budget < 0 && !document.getElementById("gameover-screen")) {
        window.location.href = "gameover.html"; 
    }
}

/* ---------------------------
   TICKET SYSTEM
----------------------------*/
function buyTicket(cost, nextPage) {
    budget = Number(localStorage.getItem("budget"));
    budget -= cost;
    localStorage.setItem("budget", budget);

    if (budget < 0) {
        window.location.href = "gameover.html";
        return; 
    }
    window.location.href = nextPage;
}

/* ---------------------------
   ACTIVITY SYSTEM
----------------------------*/
function buyActivity(cost, nextPage) {
    budget = Number(localStorage.getItem("budget"));
    budget -= cost;
    localStorage.setItem("budget", budget);

    if (budget < 0) {
        window.location.href = "gameover.html";
        return;
    }
    window.location.href = nextPage;
}

/* ---------------------------
   START GAME
----------------------------*/
function startGame() {
    budget = 4000;
    localStorage.setItem("budget", budget);

    document.getElementById("start-screen").style.display = "none";
    document.getElementById("map-screen").style.display = "flex";

    updateBudgetUI();
}

/* ---------------------------
   MAP ANIMATION
----------------------------*/
function flyToMexico() {
    const plane = document.querySelector(".plane");
    const pin = document.querySelector(".marker-start");

    const planeRect = plane.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();

    const xMove = (pinRect.left + pinRect.width / 2) - (planeRect.left + planeRect.width / 2);
    const yMove = (pinRect.top + pinRect.height / 2) - (planeRect.top + planeRect.height / 2);

    plane.style.transform = `translate(${xMove}px, ${yMove}px) rotate(20deg)`;

    plane.addEventListener("transitionend", () => {
        window.location.href = "mexico-plane-ticket.html";
    }, { once: true });
}

/* ---------------------------
   FOOD MINIGAME ENGINE
----------------------------*/
const foodMenu = [
    {
        title: "Build Your Taco!",
        base: "tortilla",
        toppings: ["meat", "lettuce", "cheese"],
        folder: "Mexico/Mexico Minigame 1/Taco/" 
    },
    {
        title: "Build Your Tamale!",
        base: "husk",
        toppings: ["masa", "meat", "salsa"],
        folder: "Mexico/Mexico Minigame 1/Tamale/" 
    },
    {
        title: "Build Your Quesadilla!",
        base: "tortilla",
        toppings: ["cheese", "meat", "salsa"],
        folder: "Mexico/Mexico Minigame 1/Quesadilla/" 
    }
];

let currentFood = null;
let currentRecipe = [];
let foodStep = 0;

function initFoodGame() {
    const titleDisplay = document.getElementById("food-title");
    const buildArea = document.getElementById("build-area");
    const optionsArea = document.getElementById("ingredient-options");
    
    if (!buildArea || !optionsArea) return;

    currentFood = foodMenu[Math.floor(Math.random() * foodMenu.length)];
    
    titleDisplay.textContent = currentFood.title;
    buildArea.innerHTML = "";
    optionsArea.innerHTML = "";
    foodStep = 0;

    currentRecipe = [currentFood.base, ...currentFood.toppings];

    const allIngredients = [currentFood.base, ...currentFood.toppings].sort(() => 0.5 - Math.random());
    
    allIngredients.forEach(ingredient => {
        const img = document.createElement("img");
        img.src = `${currentFood.folder}${ingredient}.png`;
        img.alt = ingredient;
        img.style.cursor = "pointer";
        img.onclick = () => addIngredient(ingredient);
        optionsArea.appendChild(img);
    });
}

function addIngredient(ingredient) {
    const buildArea = document.getElementById("build-area");
    if (!buildArea) return;

    if (ingredient === currentRecipe[foodStep]) {
        const img = document.createElement("img");
        img.src = `${currentFood.folder}${ingredient}.png`;
        img.style.width = "80px";

        buildArea.appendChild(img);
        foodStep++;

        if (foodStep === currentRecipe.length) {
            budget += 150;
            localStorage.setItem("budget", budget);
            setTimeout(() => {
                gameAlert("Order complete! Great job! +$150", "map2.html");
            }, 300);
        }
    } else {
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        gameAlert("Wrong ingredient! -$50");
    }
}

/* ---------------------------
   PYRAMID MEMORY MAZE
----------------------------*/
function generatePath() {
    let path = [[0, 0]]; 
    let r = 0, c = 0;

    while (r < 2 || c < 2) {
        if (r === 2) {
            c++; 
        } else if (c === 2) {
            r++; 
        } else {
            Math.random() < 0.5 ? r++ : c++;
        }
        path.push([r, c]);
    }
    return path;
}

function setupMaze() {
    correctPath = generatePath();
    currentStep = 0;
    canClickPath = false; 

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const tile = document.getElementById(`t-${r}-${c}`);
            if (tile) {
                tile.style.background = "#22404d"; 
                if (r === 2 && c === 2) {
                    tile.innerHTML = "💎"; 
                } else {
                    tile.innerHTML = "";
                }
            }
        }
    }

    correctPath.forEach(([r, c]) => {
        const tile = document.getElementById(`t-${r}-${c}`);
        if (tile) {
            tile.style.background = "#e3e453"; 
        }
    });

    setTimeout(() => {
        correctPath.forEach(([r, c]) => {
            const tile = document.getElementById(`t-${r}-${c}`);
            if (tile) {
                tile.style.background = "#22404d"; 
            }
        });
        canClickPath = true; 
    }, 2000);
}

function selectTile(row, col, tile) {
    if (!canClickPath) return;

    const expected = correctPath[currentStep];
    if (!expected) return;

    if (row === expected[0] && col === expected[1]) {
        tile.innerHTML = "🧍";
        tile.style.background = "#8fc440"; 

        currentStep++;

        if (currentStep === correctPath.length) {
            canClickPath = false; 
            budget += 150;
            localStorage.setItem("budget", budget);
            
            setTimeout(() => {
               gameAlert("🎉 Treasure found! +$150", "map2.html");
            }, 300);
        }
    } else {
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        gameAlert("💀 Trap! -$50");
    }
}

/* ---------------------------
   YACHT & SNORKELING MINIGAME
----------------------------*/
let yachtGrid = [];
let lobstersCaught = 0;

function initYachtGame() {
    const gridArea = document.getElementById("ocean-grid");
    if (!gridArea) return;

    lobstersCaught = 0;
    gridArea.innerHTML = "";

    const items = [
        "lobster", "lobster", "lobster", 
        "jellyfish", "jellyfish",
        "water", "water", "water", "water", "water", "water", "water"
    ];

    yachtGrid = items.sort(() => 0.5 - Math.random());

    yachtGrid.forEach((item, index) => {
        const tile = document.createElement("div");
        tile.className = "ocean-tile";
        tile.onclick = () => diveTile(index, tile);
        gridArea.appendChild(tile);
    });
}

function diveTile(index, tile) {
    if (tile.classList.contains("revealed")) return;
    
    tile.classList.add("revealed");
    const item = yachtGrid[index];

    if (item === "lobster") {
        tile.innerHTML = "🦞"; 
        tile.style.background = "#ff9a8b"; 
        lobstersCaught++;

        if (lobstersCaught === 3) {
            budget += 150;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            
            setTimeout(() => {
               gameAlert("You caught all the lobsters for dinner! +$150", "map2.html");
            }, 300);
        }
    } else if (item === "jellyfish") {
        tile.innerHTML = "🪼";
        tile.style.background = "#c8a2c8"; 
        
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        gameAlert("Ouch! A jellyfish stung you! -$50");
    } else {
        tile.innerHTML = "🫧";
        tile.style.background = "#89cff0"; 
    }
}

/* ---------------------------
   MAP 2 ANIMATION
----------------------------*/
function flyToNextLocation() {
    const plane = document.querySelector(".plane");
    const pin = document.querySelector(".marker-1");

    const planeRect = plane.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();

    const xMove = (pinRect.left + pinRect.width / 2) - (planeRect.left + planeRect.width / 2);
    const yMove = (pinRect.top + pinRect.height / 2) - (planeRect.top + planeRect.height / 2);

    plane.style.transform = `translate(${xMove}px, ${yMove}px) rotate(15deg)`;

    plane.addEventListener("transitionend", () => {
        window.location.href = "paris-plane-ticket.html"; 
    }, { once: true });
}

/* ========================================================
   PARIS GAME 1: EIFFEL TOWER SNAP
======================================================== */
let photosTaken = 0;
let eiffelInterval;

function initEiffelGame() {
    const camera = document.getElementById("camera-view");
    if (!camera) return;

    photosTaken = 0;
    
    eiffelInterval = setInterval(() => {
        const target = document.createElement("div");
        target.className = "popup-target";
        
        const isPigeon = Math.random() < 0.3;
        target.innerHTML = isPigeon ? "🐦" : ["🏛️", "⛪️", "🏰"][Math.floor(Math.random() * 3)];
        
        target.style.left = Math.floor(Math.random() * 500) + "px";
        target.style.top = Math.floor(Math.random() * 300) + "px";
        
        target.onclick = function() {
            if (isPigeon) {
                budget -= 50;
                localStorage.setItem("budget", budget);
                updateBudgetUI();
                gameAlert("You ruined the photo with a Pigeon! -$50");
                this.remove();
            } else {
                this.innerHTML = "📸"; 
                setTimeout(() => this.remove(), 200);
                photosTaken++;
                
                if (photosTaken === 4) {
                    clearInterval(eiffelInterval);
                    budget += 150;
                    localStorage.setItem("budget", budget);
                    updateBudgetUI();
                    setTimeout(() => {
                        gameAlert("Perfect Photos! +$150","map3.html");
                    }, 300);
                }
            }
        };
        
        camera.appendChild(target);
        setTimeout(() => { if(target.parentNode) target.remove(); }, 1500);
    }, 1000);
}

/* ========================================================
   PARIS GAME 2: LOUVRE ART MATCH
======================================================== */
let flippedCards = [];
let matchedPairs = 0;

function initLouvreGame() {
    const grid = document.getElementById("art-grid");
    if (!grid) return;

    const artSymbols = ["🖼️", "🖼️", "🗿", "🗿", "🏺", "🏺", "👑", "👑"];
    const shuffledArt = artSymbols.sort(() => 0.5 - Math.random());
    
    matchedPairs = 0;
    flippedCards = []; 
    grid.innerHTML = "";

    shuffledArt.forEach((symbol) => {
        const card = document.createElement("div");
        card.className = "art-card";
        card.dataset.symbol = symbol;
        
        const symbolSpan = document.createElement("span");
        symbolSpan.innerHTML = symbol;
        symbolSpan.className = "hidden-symbol";
        
        card.appendChild(symbolSpan);
        card.onclick = () => flipCard(card);
        grid.appendChild(card);
    });
}

function flipCard(card) {
    if (card.classList.contains("flipped") || flippedCards.length === 2) return;

    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        if (flippedCards[0].dataset.symbol === flippedCards[1].dataset.symbol) {
            flippedCards = []; 
            matchedPairs++;
            
            if (matchedPairs === 4) {
                budget += 150;
                localStorage.setItem("budget", budget);
                updateBudgetUI();
                setTimeout(() => {
                    gameAlert("You found all the artifacts! +$150","map3.html");
                }, 300);
            }
        } else {
            budget -= 50;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            
            setTimeout(() => {
                gameAlert("Wrong match! Security is watching... -$50");
                flippedCards[0].classList.remove("flipped");
                flippedCards[1].classList.remove("flipped");
                flippedCards = [];
            }, 800);
        }
    }
}

/* ========================================================
   PARIS GAME 3: MICHELIN VIP SERVE
======================================================== */
let platePos = 0; 
let movingRight = true;
let plateSpeed = 1.5; 
let coursesServed = 0;
let timingAnimation;

function initMichelinGame() {
    const plate = document.getElementById("moving-plate");
    if (!plate) return;

    function animatePlate() {
        if (movingRight) {
            platePos += plateSpeed;
            if (platePos > 80) movingRight = false; 
        } else {
            platePos -= plateSpeed;
            if (platePos < 0) movingRight = true; 
        }
        
        plate.style.left = platePos + "%"; 
        timingAnimation = requestAnimationFrame(animatePlate);
    }
    
    coursesServed = 0;
    plateSpeed = 1.5; 
    platePos = 0;
    animatePlate();
}

function checkServe() {
    const plateCenter = platePos + 7.5;

    if (plateCenter >= 25 && plateCenter <= 50) {
        coursesServed++;
        plateSpeed += 0.8; 
        
        if (coursesServed === 3) {
            cancelAnimationFrame(timingAnimation);
            budget += 150;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            setTimeout(() => {
                gameAlert("Perfect 3-Course Dinner! The VIP loved it! +$150","map3.html");
            }, 300);
        } else {
            gameAlert(`Course ${coursesServed} served perfectly! Get ready... it's speeding up!`);
        }
    } else {
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        gameAlert("You missed the table! Food dropped. -$50");
    }
}

/* ---------------------------
   MAP 3 ANIMATION
----------------------------*/
function flyToLocation3() {
    const plane = document.querySelector(".plane");
    const pin = document.querySelector(".marker-2");

    const planeRect = plane.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();

    const xMove = (pinRect.left + pinRect.width / 2) - (planeRect.left + planeRect.width / 2);
    const yMove = (pinRect.top + pinRect.height / 2) - (planeRect.top + planeRect.height / 2);

    plane.style.transform = `translate(${xMove}px, ${yMove}px) rotate(75deg)`;

    plane.addEventListener("transitionend", () => {
        window.location.href = "africa-plane-ticket.html"; 
    }, { once: true });
}

/* ========================================================
   CAPE TOWN GAME 1: PENGUIN PHOTOGRAPHER (FOCUS GAME)
======================================================== */
let targetFocus = 0;

function initPenguinGame() {
    const slider = document.getElementById("focus-slider");
    const subject = document.getElementById("penguin-subject");
    
    if (!slider || !subject) return;

    targetFocus = Math.floor(Math.random() * 61) + 20;
    slider.value = Math.random() < 0.5 ? 10 : 90;

    function updateBlur() {
        const currentFocus = slider.value;
        const diff = Math.abs(currentFocus - targetFocus);
        subject.style.filter = `blur(${diff / 3}px)`;
    }

    slider.addEventListener("input", updateBlur);
    updateBlur();
}

function snapPhoto() {
    const slider = document.getElementById("focus-slider");
    const currentFocus = slider.value;
    const diff = Math.abs(currentFocus - targetFocus);

    if (diff <= 3) { 
        budget += 150;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        
        setTimeout(() => {
            gameAlert("Perfect Shot! The penguin is crystal clear! +$150","map4.html");
        }, 300);
        
    } else {
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        gameAlert("The photo is too blurry! Slide the focus to make it clear. -$50");
    }
}

/* ========================================================
   CAPE TOWN GAME 2: CABLE CAR STABILIZER (VISUAL)
======================================================== */
let stableCount = 0;
let currentWind = "";
const directions = ["⬆️", "⬇️", "⬅️", "➡️"];

function initCableCarGame() {
    const car = document.getElementById("cable-car");
    if (!car) return;

    stableCount = 0;
    changeWind();
}

function changeWind() {
    const car = document.getElementById("cable-car");
    if (!car) return;
    currentWind = directions[Math.floor(Math.random() * directions.length)];

    if (currentWind === "⬅️") {
        car.style.transform = "rotate(-35deg)"; 
    } else if (currentWind === "➡️") {
        car.style.transform = "rotate(35deg)"; 
    } else if (currentWind === "⬆️") {
        car.style.transform = "translateY(-40px) scale(0.8)"; 
    } else if (currentWind === "⬇️") {
        car.style.transform = "translateY(40px) scale(1.2)"; 
    }
}

function checkWind(direction) {
    const car = document.getElementById("cable-car");

    if (direction === currentWind) {
        stableCount++;
        car.style.transform = "rotate(0deg) translateY(0px) scale(1)";

        if (stableCount === 5) {
            budget += 150;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            setTimeout(() => {
                gameAlert("You safely reached the summit! +$150","map4.html");
            }, 300);
        } else {
            setTimeout(changeWind, 500);
        }
    } else {
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        gameAlert("Wrong direction! The car is swinging wildly! -$50");
    }
}

/* ========================================================
   CAPE TOWN GAME 3: BIG 5 SAFARI TRACKER (HOT & COLD)
======================================================== */
let targetX = 0;
let targetY = 0;
let animalsFound = 0;
const big5List = ["🦁", "🐘", "🦏"]; 
let currentAnimal = "";

function initSafariGame() {
    const grass = document.getElementById("savanna-grass");
    const scanner = document.getElementById("scanner-glass");
    if (!grass) return;

    animalsFound = 0;
    const foundDisplay = document.getElementById("animals-found");
    if(foundDisplay) foundDisplay.innerText = animalsFound;
    hideNewAnimal();

    grass.addEventListener("mousemove", (event) => {
        if(!scanner) return;
        scanner.style.display = "block"; 
        const rect = grass.getBoundingClientRect();
        const mouseX = event.clientX - rect.left - 8;
        const mouseY = event.clientY - rect.top - 8;
        
        scanner.style.left = mouseX + "px";
        scanner.style.top = mouseY + "px";
    });

    grass.addEventListener("mouseleave", () => {
        if(scanner) scanner.style.display = "none";
    });
}

function hideNewAnimal() {
    const grass = document.getElementById("savanna-grass");
    const radar = document.getElementById("tracker-radar");
    if(!grass) return;

    const oldAnimals = grass.querySelectorAll(".found-animal");
    oldAnimals.forEach(animal => animal.remove());

    if(radar) {
        radar.innerText = "Radar: 📡 Scanning...";
        radar.style.color = "#f4d35e"; 
    }

    targetX = Math.floor(Math.random() * 420) + 40;
    targetY = Math.floor(Math.random() * 220) + 40;
    currentAnimal = big5List[animalsFound];
}

function trackAnimal(event) {
    const grass = document.getElementById("savanna-grass");
    const radar = document.getElementById("tracker-radar");
    if(!grass) return;

    const rect = grass.getBoundingClientRect();
    const clickX = event.clientX - rect.left - 8;
    const clickY = event.clientY - rect.top - 8;

    const diffX = clickX - targetX;
    const diffY = clickY - targetY;
    const distance = Math.sqrt((diffX * diffX) + (diffY * diffY));

    if (distance < 45) {
        if(radar) {
            radar.innerText = "Radar: 🎯 ANIMAL SPOTTED!";
            radar.style.color = "#90be6d"; 
        }

        const animalIcon = document.createElement("div");
        animalIcon.className = "found-animal";
        animalIcon.innerHTML = currentAnimal;
        animalIcon.style.left = targetX + "px";
        animalIcon.style.top = targetY + "px";
        grass.appendChild(animalIcon);

        animalsFound++;
        const foundDisplay = document.getElementById("animals-found");
        if(foundDisplay) foundDisplay.innerText = animalsFound;

        if (animalsFound === 3) {
            budget += 150;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            setTimeout(() => {
                gameAlert("Incredible tracking! You completed the Big 5 Safari! +$150","map4.html");
            }, 1000);
        } else {
            setTimeout(hideNewAnimal, 1500); 
        }

    } else if (distance < 100) {
        if(radar) {
            radar.innerText = "Radar: 🔥 HOT! It's right here!";
            radar.style.color = "#e74c3c"; 
        }
    } else if (distance < 200) {
        if(radar) {
            radar.innerText = "Radar: 🌤️ WARM... Keep looking.";
            radar.style.color = "#f4d35e"; 
        }
    } else {
        if(radar) {
            radar.innerText = "Radar: ❄️ COLD... Way off.";
            radar.style.color = "#87ceeb"; 
        }
        budget -= 10;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
    }
}

/* ---------------------------
   MAP 4 ANIMATION
----------------------------*/
function flyToLocation4() {
    const plane = document.querySelector(".plane");
    const pin = document.querySelector(".marker-3");

    const planeRect = plane.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();

    const xMove = (pinRect.left + pinRect.width / 2) - (planeRect.left + planeRect.width / 2);
    const yMove = (pinRect.top + pinRect.height / 2) - (planeRect.top + planeRect.height / 2);

    plane.style.transform = `translate(${xMove}px, ${yMove}px) rotate(75deg)`;

    plane.addEventListener("transitionend", () => {
        window.location.href = "japan-plane-ticket.html"; 
    }, { once: true });
}

/* ========================================================
   TOKYO GAME 1: SHIBUYA CLAW MACHINE
======================================================== */
let clawPos = 0;
let clawMovingRight = true;
let clawAnimation;
let clawDropped = false;

function initClawGame() {
    const claw = document.getElementById("the-claw");
    if (!claw) return;

    clawDropped = false;
    claw.style.top = "10px";

    function swingClaw() {
        if (clawDropped) return; 

        if (clawMovingRight) {
            clawPos += 15; 
            if (clawPos > 500) clawMovingRight = false; 
        } else {
            clawPos -= 15;
            if (clawPos < 0) clawMovingRight = true; 
        }
        
        claw.style.left = clawPos + "px";
        clawAnimation = requestAnimationFrame(swingClaw);
    }
    swingClaw();
}

function dropClaw() {
    if (clawDropped) return; 
    clawDropped = true;
    
    const claw = document.getElementById("the-claw");
    if(claw) claw.style.top = "200px"; 

    const distance = Math.abs(clawPos - 265);

    setTimeout(() => {
        if (distance < 50) {
            budget += 150;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            gameAlert("Grabbed the Kawaii Ramen! +$150","victory.html");
        } else {
            budget -= 50;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            gameAlert("You missed the prize! The claw drops empty. -$50");
            setTimeout(initClawGame, 1000); 
        }
    }, 600); 
}

/* ========================================================
   TOKYO GAME 2: ZEN TEA CEREMONY (BALANCE GAME)
======================================================== */
let temp = 50;
let zenTime = 0;
let teaGameActive = false;
let heatInterval;

function initTeaGame() {
    const tempIndicator = document.getElementById("temp-indicator");
    if (!tempIndicator) return;
    
    temp = 50;
    zenTime = 0;
    teaGameActive = false;
    
    tempIndicator.style.bottom = temp + "%";
    document.getElementById("zen-progress-bar").style.width = "0%";
    
    document.getElementById("start-tea-btn").style.display = "inline-block";
    document.getElementById("cool-btn").style.display = "none";
    
    clearInterval(heatInterval);
}

function startTeaGame() {
    document.getElementById("start-tea-btn").style.display = "none";
    document.getElementById("cool-btn").style.display = "inline-block";
    
    teaGameActive = true;
    temp = 50;
    zenTime = 0;
    
    heatInterval = setInterval(() => {
        if (!teaGameActive) return;
        
        temp += 1; 
        document.getElementById("temp-indicator").style.bottom = temp + "%";
        
        if (temp >= 40 && temp <= 60) {
            zenTime += 50; 
            let progress = (zenTime / 5000) * 100;
            document.getElementById("zen-progress-bar").style.width = progress + "%";
            
            if (zenTime >= 5000) {
                endTeaGame(true, "Perfect Zen! The tea is flawless. +$150");
            }
        }
        
        if (temp >= 100) {
            endTeaGame(false, "Too hot! The tea is boiling and ruined! -$50");
        } else if (temp <= 0) {
            endTeaGame(false, "Too cold! You added too much ice! -$50");
        }
        
    }, 50); 
}

function coolDown() {
    if (!teaGameActive) return;
    temp -= 6; 
    if (temp < 0) temp = 0; 
    document.getElementById("temp-indicator").style.bottom = temp + "%";
}

function endTeaGame(win, message) {
    teaGameActive = false;
    clearInterval(heatInterval);
    
    if (win) {
        budget += 150;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        setTimeout(() => {
            gameAlert(message, "victory.html");
        }, 300);
    } else {
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        setTimeout(() => {
            gameAlert(message, initTeaGame);
        }, 300);
    }
}

/* ========================================================
   TOKYO GAME 3: VIP SUMO SHOWDOWN (5-SECOND TIMER)
======================================================= */
let sumoPower = 50; 
let sumoGameActive = false;
let opponentInterval;
let sumoTimer; 

function initSumoGame() {
    const wrestler = document.getElementById("sumo-wrestler");
    if (!wrestler) return;

    sumoPower = 50;
    wrestler.style.left = sumoPower + "%";
    sumoGameActive = false;
    clearInterval(opponentInterval);
    clearTimeout(sumoTimer); 
}

function pushSumo() {
    const wrestler = document.getElementById("sumo-wrestler");

    if (!sumoGameActive) {
        sumoGameActive = true;
        
        sumoTimer = setTimeout(() => {
            if (sumoGameActive) { 
                clearInterval(opponentInterval);
                sumoGameActive = false;
                
                budget -= 50;
                localStorage.setItem("budget", budget);
                updateBudgetUI();
                
                gameAlert("TIME'S UP! You couldn't push him out in 5 seconds! -$50");
                initSumoGame(); 
            }
        }, 5000); 
        
        opponentInterval = setInterval(() => {
            sumoPower -= 1.5; 
            if(wrestler) wrestler.style.left = sumoPower + "%";

            if (sumoPower <= 0) {
                clearInterval(opponentInterval);
                clearTimeout(sumoTimer); 
                sumoGameActive = false;
                
                budget -= 50;
                localStorage.setItem("budget", budget);
                updateBudgetUI();
                
                gameAlert("You got pushed out of the ring! -$50", initSumoGame);
            }
        }, 100);
    }

    if (sumoGameActive) {
        sumoPower += 5; 
        if(wrestler) wrestler.style.left = sumoPower + "%";

        if (sumoPower >= 100) {
            clearInterval(opponentInterval);
            clearTimeout(sumoTimer); 
            sumoGameActive = false;
            
            budget += 150;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            
            setTimeout(() => {
                gameAlert("Incredible strength! You won the Sumo Match! +$150","victory.html");
            }, 300);
        }
    }
}

/* ---------------------------
   END GAME LOGIC
----------------------------*/
function initVictoryScreen() {
    const finalAmountText = document.getElementById("final-budget-amount");
    if (!finalAmountText) return; 

    const finalBudget = Number(localStorage.getItem("budget")) || 0;
    finalAmountText.textContent = finalBudget.toLocaleString();
}

function restartGame() {
    localStorage.removeItem("budget");
    window.location.href = "index.html"; 
}

/* ---------------------------
   MASTER INITIALIZATION LATCH
----------------------------*/
window.onload = function () {
    initGame();
    initFoodGame();
    initYachtGame();
    initEiffelGame(); 
    initLouvreGame();
    initMichelinGame();
    initPenguinGame();
    initCableCarGame();
    initSafariGame();
    initClawGame();
    initTeaGame();
    initSumoGame();
    initVictoryScreen();
};
