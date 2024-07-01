class Mnist {
  constructor() {
    this.weights = Array.from({ length: 28 }, () => Array(28).fill(0));
    this.bias = Array(10).fill(0);
    this.epoch = 0;
  }

  async loadFrom(modelUrl) {
    const response = await fetch(modelUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${modelUrl}: ${response.statusText}`);
    }

    const modelFile = await response.json();
    this.weights = modelFile.weights;
    this.bias = modelFile.bias;
    this.epoch = modelFile.epoch;
  }

  async predict(x) {
    let result = [];

    for (let i = 0; i < this.weights.length; i++) {
      let sum = 0.0;

      for (let j = 0; j < this.weights[i].length; j++) {
        sum += weights[j] * x[j];
      }

      result.push(sum + this.bias[i]);
    }

    result = result.map((x) => Math.exp(x));
    const result_exp_sum = result.flat().reduce((sum, value) => sum + value, 0);
    return result.map((x) => x / result_exp_sum);
  }
}

let canvas;
let canvasCtx;
let drawing = false;
const resolution = 28;
let scale;

function startDrawing(event) {
  drawing = true;
  draw(event);
}

function draw(event) {
  if (!drawing) return;

  canvasCtx.fillStyle = "white";
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / scale);
  const y = Math.floor((event.clientY - rect.top) / scale);

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      canvasCtx.fillRect((x + i) * scale, (y + j) * scale, scale, scale);
    }
  }
}

function stopDrawing() {
  drawing = false;
}

function getPixelData() {
  const imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = new Array(resolution)
    .fill(null)
    .map(() => new Array(resolution).fill(0));

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          const nx = x + i;
          const ny = y + j;
          if (nx >= 0 && nx < resolution && ny >= 0 && ny < resolution) {
            const index = (ny * scale * canvas.width + nx * scale) * 4;
            if (imageData.data[index] > 0) {
              pixels[y][x] = 1;
            }
          }
        }
      }
    }
  }

  return pixels;
}

document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("drawable");
  canvasCtx = canvas.getContext("2d");
  scale = canvas.width / resolution;

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);

  document
    .getElementById("clear-button")
    .addEventListener("click", () =>
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
    );
});
