import "./style.css";

const APPLICATION_TITLE = "Drawing App";
const mainContainer = document.querySelector<HTMLDivElement>("#app")!;

document.title = APPLICATION_TITLE;

// Function to create the app title
const createAppTitle = (titleText: string): HTMLElement => {
    const titleElement = document.createElement("h1");
    titleElement.textContent = titleText;
    return titleElement;
};

// Function to create a canvas element
const createCanvasElement = (width: number, height: number, cssClass: string): HTMLCanvasElement => {
    const canvasElement = document.createElement("canvas");
    canvasElement.width = width;
    canvasElement.height = height;
    canvasElement.classList.add(cssClass);
    return canvasElement;
};

// Function to create a clear button
const createClearButton = (): HTMLButtonElement => {
    const button = document.createElement("button");
    button.textContent = "Clear";
    button.addEventListener("click", () => clearCanvas());
    return button;
};

// Function to clear the canvas
const clearCanvas = () => {
    const context = canvas.getContext("2d");
    if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
};

// Add title, canvas, and clear button to the main container
mainContainer.appendChild(createAppTitle(APPLICATION_TITLE));

const canvas = createCanvasElement(256, 256, "app-canvas");
mainContainer.appendChild(canvas);

const clearButton = createClearButton();
mainContainer.appendChild(clearButton);

// Variables for drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Function to start drawing on mousedown
const startDrawing = (event: MouseEvent) => {
    isDrawing = true;
    [lastX, lastY] = [event.offsetX, event.offsetY]; // Initialize last position
    draw(event); // Start drawing immediately on mousedown
};

// Function to stop drawing on mouseup
const stopDrawing = () => {
    isDrawing = false;
};

// Function to draw on the canvas
const draw = (event: MouseEvent) => {
    if (!isDrawing) return;

    const context = canvas.getContext("2d");
    if (context) {
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.lineCap = "round";

        // Draw a line from the last position to the current position
        context.beginPath();
        context.moveTo(lastX, lastY);
        context.lineTo(event.offsetX, event.offsetY);
        context.stroke();

        // Update last position to the current position
        [lastX, lastY] = [event.offsetX, event.offsetY];
    }
};

// Register event listeners for drawing
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);
