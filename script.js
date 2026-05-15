const imageUpload = document.getElementById("imageUpload");
const analyzeBtn = document.getElementById("analyzeBtn");
const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");
const faceShapeResult = document.getElementById("faceShapeResult");

let userImage = new Image();
let currentLandmarks = null;

// Upload image
imageUpload.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        userImage.onload = function() {
            canvas.width = userImage.width;
            canvas.height = userImage.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(userImage, 0, 0);
        };

        userImage.src = e.target.result;
    };

    reader.readAsDataURL(file);
});

// MediaPipe setup
const faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

faceMesh.onResults(onResults);

// Analyze face
analyzeBtn.addEventListener("click", async () => {
    if (!userImage.src) {
        alert("Please upload an image first.");
        return;
    }

    await faceMesh.send({ image: userImage });
});

// Distance helper
function getDistance(a, b) {
    return Math.sqrt(
        Math.pow(a.x - b.x, 2) +
        Math.pow(a.y - b.y, 2)
    );
}

// Face shape detection
function classifyFaceShape(landmarks) {
    const foreheadLeft = landmarks[234];
    const foreheadRight = landmarks[454];
    const jawLeft = landmarks[172];
    const jawRight = landmarks[397];
    const chin = landmarks[152];
    const foreheadTop = landmarks[10];
    const cheekLeft = landmarks[93];
    const cheekRight = landmarks[323];

    const foreheadWidth = getDistance(foreheadLeft, foreheadRight);
    const jawWidth = getDistance(jawLeft, jawRight);
    const cheekWidth = getDistance(cheekLeft, cheekRight);
    const faceLength = getDistance(foreheadTop, chin);

    if (faceLength > cheekWidth * 1.5) return "Rectangle";
    if (Math.abs(faceLength - cheekWidth) < 0.05) return "Round";
    if (jawWidth > cheekWidth * 0.95) return "Square";
    if (foreheadWidth > jawWidth * 1.1) return "Heart";
    return "Oval";
}

// Results
function onResults(results) {
    if (!results.multiFaceLandmarks.length) {
        faceShapeResult.textContent = "No face detected";
        return;
    }

    currentLandmarks = results.multiFaceLandmarks[0];

    const shape = classifyFaceShape(currentLandmarks);
    faceShapeResult.textContent = `Face Shape: ${shape}`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(userImage, 0, 0);
}

// Hairstyle overlay
function applyStyle(styleFile) {
    if (!currentLandmarks) {
        alert("Analyze face first.");
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(userImage, 0, 0);

    const hair = new Image();

    hair.onload = function() {
        const leftTemple = currentLandmarks[234];
        const rightTemple = currentLandmarks[454];
        const foreheadTop = currentLandmarks[10];

        const x1 = leftTemple.x * canvas.width;
        const x2 = rightTemple.x * canvas.width;
        const y = foreheadTop.y * canvas.height;

        const hairWidth = (x2 - x1) * 1.4;
        const hairHeight = hairWidth * 0.8;

        ctx.drawImage(
            hair,
            x1 - hairWidth * 0.2,
            y - hairHeight * 0.9,
            hairWidth,
            hairHeight
        );
    };

    hair.src = "hairstyles/" + styleFile;
}
