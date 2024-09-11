const dropArea = document.getElementById('drop-area');
const previewCanvas = document.getElementById('preview-canvas');
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

let image = null;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;

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
      updatePreview();
    };
    image.src = e.target.result;
  };

  reader.readAsDataURL(file);
});

// グリッド設定変更イベント
gridRowsInput.addEventListener('input', updatePreview);
gridColsInput.addEventListener('input', updatePreview);
gridSizeInput.addEventListener('input', updatePreview);
gridOffsetXInput.addEventListener('input', updatePreview);
gridOffsetYInput.addEventListener('input', updatePreview);
lineWidthInput.addEventListener('input', updatePreview);
lineColorInput.addEventListener('input', updatePreview);
lineStyleSelect.addEventListener('change', handleLineStyleChange);
gridTextInput.addEventListener('input', updatePreview);
textFontSizeInput.addEventListener('input', updatePreview);
textRotationSelect.addEventListener('change', updatePreview);
textSpacingInput.addEventListener('input', updatePreview);
lineOpacityInput.addEventListener('input', updatePreview);
gradientCenterInput.addEventListener('input', updatePreview);
gradientEdgeInput.addEventListener('input', updatePreview);
gradientOuterInput.addEventListener('input', updatePreview);

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
  let rows, cols;
  if (gridMode === 'size') {
    const gridSize = parseInt(gridSizeInput.value) || 50;
    rows = Math.floor(image.height / gridSize);
    cols = Math.floor(image.width / gridSize);
  } else {
    rows = parseInt(gridRowsInput.value);
    cols = parseInt(gridColsInput.value);
  }
  const lineWidth = parseInt(lineWidthInput.value);
  const lineColor = lineColorInput.value;
  const lineStyle = lineStyleSelect.value;
  const gridText = gridTextInput.value;
  const textFontSize = parseInt(textFontSizeInput.value);
  const textRotation = textRotationSelect.value;
  const textSpacing = parseFloat(textSpacingInput.value) || 2.5;
  const lineOpacity = parseFloat(lineOpacityInput.value);

  // 画像とグリッドを描画
  ctx.drawImage(image, 0, 0);
  drawGrid(ctx, 0, 0, image.width, image.height, rows, cols, lineWidth, lineColor, lineStyle, gridText, textFontSize, textRotation, lineOpacity, textSpacing); 

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
  let rows, cols;
  if (gridMode === 'size') {
    const gridSize = parseInt(gridSizeInput.value) || 50;
    rows = Math.floor(image.height / gridSize);
    cols = Math.floor(image.width / gridSize);
  } else {
    rows = parseInt(gridRowsInput.value);
    cols = parseInt(gridColsInput.value);
  }
  const lineWidth = parseInt(lineWidthInput.value);
  const lineColor = lineColorInput.value;
  const lineStyle = lineStyleSelect.value;
  const gridText = gridTextInput.value;
  const textFontSize = parseInt(textFontSizeInput.value);
  const textRotation = textRotationSelect.value;
  const textSpacing = parseFloat(textSpacingInput.value) || 2.5; 
  const lineOpacity = parseFloat(lineOpacityInput.value);

  // グリッドのみを描画
  drawGrid(ctx, 0, 0, image.width, image.height, rows, cols, lineWidth, lineColor, lineStyle, gridText, textFontSize, textRotation, lineOpacity, textSpacing); 

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

// プレビュー更新関数
function updatePreview() {
  if (!image) return;

  const gridMode = document.querySelector('input[name="grid-mode"]:checked').value;
  let rows, cols;

  if (gridMode === 'size') {
    const gridSize = parseInt(gridSizeInput.value) || 50;
    rows = Math.floor(image.height / gridSize);
    cols = Math.floor(image.width / gridSize);
  } else {
    rows = parseInt(gridRowsInput.value);
    cols = parseInt(gridColsInput.value);
  }

  const offsetX = parseInt(gridOffsetXInput.value);
  const offsetY = parseInt(gridOffsetYInput.value);
  const lineWidth = parseInt(lineWidthInput.value);
  const lineColor = lineColorInput.value;
  const lineStyle = lineStyleSelect.value;
  const gridText = gridTextInput.value;
  const textFontSize = parseInt(textFontSizeInput.value);
  const textRotation = textRotationSelect.value;
  const textSpacing = parseFloat(textSpacingInput.value) || 2.5;
  const lineOpacity = parseFloat(lineOpacityInput.value);

  // キャンバスのサイズを画像のサイズに合わせる
  previewCanvas.width = image.width;
  previewCanvas.height = image.height;

  // 画像を描画 (オフセットは適用しない)
  previewCtx.drawImage(image, 0, 0);

  // グリッドを描画 (オフセットを適用)
  drawGrid(previewCtx, offsetX, offsetY, previewCanvas.width, previewCanvas.height, rows, cols, lineWidth, lineColor, lineStyle, gridText, textFontSize, textRotation, lineOpacity, textSpacing); 
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
function drawLineGrid(ctx, offsetX, offsetY, width, height, rows, cols, lineWidth, lineColor, lineStyle, lineOpacity) {
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
  for (let i = (lineStyle !== "text" ? 0 : 1); i < rows; i++) {
    const y = (height / rows) * i + offsetY;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 縦線を描画
  for (let i = (lineStyle !== "text" ? 0 : 1); i < cols; i++) {
    const x = (width / cols) * i + offsetX;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
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

// マウスイベントでプレビューをドラッグ
previewArea.addEventListener('mousedown', (e) => {
  isDragging = true;
  previewArea.style.cursor = 'grabbing';
});

previewArea.addEventListener('mousemove', (e) => {
  if (!isDragging || !image) return;

  offsetX += e.movementX;
  offsetY += e.movementY;

  // 画像がプレビューエリアからはみ出ないように調整
  offsetX = Math.max(previewArea.offsetWidth - image.width, Math.min(0, offsetX));
  offsetY = Math.max(previewArea.offsetHeight - image.height, Math.min(0, offsetY));

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