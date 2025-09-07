const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const speakBtn = document.getElementById("speakBtn");
const wordInput = document.getElementById("wordInput");
const brushColor = document.getElementById("brushColor");

const fontSize = 200;
let text = "A"; // valor inicial
const textX = canvas.width / 2;
const textY = canvas.height / 2 + fontSize / 6;

// Funções de canvas auxiliar
const maskCanvas = document.createElement("canvas");
maskCanvas.width = canvas.width;
maskCanvas.height = canvas.height;
const maskCtx = maskCanvas.getContext("2d");

const paintCanvas = document.createElement("canvas");
paintCanvas.width = canvas.width;
paintCanvas.height = canvas.height;
const paintCtx = paintCanvas.getContext("2d");
paintCtx.lineWidth = 30;
paintCtx.lineCap = "round";
paintCtx.strokeStyle = "#aa6347";

function drawLetterGuide() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#cccccc";
	ctx.font = `${fontSize}px Arial`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(text, textX, textY);
}

function updateMaskCanvas() {
	maskCtx.clearRect(0, 0, canvas.width, canvas.height);
	maskCtx.fillStyle = "black";
	maskCtx.font = `${fontSize}px Arial`;
	maskCtx.textAlign = "center";
	maskCtx.textBaseline = "middle";
	maskCtx.fillText(text, textX, textY);
}

function clearPaintCanvas() {
	paintCtx.clearRect(0, 0, canvas.width, canvas.height);
}

function render() {
	drawLetterGuide();
	const maskedPaint = document.createElement("canvas");
	maskedPaint.width = canvas.width;
	maskedPaint.height = canvas.height;
	const maskedCtx = maskedPaint.getContext("2d");

	maskedCtx.drawImage(maskCanvas, 0, 0);
	maskedCtx.globalCompositeOperation = "source-in";
	maskedCtx.drawImage(paintCanvas, 0, 0);

	ctx.drawImage(maskedPaint, 0, 0);
}

function setText(newText) {
	text = newText.toUpperCase();
	clearPaintCanvas();
	updateMaskCanvas();
	render();
}

// Pintura
let painting = false;

function getMousePos(e) {
	const rect = canvas.getBoundingClientRect();
	const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
	const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
	return { x, y };
}

function startPosition(e) {
	painting = true;
	const { x, y } = getMousePos(e);
	paintCtx.beginPath();
	paintCtx.moveTo(x, y);
	draw(e);
}

function endPosition() {
	painting = false;
}

function draw(e) {
	if (!painting) return;
	const { x, y } = getMousePos(e);
	paintCtx.lineTo(x, y);
	paintCtx.stroke();
	paintCtx.beginPath();
	paintCtx.moveTo(x, y);

	render();
}

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", endPosition);
canvas.addEventListener("mouseout", endPosition);
canvas.addEventListener("mousemove", draw);

canvas.addEventListener("touchstart", startPosition);
canvas.addEventListener("touchend", endPosition);
canvas.addEventListener("touchcancel", endPosition);
canvas.addEventListener("touchmove", draw);

// 🎤 Reconhecimento de Voz
const SpeechRecognition =
	window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
	const recognition = new SpeechRecognition();
	recognition.lang = "pt-BR";
	recognition.interimResults = false;
	recognition.maxAlternatives = 1;

	speakBtn.addEventListener("click", () => {
		recognition.start();
		speakBtn.innerText = "🎙️ Ouvindo...";
	});

	recognition.addEventListener("result", (event) => {
		const spokenText = event.results[0][0].transcript;
		console.log("Você disse:", spokenText);
		setText(spokenText);
		speakBtn.innerText = "🎤 Falar Palavra";
	});

	recognition.addEventListener("end", () => {
		speakBtn.innerText = "🎤 Falar Palavra";
	});

	recognition.addEventListener("error", (event) => {
		console.error("Erro de reconhecimento:", event.error);
		speakBtn.innerText = "🎤 Falar Palavra";
	});
} else {
	speakBtn.disabled = true;
	speakBtn.innerText = "Reconhecimento não suportado";
	alert("Este navegador não suporta reconhecimento de voz.");
}

wordInput.addEventListener("keyup", (e)=> {
    setText(e.target.value);
})
brushColor.addEventListener("change", (e) => {
    console.log(e.target.value);
    paintCtx.strokeStyle = e.target.value;
})
// Inicializa com a letra A
setText(text);
