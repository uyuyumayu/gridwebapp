// --- DOM Element References ---
const dropArea = document.getElementById('drop-area');
const previewCanvas = document.getElementById('preview-canvas');
const gridTypeSquareRadio = document.getElementById('grid-type-square');
const gridTypeHexRadio = document.getElementById('grid-type-hex');
const previewCtx = previewCanvas.getContext('2d');
const previewArea = document.getElementById('preview-area');
const gridModeSizeRadio = document.getElementById('grid-mode-size');
const gridModeCountRadio = document.getElementById('grid-mode-count');
const gridSizeControls = document.getElementById('grid-size-controls');
const gridCountControls = document.getElementById('grid-count-controls');
const gridRowsInput = document.getElementById('grid-rows');
const gridColsInput = document.getElementById('grid-cols');
const gridSizeInput = document.getElementById('grid-size');
const gridOffsetXInput = document.getElementById('grid-offsetX');
const gridOffsetYInput = document.getElementById('grid-offsetY');
const lineWidthInput = document.getElementById('line-width');
const lineColorInput = document.getElementById('line-color');
const lineStyleSelect = document.getElementById('line-style');
const textControls = document.getElementById('text-controls');
const gridTextInput = document.getElementById('grid-text');
const textFontSizeInput = document.getElementById('text-font-size');
const textRotationSelect = document.getElementById('text-rotation');
const textSpacingInput = document.getElementById('text-spacing');
const lineOpacityInput = document.getElementById('line-opacity');
const gradientControls = document.getElementById('gradient-controls');
const gradientCenterInput = document.getElementById('gradient-center');
const gradientEdgeInput = document.getElementById('gradient-edge');
const gradientOuterInput = document.getElementById('gradient-outer');
const downloadButton = document.getElementById('download-button');
const downloadFormatSelect = document.getElementById('download-format');
const gridOnlyButton = document.getElementById('grid-only-button');
const gridOnlyFormatSelect = document.getElementById('grid-only-format');
const fileInput = document.getElementById('file-input');
const fillColor1Input = document.getElementById('fill-color1');
const fillColor2Input = document.getElementById('fill-color2');
const fillOpacityInput = document.getElementById('fill-opacity');
const resetFillButton = document.getElementById('reset-fill-button');

// Coordinate Display Elements
const coordVisibleCheckbox = document.getElementById('coord-visible-checkbox');
const coordControlsDiv = document.getElementById('coord-controls');
const coordFormatSelect = document.getElementById('coord-format');
const coordPositionSelect = document.getElementById('coord-position');
const coordFontSizeInput = document.getElementById('coord-font-size');
const coordColorInput = document.getElementById('coord-color');
const coordOpacityInput = document.getElementById('coord-opacity');
// const coordOffsetXInput = document.getElementById('coord-offset-x'); // Optional
// const coordOffsetYInput = document.getElementById('coord-offset-y'); // Optional

// --- Global State Variables ---
let image = null;
let fillStates = []; // Grid fill states (2D array)

// Zoom & Pan Variables
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let lastPanMouseX = 0;
let lastPanMouseY = 0;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 15; // Increased max zoom

// Fill Operation Variables
let isMouseDown = false; // For fill operation tracking
let lastFillRow = -1;
let lastFillCol = -1;

// --- Event Listeners ---

// Image Loading
dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('highlight');
});
dropArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropArea.classList.remove('highlight');
});
dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('highlight');
    handleFile(e.dataTransfer.files[0]);
});

// Grid Settings Input Listeners
gridRowsInput.addEventListener('input', () => handleNumericInput(gridRowsInput, 1, 10, true));
gridColsInput.addEventListener('input', () => handleNumericInput(gridColsInput, 1, 10, true));
gridSizeInput.addEventListener('input', () => handleNumericInput(gridSizeInput, 1, 50, true));
gridOffsetXInput.addEventListener('input', () => handleNumericInput(gridOffsetXInput, -Infinity, 0));
gridOffsetYInput.addEventListener('input', () => handleNumericInput(gridOffsetYInput, -Infinity, 0));
lineWidthInput.addEventListener('input', () => handleNumericInput(lineWidthInput, 1, 1));
textFontSizeInput.addEventListener('input', () => handleNumericInput(textFontSizeInput, 1, 12));
textSpacingInput.addEventListener('input', () => handleNumericInput(textSpacingInput, 0.1, 2.5, false, true)); // Allow float
coordFontSizeInput.addEventListener('input', () => handleNumericInput(coordFontSizeInput, 5, 10));

// Other Grid/Style Listeners
lineColorInput.addEventListener('input', updatePreview);
lineStyleSelect.addEventListener('change', handleLineStyleChange);
gridTextInput.addEventListener('input', updatePreview);
textRotationSelect.addEventListener('change', updatePreview);
lineOpacityInput.addEventListener('input', updatePreview);
gradientCenterInput.addEventListener('input', updatePreview);
gradientEdgeInput.addEventListener('input', updatePreview);
gradientOuterInput.addEventListener('input', updatePreview);
fillColor1Input.addEventListener('input', updatePreview);
fillColor2Input.addEventListener('input', updatePreview);
fillOpacityInput.addEventListener('input', updatePreview);
gridTypeSquareRadio.addEventListener('change', updatePreview);
gridTypeHexRadio.addEventListener('change', updatePreview);
gridModeSizeRadio.addEventListener('change', handleGridModeChange);
gridModeCountRadio.addEventListener('change', handleGridModeChange);
resetFillButton.addEventListener('click', resetFillStates);

// Coordinate Display Listeners
coordVisibleCheckbox.addEventListener('change', () => {
    coordControlsDiv.style.display = coordVisibleCheckbox.checked ? 'block' : 'none';
    updatePreview();
});
coordFormatSelect.addEventListener('change', updatePreview);
coordPositionSelect.addEventListener('change', updatePreview);
coordColorInput.addEventListener('input', updatePreview);
coordOpacityInput.addEventListener('input', updatePreview);
// coordOffsetXInput.addEventListener('input', updatePreview); // Optional
// coordOffsetYInput.addEventListener('input', updatePreview); // Optional

// Download Listeners
downloadButton.addEventListener('click', () => {
    if (!image) return;
    const format = downloadFormatSelect.value;
    const filename = `grid_image.${format}`;
    generateDownload(filename, format, true); // includeImage = true
});
gridOnlyButton.addEventListener('click', () => {
    if (!image) return;
    let format = gridOnlyFormatSelect.value;
    // Handle display text vs value for format
    if (format.includes(' ')) {
        format = format.split(' ')[0]; // Get 'png', 'webp', or 'jpg'
    }
    const filename = `grid_only.${format}`;
    generateDownload(filename, format, false); // includeImage = false
});

// Zoom and Pan Listeners (on previewArea)
previewArea.addEventListener('wheel', handleZoom);
previewArea.addEventListener('mousedown', handlePanStart);
previewArea.addEventListener('mousemove', handlePanMove);
previewArea.addEventListener('mouseup', handlePanEnd);
previewArea.addEventListener('mouseleave', handlePanEnd); // End panning if mouse leaves

// Fill Operation Listeners (on previewCanvas)
previewCanvas.addEventListener('mousedown', handleFillStart);
previewCanvas.addEventListener('mousemove', handleFillMove);
previewCanvas.addEventListener('mouseup', handleFillEnd);
// previewCanvas.addEventListener('mouseleave', handleFillEnd); // Optional: End fill if mouse leaves canvas


// --- Initialization ---
handleLineStyleChange(); // Set initial visibility of text/gradient controls
handleGridModeChange(); // Set initial state of grid mode inputs
coordControlsDiv.style.display = coordVisibleCheckbox.checked ? 'block' : 'none'; // Initial coord controls visibility

// --- Utility Functions ---

// Handles numeric input validation and preview update
function handleNumericInput(inputElement, minValue, defaultValue, resetFill = false, allowFloat = false) {
    let value = allowFloat ? parseFloat(inputElement.value) : parseInt(inputElement.value, 10);
    if (isNaN(value) || value < minValue) {
        inputElement.value = defaultValue;
        value = defaultValue; // Use default value if invalid
    }
    if (resetFill) {
        fillStates = []; // Reset fill if grid dimensions might change
    }
    updatePreview();
}

// Converts 0-based column index to A, B, ..., Z, AA, AB, ...
function getColumnLetter(colIndex) {
    let letters = '';
    let num = colIndex + 1;
    while (num > 0) {
        let rem = (num - 1) % 26;
        letters = String.fromCharCode(65 + rem) + letters; // 65 is ASCII for 'A'
        num = Math.floor((num - 1) / 26);
    }
    return letters;
}

// Transforms screen coordinates to canvas world coordinates
function getTransformedPoint(screenX, screenY) {
    const rect = previewCanvas.getBoundingClientRect();
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;

    // Account for CSS scaling of the canvas
    const bufferX = canvasX * (previewCanvas.width / previewCanvas.clientWidth);
    const bufferY = canvasY * (previewCanvas.height / previewCanvas.clientHeight);

    // Inverse transform: Apply inverse of pan and zoom
    const originalX = (bufferX - panX) / zoomLevel;
    const originalY = (bufferY - panY) / zoomLevel;

    return { x: originalX, y: originalY };
}


// --- Core Functions ---

// Handles file loading and image initialization
function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        console.error("Invalid file type. Please upload an image.");
        // Optionally show an error message to the user
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        image = new Image();
        image.onload = () => {
            zoomLevel = 1; // Reset zoom
            panX = 0;      // Reset pan
            panY = 0;
            fillStates = []; // Reset fill states
            lastFillRow = -1;
            lastFillCol = -1;
            console.log(`Image loaded: ${image.width}x${image.height}`);
            updatePreview(); // Initial draw
        };
        image.onerror = () => {
            console.error("Error loading image.");
            // Optionally show an error message
            image = null;
        };
        image.src = e.target.result;
    };
    reader.onerror = () => {
        console.error("Error reading file.");
        // Optionally show an error message
    };
    reader.readAsDataURL(file);
}

// Updates the preview canvas based on current settings
function updatePreview() {
    if (!image) {
         // Optionally clear canvas or show placeholder if no image
         previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        return;
    }

    // --- Get Settings ---
    const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
    const gridType = document.querySelector('input[name="grid-type"]:checked').value;
    let rows, cols;

    if (gridMode === 'size') {
        const gridSize = parseInt(gridSizeInput.value, 10) || 50;
        rows = Math.max(1, Math.floor(image.height / gridSize));
        cols = Math.max(1, Math.floor(image.width / gridSize));
    } else {
        rows = parseInt(gridRowsInput.value, 10) || 10;
        cols = parseInt(gridColsInput.value, 10) || 10;
    }
    rows = Math.max(1, rows); // Ensure at least 1
    cols = Math.max(1, cols);

    const gridOffsetXValue = parseInt(gridOffsetXInput.value, 10) || 0;
    const gridOffsetYValue = parseInt(gridOffsetYInput.value, 10) || 0;
    const lineWidth = parseInt(lineWidthInput.value, 10) || 1;
    const lineColor = lineColorInput.value;
    const lineStyle = lineStyleSelect.value;
    const lineOpacity = parseFloat(lineOpacityInput.value);
    const gridText = gridTextInput.value;
    const textFontSize = parseInt(textFontSizeInput.value, 10) || 12;
    const textRotation = textRotationSelect.value;
    const textSpacing = parseFloat(textSpacingInput.value) || 2.5;
    const fillColor1 = fillColor1Input.value;
    const fillColor2 = fillColor2Input.value;
    const fillOpacity = parseFloat(fillOpacityInput.value);

    // Coordinate Settings
    const coordSettings = {
        visible: coordVisibleCheckbox.checked,
        format: coordFormatSelect.value,
        position: coordPositionSelect.value,
        fontSize: parseInt(coordFontSizeInput.value, 10) || 10,
        color: coordColorInput.value,
        opacity: parseFloat(coordOpacityInput.value) || 0.8,
        // offsetX: parseInt(coordOffsetXInput.value, 10) || 0, // Optional
        // offsetY: parseInt(coordOffsetYInput.value, 10) || 0, // Optional
    };

    // --- Canvas Preparation ---
    // Set logical canvas size to image size
    previewCanvas.width = image.width;
    previewCanvas.height = image.height;

    // Set display size to fit container while maintaining aspect ratio
    const previewAreaWidth = previewArea.clientWidth;
    const previewAreaHeight = previewArea.clientHeight;
    const imageAspectRatio = image.width / image.height;
    const areaAspectRatio = previewAreaWidth / previewAreaHeight;

    let canvasDisplayWidth, canvasDisplayHeight;
    if (imageAspectRatio > areaAspectRatio) {
        canvasDisplayWidth = previewAreaWidth;
        canvasDisplayHeight = previewAreaWidth / imageAspectRatio;
    } else {
        canvasDisplayHeight = previewAreaHeight;
        canvasDisplayWidth = previewAreaHeight * imageAspectRatio;
    }
    previewCanvas.style.width = `${canvasDisplayWidth}px`;
    previewCanvas.style.height = `${canvasDisplayHeight}px`;

    // --- Clear and Transform ---
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.save();
    previewCtx.translate(panX, panY);
    previewCtx.scale(zoomLevel, zoomLevel);

    // --- Drawing ---
    previewCtx.drawImage(image, 0, 0); // Draw image first

    // Initialize or check fillStates size
    if (fillStates.length !== rows || (fillStates.length > 0 && fillStates[0]?.length !== cols)) {
        console.log(`Initializing fillStates: ${rows}x${cols}`);
        fillStates = Array(rows).fill(null).map(() => Array(cols).fill(0));
        lastFillRow = -1;
        lastFillCol = -1;
    }

    // Draw Grid (Lines, Fills, Coords)
    if (gridType === 'square') {
        const cellWidth = image.width / cols;
        const cellHeight = image.height / rows;
        if (lineStyle === "text") {
            drawTextGrid(previewCtx, gridOffsetXValue, gridOffsetYValue, image.width, image.height, rows, cols, lineColor, gridText, textFontSize, textRotation, lineOpacity, textSpacing);
        } else {
            drawSquareGrid(previewCtx, gridOffsetXValue, gridOffsetYValue, image.width, image.height, rows, cols, lineWidth, lineColor, lineStyle, lineOpacity, fillColor1, fillColor2, fillOpacity, fillStates);
        }
        drawCoordinates(previewCtx, rows, cols, cellWidth, cellHeight, gridOffsetXValue, gridOffsetYValue, coordSettings);

    } else if (gridType === 'hex') {
        const sideLength = image.width / (cols * 1.5 + 0.5);
        const hexHeight = Math.sqrt(3) * sideLength;
        drawHexGrid(previewCtx, gridOffsetXValue, gridOffsetYValue, image.width, image.height, rows, cols, lineWidth, lineColor, lineOpacity, lineStyle);
        drawHexCoordinates(previewCtx, rows, cols, sideLength, hexHeight, gridOffsetXValue, gridOffsetYValue, coordSettings);
    }

    // --- Restore ---
    previewCtx.restore();
}

// Handles changes in line style selection
function handleLineStyleChange() {
    const lineStyle = lineStyleSelect.value;
    gradientControls.style.display = lineStyle === "gradient" ? "block" : "none";
    textControls.style.display = lineStyle === "text" ? "block" : "none";
    updatePreview();
}

// Handles changes in grid mode selection
function handleGridModeChange() {
    const sizeMode = gridModeSizeRadio.checked;
    gridSizeControls.querySelectorAll('input').forEach(input => input.disabled = !sizeMode);
    gridCountControls.querySelectorAll('input').forEach(input => input.disabled = sizeMode);
    fillStates = []; // Reset fill states as grid definition changes
    updatePreview();
}

// Resets all fill states to 0
function resetFillStates() {
    if (!image) return;
    // Determine current rows/cols to reset correctly
    const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
    let rows, cols;
     if (gridMode === 'size') {
        const gridSize = parseInt(gridSizeInput.value, 10) || 50;
        rows = Math.max(1, Math.floor(image.height / gridSize));
        cols = Math.max(1, Math.floor(image.width / gridSize));
    } else {
        rows = parseInt(gridRowsInput.value, 10) || 10;
        cols = parseInt(gridColsInput.value, 10) || 10;
    }
    rows = Math.max(1, rows);
    cols = Math.max(1, cols);

    fillStates = Array(rows).fill(null).map(() => Array(cols).fill(0));
    lastFillRow = -1;
    lastFillCol = -1;
    updatePreview();
}

// --- Drawing Functions ---

function drawSquareGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineWidth, lineColor, lineStyle, lineOpacity, fillColor1, fillColor2, fillOpacity, fillStates) {
    ctx.lineWidth = lineWidth;
    const r = parseInt(lineColor.substring(1, 3), 16);
    const g = parseInt(lineColor.substring(3, 5), 16);
    const b = parseInt(lineColor.substring(5, 7), 16);
    const strokeStyleWithOpacity = `rgba(${r}, ${g}, ${b}, ${lineOpacity})`;

    // Line Style Setup
    ctx.setLineDash([]); // Reset dashes
    if (lineStyle === "dotted") {
        ctx.setLineDash([lineWidth, lineWidth * 2]); // Smaller gaps for dotted
    } else if (lineStyle === "dashed") {
        ctx.setLineDash([lineWidth * 5, lineWidth * 3]);
    } else if (lineStyle === "gradient") {
        try {
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
            gradient.addColorStop(0, gradientCenterInput.value);
            gradient.addColorStop(0.5, gradientEdgeInput.value);
            gradient.addColorStop(1, gradientOuterInput.value);
            ctx.strokeStyle = gradient;
             // Note: Opacity might need globalAlpha if gradient doesn't support it directly
            // ctx.globalAlpha = lineOpacity;
         } catch (e) {
             console.error("Error creating gradient:", e);
             ctx.strokeStyle = strokeStyleWithOpacity; // Fallback
         }
    } else { // Solid or other cases handled by specific drawing functions
        ctx.strokeStyle = strokeStyleWithOpacity;
    }

    // Apply stroke style if not gradient (gradient sets it already)
    if (lineStyle !== "gradient") {
        ctx.strokeStyle = strokeStyleWithOpacity;
    }


    const cellWidth = width / cols;
    const cellHeight = height / rows;

    // Draw Fillings first
    if (fillStates && fillStates.length === rows) {
        const fillR1 = parseInt(fillColor1.substring(1, 3), 16);
        const fillG1 = parseInt(fillColor1.substring(3, 5), 16);
        const fillB1 = parseInt(fillColor1.substring(5, 7), 16);
        const fillStyle1 = `rgba(${fillR1}, ${fillG1}, ${fillB1}, ${fillOpacity})`;

        const fillR2 = parseInt(fillColor2.substring(1, 3), 16);
        const fillG2 = parseInt(fillColor2.substring(3, 5), 16);
        const fillB2 = parseInt(fillColor2.substring(5, 7), 16);
        const fillStyle2 = `rgba(${fillR2}, ${fillG2}, ${fillB2}, ${fillOpacity})`;

        for (let row = 0; row < rows; row++) {
            if (fillStates[row]?.length === cols) {
                for (let col = 0; col < cols; col++) {
                    const state = fillStates[row][col];
                    if (state === 1 || state === 2) {
                        const x = cellWidth * col + offsetX;
                        const y = cellHeight * row + offsetY;
                        ctx.fillStyle = (state === 1) ? fillStyle1 : fillStyle2;
                        ctx.fillRect(x, y, cellWidth, cellHeight);
                    }
                }
            }
        }
    }

    // Draw Lines if not text grid
    if (lineStyle !== "text") {
        ctx.beginPath();
        // Horizontal lines
        for (let i = 0; i <= rows; i++) {
            const y = cellHeight * i + offsetY;
            // Draw lines slightly offset for sharp 1px lines
            const drawY = Math.round(y) + (lineWidth % 2 === 1 ? 0.5 : 0);
            ctx.moveTo(offsetX, drawY);
            ctx.lineTo(width + offsetX, drawY);
        }
        // Vertical lines
        for (let i = 0; i <= cols; i++) {
            const x = cellWidth * i + offsetX;
             const drawX = Math.round(x) + (lineWidth % 2 === 1 ? 0.5 : 0);
            ctx.moveTo(drawX, offsetY);
            ctx.lineTo(drawX, height + offsetY);
        }
        ctx.stroke();
    }

    // Reset line dash and potential global alpha
    ctx.setLineDash([]);
    // if (lineStyle === "gradient") ctx.globalAlpha = 1.0;
}

function drawTextGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineColor, gridText, textFontSize, textRotation, lineOpacity, spacingFactor) {
    if (!gridText) return;

    ctx.font = `${textFontSize}px sans-serif`;
    const r = parseInt(lineColor.substring(1, 3), 16);
    const g = parseInt(lineColor.substring(3, 5), 16);
    const b = parseInt(lineColor.substring(5, 7), 16);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${lineOpacity})`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const metrics = ctx.measureText(gridText);
    const textWidth = metrics.width;
    const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || textFontSize; // Use actual height if available

    // Horizontal "lines"
    for (let i = 1; i < rows; i++) {
        const y = cellHeight * i + offsetY;
        const effectiveSpacing = Math.max(textWidth, 1) * spacingFactor; // Ensure spacing > 0
        for (let x = offsetX + effectiveSpacing / 2; x < width + offsetX; x += effectiveSpacing) {
             drawRotatedText(ctx, gridText, x, y, textRotation);
        }
    }

    // Vertical "lines"
    for (let i = 1; i < cols; i++) {
        const x = cellWidth * i + offsetX;
        const effectiveSpacing = Math.max(textHeight, 1) * spacingFactor; // Ensure spacing > 0
        for (let y = offsetY + effectiveSpacing / 2; y < height + offsetY; y += effectiveSpacing) {
            drawRotatedText(ctx, gridText, x, y, textRotation);
        }
    }
}

function drawRotatedText(ctx, text, x, y, rotationType) {
    ctx.save();
    ctx.translate(x, y);
    if (rotationType === 'left') {
        ctx.rotate(-Math.PI / 2);
    } else if (rotationType === 'right') {
        ctx.rotate(Math.PI / 2);
    }
    ctx.fillText(text, 0, 0);
    ctx.restore();
}

function drawHexGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineWidth, lineColor, lineOpacity, lineStyle) {
    const sideLength = width / (cols * 1.5 + 0.5);
    if (sideLength <= 0) return; // Prevent division by zero or negative sideLength
    const hexHeight = Math.sqrt(3) * sideLength;

    const r = parseInt(lineColor.substring(1, 3), 16);
    const g = parseInt(lineColor.substring(3, 5), 16);
    const b = parseInt(lineColor.substring(5, 7), 16);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineOpacity})`;
    ctx.lineWidth = lineWidth;

    // Calculate effective rows based on fitting hex height
    const effectiveRows = Math.floor((height - hexHeight * 0.5) / hexHeight);

    for (let row = 0; row < effectiveRows + 2; row++) { // Draw extra rows for potential overlap
        for (let col = 0; col < cols + 2; col++) { // Draw extra cols
            const centerX = offsetX + sideLength * (col * 1.5 + 1);
            const centerY = offsetY + hexHeight * (row + 0.5 * (col % 2) + 0.5);

            // Simple culling: Only draw if hex center is roughly within extended bounds
            if (centerX > -sideLength * 2 && centerX < width + sideLength * 2 &&
                centerY > -hexHeight && centerY < height + hexHeight) {
                drawHexagon(ctx, centerX, centerY, sideLength, lineStyle);
            }
        }
    }
}

function drawHexagon(ctx, centerX, centerY, sideLength, lineStyle) {
    const angle = Math.PI / 3; // 60 degrees

    ctx.setLineDash([]);
    if (lineStyle === "dotted") {
        ctx.setLineDash([ctx.lineWidth, ctx.lineWidth * 2]);
    } else if (lineStyle === "dashed") {
        ctx.setLineDash([ctx.lineWidth * 5, ctx.lineWidth * 3]);
    }
    // Note: Gradient lines for hex not implemented here

    ctx.beginPath();
    // Start from the right point for flat top/bottom hexes
    ctx.moveTo(centerX + sideLength, centerY);
    for (let i = 1; i <= 6; i++) {
        const currentAngle = angle * i;
        const x = centerX + sideLength * Math.cos(currentAngle);
        const y = centerY + sideLength * Math.sin(currentAngle);
        ctx.lineTo(x, y);
    }
    // ctx.closePath(); // Connects last to first
    ctx.stroke();
    ctx.setLineDash([]); // Reset dashes
}

function drawCoordinates(ctx, rows, cols, cellWidth, cellHeight, gridOffsetX, gridOffsetY, coordSettings) {
    if (!coordSettings.visible || !image) return; // Also check for image

    const { format, position, fontSize, color, opacity } = coordSettings;

    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    ctx.font = `${fontSize}px sans-serif`;

    let textAlign = 'center';
    let textBaseline = 'middle';
    let xOffsetFactor = 0.5;
    let yOffsetFactor = 0.5;
    const margin = fontSize * 0.25; // Adjust margin

    switch (position) {
        case 'top-left':    textAlign = 'left';   textBaseline = 'top';    xOffsetFactor = 0; yOffsetFactor = 0; break;
        case 'top-right':   textAlign = 'right';  textBaseline = 'top';    xOffsetFactor = 1; yOffsetFactor = 0; break;
        case 'bottom-left': textAlign = 'left';   textBaseline = 'bottom'; xOffsetFactor = 0; yOffsetFactor = 1; break;
        case 'bottom-right':textAlign = 'right';  textBaseline = 'bottom'; xOffsetFactor = 1; yOffsetFactor = 1; break;
    }
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let coordText = '';
            switch (format) {
                case 'A1':  coordText = `${getColumnLetter(col)}${row + 1}`; break;
                case '0-0': coordText = `${col}-${row}`; break;
                case '1-1': coordText = `${col + 1}-${row + 1}`; break;
                default:    coordText = `${col}-${row}`;
            }

            let drawX = gridOffsetX + col * cellWidth + xOffsetFactor * cellWidth;
            let drawY = gridOffsetY + row * cellHeight + yOffsetFactor * cellHeight;

            // Apply margin for corner positions
            if (position.includes('left')) drawX += margin;
            if (position.includes('right')) drawX -= margin;
            if (position.includes('top')) drawY += margin;
            if (position.includes('bottom')) drawY -= margin;

            ctx.fillText(coordText, drawX, drawY);
        }
    }
}

function drawHexCoordinates(ctx, rows, cols, sideLength, hexHeight, gridOffsetX, gridOffsetY, coordSettings) {
     if (!coordSettings.visible || !image || sideLength <= 0) return;

    const { format, fontSize, color, opacity } = coordSettings; // Position ignored for simplicity

    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const effectiveRows = Math.floor((image.height - hexHeight * 0.5) / hexHeight);

     for (let row = 0; row < effectiveRows + 2; row++) {
        for (let col = 0; col < cols + 2; col++) {
             const centerX = gridOffsetX + sideLength * (col * 1.5 + 1);
             const centerY = gridOffsetY + hexHeight * (row + 0.5 * (col % 2) + 0.5);

             if (centerX > -sideLength * 2 && centerX < image.width + sideLength * 2 &&
                 centerY > -hexHeight && centerY < image.height + hexHeight) {
                 let coordText = '';
                 switch (format) {
                     case 'A1': // Use col-row for hex as A1 is ambiguous
                     case '0-0': coordText = `${col}-${row}`; break;
                     case '1-1': coordText = `${col + 1}-${row + 1}`; break;
                     default:    coordText = `${col}-${row}`;
                 }
                 ctx.fillText(coordText, centerX, centerY);
             }
        }
    }
}


// --- Event Handlers for Zoom, Pan, Fill ---

function handleZoom(e) {
    if (!image) return;
    e.preventDefault();

    const rect = previewCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const bufferMouseX = mouseX * (previewCanvas.width / previewCanvas.clientWidth);
    const bufferMouseY = mouseY * (previewCanvas.height / previewCanvas.clientHeight);

    const pointBeforeZoomX = (bufferMouseX - panX) / zoomLevel;
    const pointBeforeZoomY = (bufferMouseY - panY) / zoomLevel;

    const delta = e.deltaY > 0 ? 0.85 : 1.15; // Adjust zoom speed
    let newZoomLevel = zoomLevel * delta;
    newZoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoomLevel));

    panX = bufferMouseX - pointBeforeZoomX * newZoomLevel;
    panY = bufferMouseY - pointBeforeZoomY * newZoomLevel;

    zoomLevel = newZoomLevel;
    // limitPan(); // Optional: Limit pan after zoom
    updatePreview();
}

function handlePanStart(e) {
    // Pan with middle mouse or Ctrl+Left click
    if ((e.button === 1 || (e.button === 0 && e.ctrlKey)) && image) {
        isPanning = true;
        lastPanMouseX = e.clientX;
        lastPanMouseY = e.clientY;
        previewArea.style.cursor = 'grabbing';
        e.preventDefault();
    }
}

function handlePanMove(e) {
    if (!isPanning || !image) return;
    e.preventDefault(); // Prevent text selection during pan

    const deltaX = e.clientX - lastPanMouseX;
    const deltaY = e.clientY - lastPanMouseY;

    panX += deltaX;
    panY += deltaY;

    lastPanMouseX = e.clientX;
    lastPanMouseY = e.clientY;
    // limitPan(); // Optional: Limit pan during move
    updatePreview();
}

function handlePanEnd(e) {
    // Check the button that was released or if panning was active
     if (isPanning && (e.button === 1 || (e.button === 0 && e.type === 'mouseup' && e.ctrlKey) || e.type === 'mouseleave')) {
        isPanning = false;
        previewArea.style.cursor = 'grab';
    }
}

function handleFillStart(e) {
    if (e.button !== 0 || e.ctrlKey || !image || isPanning) return; // Left click only, no Ctrl, image loaded, not panning
    isMouseDown = true;
    performFillAction(e);
    e.preventDefault(); // Prevent default canvas interactions
}

function handleFillMove(e) {
    if (!isMouseDown || !image || isPanning) return; // Ensure mouse is down, image exists, not panning
     performFillAction(e);
}

function handleFillEnd(e) {
    if (e.button === 0) { // Left button released
        isMouseDown = false;
        lastFillRow = -1; // Allow re-clicking same cell immediately
        lastFillCol = -1;
    }
}

// Performs the actual fill calculation and update
function performFillAction(e) {
    // Check if grid type is square, as fill is only for square now
    if (gridTypeSquareRadio.checked) {
        const transformedPoint = getTransformedPoint(e.clientX, e.clientY);
        const x = transformedPoint.x;
        const y = transformedPoint.y;

        // Recalculate rows/cols based on current mode
        const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
        let rows, cols;
         if (gridMode === 'size') {
            const gridSize = parseInt(gridSizeInput.value, 10) || 50;
            rows = Math.max(1, Math.floor(image.height / gridSize));
            cols = Math.max(1, Math.floor(image.width / gridSize));
        } else {
            rows = parseInt(gridRowsInput.value, 10) || 10;
            cols = parseInt(gridColsInput.value, 10) || 10;
        }
        rows = Math.max(1, rows);
        cols = Math.max(1, cols);

        // Ensure fillStates array matches current dimensions
        if (fillStates.length !== rows || (fillStates.length > 0 && fillStates[0]?.length !== cols)) {
             console.warn("Fill states size mismatch during fill action. Reinitializing.");
             fillStates = Array(rows).fill(null).map(() => Array(cols).fill(0));
             lastFillRow = -1; // Reset tracker after reinit
             lastFillCol = -1;
        }


        const gridOffsetXValue = parseInt(gridOffsetXInput.value, 10) || 0;
        const gridOffsetYValue = parseInt(gridOffsetYInput.value, 10) || 0;
        const cellWidth = image.width / cols;
        const cellHeight = image.height / rows;

        const col = Math.floor((x - gridOffsetXValue) / cellWidth);
        const row = Math.floor((y - gridOffsetYValue) / cellHeight);

        if (row >= 0 && row < rows && col >= 0 && col < cols) {
            // Only update if the cell is different from the last one (for mousemove)
            // or if it's the initial mousedown click
             if (isMouseDown && (row !== lastFillRow || col !== lastFillCol || lastFillRow === -1)) {
                 if (!fillStates[row]) fillStates[row] = []; // Initialize row array if needed
                 const currentState = fillStates[row][col] || 0;
                 fillStates[row][col] = (currentState + 1) % 3; // Cycle 0 -> 1 -> 2 -> 0
                 updatePreview();
                 lastFillRow = row;
                 lastFillCol = col;
            }
        }
     } else {
         // console.log("Fill is only available for Square grids.");
     }
}


// --- Download Function ---

function generateDownload(filename, format, includeImage) {
    if (!image) return;

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');

    // Get settings again for download context
    const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
    const gridType = document.querySelector('input[name="grid-type"]:checked').value;
    let rows, cols;
    if (gridMode === 'size') {
        const gridSize = parseInt(gridSizeInput.value, 10) || 50;
        // Use ceil for download to potentially cover edges fully
        rows = Math.max(1, Math.ceil(image.height / gridSize));
        cols = Math.max(1, Math.ceil(image.width / gridSize));
    } else {
        rows = parseInt(gridRowsInput.value, 10) || 10;
        cols = parseInt(gridColsInput.value, 10) || 10;
    }
     rows = Math.max(1, rows);
     cols = Math.max(1, cols);

    const gridOffsetXValue = parseInt(gridOffsetXInput.value, 10) || 0;
    const gridOffsetYValue = parseInt(gridOffsetYInput.value, 10) || 0;
    const lineWidth = parseInt(lineWidthInput.value, 10) || 1;
    const lineColor = lineColorInput.value;
    const lineStyle = lineStyleSelect.value;
    const lineOpacity = parseFloat(lineOpacityInput.value);
    const gridText = gridTextInput.value;
    const textFontSize = parseInt(textFontSizeInput.value, 10) || 12;
    const textRotation = textRotationSelect.value;
    const textSpacing = parseFloat(textSpacingInput.value) || 2.5;
    const fillColor1 = fillColor1Input.value;
    const fillColor2 = fillColor2Input.value;
    const fillOpacity = parseFloat(fillOpacityInput.value);

     // Coordinate Settings for Download
    const coordSettings = {
        visible: coordVisibleCheckbox.checked,
        format: coordFormatSelect.value,
        position: coordPositionSelect.value,
        fontSize: parseInt(coordFontSizeInput.value, 10) || 10,
        color: coordColorInput.value,
        opacity: parseFloat(coordOpacityInput.value) || 0.8,
    };

    // Background
    if (!includeImage) {
        if (format === 'png' || format === 'webp') {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Transparent
        } else { // jpg
            ctx.fillStyle = '#ffffff'; // White
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    } else {
        ctx.drawImage(image, 0, 0); // Draw base image
    }

    // Get consistent fill states for download size
    const downloadFillStates = getFillStatesForDownload(rows, cols);

    // Draw Grid (Lines, Fills, Coords) - No Zoom/Pan applied here
    if (gridType === 'square') {
        const cellWidth = canvas.width / cols;
        const cellHeight = canvas.height / rows;
        if (lineStyle === "text") {
            drawTextGrid(ctx, gridOffsetXValue, gridOffsetYValue, canvas.width, canvas.height, rows, cols, lineColor, gridText, textFontSize, textRotation, lineOpacity, textSpacing);
        } else {
            drawSquareGrid(ctx, gridOffsetXValue, gridOffsetYValue, canvas.width, canvas.height, rows, cols, lineWidth, lineColor, lineStyle, lineOpacity, fillColor1, fillColor2, fillOpacity, downloadFillStates);
        }
        drawCoordinates(ctx, rows, cols, cellWidth, cellHeight, gridOffsetXValue, gridOffsetYValue, coordSettings);

    } else if (gridType === 'hex') {
        const sideLength = canvas.width / (cols * 1.5 + 0.5);
        const hexHeight = Math.sqrt(3) * sideLength;
        drawHexGrid(ctx, gridOffsetXValue, gridOffsetYValue, canvas.width, canvas.height, rows, cols, lineWidth, lineColor, lineOpacity, lineStyle);
         if (sideLength > 0) { // Only draw coords if hexes are valid
             drawHexCoordinates(ctx, rows, cols, sideLength, hexHeight, gridOffsetXValue, gridOffsetYValue, coordSettings);
         }
    }

    // Trigger Download
    const link = document.createElement('a');
    link.download = filename;
    try {
        link.href = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.9 : undefined); // Quality setting for JPG
        link.click();
    } catch (e) {
        console.error("Error generating download link:", e);
        // Optionally inform user of error (e.g., canvas too large)
    }
}

// Ensures fillStates array matches expected dimensions for download
function getFillStatesForDownload(expectedRows, expectedCols) {
    // If current fillStates size doesn't match, return a new empty array
    // or attempt to resize/copy (simpler to return empty if mismatch)
    if (fillStates.length !== expectedRows || (fillStates.length > 0 && fillStates[0]?.length !== expectedCols)) {
        console.warn(`Fill states size mismatch for download (${fillStates.length}x${fillStates[0]?.length} vs ${expectedRows}x${expectedCols}). Returning empty fill states for download.`);
        return Array(expectedRows).fill(null).map(() => Array(expectedCols).fill(0));
    }
    // Otherwise, return the current state
    return fillStates;
}