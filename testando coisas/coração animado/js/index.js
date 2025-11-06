const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function fitCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
fitCanvas();
window.addEventListener('resize', fitCanvas);

function getCenter() {
    return { x: canvas.width / 2, y: canvas.height / 2 };
}
let baseScale = Math.min(canvas.width, canvas.height) / 32; // ajuste inicial

function heartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x, y };
}
