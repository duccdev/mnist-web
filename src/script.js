class Mnist {
  constructor() {
    this.weights = Array.from({ length: 10 }, () => Array(28).fill(0));
    this.bias = Array(10).fill(0);
    this.epoch = 0;
  }

  async loadFrom(modelUrl) {
    const response = await fetch(modelUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${modelUrl}: ${response.statusText}`);
    }

    const model = await response.json();
    this.weights = model.weights;
    this.bias = model.bias;
    this.epoch = model.epoch;
  }

  async predict(x) {
    let result = [];

    for (let i = 0; i < this.weights.length; i++) {
      let sum = 0;

      for (let j = 0; j < this.weights[i].length; j++) {
        sum += this.weights[i][j] * x[j];
      }

      result.push(sum + this.bias[i]);
    }

    result = result.map((x) => Math.exp(x));
    const result_exp_sum = result.flat().reduce((sum, value) => sum + value, 0);
    return result.map((x) => x / result_exp_sum);
  }
}

let model;
let canvas;
let canvasCtx;
let statusText;
let zero;
let one;
let two;
let three;
let four;
let five;
let six;
let seven;
let eight;
let nine;
let drawing = false;
let predicting = false;
const resolution = 28;
let scale;

function startDrawing(event) {
  drawing = true;
  draw(event);
}

function draw(event) {
  if (!drawing || predicting) return;

  canvasCtx.fillStyle = "white";
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / scale);
  const y = Math.floor((event.clientY - rect.top) / scale);

  canvasCtx.fillRect(x * scale, y * scale, scale, scale);
}

function clearCanvas() {
  if (predicting) return;
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function getPixelData() {
  const imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = Array.from({ length: resolution }, () =>
    Array(resolution).fill(0)
  );

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const index = (y * scale * canvas.width + x * scale) * 4;
      const pixelValue = imageData.data[index] > 0 ? 1 : 0;
      pixels[y][x] = pixelValue;
    }
  }

  return pixels;
}

async function stopDrawing() {
  if (predicting) return;
  const pixels = getPixelData().flat();
  if (pixels.every((v) => v === 0)) return;

  drawing = false;
  predicting = true;

  if (!model) {
    statusText.innerText = "Status: Loading model";
    model = new Mnist();
    await model.loadFrom("/model.json");
  }

  statusText.innerText = "Status: Predicting";
  const prediction = await model.predict(pixels);

  zero.style.height = `${(prediction[0] * 100).toFixed(2)}%`;
  one.style.height = `${(prediction[1] * 100).toFixed(2)}%`;
  two.style.height = `${(prediction[2] * 100).toFixed(2)}%`;
  three.style.height = `${(prediction[3] * 100).toFixed(2)}%`;
  four.style.height = `${(prediction[4] * 100).toFixed(2)}%`;
  five.style.height = `${(prediction[5] * 100).toFixed(2)}%`;
  six.style.height = `${(prediction[6] * 100).toFixed(2)}%`;
  seven.style.height = `${(prediction[7] * 100).toFixed(2)}%`;
  eight.style.height = `${(prediction[8] * 100).toFixed(2)}%`;
  nine.style.height = `${(prediction[9] * 100).toFixed(2)}%`;

  let biggest = -9999;
  let index = 0;

  for (let i = 0; i < prediction.length; i++) {
    if (prediction[i] > biggest) {
      biggest = prediction[i];
      index = i;
    }
  }

  statusText.innerText = `Number: ${index}, Confidence: ${(biggest * 100).toFixed(2)}%`;
  predicting = false;
}

document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("drawable");
  canvasCtx = canvas.getContext("2d");
  scale = canvas.width / resolution;
  statusText = document.getElementById("status-text");

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);

  document
    .getElementById("clear-button")
    .addEventListener("click", clearCanvas);

  zero = document.getElementById("zero");
  one = document.getElementById("one");
  two = document.getElementById("two");
  three = document.getElementById("three");
  four = document.getElementById("four");
  five = document.getElementById("five");
  six = document.getElementById("six");
  seven = document.getElementById("seven");
  eight = document.getElementById("eight");
  nine = document.getElementById("nine");
});
