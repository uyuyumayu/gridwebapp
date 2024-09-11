const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let img = new Image();

// 画像ドロップ処理
const dropArea = document.getElementById('dropArea');
dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
});
dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      drawGrid();
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// グリッド描画関数
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  const gridSizeX = parseInt(document.getElementById('gridSizeX').value);
  const gridSizeY = parseInt(document.getElementById('gridSizeY').value);
  const gridColor = document.getElementById('gridColor').value;
  const gridOpacity = parseFloat(document.getElementById('gridOpacity').value);
  const gridOffsetX = parseInt(document.getElementById('gridOffsetX').value);
  const gridOffsetY = parseInt(document.getElementById('gridOffsetY').value);

  ctx.strokeStyle = gridColor;
  ctx.globalAlpha = gridOpacity;

  for (let x = 0; x <= canvas.width; x += canvas.width / gridSizeX) {
    ctx.beginPath();
    ctx.moveTo(x + gridOffsetX, 0 + gridOffsetY);
    ctx.lineTo(x + gridOffsetX, canvas.height + gridOffsetY);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += canvas.height / gridSizeY) {
    ctx.beginPath();
    ctx.moveTo(0 + gridOffsetX, y + gridOffsetY);
    ctx.lineTo(canvas.width + gridOffsetX, y + gridOffsetY);
    ctx.stroke();
  }
}

// グリッド設定変更時のイベントリスナー
document.getElementById('gridSizeX').addEventListener('input', drawGrid);
document.getElementById('gridSizeY').addEventListener('input', drawGrid);
document.getElementById('gridColor').addEventListener('input', drawGrid);
document.getElementById('gridOpacity').addEventListener('input', drawGrid);
document.getElementById('gridOffsetX').addEventListener('input', drawGrid);
document.getElementById('gridOffsetY').addEventListener('input', drawGrid);


// ダウンロードボタン処理
document.getElementById('downloadButton').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'gridded_image.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});