let rectangle = [];         // górne kwadraty z cyframi
let bottomSlots = [];       // dolne pola (sloty)
let dragging = null;        // przeciągany kwadrat
let offsetX = 0;
let offsetY = 0;
let size = 30;
let chosen = [];
let startTime;
let timeLimit = 15000;
let timeOver = false;
let restartDelay = 2000;
let restartTime = null;
let database;


function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  textSize(16);
  

  firebase.initializeApp(firebaseConfig);
 database = firebase.database();

  // Górny rząd kwadratów
  let spacing = size + 20;
  let totalWidth = spacing * 9; // 10 kwadratów = 9 odstępów
  let startX = (windowWidth - totalWidth) / 2;

  for (let i = 0; i < 10; i++) {
    let x = startX + i * spacing;
    let y = windowHeight / 2 - 50;
    let r = random(255);
    let g = random(255);
    let b = random(255);
    rectangle.push({ x, y, r, g, b, number: i });
  }

  // Dolny rząd kwadratów
  spacing = size + 20;
  totalWidth = spacing * 10; // 11 pól = 10 odstępów
  startX = (windowWidth - totalWidth) / 2;
  let y = windowHeight / 2 + 50;

  for (let i = 0; i < 11; i++) {
  let x = startX + i * spacing;
  bottomSlots.push({
    x,
    y,
    filled: false,
    number: null,
    locked: i < 5 // pierwsze 5 slotów są zablokowane
  });
}


  startTime = millis();
}

function draw() {
  background(255);
  let elapsed = millis() - startTime;

  // zegar i limit czasu
  if (elapsed >= timeLimit && !timeOver) {
    timeOver = true;
    restartTime = millis();
  }

  if (timeOver && chosen.length < 6) {
    fill('#DA1E1E');
    textSize(24);
    noStroke();
    text("Czas minął!", windowWidth / 2, windowHeight / 2);
    if (millis() - restartTime > restartDelay) resetGame();
    return;
  }

  if (chosen.length >= 6) {
    fill(0);
    textSize(24);
    noStroke();
    text("Twoje cyfry:", windowWidth / 2, windowHeight / 2);
    fill('#45C207');
    textSize(32);
    text(chosen.join(" "), windowWidth / 2, windowHeight / 2 + 40);
    zapiszLiczba2(chosen.join(''));
    t++;
    if(t==20){
      window.location.href = 'https://nelahryniak.github.io/Scam_7/'
      print('go');
    }
    return;
  }

  // Instrukcje i licznik czasu
  fill(0);
  textSize(24);
  textAlign(CENTER, TOP);
  noStroke();
  text("Uzupełnij 6 ostatnich cyfr Twojego PESELu", windowWidth / 2, windowHeight / 30);

  let timeLeft = max(0, ceil((timeLimit - elapsed) / 1000));
  textSize(18);
  textAlign(RIGHT, TOP);
  text(timeLeft, windowWidth / 2, windowHeight / 10);

  // Górny rząd
  textAlign(CENTER, CENTER);
  textSize(12);

  for (let re of rectangle) {
    if (re !== dragging) {
      fill(re.r, re.g, re.b);
      noStroke();
      rect(re.x, re.y, size, size);
      fill(255);
      noStroke();
      text(re.number, re.x, re.y);
    }
  }

  // Przeciągany kwadrat
  if (dragging !== null) {
    fill(dragging.r, dragging.g, dragging.b);
    noStroke();
    rect(mouseX + offsetX, mouseY + offsetY, size, size);
    fill(255);
    noStroke();
    text(dragging.number, mouseX + offsetX, mouseY + offsetY);
  }

  // Dolny rząd - uzupełnianie
  for (let slot of bottomSlots) {
    if (slot.locked) {
      fill(0);
      noStroke();
      rect(slot.x, slot.y, size, size);
    } else if (slot.filled) {
      fill(100);
      noStroke();
      rect(slot.x, slot.y, size, size);
       fill(255);
  text(slot.number, slot.x, slot.y);
} else {
  noFill();
  stroke(0);
  strokeWeight(2);
  rect(slot.x, slot.y, size, size);
}
    }
}

function zapiszLiczba2(liczba) {
  database.ref("mojaLiczba2").set(liczba);
  print("Zapisano: " + liczba);
}


function mousePressed() {
  for (let re of rectangle) {
    if (dist(mouseX, mouseY, re.x, re.y) < size / 2) {
      dragging = re;
      offsetX = re.x - mouseX;
      offsetY = re.y - mouseY;
      break;
    }
  }
}

function mouseReleased() {
  if (dragging !== null) {
    for (let slot of bottomSlots) {
      if (!slot.locked && !slot.filled && dist(mouseX, mouseY, slot.x, slot.y) < size / 2) {
        slot.filled = true;
        slot.number = dragging.number;
        chosen.push(dragging.number); // dodajemy do tablicy chosen
        break;
      }
    }
    dragging = null;
  }
}


function resetGame() {
  // Zresetuj wszystkie dane
  rectangle = [];
  bottomSlots = [];
  chosen = [];
  dragging = null;
  timeOver = false;
  restartTime = null;
  startTime = millis();

  // Parametry wspólne
  let spacing = size + 20;

  // Górny rząd (10 kwadratów)
  let startX = (windowWidth - spacing * 9) / 2;
  for (let i = 0; i < 10; i++) {
    rectangle.push({
      x: startX + i * spacing,
      y: windowHeight / 2 - 50,
      r: random(255),
      g: random(255),
      b: random(255),
      number: i
    });
  }

  // Dolny rząd (11 pól, z czego 5 zablokowanych)
  startX = (windowWidth - spacing * 10) / 2;
  let y = windowHeight / 2 + 50;
  for (let i = 0; i < 11; i++) {
    bottomSlots.push({
      x: startX + i * spacing,
      y: y,
      filled: false,
      number: null,
      locked: i < 5
    });
  }
}
