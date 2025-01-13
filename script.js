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


// ドロップエリアクリックイベント
dropArea.addEventListener('click', () => {
    fileInput.click(); // ファイル入力欄をクリック
});

// ファイル選択イベント
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        image = new Image();
        image.onload = () => {
            offsetX = 0; // 初期化をここに移動
            offsetY = 0; // 初期化をここに移動
            updatePreview();
        };
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

let image = null;
let offsetX = 0;
let offsetY = 0;

// グリッドモードの初期設定
gridModeSizeRadio.checked = true;
gridCountControls.querySelectorAll('input').forEach(input => input.disabled = true);

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
    const reader = new FileReader();

    reader.onload = (e) => {
        image = new Image();
        image.onload = () => {
            offsetX = 0; // 初期化をここに移動
            offsetY = 0; // 初期化をここに移動
            updatePreview();
        };
        image.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

// グリッド設定変更イベント
gridRowsInput.addEventListener('input', () => {
    const value = parseInt(gridRowsInput.value, 10);
    if (value <= 0 || isNaN(value)) {
        gridRowsInput.value = 10; // デフォルト値に戻す
    }
    updatePreview();
});
gridColsInput.addEventListener('input', () => {
    const value = parseInt(gridColsInput.value, 10);
    if (value <= 0 || isNaN(value)) {
        gridColsInput.value = 10; // デフォルト値に戻す
    }
    updatePreview();
});
gridSizeInput.addEventListener('input', () => {
    const value = parseInt(gridSizeInput.value, 10);
    if (value <= 0 || isNaN(value)) {
        gridSizeInput.value = 50; // デフォルト値に戻す
    }
    updatePreview();
});
gridOffsetXInput.addEventListener('input', () => {
    const value = parseInt(gridOffsetXInput.value, 10);
    if (isNaN(value)) {
        gridOffsetXInput.value = 0; // デフォルト値に戻す
    }
    updatePreview();
});
gridOffsetYInput.addEventListener('input', () => {
    const value = parseInt(gridOffsetYInput.value, 10);
    if (isNaN(value)) {
        gridOffsetYInput.value = 0; // デフォルト値に戻す
    }
    updatePreview();
});
lineWidthInput.addEventListener('input', () => {
    const value = parseInt(lineWidthInput.value, 10);
    if (value <= 0 || isNaN(value)) {
        lineWidthInput.value = 1; // デフォルト値に戻す
    }
    updatePreview();
});
lineColorInput.addEventListener('input', updatePreview);
lineStyleSelect.addEventListener('change', handleLineStyleChange);
gridTextInput.addEventListener('input', updatePreview);
textFontSizeInput.addEventListener('input', () => {
    const value = parseInt(textFontSizeInput.value, 10);
    if (value <= 0 || isNaN(value)) {
        textFontSizeInput.value = 12; // デフォルト値に戻す
    }
    updatePreview();
});
textRotationSelect.addEventListener('change', updatePreview);
textSpacingInput.addEventListener('input', () => {
    const value = parseFloat(textSpacingInput.value);
    if (value <= 0 || isNaN(value)) {
        textSpacingInput.value = 2.5; // デフォルト値に戻す
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

// グリッドモード変更イベント
gridModeSizeRadio.addEventListener('change', handleGridModeChange);
gridModeCountRadio.addEventListener('change', handleGridModeChange);
// ダウンロードボタンクリックイベント
downloadButton.addEventListener('click', () => {
    const format = downloadFormatSelect.value;
    const filename = `grid_image.${format}`;

    // Canvasのサイズを画像のサイズに合わせる
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
        rows = Math.floor(image.height / gridSize);
        cols = Math.floor(image.width / gridSize);
    } else {
        rows = parseInt(gridRowsInput.value, 10);
        cols = parseInt(gridColsInput.value, 10);
    }
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

    // 画像とグリッドを描画
    ctx.drawImage(image, 0, 0);
    const offsetX = parseInt(gridOffsetXInput.value, 10);
    const offsetY = parseInt(gridOffsetYInput.value, 10);
    if (gridType === 'square') {
        if (lineStyle === "text") {
            drawTextGrid(ctx, offsetX, offsetY, image.width, image.height, rows, cols, lineColor, gridText, textFontSize, textRotation, lineOpacity, textSpacing);
        } else {
            drawSquareGrid(ctx, offsetX, offsetY, image.width, image.height, rows, cols, lineWidth, lineColor, lineStyle, lineOpacity, fillColor1, fillColor2, fillOpacity, fillStates);
        }
    } else if (gridType === 'hex') {
        drawHexGrid(ctx, offsetX, offsetY, image.width, image.height, rows, cols, lineWidth, lineColor, lineOpacity, lineStyle); // lineStyleを渡す
    }
    // ダウンロードリンクを作成
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
});
// グリッドのみダウンロードボタンクリックイベント
gridOnlyButton.addEventListener('click', () => {
    const format = gridOnlyFormatSelect.value;
    const filename = `grid_only.${format}`;

    // Canvasのサイズを画像のサイズに合わせる
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');

    // 背景を透明に設定
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 必要な変数を取得
    const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
    const gridType = document.querySelector('input[name="grid-type"]:checked').value;
    let rows, cols;
    if (gridMode === 'size') {
        const gridSize = parseInt(gridSizeInput.value, 10) || 50;
        rows = Math.floor(image.height / gridSize);
        cols = Math.floor(image.width / gridSize);
    } else {
        rows = parseInt(gridRowsInput.value, 10);
        cols = parseInt(gridColsInput.value, 10);
    }
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
    // グリッドのみを描画
    const offsetX = parseInt(gridOffsetXInput.value, 10);
    const offsetY = parseInt(gridOffsetYInput.value, 10);
    if (gridType === 'square') {
        if (lineStyle === "text") {
            drawTextGrid(ctx, offsetX, offsetY, image.width, image.height, rows, cols, lineColor, gridText, textFontSize, textRotation, lineOpacity, textSpacing);
        } else {
           drawSquareGrid(ctx, offsetX, offsetY, image.width, image.height, rows, cols, lineWidth, lineColor, lineStyle, lineOpacity, fillColor1, fillColor2, fillOpacity, fillStates);
        }
    } else if (gridType === 'hex') {
        drawHexGrid(ctx, offsetX, offsetY, image.width, image.height, rows, cols, lineWidth, lineColor, lineOpacity, lineStyle); // lineStyleを渡す
    }
    // グリッド線以外の部分を透明にする (png/webpの場合)
    if (format === 'png' || format === 'webp') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] === 0) { // アルファ値が0 (透明) のピクセルのみ残す
                data[i - 3] = 0;  // R
                data[i - 2] = 0;  // G
                data[i - 1] = 0;  // B
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }

    // ダウンロードリンクを作成
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
});

// 線の種類変更イベントハンドラ
function handleLineStyleChange() {
    const lineStyle = lineStyleSelect.value;

    if (lineStyle === "gradient") {
        gradientControls.style.display = "block";
        textControls.style.display = "none";
    } else if (lineStyle === "text") {
        gradientControls.style.display = "none";
        textControls.style.display = "block";
    } else {
        gradientControls.style.display = "none";
        textControls.style.display = "none";
    }

    updatePreview();
}
let fillStates = []; // グリッドの塗りつぶし状態を保持する配列

// プレビュー更新関数
function updatePreview() {
    if (!image) return;

    const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
    let rows, cols;

    if (gridMode === 'size') {
        const gridSize = parseInt(gridSizeInput.value, 10) || 50;
        rows = Math.floor(image.height / gridSize);
        cols = Math.floor(image.width / gridSize);
    } else {
        rows = parseInt(gridRowsInput.value, 10);
        cols = parseInt(gridColsInput.value, 10);
    }

    const offsetX = parseInt(gridOffsetXInput.value, 10);
    const offsetY = parseInt(gridOffsetYInput.value, 10);
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


    // キャンバスのサイズを画像のサイズに合わせる
    previewCanvas.width = image.width;
    previewCanvas.height = image.height;

    // 画像を描画 (オフセットを適用)
    previewCtx.drawImage(image, 0, 0);
     // fillStatesを初期化
    if (fillStates.length !== rows || (fillStates.length > 0 && fillStates[0].length !== cols)) {
        fillStates = Array(rows).fill(null).map(() => Array(cols).fill(0));
    }


    const gridType = document.querySelector('input[name="grid-type"]:checked').value;
    // グリッドを描画 (オフセットを適用)
    if (gridType === 'square') {
        if (lineStyle === "text") {
            drawTextGrid(previewCtx, offsetX, offsetY, previewCanvas.width, previewCanvas.height, rows, cols, lineColor, gridText, textFontSize, textRotation, lineOpacity, textSpacing);
        } else {
            drawSquareGrid(previewCtx, offsetX, offsetY, previewCanvas.width, previewCanvas.height, rows, cols, lineWidth, lineColor, lineStyle, lineOpacity, fillColor1, fillColor2, fillOpacity, fillStates);
        }
    } else if (gridType === 'hex') {
        drawHexGrid(previewCtx, offsetX, offsetY, previewCanvas.width, previewCanvas.height, rows, cols, lineWidth, lineColor, lineOpacity, lineStyle); // lineStyleを渡す
    }
}
// グリッドを描画する関数
function drawGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineWidth, lineColor, lineStyle, gridText, textFontSize, textRotation, lineOpacity, spacingFactor) {
    if (lineStyle === "text") {
        drawTextGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineColor, gridText, textFontSize, textRotation, lineOpacity, spacingFactor);
    } else {
        drawLineGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineWidth, lineColor, lineStyle, lineOpacity);
    }
}

// 線のグリッドを描画する関数
function drawSquareGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineWidth, lineColor, lineStyle, lineOpacity, fillColor1, fillColor2, fillOpacity, fillStates) {
    ctx.lineWidth = lineWidth;

    // 線の種類によるスタイル設定
    switch (lineStyle) {
        case "solid":
            ctx.strokeStyle = `rgba(${parseInt(lineColor.substring(1, 3), 16)}, ${parseInt(lineColor.substring(3, 5), 16)}, ${parseInt(lineColor.substring(5, 7), 16)}, ${lineOpacity})`;
            ctx.setLineDash([]);
            break;
        case "dotted":
            ctx.strokeStyle = `rgba(${parseInt(lineColor.substring(1, 3), 16)}, ${parseInt(lineColor.substring(3, 5), 16)}, ${parseInt(lineColor.substring(5, 7), 16)}, ${lineOpacity})`;
            ctx.setLineDash([5, 5]);
            break;
        case "dashed":
            ctx.strokeStyle = `rgba(${parseInt(lineColor.substring(1, 3), 16)}, ${parseInt(lineColor.substring(3, 5), 16)}, ${parseInt(lineColor.substring(5, 7), 16)}, ${lineOpacity})`;
            ctx.setLineDash([10, 5]);
            break;
        case "gradient":
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
            gradient.addColorStop(0, gradientCenterInput.value);
            gradient.addColorStop(0.5, gradientEdgeInput.value);
            gradient.addColorStop(1, gradientOuterInput.value);
            ctx.strokeStyle = gradient;
            ctx.setLineDash([]);
            break;
        default:
            ctx.strokeStyle = `rgba(${parseInt(lineColor.substring(1, 3), 16)}, ${parseInt(lineColor.substring(3, 5), 16)}, ${parseInt(lineColor.substring(5, 7), 16)}, ${lineOpacity})`;
            ctx.setLineDash([]);
    }
  // 横線を描画
    for (let i = (lineStyle !== "text" ? 0 : 1); i <= rows; i++) {
        const y = (height / rows) * i + offsetY;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    // 縦線を描画
    for (let i = (lineStyle !== "text" ? 0 : 1); i <= cols; i++) {
        const x = (width / cols) * i + offsetX;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    // 塗りつぶしを描画
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = (width / cols) * col + offsetX;
            const y = (height / rows) * row + offsetY;
             const cellWidth = width / cols;
            const cellHeight = height / rows;

            if (fillStates[row][col] === 1) {
                  ctx.fillStyle = `rgba(${parseInt(fillColor1.substring(1, 3), 16)}, ${parseInt(fillColor1.substring(3, 5), 16)}, ${parseInt(fillColor1.substring(5, 7), 16)}, ${fillOpacity})`;
                ctx.fillRect(x, y, cellWidth, cellHeight);
            } else if (fillStates[row][col] === 2) {
                ctx.fillStyle = `rgba(${parseInt(fillColor2.substring(1, 3), 16)}, ${parseInt(fillColor2.substring(3, 5), 16)}, ${parseInt(fillColor2.substring(5, 7), 16)}, ${fillOpacity})`;
                ctx.fillRect(x, y, cellWidth, cellHeight);
           }
        }
    }
}
// 文字のグリッドを描画する関数
function drawTextGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineColor, gridText, textFontSize, textRotation, lineOpacity, spacingFactor) {
    if (gridText === "") {
        return;
    }

    ctx.font = `${textFontSize}px sans-serif`;
    ctx.fillStyle = lineColor;
    ctx.globalAlpha = lineOpacity;
    ctx.textBaseline = "middle";

    // 横線を描画
    for (let i = 1; i < rows; i++) {
        const y = (height / rows) * i + offsetY;
        const textWidth = ctx.measureText(gridText).width;
        for (let j = 0; j < width; j += textWidth * spacingFactor) {
            ctx.fillText(gridText, j, y);
        }
    }

    // 縦線を描画
    for (let i = 1; i < cols; i++) {
        const x = (width / cols) * i + offsetX;
        for (let j = 0; j < height; j += textFontSize * spacingFactor) {
            const y = j + offsetY + (textFontSize / 2);
            ctx.fillText(gridText, x, y);
        }
    }
}
// ヘクスグリッドを描画する関数
function drawHexGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineWidth, lineColor, lineOpacity, lineStyle) {
    const sideLength = width / (cols * 1.5 + 0.5); // ヘクスの辺の長さを計算 (概算)
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = lineOpacity;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const centerX = offsetX + sideLength * (col * 1.5 + 1);
            const centerY = offsetY + sideLength * Math.sqrt(3) * (row + 0.5 * (col % 2));
            drawHexagon(ctx, centerX, centerY, sideLength, lineStyle); // lineStyleを渡す
        }
    }
}

function drawHexagon(ctx, centerX, centerY, sideLength, lineStyle) {
    const angle = 2 * Math.PI / 6;
    // 線の種類によるスタイル設定
    switch (lineStyle) {
        case "solid":
            ctx.setLineDash([]);
            break;
        case "dotted":
            ctx.setLineDash([5, 5]);
            break;
        case "dashed":
            ctx.setLineDash([10, 5]);
            break;
        default:
            ctx.setLineDash([]);
    }
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const x = centerX + sideLength * Math.cos(angle * i);
        const y = centerY + sideLength * Math.sin(angle * i);
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
}

// マウスイベントでプレビューをドラッグ
let isDragging = false; // isDragging の定義を修正
previewArea.addEventListener('mousedown', (e) => {
    isDragging = true;
    previewArea.style.cursor = 'grabbing';
});

previewArea.addEventListener('mousemove', (e) => {
    if (!isDragging || !image) return;
    offsetX += e.movementX;
    offsetY += e.movementY;

    // 画像がプレビューエリアからはみ出ないように調整
    offsetX = Math.max(previewCanvas.width - image.width, Math.min(0, offsetX)); // previewArea.offsetWidth を previewCanvas.width に変更
    offsetY = Math.max(previewCanvas.height - image.height, Math.min(0, offsetY)); // previewArea.offsetHeight を previewCanvas.height に変更

    updatePreview();
});
previewArea.addEventListener('mouseup', () => {
    isDragging = false;
    previewArea.style.cursor = 'grab';
});

// グリッドモード変更イベントハンドラ
function handleGridModeChange() {
    if (gridModeSizeRadio.checked) {
        gridSizeControls.querySelectorAll('input').forEach(input => input.disabled = false);
        gridCountControls.querySelectorAll('input').forEach(input => input.disabled = true);
    } else {
        gridSizeControls.querySelectorAll('input').forEach(input => input.disabled = true);
        gridCountControls.querySelectorAll('input').forEach(input => input.disabled = false);
    }
    updatePreview();
}

gridTypeSquareRadio.addEventListener('change', updatePreview);
gridTypeHexRadio.addEventListener('change', updatePreview);


let isMouseDown = false;
let lastFillRow = -1; // 初期値を-1に設定
let lastFillCol = -1; // 初期値を-1に設定
previewCanvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    if (!image) return; // 画像がロードされていない場合は何もしない

    const rect = previewCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
    let rows, cols;
    if (gridMode === 'size') {
        const gridSize = parseInt(gridSizeInput.value, 10) || 50;
        rows = Math.floor(image.height / gridSize);
        cols = Math.floor(image.width / gridSize);
    } else {
        rows = parseInt(gridRowsInput.value, 10);
        cols = parseInt(gridColsInput.value, 10);
    }

    const offsetXValue = parseInt(gridOffsetXInput.value, 10);
    const offsetYValue = parseInt(gridOffsetYInput.value, 10);
    const cellWidth = previewCanvas.width / cols;
    const cellHeight = previewCanvas.height / rows;

    const col = Math.floor((x - offsetXValue) / cellWidth);
    const row = Math.floor((y - offsetYValue) / cellHeight);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
        fillStates[row][col] = (fillStates[row][col] + 1) % 3;
        updatePreview();
        lastFillRow = row;
        lastFillCol = col;
    }
});

previewCanvas.addEventListener('mouseup', () => {
    isMouseDown = false;
    lastFillRow = -1; // マウスアップでリセット
    lastFillCol = -1; // マウスアップでリセット
});
// プレビューキャンバスのクリックイベント
previewCanvas.addEventListener('mousemove', (e) => {
    if (!image || !isMouseDown) return;
        const rect = previewCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;


        const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
        let rows, cols;
        if (gridMode === 'size') {
            const gridSize = parseInt(gridSizeInput.value, 10) || 50;
            rows = Math.floor(image.height / gridSize);
            cols = Math.floor(image.width / gridSize);
        } else {
            rows = parseInt(gridRowsInput.value, 10);
            cols = parseInt(gridColsInput.value, 10);
        }

        const offsetXValue = parseInt(gridOffsetXInput.value, 10);
        const offsetYValue = parseInt(gridOffsetYInput.value, 10);
        const cellWidth = previewCanvas.width / cols;
        const cellHeight = previewCanvas.height / rows;

        const col = Math.floor((x - offsetXValue) / cellWidth);
        const row = Math.floor((y - offsetYValue) / cellHeight);
        
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
            if(row !== lastFillRow || col !== lastFillCol) {
            fillStates[row][col] = (fillStates[row][col] + 1) % 3;
           updatePreview();
           lastFillRow = row; // 更新
           lastFillCol = col; // 更新
        }
      }
    });

// 塗りつぶしリセットボタンのイベントリスナー
resetFillButton.addEventListener('click', () => {
    if (!image) return;

    const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
    let rows, cols;
    if (gridMode === 'size') {
      const gridSize = parseInt(gridSizeInput.value, 10) || 50;
      rows = Math.floor(image.height / gridSize);
      cols = Math.floor(image.width / gridSize);
   } else {
     rows = parseInt(gridRowsInput.value, 10);
     cols = parseInt(gridColsInput.value, 10);
   }

    fillStates = Array(rows).fill(null).map(() => Array(cols).fill(0));
    updatePreview();
    lastFillRow = -1; // リセット
    lastFillCol = -1; // リセット
});