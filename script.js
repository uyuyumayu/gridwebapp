const dropArea = document.getElementById('drop-area');
const previewCanvas = document.getElementById('preview-canvas');
const gridTypeSquareRadio = document.getElementById('grid-type-square');
const gridTypeHexRadio = document.getElementById('grid-type-hex');
const previewCtx = previewCanvas.getContext('2d');
const previewArea = document.getElementById('preview-area'); // previewArea を取得
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

let image = null;
// 画像自体のオフセット (パン機能に統合するためコメントアウトまたは削除)
// let offsetX = 0;
// let offsetY = 0;

// --- Zoom & Pan Variables ---
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isPanning = false;
let lastPanMouseX = 0;
let lastPanMouseY = 0;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
let isMouseDown = false; // For fill operation
let lastFillRow = -1;
let lastFillCol = -1;
let fillStates = []; // グリッドの塗りつぶし状態を保持する配列

// ドロップエリアクリックイベント
dropArea.addEventListener('click', () => {
    fileInput.click(); // ファイル入力欄をクリック
});

// ファイル選択イベント
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFile(file);
});

// ドラッグ＆ドロップイベント
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
    const file = e.dataTransfer.files[0];
    if (!file) return;
    handleFile(file);
});

// ファイル処理関数
function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        image = new Image();
        image.onload = () => {
            // Reset zoom and pan when a new image is loaded
            zoomLevel = 1;
            panX = 0;
            panY = 0;
            // offsetX = 0; // 画像オフセットもリセット (もし使うなら)
            // offsetY = 0; // 画像オフセットもリセット (もし使うなら)
            fillStates = []; // 塗りつぶし状態もリセット
            updatePreview();
        };
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// グリッドモードの初期設定
gridModeSizeRadio.checked = true;
gridCountControls.querySelectorAll('input').forEach(input => input.disabled = true);

// グリッド設定変更イベント (入力値チェックとプレビュー更新)
gridRowsInput.addEventListener('input', () => {
    const value = parseInt(gridRowsInput.value, 10);
    if (value <= 0 || isNaN(value)) {
        gridRowsInput.value = 10;
    }
    fillStates = []; // グリッド数が変わる可能性があるのでリセット
    updatePreview();
});
gridColsInput.addEventListener('input', () => {
    const value = parseInt(gridColsInput.value, 10);
    if (value <= 0 || isNaN(value)) {
        gridColsInput.value = 10;
    }
    fillStates = []; // グリッド数が変わる可能性があるのでリセット
    updatePreview();
});
gridSizeInput.addEventListener('input', () => {
    const value = parseInt(gridSizeInput.value, 10);
    if (value <= 0 || isNaN(value)) {
        gridSizeInput.value = 50;
    }
    fillStates = []; // グリッド数が変わる可能性があるのでリセット
    updatePreview();
});
gridOffsetXInput.addEventListener('input', () => {
    const value = parseInt(gridOffsetXInput.value, 10);
    if (isNaN(value)) {
        gridOffsetXInput.value = 0;
    }
    updatePreview();
});
gridOffsetYInput.addEventListener('input', () => {
    const value = parseInt(gridOffsetYInput.value, 10);
    if (isNaN(value)) {
        gridOffsetYInput.value = 0;
    }
    updatePreview();
});
lineWidthInput.addEventListener('input', () => {
    const value = parseInt(lineWidthInput.value, 10);
    if (value <= 0 || isNaN(value)) {
        lineWidthInput.value = 1;
    }
    updatePreview();
});
lineColorInput.addEventListener('input', updatePreview);
lineStyleSelect.addEventListener('change', handleLineStyleChange);
gridTextInput.addEventListener('input', updatePreview);
textFontSizeInput.addEventListener('input', () => {
    const value = parseInt(textFontSizeInput.value, 10);
    if (value <= 0 || isNaN(value)) {
        textFontSizeInput.value = 12;
    }
    updatePreview();
});
textRotationSelect.addEventListener('change', updatePreview);
textSpacingInput.addEventListener('input', () => {
    const value = parseFloat(textSpacingInput.value);
    if (value <= 0 || isNaN(value)) {
        textSpacingInput.value = 2.5;
    }
    updatePreview();
});
lineOpacityInput.addEventListener('input', updatePreview);
gradientCenterInput.addEventListener('input', updatePreview);
gradientEdgeInput.addEventListener('input', updatePreview);
gradientOuterInput.addEventListener('input', updatePreview);
fillColor1Input.addEventListener('input', updatePreview);
fillColor2Input.addEventListener('input', updatePreview);
fillOpacityInput.addEventListener('input', updatePreview);
gridTypeSquareRadio.addEventListener('change', updatePreview);
gridTypeHexRadio.addEventListener('change', updatePreview);

// グリッドモード変更イベント
gridModeSizeRadio.addEventListener('change', handleGridModeChange);
gridModeCountRadio.addEventListener('change', handleGridModeChange);

// ダウンロードボタンクリックイベント
downloadButton.addEventListener('click', () => {
    if (!image) return; // 画像がない場合は処理しない
    const format = downloadFormatSelect.value;
    const filename = `grid_image.${format}`;
    generateDownload(filename, format, true); // includeImage = true
});

// グリッドのみダウンロードボタンクリックイベント
gridOnlyButton.addEventListener('click', () => {
    if (!image) return; // 画像がない場合は処理しない
    const format = gridOnlyFormatSelect.value;
    const filename = `grid_only.${format}`;
    generateDownload(filename, format, false); // includeImage = false
});

// ダウンロード用画像生成関数
function generateDownload(filename, format, includeImage) {
    // Canvasのサイズを画像の元のサイズに合わせる
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');

    // 必要な変数を取得
    const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
    const gridType = document.querySelector('input[name="grid-type"]:checked').value;
    let rows, cols;
    if (gridMode === 'size') {
        const gridSize = parseInt(gridSizeInput.value, 10) || 50;
        // Note: Use ceil to ensure the grid covers the entire image for download
        rows = Math.ceil(image.height / gridSize);
        cols = Math.ceil(image.width / gridSize);
    } else {
        rows = parseInt(gridRowsInput.value, 10);
        cols = parseInt(gridColsInput.value, 10);
    }
    const gridOffsetXValue = parseInt(gridOffsetXInput.value, 10) || 0;
    const gridOffsetYValue = parseInt(gridOffsetYInput.value, 10) || 0;
    const lineWidth = parseInt(lineWidthInput.value, 10);
    const lineColor = lineColorInput.value;
    const lineStyle = lineStyleSelect.value;
    const gridText = gridTextInput.value;
    const textFontSize = parseInt(textFontSizeInput.value, 10);
    const textRotation = textRotationSelect.value;
    const textSpacing = parseFloat(textSpacingInput.value) || 2.5;
    const lineOpacity = parseFloat(lineOpacityInput.value);
    const fillColor1 = fillColor1Input.value;
    const fillColor2 = fillColor2Input.value;
    const fillOpacity = parseFloat(fillOpacityInput.value);

    // グリッドのみの場合、背景を透明にする (PNG/WebP) か白にする (JPG)
    if (!includeImage) {
        if (format === 'png' || format === 'webp') {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // 透明
        } else {
            ctx.fillStyle = '#ffffff'; // 白
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    // 画像を描画 (必要な場合)
    if (includeImage) {
        ctx.drawImage(image, 0, 0);
    }

    // グリッドと塗りつぶしを描画 (ズーム/パンは適用しない)
    // fillStates はプレビュー時のものをそのまま使う
    const currentFillStates = getFillStatesForDownload(rows, cols); // 現在の fillStates を取得

    if (gridType === 'square') {
        if (lineStyle === "text") {
            drawTextGrid(ctx, gridOffsetXValue, gridOffsetYValue, canvas.width, canvas.height, rows, cols, lineColor, gridText, textFontSize, textRotation, lineOpacity, textSpacing);
        } else {
            drawSquareGrid(ctx, gridOffsetXValue, gridOffsetYValue, canvas.width, canvas.height, rows, cols, lineWidth, lineColor, lineStyle, lineOpacity, fillColor1, fillColor2, fillOpacity, currentFillStates);
        }
    } else if (gridType === 'hex') {
        // ヘクスグリッドは現在塗りつぶし非対応のため fillStates は渡さない
        drawHexGrid(ctx, gridOffsetXValue, gridOffsetYValue, canvas.width, canvas.height, rows, cols, lineWidth, lineColor, lineOpacity, lineStyle);
    }

    // ダウンロードリンクを作成してクリック
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
}

// ダウンロード用に現在の fillStates を取得/整形する関数
function getFillStatesForDownload(expectedRows, expectedCols) {
    // 現在の fillStates のサイズが期待値と異なる場合、
    // 新しいサイズの配列を 0 で初期化して返す (またはエラー処理)
    // ここでは、プレビュー時の状態をそのまま使うことを前提とする
    if (fillStates.length !== expectedRows || (fillStates.length > 0 && fillStates[0].length !== expectedCols)) {
        console.warn("Fill states size mismatch during download. Using current states.");
        // 必要ならここでリサイズや初期化を行う
        // return Array(expectedRows).fill(null).map(() => Array(expectedCols).fill(0));
    }
    return fillStates;
}


// 線の種類変更イベントハンドラ
function handleLineStyleChange() {
    const lineStyle = lineStyleSelect.value;

    gradientControls.style.display = lineStyle === "gradient" ? "block" : "none";
    textControls.style.display = lineStyle === "text" ? "block" : "none";

    updatePreview();
}

// グリッドモード変更イベントハンドラ
function handleGridModeChange() {
    if (gridModeSizeRadio.checked) {
        gridSizeControls.querySelectorAll('input').forEach(input => input.disabled = false);
        gridCountControls.querySelectorAll('input').forEach(input => input.disabled = true);
    } else {
        gridSizeControls.querySelectorAll('input').forEach(input => input.disabled = true);
        gridCountControls.querySelectorAll('input').forEach(input => input.disabled = false);
    }
    fillStates = []; // グリッド計算方法が変わるのでリセット
    updatePreview();
}

// プレビュー更新関数
function updatePreview() {
    if (!image) return;

    const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
    let rows, cols;

    if (gridMode === 'size') {
        const gridSize = parseInt(gridSizeInput.value, 10) || 50;
        // Use floor for preview display consistency
        rows = Math.floor(image.height / gridSize);
        cols = Math.floor(image.width / gridSize);
    } else {
        rows = parseInt(gridRowsInput.value, 10) || 10;
        cols = parseInt(gridColsInput.value, 10) || 10;
    }

    // Ensure rows and cols are at least 1
    rows = Math.max(1, rows);
    cols = Math.max(1, cols);


    const gridOffsetXValue = parseInt(gridOffsetXInput.value, 10) || 0;
    const gridOffsetYValue = parseInt(gridOffsetYInput.value, 10) || 0;
    const lineWidth = parseInt(lineWidthInput.value, 10) || 1;
    const lineColor = lineColorInput.value;
    const lineStyle = lineStyleSelect.value;
    const gridText = gridTextInput.value;
    const textFontSize = parseInt(textFontSizeInput.value, 10) || 12;
    const textRotation = textRotationSelect.value;
    const textSpacing = parseFloat(textSpacingInput.value) || 2.5;
    const lineOpacity = parseFloat(lineOpacityInput.value);
    const fillColor1 = fillColor1Input.value;
    const fillColor2 = fillColor2Input.value;
    const fillOpacity = parseFloat(fillOpacityInput.value);

    // --- Canvas Preparation ---
    // Set canvas display size to fit the container, but keep drawing buffer size based on image
    const previewAreaWidth = previewArea.clientWidth;
    const previewAreaHeight = previewArea.clientHeight;

    // Maintain aspect ratio
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

    // Set the CSS size for display
    previewCanvas.style.width = `${canvasDisplayWidth}px`;
    previewCanvas.style.height = `${canvasDisplayHeight}px`;

    // Set the actual drawing buffer size (can be image size for full res)
    previewCanvas.width = image.width;
    previewCanvas.height = image.height;

    // --- Clear and Transform ---
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height); // Clear previous frame
    previewCtx.save(); // Save the default state
    previewCtx.translate(panX, panY); // Apply panning
    previewCtx.scale(zoomLevel, zoomLevel); // Apply zoom

    // --- Drawing ---
    // Draw Image
    previewCtx.drawImage(image, 0, 0);

    // Initialize or check fillStates size
    if (fillStates.length !== rows || (fillStates.length > 0 && fillStates[0].length !== cols)) {
        console.log(`Initializing fillStates: ${rows}x${cols}`);
        fillStates = Array(rows).fill(null).map(() => Array(cols).fill(0));
        lastFillRow = -1; // Reset last filled cell tracker
        lastFillCol = -1;
    }


    // Draw Grid
    const gridType = document.querySelector('input[name="grid-type"]:checked').value;
    if (gridType === 'square') {
        if (lineStyle === "text") {
            drawTextGrid(previewCtx, gridOffsetXValue, gridOffsetYValue, image.width, image.height, rows, cols, lineColor, gridText, textFontSize, textRotation, lineOpacity, textSpacing);
        } else {
            drawSquareGrid(previewCtx, gridOffsetXValue, gridOffsetYValue, image.width, image.height, rows, cols, lineWidth, lineColor, lineStyle, lineOpacity, fillColor1, fillColor2, fillOpacity, fillStates);
        }
    } else if (gridType === 'hex') {
        drawHexGrid(previewCtx, gridOffsetXValue, gridOffsetYValue, image.width, image.height, rows, cols, lineWidth, lineColor, lineOpacity, lineStyle);
    }

    // --- Restore ---
    previewCtx.restore(); // Restore to the default state (before translate/scale)
}

// --- Drawing Functions ---

function drawSquareGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineWidth, lineColor, lineStyle, lineOpacity, fillColor1, fillColor2, fillOpacity, fillStates) {
    ctx.lineWidth = lineWidth;
    const r = parseInt(lineColor.substring(1, 3), 16);
    const g = parseInt(lineColor.substring(3, 5), 16);
    const b = parseInt(lineColor.substring(5, 7), 16);
    const strokeStyleWithOpacity = `rgba(${r}, ${g}, ${b}, ${lineOpacity})`;

    // Line Style
    ctx.setLineDash([]); // Reset dashes first
    if (lineStyle === "dotted") {
        ctx.setLineDash([lineWidth * 2, lineWidth * 3]); // Adjust dot spacing based on line width
    } else if (lineStyle === "dashed") {
        ctx.setLineDash([lineWidth * 5, lineWidth * 3]); // Adjust dash spacing
    } else if (lineStyle === "gradient") {
        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
        gradient.addColorStop(0, gradientCenterInput.value);
        gradient.addColorStop(0.5, gradientEdgeInput.value);
        gradient.addColorStop(1, gradientOuterInput.value);
        ctx.strokeStyle = gradient; // Opacity applied automatically? Check this. If not, apply globally.
    } else { // Solid or Text (Text grid lines are drawn separately)
         ctx.strokeStyle = strokeStyleWithOpacity;
    }
     if (lineStyle !== "gradient") {
       ctx.strokeStyle = strokeStyleWithOpacity;
     }


    const cellWidth = width / cols;
    const cellHeight = height / rows;

    // Draw Fillings first (so lines are on top)
    const fillR1 = parseInt(fillColor1.substring(1, 3), 16);
    const fillG1 = parseInt(fillColor1.substring(3, 5), 16);
    const fillB1 = parseInt(fillColor1.substring(5, 7), 16);
    const fillStyle1 = `rgba(${fillR1}, ${fillG1}, ${fillB1}, ${fillOpacity})`;

    const fillR2 = parseInt(fillColor2.substring(1, 3), 16);
    const fillG2 = parseInt(fillColor2.substring(3, 5), 16);
    const fillB2 = parseInt(fillColor2.substring(5, 7), 16);
    const fillStyle2 = `rgba(${fillR2}, ${fillG2}, ${fillB2}, ${fillOpacity})`;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (fillStates && fillStates[row] && fillStates[row][col] !== undefined) { // Check if fillStates is valid
                const x = cellWidth * col + offsetX;
                const y = cellHeight * row + offsetY;

                if (fillStates[row][col] === 1) {
                    ctx.fillStyle = fillStyle1;
                    ctx.fillRect(x, y, cellWidth, cellHeight);
                } else if (fillStates[row][col] === 2) {
                    ctx.fillStyle = fillStyle2;
                    ctx.fillRect(x, y, cellWidth, cellHeight);
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
            ctx.moveTo(offsetX, y);
            ctx.lineTo(width + offsetX, y);
        }
        // Vertical lines
        for (let i = 0; i <= cols; i++) {
            const x = cellWidth * i + offsetX;
            ctx.moveTo(x, offsetY);
            ctx.lineTo(x, height + offsetY);
        }
        ctx.stroke();
     }

    // Reset line dash for other potential drawing operations
    ctx.setLineDash([]);
}

function drawTextGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineColor, gridText, textFontSize, textRotation, lineOpacity, spacingFactor) {
    if (gridText === "") return;

    ctx.font = `${textFontSize}px sans-serif`;
    const r = parseInt(lineColor.substring(1, 3), 16);
    const g = parseInt(lineColor.substring(3, 5), 16);
    const b = parseInt(lineColor.substring(5, 7), 16);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${lineOpacity})`;
    // ctx.globalAlpha = lineOpacity; // Setting alpha via fillStyle is often better
    ctx.textBaseline = "middle";
    ctx.textAlign = "center"; // Center text on the line point

    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const textWidth = ctx.measureText(gridText).width;
    const textHeight = textFontSize; // Approximate height

    // Horizontal "lines"
    for (let i = 1; i < rows; i++) {
        const y = cellHeight * i + offsetY;
        const effectiveSpacing = textWidth * spacingFactor;
        for (let x = offsetX + effectiveSpacing / 2; x < width + offsetX; x += effectiveSpacing) {
             drawRotatedText(ctx, gridText, x, y, textRotation);
        }
    }

    // Vertical "lines"
    for (let i = 1; i < cols; i++) {
        const x = cellWidth * i + offsetX;
        const effectiveSpacing = textHeight * spacingFactor; // Use font size for vertical spacing
        for (let y = offsetY + effectiveSpacing / 2; y < height + offsetY; y += effectiveSpacing) {
             drawRotatedText(ctx, gridText, x, y, textRotation);
        }
    }
    // ctx.globalAlpha = 1.0; // Reset global alpha if it was used
}

// Helper for drawing rotated text
function drawRotatedText(ctx, text, x, y, rotationType) {
    ctx.save();
    ctx.translate(x, y);
    if (rotationType === 'left') {
        ctx.rotate(-Math.PI / 2); // -90 degrees
    } else if (rotationType === 'right') {
        ctx.rotate(Math.PI / 2); // +90 degrees
    }
    // No rotation if 'none' or other value
    ctx.fillText(text, 0, 0);
    ctx.restore();
}


function drawHexGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineWidth, lineColor, lineOpacity, lineStyle) {
    // Estimate side length based on fitting cols into width
    // Hex width = 2 * side, but they overlap by 0.5 * side
    // Total width ≈ side * (cols * 1.5 + 0.5)
    const sideLength = width / (cols * 1.5 + 0.5);
    // Hex height = sqrt(3) * side
    // Total height ≈ side * sqrt(3) * (rows + 0.5)
    const hexHeight = Math.sqrt(3) * sideLength;

    const r = parseInt(lineColor.substring(1, 3), 16);
    const g = parseInt(lineColor.substring(3, 5), 16);
    const b = parseInt(lineColor.substring(5, 7), 16);
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineOpacity})`;
    ctx.lineWidth = lineWidth;
    // ctx.globalAlpha = lineOpacity; // Setting via strokeStyle is preferred

    // Adjust rows based on calculated hex height to potentially fit more/less
    const effectiveRows = Math.floor((height - hexHeight * 0.5) / hexHeight);


    for (let row = 0; row < effectiveRows + 1; row++) { // +1 to potentially draw partially visible rows
        for (let col = 0; col < cols + 1; col++) { // +1 for partials
            // Calculate center X: Staggered columns
            // Even columns are baseline, odd columns shifted right by 0.75 * width
            const centerX = offsetX + sideLength * (col * 1.5 + 1);
            // Calculate center Y: Staggered rows based on column
            // Odd columns are shifted down by half hex height
            const centerY = offsetY + hexHeight * (row + 0.5 * (col % 2) + 0.5); // Add 0.5 hexHeight base offset

             // Only draw if hex center is somewhat within bounds (optimization)
            if (centerX > -sideLength && centerX < width + sideLength && centerY > -hexHeight && centerY < height + hexHeight) {
                drawHexagon(ctx, centerX, centerY, sideLength, lineStyle);
            }
        }
    }
    // ctx.globalAlpha = 1.0; // Reset global alpha
}

function drawHexagon(ctx, centerX, centerY, sideLength, lineStyle) {
    const angle = Math.PI / 3; // 60 degrees

    ctx.setLineDash([]); // Reset dashes
     if (lineStyle === "dotted") {
        ctx.setLineDash([ctx.lineWidth * 2, ctx.lineWidth * 3]);
    } else if (lineStyle === "dashed") {
        ctx.setLineDash([ctx.lineWidth * 5, ctx.lineWidth * 3]);
    }
    // No gradient support for hex lines in this example yet

    ctx.beginPath();
    // Start from the top point (or any point, ensures connection)
    ctx.moveTo(centerX + sideLength * Math.cos(Math.PI/2), centerY + sideLength * Math.sin(Math.PI/2)); // Start top
    for (let i = 0; i < 6; i++) {
        // Angle calculation adjusted to start from top and go clockwise
        const currentAngle = Math.PI/2 + angle * (i + 1);
        const x = centerX + sideLength * Math.cos(currentAngle);
        const y = centerY + sideLength * Math.sin(currentAngle);
        ctx.lineTo(x, y);
    }
    // ctx.closePath(); // Connects last point to first automatically with stroke
    ctx.stroke();
     ctx.setLineDash([]); // Reset dashes
}


// --- Zoom and Pan Event Handlers ---

// Helper function to transform screen coordinates to canvas coordinates
function getTransformedPoint(screenX, screenY) {
    const rect = previewCanvas.getBoundingClientRect();
    // Calculate mouse position relative to the canvas element
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;

    // Calculate the position on the drawing buffer, considering CSS scaling
    const bufferX = canvasX * (previewCanvas.width / previewCanvas.clientWidth);
    const bufferY = canvasY * (previewCanvas.height / previewCanvas.clientHeight);


    // Inverse transform: Apply inverse of pan and zoom
    const originalX = (bufferX - panX) / zoomLevel;
    const originalY = (bufferY - panY) / zoomLevel;

    return { x: originalX, y: originalY };
}


previewArea.addEventListener('wheel', (e) => {
    if (!image) return;
    e.preventDefault();

    const rect = previewCanvas.getBoundingClientRect();
    // Mouse position relative to the scaled canvas element
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

     // Position on the drawing buffer (considering CSS scaling)
    const bufferMouseX = mouseX * (previewCanvas.width / previewCanvas.clientWidth);
    const bufferMouseY = mouseY * (previewCanvas.height / previewCanvas.clientHeight);


    // Get the world coordinates (image coordinates) before zoom
    const pointBeforeZoomX = (bufferMouseX - panX) / zoomLevel;
    const pointBeforeZoomY = (bufferMouseY - panY) / zoomLevel;

    // Calculate new zoom level
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    let newZoomLevel = zoomLevel * delta;
    newZoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoomLevel));

    // Calculate new pan to keep the mouse position fixed relative to the image
    // newPanX = bufferMouseX - pointBeforeZoomX * newZoomLevel
    // newPanY = bufferMouseY - pointBeforeZoomY * newZoomLevel
    panX = bufferMouseX - pointBeforeZoomX * newZoomLevel;
    panY = bufferMouseY - pointBeforeZoomY * newZoomLevel;

    zoomLevel = newZoomLevel;

    // Optional: Add pan limits if needed
    // limitPan();

    updatePreview();
});

previewArea.addEventListener('mousedown', (e) => {
    // Use middle mouse button or Ctrl+Left Click for panning
    // Allow left click for filling on the canvas itself
    if ((e.button === 1 || (e.button === 0 && e.ctrlKey)) && image) {
        isPanning = true;
        lastPanMouseX = e.clientX;
        lastPanMouseY = e.clientY;
        previewArea.style.cursor = 'grabbing';
        e.preventDefault(); // Prevent default middle-click scroll
    }
     // Note: Left click without Ctrl is handled by previewCanvas listener for filling
});

previewArea.addEventListener('mousemove', (e) => {
    if (!isPanning || !image) return;

    const deltaX = e.clientX - lastPanMouseX;
    const deltaY = e.clientY - lastPanMouseY;

    panX += deltaX;
    panY += deltaY;

    lastPanMouseX = e.clientX;
    lastPanMouseY = e.clientY;

    // Optional: Add pan limits if needed
    // limitPan();

    updatePreview();
});

previewArea.addEventListener('mouseup', (e) => {
    if (isPanning && (e.button === 1 || (e.button === 0 && e.ctrlKey))) {
        isPanning = false;
        previewArea.style.cursor = 'grab'; // Or 'default' if grab is confusing
    }
});

previewArea.addEventListener('mouseleave', () => {
    if (isPanning) {
        isPanning = false;
        previewArea.style.cursor = 'grab';
    }
});

// Optional: Function to limit panning
function limitPan() {
    const scaledWidth = image.width * zoomLevel;
    const scaledHeight = image.height * zoomLevel;

    // Limit panX
    const minPanX = previewCanvas.clientWidth - scaledWidth; // Max left pan
    const maxPanX = 0; // Max right pan
    panX = Math.max(minPanX, Math.min(maxPanX, panX));

     // Limit panY
    const minPanY = previewCanvas.clientHeight - scaledHeight; // Max top pan
    const maxPanY = 0; // Max bottom pan
    panY = Math.max(minPanY, Math.min(maxPanY, panY));

     // Adjust if image is smaller than viewport after zoom
    if (scaledWidth < previewCanvas.clientWidth) {
       panX = (previewCanvas.clientWidth - scaledWidth) / 2; // Center horizontally
    }
     if (scaledHeight < previewCanvas.clientHeight) {
       panY = (previewCanvas.clientHeight - scaledHeight) / 2; // Center vertically
    }

}

// --- Fill Operation Event Handlers (on previewCanvas) ---

previewCanvas.addEventListener('mousedown', (e) => {
    // Only activate fill on left click WITHOUT Ctrl key
    if (e.button !== 0 || e.ctrlKey || !image) return;

    isMouseDown = true; // Start fill sequence
    handleFillAction(e); // Execute fill for the clicked cell
    e.preventDefault(); // Prevent text selection, etc.
});

previewCanvas.addEventListener('mousemove', (e) => {
    // Continue filling only if left mouse is down and not panning
    if (!isMouseDown || isPanning || !image) return;

    handleFillAction(e); // Execute fill for the cell under cursor
});

previewCanvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) { // Left mouse button up
        isMouseDown = false;
        lastFillRow = -1; // Reset last filled cell to allow re-clicking same cell
        lastFillCol = -1;
    }
});

previewCanvas.addEventListener('mouseleave', () => {
    // Stop filling if mouse leaves canvas while button is down
    // isMouseDown = false; // Keep isMouseDown true potentially? Maybe not needed.
    // lastFillRow = -1; // Reset last filled cell
    // lastFillCol = -1;
});


// Combined function to handle fill logic for mousedown/mousemove
function handleFillAction(e) {
    const transformedPoint = getTransformedPoint(e.clientX, e.clientY);
    const x = transformedPoint.x;
    const y = transformedPoint.y;

    const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
    let rows, cols;
    if (gridMode === 'size') {
        const gridSize = parseInt(gridSizeInput.value, 10) || 50;
        rows = Math.floor(image.height / gridSize);
        cols = Math.floor(image.width / gridSize);
    } else {
        rows = parseInt(gridRowsInput.value, 10) || 10;
        cols = parseInt(gridColsInput.value, 10) || 10;
    }
    rows = Math.max(1, rows);
    cols = Math.max(1, cols);

    const gridOffsetXValue = parseInt(gridOffsetXInput.value, 10) || 0;
    const gridOffsetYValue = parseInt(gridOffsetYInput.value, 10) || 0;

    // Calculate cell dimensions based on the original image size
    const cellWidth = image.width / cols;
    const cellHeight = image.height / rows;

    // Calculate grid cell coordinates, considering grid offset
    const col = Math.floor((x - gridOffsetXValue) / cellWidth);
    const row = Math.floor((y - gridOffsetYValue) / cellHeight);

    // Check bounds and if the cell is different from the last one filled (for mousemove)
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
        if (row !== lastFillRow || col !== lastFillCol) {
             // Ensure fillStates is initialized correctly
             if (!fillStates[row]) {
                 fillStates[row] = []; // Initialize row if it doesn't exist
             }
             const currentState = fillStates[row][col] || 0; // Default to 0 if undefined
             fillStates[row][col] = (currentState + 1) % 3; // Cycle 0 -> 1 -> 2 -> 0
             updatePreview();
             lastFillRow = row;
             lastFillCol = col;
        }
    }
}

// 塗りつぶしリセットボタンのイベントリスナー
resetFillButton.addEventListener('click', () => {
    if (!image) return;

    // Get current grid dimensions to reset fillStates correctly
    const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
    let rows, cols;
    if (gridMode === 'size') {
        const gridSize = parseInt(gridSizeInput.value, 10) || 50;
        rows = Math.floor(image.height / gridSize);
        cols = Math.floor(image.width / gridSize);
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
});

// Initial setup calls if needed
handleLineStyleChange(); // Set initial visibility of controls
handleGridModeChange(); // Set initial state of grid mode inputs