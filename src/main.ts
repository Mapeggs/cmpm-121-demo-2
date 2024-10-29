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

const buttonContainer = document.createElement("div");
buttonContainer.classList.add("button-container");
buttonContainer.append(clearButton, undoButton, redoButton);

mainContainer.appendChild(buttonContainer);

// Class for representing marker lines
class MarkerLine {
    private points: { x: number; y: number }[] = [];

    constructor(startX: number, startY: number) {
        this.points.push({ x: startX, y: startY });
    }

    // Adds a new point to the line as the user drags
    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    // Draws the line on the canvas
    display(ctx: CanvasRenderingContext2D) {
        if (this.points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            const { x, y } = this.points[i];
            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.stroke();
    }
}

// Drawing state
let isDrawing = false;
let paths: MarkerLine[] = []; // Array of MarkerLine objects
let undonePaths: MarkerLine[] = []; // Stores undone MarkerLine objects for redo functionality
let currentPath: MarkerLine | null = null;

// Function to start drawing on mousedown
const startDrawing = (event: MouseEvent) => {
    isDrawing = true;
    currentPath = new MarkerLine(event.offsetX, event.offsetY);
    paths.push(currentPath);
    undonePaths = []; // Clear redo history whenever a new path is drawn
    dispatchDrawingChanged();
};

// Function to stop drawing on mouseup
const stopDrawing = () => {
    if (isDrawing) {
        isDrawing = false;
        currentPath = null;
    }
};

// Function to extend the current path as the user drags the mouse
const capturePoint = (event: MouseEvent) => {
    if (!isDrawing || !currentPath) return;

    currentPath.drag(event.offsetX, event.offsetY);
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
            undonePaths.push(lastPath);
            dispatchDrawingChanged();
        }
    }
};

// Function to redo the last undone path
const redoLastPath = () => {
    if (undonePaths.length > 0) {
        const redoPath = undonePaths.pop();
        if (redoPath) {
            paths.push(redoPath);
            dispatchDrawingChanged();
        }
    }
};

// Function to redraw the entire canvas based on the stored paths
const redrawCanvas = () => {
    const context = canvas.getContext("2d");
    if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        paths.forEach(path => path.display(context));
    }
};

// Register event listeners for drawing
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", capturePoint);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing); // Stop drawing if mouse leaves canvas

// Register an observer for the "drawing-changed" event
canvas.addEventListener("drawing-changed", redrawCanvas);
