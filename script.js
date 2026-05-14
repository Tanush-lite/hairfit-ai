const imageUpload = document.getElementById("imageUpload");
const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");
const faceShapeResult = document.getElementById("faceShapeResult");

let userImage = new Image();

imageUpload.addEventListener("change", function(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        userImage.onload = function() {
            canvas.width = userImage.width;
            canvas.height = userImage.height;
            ctx.drawImage(userImage, 0, 0);
        };

        userImage.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

document.getElementById("analyzeBtn").addEventListener("click", function() {
    faceShapeResult.textContent = "Face Shape: Oval";
});

function applyStyle(styleFile) {
    if (!userImage.src) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(userImage, 0, 0);

    const hair = new Image();

    hair.onload = function() {
        ctx.drawImage(hair, canvas.width * 0.2, 20, canvas.width * 0.6, canvas.height * 0.3);
    };

    hair.src = "hairstyles/" + styleFile;
}