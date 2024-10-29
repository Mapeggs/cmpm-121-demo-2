// Import CSS for styling
import "./style.css";

// Set application title
const APPLICATION_TITLE = "Drawing App";
const mainContainer = document.querySelector<HTMLDivElement>("#app")!;
document.title = APPLICATION_TITLE;

// Initial sticker set defined in a single array
const stickers = [
    { name: "Star", icon: "⭐" },
    { name: "Heart", icon: "❤️" },
    { name: "Smiley", icon: "😊" },
];

// Function to add a new sticker from user input
const addCustomSticker = () => {
    const customIcon = prompt("Enter your custom sticker:", "💬");
    if (customIcon) {
        stickers.push({ name: `Custom Sticker ${stickers.length + 1}`, icon: customIcon });
        renderStickers(); // Re-render to include the new sticker
    }
};

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

// Set up app layout
mainContainer.appendChild(createAppTitle(APPLICATION_TITLE));

const canvas = createCanvasElement(256, 256, "app-canvas");
mainContainer.appendChild(canvas);

// Create thickness buttons
const thinButton = createButton("Thin", () => setMarkerThickness(2));
const thickButton = createButton("Thick", () => setMarkerThickness(5));

// Function to add "selectedTool" class to the active tool
const setMarkerThickness = (thickness: number) => {
    markerThickness = thickness;
    thinButton.classList.toggle("selectedTool", thickness === 2);
    thickButton.classList.toggle("selectedTool", thickness === 5);
};

// Set up initial thickness
let markerThickness = 2; // Default to thin
thinButton.classList.add("selectedTool"); // Mark thin as selected initially

const clearButton = createButton("Clear", () => clearCanvas());
const undoButton = createButton("Undo", () => undoLastPath());
const redoButton = createButton("Redo", () => redoLastPath());

// Create the custom sticker button
const customStickerButton = createButton("Create Custom Sticker", addCustomSticker);

// Function to create sticker buttons based on sticker data
const createStickerButton = (sticker: { name: string, icon: string }) => {
    const button = document.createElement("button");
    button.textContent = sticker.icon;
    button.title = sticker.name;
    button.addEventListener("click", () => applySticker(sticker.icon));
    return button;
};

// Sticker class to track sticker details (position and icon)
class Sticker {
    x: number;
    y: number;
    icon: string;

    constructor(x: number, y: number, icon: string) {
        this.x = x;
        this.y = y;
        this.icon = icon;
    }

    // Display sticker on the provided context
    display(ctx: CanvasRenderingContext2D) {
        ctx.font = "30px Arial";
        ctx.fillText(this.icon, this.x, this.y);
    }
}

// Drawing state and thickness setup for line drawing
class MarkerLine {
    private points: { x: number; y: number }[] = [];
    private thickness: number;

    constructor(startX: number, startY: number, thickness: number) {
        this.points.push({ x: startX, y: startY });
        this.thickness = thickness;
    }

    // Adds a new point to the line as the user drags
    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    // Draws the line on the canvas with the specified thickness
    display(ctx: CanvasRenderingContext2D) {
        if (this.points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            const { x, y } = this.points[i];
            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = "black";
        ctx.lineWidth = this.thickness; // Use thickness for line width
        ctx.lineCap = "round";
        ctx.stroke();
    }
}

// Set up initial drawing state
let isDrawing = false;
let paths: (MarkerLine | Sticker)[] = [];
let undonePaths: (MarkerLine | Sticker)[] = [];
let currentPath: MarkerLine | null = null;

// Function to start drawing with the current marker thickness
const startDrawing = (event: MouseEvent) => {
    isDrawing = true;
    currentPath = new MarkerLine(event.offsetX, event.offsetY, markerThickness); // Pass thickness
    paths.push(currentPath);
    undonePaths = [];
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
    const context = canvas.getContext("2d");
    if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    }
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

        paths.forEach(item => item.display(context)); // Draw all paths and stickers
    }
};

// Modified applySticker function to create Sticker objects and add them to paths
const applySticker = (icon: string) => {
    const context = canvas.getContext("2d");
    if (context) {
        const x = Math.random() * canvas.width; // Random x position within canvas width
        const y = Math.random() * canvas.height; // Random y position within canvas height

        const newSticker = new Sticker(x, y, icon); // Create Sticker object
        paths.push(newSticker); // Add sticker to paths for rendering and exporting
        newSticker.display(context); // Display on the main canvas immediately
        dispatchDrawingChanged(); // Update canvas state to include the sticker
    }
};

// Export function to save canvas as PNG
const exportDrawing = () => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const exportContext = exportCanvas.getContext("2d");

    if (!exportContext) return;

    exportContext.scale(4, 4); // Scale up to 4x for high-res export

    // Render both paths and stickers to the export canvas
    paths.forEach(item => item.display(exportContext));

    const dataURL = exportCanvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = dataURL;
    downloadLink.download = "drawing.png";
    downloadLink.click();
};

// Register event listeners for drawing
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", capturePoint);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

// Register an observer for the "drawing-changed" event
canvas.addEventListener("drawing-changed", redrawCanvas);

// Set up main button container and sticker container
const buttonContainer = document.createElement("div");
buttonContainer.classList.add("button-container");
const stickerContainer = document.createElement("div");
stickerContainer.classList.add("sticker-container");

// Append button container to mainContainer
mainContainer.appendChild(buttonContainer);
buttonContainer.append(customStickerButton, thinButton, thickButton, clearButton, undoButton, redoButton);

// Render stickers and append sticker buttons
const renderStickers = () => {
    stickerContainer.innerHTML = ""; // Clear existing stickers

    stickers.forEach(sticker => {
        const stickerButton = createStickerButton(sticker);
        stickerContainer.appendChild(stickerButton);
    });
};
mainContainer.appendChild(stickerContainer);
renderStickers(); // Initial render of sticker buttons

// Add the export button
const exportButton = createButton("Export", exportDrawing);
buttonContainer.appendChild(exportButton);
