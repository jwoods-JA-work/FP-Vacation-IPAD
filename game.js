let budget = Number(localStorage.getItem("budget")) || 4000;
let correctPath = [];
let currentStep = 0;

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

    // --- NEW: FOOLPROOF GAME OVER CHECK ---
    // If the budget drops below 0 AND the "gameover-screen" box is NOT on the page...
    if (budget < 0 && !document.getElementById("gameover-screen")) {
        window.location.href = "gameover.html"; // Send them to the game over screen!
    }
}

/* ---------------------------
   TICKET SYSTEM
----------------------------*/
function buyTicket(cost, nextPage) {
    budget = Number(localStorage.getItem("budget"));

    // Deduct the cost immediately
    budget -= cost;
    localStorage.setItem("budget", budget);

    // Check if that expensive ticket bankrupted them
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

    // Deduct the cost immediately
    budget -= cost;
    localStorage.setItem("budget", budget);

    // Check if the activity bankrupted them
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

    const xMove =
        (pinRect.left + pinRect.width / 2) -
        (planeRect.left + planeRect.width / 2);

    const yMove =
        (pinRect.top + pinRect.height / 2) -
        (planeRect.top + planeRect.height / 2);

    plane.style.transform = `translate(${xMove}px, ${yMove}px) rotate(20deg)`;

    plane.addEventListener("transitionend", () => {
        window.location.href = "mexico-plane-ticket.html";
    }, { once: true });
}
/* ---------------------------
   FOOD MINIGAME ENGINE
----------------------------*/

// 1. Define all your possible foods here!
const foodMenu = [
    {
        title: "Build Your Taco!",
        base: "tortilla",
        toppings: ["meat", "lettuce", "cheese"],
        folder: "Mexico/Mexico Minigame 1/Taco/" // Path to taco images
    },
    {
        title: "Build Your Tamale!",
        base: "husk",
        toppings: ["masa", "meat", "salsa"],
        folder: "Mexico/Mexico Minigame 1/Tamale/" // Make sure you create this folder & images!
    },
    {
        title: "Build Your Quesadilla!",
        base: "tortilla",
        toppings: ["cheese", "meat", "salsa"],
        folder: "Mexico/Mexico Minigame 1/Quesadilla/" // Make sure you create this folder & images!
    }
];

let currentFood = null;
let currentRecipe = [];
let foodStep = 0;

function initFoodGame() {
    const titleDisplay = document.getElementById("food-title");
    const buildArea = document.getElementById("build-area");
    const optionsArea = document.getElementById("ingredient-options");
    
    // If we aren't on the food page, skip this
    if (!buildArea || !optionsArea) return;

    // 1. Pick a random food from the menu
    currentFood = foodMenu[Math.floor(Math.random() * foodMenu.length)];
    
    // 2. Reset the UI
    titleDisplay.textContent = currentFood.title;
    buildArea.innerHTML = "";
    optionsArea.innerHTML = "";
    foodStep = 0;

    // 3. Set the recipe to EXACTLY the order you wrote in the foodMenu array
    // (We no longer shuffle the recipe, so they can use logic to guess the order)
    currentRecipe = [currentFood.base, ...currentFood.toppings];

    // 4. Shuffle the ingredient buttons so they are totally out of order on the screen!
    const allIngredients = [currentFood.base, ...currentFood.toppings].sort(() => 0.5 - Math.random());
    
    // 5. Create the clickable images dynamically
    allIngredients.forEach(ingredient => {
        const img = document.createElement("img");
        img.src = `${currentFood.folder}${ingredient}.png`;
        img.alt = ingredient;
        img.style.cursor = "pointer";
        
        // Add the click event
        img.onclick = () => addIngredient(ingredient);
        
        optionsArea.appendChild(img);
    });
}

function addIngredient(ingredient) {
    const buildArea = document.getElementById("build-area");
    if (!buildArea) return;

    if (ingredient === currentRecipe[foodStep]) {
        // Correct ingredient!
        const img = document.createElement("img");
        img.src = `${currentFood.folder}${ingredient}.png`;
        img.style.width = "80px";

        buildArea.appendChild(img);
        foodStep++;

        // Check if the food is finished
        if (foodStep === currentRecipe.length) {
            budget +=150;
            localStorage.setItem("budget", budget);
            setTimeout(() => {
                alert("Order complete! Great job! +$150");
                window.location.href = "map2.html";
            }, 300);
        }
    } else {
        // Wrong ingredient!
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();

        // Removed the "Read the recipe" text from the alert
        alert("Wrong ingredient! -$50");
    }
}
/* ---------------------------
   PYRAMID MEMORY MAZE
----------------------------*/
function generatePath() {
    let path = [[0, 0]]; // Always start at top-left
    let r = 0, c = 0;

    // Randomly walk Right or Down until we reach the bottom-right [2,2]
    while (r < 2 || c < 2) {
        if (r === 2) {
            c++; // At bottom edge, must go right
        } else if (c === 2) {
            r++; // At right edge, must go down
        } else {
            // Randomly choose down or right
            Math.random() < 0.5 ? r++ : c++;
        }
        path.push([r, c]);
    }
    return path;
}

/* ---------------- SETUP MAZE ---------------- */
function setupMaze() {
    correctPath = generatePath();
    currentStep = 0;

    // Reset all tiles visually before starting (useful if the player restarts)
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const tile = document.getElementById(`t-${r}-${c}`);
            if (tile) {
                tile.style.background = "#d9d9d9"; // Standard tile color
                if (r === 2 && c === 2) {
                    tile.innerHTML = "💎"; // Ensure treasure stays on the last tile
                } else {
                    tile.innerHTML = "";
                }
            }
        }
    }

    // Show glowing path
    correctPath.forEach(([r, c]) => {
        const tile = document.getElementById(`t-${r}-${c}`);
        if (tile) {
            tile.style.background = "#f4d35e"; // glow color
        }
    });

    // Hide exactly after 4 seconds (4000 milliseconds)
    setTimeout(() => {
        correctPath.forEach(([r, c]) => {
            const tile = document.getElementById(`t-${r}-${c}`);
            if (tile) {
                tile.style.background = "#d9d9d9"; // Reset back to default
            }
        });
    }, 4000);
}

/* ---------------- TILE CLICK ---------------- */
function selectTile(row, col, tile) {
    const expected = correctPath[currentStep];

    // Prevent errors if they click too fast or after the game ends
    if (!expected) return;

    if (row === expected[0] && col === expected[1]) {
        // Correct step!
        tile.innerHTML = "🧍";
        tile.style.background = "#90be6d"; // Success green

        currentStep++;

        // Check if they reached the end
        if (currentStep === correctPath.length) {
            budget +=150;
            localStorage.setItem("budget",budget)
            setTimeout(() => {
                alert("🎉 Treasure found! +$150");
                window.location.href = "map2.html";
            }, 300);
        }

    } else {
        // Wrong step!
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();

        alert("💀 Trap! -$50");
    }
}

/* ---------------------------
   INITIALIZATION
----------------------------*/
// Keep only ONE window.onload event to prevent code conflicts
window.onload = function () {
    initGame();
    initFoodGame();
    initYachtGame(); 
    initEiffelGame();
    initLouvreGame();
    initMichelinGame();
};


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

    // 1. Create the items hidden in the water
    const items = [
        "lobster", "lobster", "lobster", 
        "jellyfish", "jellyfish",
        "water", "water", "water", "water", "water", "water", "water"
    ];

    // 2. Shuffle them randomly
    yachtGrid = items.sort(() => 0.5 - Math.random());

    // 3. Build the clickable water tiles
    yachtGrid.forEach((item, index) => {
        const tile = document.createElement("div");
        tile.className = "ocean-tile";
        
        // Add the click event
        tile.onclick = () => diveTile(index, tile);
        
        gridArea.appendChild(tile);
    });
}

function diveTile(index, tile) {
    // If the tile is already clicked, do nothing
    if (tile.classList.contains("revealed")) return;
    
    // Mark as clicked
    tile.classList.add("revealed");
    const item = yachtGrid[index];

    if (item === "lobster") {
        tile.innerHTML = "🦞"; 
        tile.style.background = "#ff9a8b"; // Salmon color
        lobstersCaught++;

        if (lobstersCaught === 3) {
            // Reward the player!
            budget += 150;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            
            setTimeout(() => {
                alert("You caught all the lobsters for dinner! +$150");
                window.location.href = "map2.html";
            }, 300);
        }

    } else if (item === "jellyfish") {
        tile.innerHTML = "🪼";
        tile.style.background = "#c8a2c8"; // Purple color
        
        // Penalty!
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        
        alert("Ouch! A jellyfish stung you! -$50");

    } else {
        // Just empty water
        tile.innerHTML = "🫧";
        tile.style.background = "#89cff0"; // Light blue color
    }
}



/* ---------------------------
   MAP 2 ANIMATION
----------------------------*/
function flyToNextLocation() {
    const plane = document.querySelector(".plane");
    // We target marker-1 because that is where the pin is now!
    const pin = document.querySelector(".marker-1");

    const planeRect = plane.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();

    const xMove =
        (pinRect.left + pinRect.width / 2) -
        (planeRect.left + planeRect.width / 2);

    const yMove =
        (pinRect.top + pinRect.height / 2) -
        (planeRect.top + planeRect.height / 2);

    // Plane tilts up slightly for the next flight
    plane.style.transform = `translate(${xMove}px, ${yMove}px) rotate(15deg)`;

    plane.addEventListener("transitionend", () => {
        // Change this to whatever you name your next location's ticket HTML!
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
    
    // Spawn a target every 1 second
    eiffelInterval = setInterval(() => {
        const target = document.createElement("div");
        target.className = "popup-target";
        
        // 70% chance to be a landmark, 30% chance to be a pigeon
        const isPigeon = Math.random() < 0.3;
        target.innerHTML = isPigeon ? "🐦" : ["🏛️", "⛪️", "🏰"][Math.floor(Math.random() * 3)];
        
        // Random position within the camera view
        target.style.left = Math.floor(Math.random() * 500) + "px";
        target.style.top = Math.floor(Math.random() * 300) + "px";
        
        target.onclick = function() {
            if (isPigeon) {
                budget -= 50;
                localStorage.setItem("budget", budget);
                updateBudgetUI();
                alert("You ruined the photo with a Pigeon! -$50");
                this.remove();
            } else {
                this.innerHTML = "📸"; // Flash effect
                setTimeout(() => this.remove(), 200);
                photosTaken++;
                
                if (photosTaken === 4) {
                    clearInterval(eiffelInterval);
                    budget += 150;
                    localStorage.setItem("budget", budget);
                    updateBudgetUI();
                    setTimeout(() => {
                        alert("Perfect Photos! +$150");
                        window.location.href = "map3.html"; // To next map!
                    }, 300);
                }
            }
        };
        
        camera.appendChild(target);
        
        // Disappear after 1.5 seconds if not clicked
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

    // We have 4 pairs (8 total cards)
    const artSymbols = ["🖼️", "🖼️", "🗿", "🗿", "🏺", "🏺", "👑", "👑"];
    const shuffledArt = artSymbols.sort(() => 0.5 - Math.random());
    
    matchedPairs = 0;
    flippedCards = []; // Reset this!
    grid.innerHTML = "";

    shuffledArt.forEach((symbol) => {
        const card = document.createElement("div");
        card.className = "art-card";
        card.dataset.symbol = symbol;
        
        // Put the emoji inside a span
        const symbolSpan = document.createElement("span");
        symbolSpan.innerHTML = symbol;
        symbolSpan.className = "hidden-symbol";
        
        card.appendChild(symbolSpan);
        card.onclick = () => flipCard(card);
        grid.appendChild(card);
    });
}

function flipCard(card) {
    // If it's already flipped or 2 cards are currently animating, ignore the click
    if (card.classList.contains("flipped") || flippedCards.length === 2) return;

    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        // Check for match
        if (flippedCards[0].dataset.symbol === flippedCards[1].dataset.symbol) {
            flippedCards = []; // It's a match! Clear array.
            matchedPairs++;
            
            if (matchedPairs === 4) {
                budget += 150;
                localStorage.setItem("budget", budget);
                updateBudgetUI();
                setTimeout(() => {
                    alert("You found all the artifacts! +$150");
                    window.location.href = "map3.html";
                }, 300);
            }
        } else {
            // Not a match, penalty and unflip
            budget -= 50;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            
            setTimeout(() => {
                alert("Wrong match! Security is watching... -$50");
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
let plateSpeed = 10;
let coursesServed = 0;
let timingAnimation;

function initMichelinGame() {
    const plate = document.getElementById("moving-plate");
    if (!plate) return;

    function animatePlate() {
        if (movingRight) {
            platePos += plateSpeed;
            if (platePos > 750) movingRight = false; // hit right edge
        } else {
            platePos -= plateSpeed;
            if (platePos < 0) movingRight = true; // hit left edge
        }
        plate.style.left = platePos + "px";
        timingAnimation = requestAnimationFrame(animatePlate);
    }
    
    coursesServed = 0;
    plateSpeed = 20; // Resets speed
    animatePlate();
}

function checkServe() {
    // The green zone is from 200px to 300px
    // The plate icon is about 50px wide, so its center is platePos + 25
    const plateCenter = platePos + 75;

    if (plateCenter >= 200 && plateCenter <= 370) {
        coursesServed++;
        plateSpeed += 10; // Make it move faster each time!
        
        if (coursesServed === 3) {
            cancelAnimationFrame(timingAnimation);
            budget += 150;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            setTimeout(() => {
                alert("Perfect 3-Course Dinner! The VIP loved it! +$150");
                window.location.href = "map3.html";
            }, 300);
        } else {
            alert(`Course ${coursesServed} served perfectly! Get ready... it's speeding up!`);
        }
    } else {
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        alert("You missed the table! Food dropped. -$50");
    }
}

/* ---------------------------
   MAP 3 ANIMATION
----------------------------*/
function flyToLocation3() {
    const plane = document.querySelector(".plane");
    // We target marker-2 because that is where the pin is now!
    const pin = document.querySelector(".marker-2");

    const planeRect = plane.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();

    const xMove =
        (pinRect.left + pinRect.width / 2) -
        (planeRect.left + planeRect.width / 2);

    const yMove =
        (pinRect.top + pinRect.height / 2) -
        (planeRect.top + planeRect.height / 2);

    // Plane tilts steeply down (75 degrees) for the southbound flight
    plane.style.transform = `translate(${xMove}px, ${yMove}px) rotate(75deg)`;

    plane.addEventListener("transitionend", () => {
        // UPDATE THIS to whatever your third location's ticket HTML is named!
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

    // 1. Choose a random "perfect focus" spot between 20 and 80
    targetFocus = Math.floor(Math.random() * 61) + 20;

    // 2. Start the slider far away from the answer so it's very blurry initially
    slider.value = Math.random() < 0.5 ? 10 : 90;

    // 3. Function to update how blurry the penguin is
    function updateBlur() {
        const currentFocus = slider.value;
        // Find out how far the slider is from the correct answer
        const diff = Math.abs(currentFocus - targetFocus);
        
        // The further away it is, the higher the blur pixel radius! 
        // We divide by 3 to make the blur fade nicely.
        subject.style.filter = `blur(${diff / 3}px)`;
    }

    // 4. Update the blur every single time the slider moves
    slider.addEventListener("input", updateBlur);

    // Apply the initial blur when the page loads
    updateBlur();
}

function snapPhoto() {
    const slider = document.getElementById("focus-slider");
    const currentFocus = slider.value;
    
    // Check how close they were to the perfect spot
    const diff = Math.abs(currentFocus - targetFocus);

    // If they are within 3 notches of the perfect answer, it's a win!
    if (diff <= 3) { 
        budget += 150;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        
        setTimeout(() => {
            alert("Perfect Shot! The penguin is crystal clear! +$150");
            window.location.href = "map4.html"; // Goes to the final map!
        }, 300);
        
    } else {
        // If the blur is still too high, penalty!
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        
        alert("The photo is too blurry! Slide the focus to make it clear. -$50");
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
    currentWind = directions[Math.floor(Math.random() * directions.length)];

    // Visually move the car based on the wind direction!
    if (currentWind === "⬅️") {
        car.style.transform = "rotate(-35deg)"; // Swings left
    } else if (currentWind === "➡️") {
        car.style.transform = "rotate(35deg)"; // Swings right
    } else if (currentWind === "⬆️") {
        car.style.transform = "translateY(-40px) scale(0.8)"; // Blown upward/away
    } else if (currentWind === "⬇️") {
        car.style.transform = "translateY(40px) scale(1.2)"; // Blown downward/closer
    }
}

function checkWind(direction) {
    const car = document.getElementById("cable-car");

    if (direction === currentWind) {
        stableCount++;
        
        // Snap the car safely back to the center!
        car.style.transform = "rotate(0deg) translateY(0px) scale(1)";

        if (stableCount === 5) {
            budget += 150;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            setTimeout(() => {
                alert("You safely reached the summit! +$150");
                window.location.href = "map4.html";
            }, 300);
        } else {
            // Give them a half-second of safety before the next wind hits
            setTimeout(changeWind, 500);
        }
    } else {
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        alert("Wrong direction! The car is swinging wildly! -$50");
    }
}

/* ========================================================
   CAPE TOWN GAME 3: BIG 5 SAFARI TRACKER (HOT & COLD)
======================================================== */
let targetX = 0;
let targetY = 0;
let animalsFound = 0;
const big5List = ["🦁", "🐘", "🦏"]; // We will find 3 for this minigame
let currentAnimal = "";

function initSafariGame() {
    const grass = document.getElementById("savanna-grass");
    const scanner = document.getElementById("scanner-glass");
    if (!grass) return;

    animalsFound = 0;
    document.getElementById("animals-found").innerText = animalsFound;
    hideNewAnimal();

    // --- NEW: SCANNER TRACKING LOGIC ---
// Make the magnifying glass follow the mouse
    grass.addEventListener("mousemove", (event) => {
        scanner.style.display = "block"; // Show the scanner
        
        // Find exact mouse position inside the grass box
        const rect = grass.getBoundingClientRect();
        
        // SUBTRACT THE 8px BORDER SO IT LINES UP PERFECTLY!
        const mouseX = event.clientX - rect.left - 8;
        const mouseY = event.clientY - rect.top - 8;
        
        // Move the emoji to those coordinates
        scanner.style.left = mouseX + "px";
        scanner.style.top = mouseY + "px";
    });

    // Hide the scanner if the mouse leaves the grass box
    grass.addEventListener("mouseleave", () => {
        scanner.style.display = "none";
    });
}
function hideNewAnimal() {
    const grass = document.getElementById("savanna-grass");
    const radar = document.getElementById("tracker-radar");
    
    // FIX: Instead of clearing everything, ONLY remove the old animals!
    // This protects our magnifying glass scanner from being deleted.
    const oldAnimals = grass.querySelectorAll(".found-animal");
    oldAnimals.forEach(animal => animal.remove());

    radar.innerText = "Radar: 📡 Scanning...";
    radar.style.color = "#f4d35e"; // Reset radar color to yellow

    // Pick a random secret X and Y coordinate inside the 500x300 box
    targetX = Math.floor(Math.random() * 420) + 40;
    targetY = Math.floor(Math.random() * 220) + 40;

    // Pick the next animal in the array
    currentAnimal = big5List[animalsFound];
}

function trackAnimal(event) {
    const grass = document.getElementById("savanna-grass");
    const radar = document.getElementById("tracker-radar");

    // FIX: Get the exact click coordinates and subtract the 8px border
    // so the click math matches the scanner math perfectly!
    const rect = grass.getBoundingClientRect();
    const clickX = event.clientX - rect.left - 8;
    const clickY = event.clientY - rect.top - 8;

    // Calculate the distance from the click to the hidden animal
    const diffX = clickX - targetX;
    const diffY = clickY - targetY;
    const distance = Math.sqrt((diffX * diffX) + (diffY * diffY));

    // Check how close they are!
    if (distance < 45) {
        // FOUND IT!
        radar.innerText = "Radar: 🎯 ANIMAL SPOTTED!";
        radar.style.color = "#90be6d"; // Green

        // Create the animal emoji and place it exactly where they clicked
        const animalIcon = document.createElement("div");
        animalIcon.className = "found-animal";
        animalIcon.innerHTML = currentAnimal;
        animalIcon.style.left = targetX + "px";
        animalIcon.style.top = targetY + "px";
        grass.appendChild(animalIcon);

        animalsFound++;
        document.getElementById("animals-found").innerText = animalsFound;

        if (animalsFound === 3) {
            budget += 150;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            setTimeout(() => {
                alert("Incredible tracking! You completed the Big 5 Safari! +$150");
                window.location.href = "map4.html"; // To next map!
            }, 1000);
        } else {
            // Wait 1.5 seconds so they can see the animal, then hide the next one
            setTimeout(hideNewAnimal, 1500); 
        }

    } else if (distance < 100) {
        radar.innerText = "Radar: 🔥 HOT! It's right here!";
        radar.style.color = "#e74c3c"; // Red
        
    } else if (distance < 200) {
        radar.innerText = "Radar: 🌤️ WARM... Keep looking.";
        radar.style.color = "#f4d35e"; // Yellow
        
    } else {
        radar.innerText = "Radar: ❄️ COLD... Way off.";
        radar.style.color = "#87ceeb"; // Ice blue

        // Penalty for wasting fuel driving in the wrong direction!
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
    // We target marker-3 because that is where the pin is now!
    const pin = document.querySelector(".marker-3");

    const planeRect = plane.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();

    const xMove =
        (pinRect.left + pinRect.width / 2) -
        (planeRect.left + planeRect.width / 2);

    const yMove =
        (pinRect.top + pinRect.height / 2) -
        (planeRect.top + planeRect.height / 2);

    // Plane tilts steeply down (75 degrees) for the southbound flight
    plane.style.transform = `translate(${xMove}px, ${yMove}px) rotate(75deg)`;

    plane.addEventListener("transitionend", () => {
        // UPDATE THIS to whatever your third location's ticket HTML is named!
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
        if (clawDropped) return; // Stop swinging if dropped

        if (clawMovingRight) {
            clawPos += 27; // Speed of the claw
            if (clawPos > 500) clawMovingRight = false; // Right wall
        } else {
            clawPos -= 27;
            if (clawPos < 0) clawMovingRight = true; // Left wall
        }
        
        claw.style.left = clawPos + "px";
        clawAnimation = requestAnimationFrame(swingClaw);
    }
    swingClaw();
}

function dropClaw() {
    if (clawDropped) return; // Can only drop once!
    clawDropped = true;
    
    const claw = document.getElementById("the-claw");
    claw.style.top = "200px"; // Visually drop it down

    // The prize is centered at roughly 170px
    const distance = Math.abs(clawPos - 265);

    setTimeout(() => {
        if (distance < 30) {
            // Close enough to grab it!
            budget += 150;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            
            alert("Grabbed the Kawaii Ramen! +$150");
            window.location.href = "victory.html"; // Final screen!
        } else {
            budget -= 50;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            
            alert("You missed the prize! The claw drops empty. -$50");
            // Reset to try again
            setTimeout(initClawGame, 1000); 
        }
    }, 600); // Wait for drop animation to finish
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
    
    // Reset all variables
    temp = 50;
    zenTime = 0;
    teaGameActive = false;
    
    // Reset visuals
    tempIndicator.style.bottom = temp + "%";
    document.getElementById("zen-progress-bar").style.width = "0%";
    
    // Show start button, hide cool button
    document.getElementById("start-tea-btn").style.display = "inline-block";
    document.getElementById("cool-btn").style.display = "none";
    
    clearInterval(heatInterval);
}

function startTeaGame() {
    // Swap the buttons
    document.getElementById("start-tea-btn").style.display = "none";
    document.getElementById("cool-btn").style.display = "inline-block";
    
    teaGameActive = true;
    temp = 50;
    zenTime = 0;
    
    // The main game loop runs every 50 milliseconds
    heatInterval = setInterval(() => {
        if (!teaGameActive) return;
        
        // 1. Heat rises constantly!
        temp += 1; 
        document.getElementById("temp-indicator").style.bottom = temp + "%";
        
        // 2. Check if the temperature is inside the Green Zone (40% to 60%)
        if (temp >= 40 && temp <= 60) {
            zenTime += 50; // Add 50 milliseconds to the timer
            
            // Calculate progress out of 5000ms (5 seconds)
            let progress = (zenTime / 5000) * 100;
            document.getElementById("zen-progress-bar").style.width = progress + "%";
            
            // WIN CONDITION!
            if (zenTime >= 5000) {
                endTeaGame(true, "Perfect Zen! The tea is flawless. +$150");
            }
        }
        
        // 3. FAILURE CONDITIONS!
        if (temp >= 100) {
            endTeaGame(false, "Too hot! The tea is boiling and ruined! -$50");
        } else if (temp <= 0) {
            endTeaGame(false, "Too cold! You added too much ice! -$50");
        }
        
    }, 50); 
}

function coolDown() {
    if (!teaGameActive) return;
    
    // Drop the temperature quickly when clicked!
    temp -= 6; 
    if (temp < 0) temp = 0; // Prevent visual glitches below 0
    
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
            alert(message);
            window.location.href = "victory.html"; // Final screen!
        }, 300);
    } else {
        budget -= 50;
        localStorage.setItem("budget", budget);
        updateBudgetUI();
        setTimeout(() => {
            alert(message);
            initTeaGame(); // Reset to try again!
        }, 300);
    }
}

/* ========================================================
   TOKYO GAME 3: VIP SUMO SHOWDOWN (5-SECOND TIMER)
======================================================== */
let sumoPower = 50; 
let sumoGameActive = false;
let opponentInterval;
let sumoTimer; // The new 5-second timer!

function initSumoGame() {
    const wrestler = document.getElementById("sumo-wrestler");
    if (!wrestler) return;

    sumoPower = 50;
    wrestler.style.left = sumoPower + "%";
    sumoGameActive = false;
    clearInterval(opponentInterval);
    clearTimeout(sumoTimer); // Reset the timer if they play again
}

function pushSumo() {
    const wrestler = document.getElementById("sumo-wrestler");

    // Start the game on the first click
    if (!sumoGameActive) {
        sumoGameActive = true;
        
        // --- NEW: THE 5-SECOND CLOCK! ---
        sumoTimer = setTimeout(() => {
            if (sumoGameActive) { // If the game hasn't ended yet
                clearInterval(opponentInterval);
                sumoGameActive = false;
                
                budget -= 50;
                localStorage.setItem("budget", budget);
                updateBudgetUI();
                
                alert("TIME'S UP! You couldn't push him out in 5 seconds! -$50");
                initSumoGame(); // Reset
            }
        }, 5000); // 5000 milliseconds = 5 seconds
        
        // The opponent pushes back every 100 milliseconds
        opponentInterval = setInterval(() => {
            sumoPower -= 1.5; 
            wrestler.style.left = sumoPower + "%";

            // If opponent pushes you all the way left (0%)
            if (sumoPower <= 0) {
                clearInterval(opponentInterval);
                clearTimeout(sumoTimer); // Stop the clock!
                sumoGameActive = false;
                
                budget -= 50;
                localStorage.setItem("budget", budget);
                updateBudgetUI();
                
                alert("You got pushed out of the ring! -$50");
                initSumoGame(); 
            }
        }, 100);
    }

    // Every time YOU click, push back to the right
    if (sumoGameActive) {
        sumoPower += 5; 
        wrestler.style.left = sumoPower + "%";

        // If you push the opponent all the way right (100%)
        if (sumoPower >= 100) {
            clearInterval(opponentInterval);
            clearTimeout(sumoTimer); // Stop the clock!
            sumoGameActive = false;
            
            budget += 150;
            localStorage.setItem("budget", budget);
            updateBudgetUI();
            
            setTimeout(() => {
                alert("Incredible strength! You won the Sumo Match! +$150");
                window.location.href = "victory.html";
            }, 300);
        }
    }
}

/* ---------------------------
   END GAME LOGIC
----------------------------*/
function initVictoryScreen() {
    const finalAmountText = document.getElementById("final-budget-amount");
    if (!finalAmountText) return; // If we aren't on the victory screen, skip this

    // Get the final budget from storage, or default to 0 if something went wrong
    const finalBudget = Number(localStorage.getItem("budget")) || 0;
    
    // Display it with a comma (e.g., 1,250)
    finalAmountText.textContent = finalBudget.toLocaleString();
}

function restartGame() {
    // 1. Wipe the budget from the browser's memory
    localStorage.removeItem("budget");
    
    // 2. Send them back to the very first map/start screen!
    // (Change "index.html" to whatever your first HTML file is named)
    window.location.href = "index.html"; 
}
/* ---------------------------
   INITIALIZATION
----------------------------*/
// Don't forget to add initYachtGame to your window.onload!
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
