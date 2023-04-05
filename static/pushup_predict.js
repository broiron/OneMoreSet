const URL = `../pushup_model/`;
const SOUNDURL = `../sound/`;


let model, webcam, ctx, labelContainer, maxPredictions;
let status = "up"; // stand or down
let count = 0;
let ismiddle = false;

async function init() {
    
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const size = 500;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    // ["up","middle","down"]
    //0, 1, 2 총 3개의 label
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    if(prediction[0].probability.toFixed(2) == 1.00){ // 서 있는 상태
        
        if(status == "down") { // 정상 push up
            count++;
            console.log("push-up 횟수: ", count);
            var audio = new Audio(SOUNDURL + count%10 + '.mp3');
            audio.play();
        }
        else if (ismiddle == true) {
            console.log("더 내려가세요. no count!");
            var audio = new Audio(SOUNDURL + 'pushup_feedback_moredown.mp3');
            audio.play();
        }

        status = "stand";
        ismiddle = false;
    }
    else if (prediction[1].probability.toFixed(2) > 0.9) { // middle-down
        ismiddle = true;
    }

    else if (prediction[2].probability.toFixed(2) == 1.00) { // down
        status = "down";
    }


    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
    
    // finally draw the poses
    drawPose(pose);
    document.getElementById("count").innerHTML = String(count);

}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}