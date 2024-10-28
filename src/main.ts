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

// Function to create a button with specific text and event listener
const createButton = (text: string, onClick: () => void): HTMLButtonElement => {
    const button = document.createElement("button");
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
};

// Add title, canvas, and buttons to the main container
mainContainer.appendChild(createAppTitle(APPLICATION_TITLE));

const canvas = createCanvasElement(256, 256, "app-canvas");
mainContainer.appendChild(canvas);

const clearButton = createButton("Clear", () => clearCanvas());
const undoButton = createButton("Undo", () => undoLastPath());
const redoButton = createButton("Redo", () => redoLastPath());

// Create a button container and add the buttons inside it
const buttonContainer = document.createElement("div");
buttonContainer.classList.add("button-container");
buttonContainer.append(clearButton, undoButton, redoButton);

// Append the button container to the main app container below the canvas
mainContainer.appendChild(buttonContainer);

// Drawing state
let isDrawing = false;
let paths: { x: number; y: number }[][] = []; // Array of arrays of points
let undonePaths: { x: number; y: number }[][] = []; // Stores undone paths for redo functionality
let currentPath: { x: number; y: number }[] = [];

// Function to start drawing on mousedown
const startDrawing = (event: MouseEvent) => {
    isDrawing = true;
    currentPath = [{ x: event.offsetX, y: event.offsetY }];
    paths.push(currentPath);
    undonePaths = []; // Clear redo history whenever a new path is drawn
    dispatchDrawingChanged();
};

// Function to stop drawing on mouseup
const stopDrawing = () => {
    if (isDrawing) {
        isDrawing = false;
        currentPath = [];
    }
};

// Function to capture the drawing path
const capturePoint = (event: MouseEvent) => {
    if (!isDrawing) return;

    const point = { x: event.offsetX, y: event.offsetY };
    currentPath.push(point);
    dispatchDrawingChanged();
};

// Function to dispatch a custom event whenever the drawing changes
const dispatchDrawingChanged = () => {
    const drawingChangedEvent = new CustomEvent("drawing-changed");
    canvas.dispatchEvent(drawingChangedEvent);
};

// Function to clear the canvas
const clearCanvas = () => {
    paths = [];
    undonePaths = [];
    dispatchDrawingChanged();
};

// Function to undo the last path
const undoLastPath = () => {
    if (paths.length > 0) {
        const lastPath = paths.pop();
        if (lastPath) {
            undonePaths.push(lastPath); // Move last path to undone stack
            dispatchDrawingChanged();
        }
    }
};

// Function to redo the last undone path
const redoLastPath = () => {
    if (undonePaths.length > 0) {
        const redoPath = undonePaths.pop();
        if (redoPath) {
            paths.push(redoPath); // Move last undone path back to paths
            dispatchDrawingChanged();
        }
    }
};

// Function to redraw the entire canvas based on the stored paths
const redrawCanvas = () => {
    const context = canvas.getContext("2d");
    if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.lineCap = "round";

        // Draw each path as a separate line
        paths.forEach(path => {
            context.beginPath();
            path.forEach((point, index) => {
                if (index === 0) {
                    context.moveTo(point.x, point.y);
                } else {
                    context.lineTo(point.x, point.y);
                }
            });
            context.stroke();
        });
    }
};

// Register event listeners for drawing
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", capturePoint);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

// Register an observer for the "drawing-changed" event
canvas.addEventListener("drawing-changed", redrawCanvas);
