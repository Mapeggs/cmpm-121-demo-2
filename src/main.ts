import "./style.css";

const APP_NAME = "Hello";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// Create and add an <h1> element for the app title
const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);

// Create a <canvas> element and set its dimensions
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.classList.add("app-canvas"); // Add a class for CSS styling
app.appendChild(canvas);