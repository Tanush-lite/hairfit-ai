const imageUpload = document.getElementById("imageUpload");
const analyzeBtn = document.getElementById("analyzeBtn");
const previewImage = document.getElementById("previewImage");
const faceShapeResult = document.getElementById("faceShapeResult");
const recommendations = document.getElementById("recommendations");

let uploadedImage = null;

imageUpload.addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
        uploadedImage = previewImage;
    };

    reader.readAsDataURL(file);
});

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

analyzeBtn.addEventListener("click", async () => {
    if (!uploadedImage) {
        alert("Please upload an image first.");
        return;
    }

    await faceMesh.send({ image: uploadedImage });
});

function getDistance(a, b) {
    return Math.sqrt(
        Math.pow(a.x - b.x, 2) +
        Math.pow(a.y - b.y, 2)
    );
}

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

function getRecommendations(shape) {
    const styles = {
        Round: ["Quiff", "Pompadour", "Faux Hawk"],
        Square: ["Buzz Cut", "Crew Cut", "Textured Crop"],
        Oval: ["Fade", "Side Part", "Undercut"],
        Heart: ["Fringe", "Side Sweep", "Textured Crop"],
        Rectangle: ["Layered Cut", "Side Part", "Fringe"]
    };

    return styles[shape] || [];
}

function onResults(results) {
    if (!results.multiFaceLandmarks.length) {
        faceShapeResult.textContent = "No face detected.";
        return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    const shape = classifyFaceShape(landmarks);

    faceShapeResult.textContent = `Face Shape: ${shape}`;

    const recs = getRecommendations(shape);

    recommendations.innerHTML =
        "<h3>Recommended Hairstyles:</h3>" +
        recs.map(style => `<p>${style}</p>`).join("");
}
