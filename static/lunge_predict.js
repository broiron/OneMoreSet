const URL = `../lunge_model/`;
const SOUNDURL = `../sound/`;

let model, webcam, ctx, labelContainer, maxPredictions;
let status = "stand"; // stand or down
let count = 0;
let isbent = false; let isshort = false; 

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
    //["stand","lunge","bent","short"]
    // bent: 허리가 굽은 상태로 내려가는것 , short: 다리를 덜 벌리고 내려가는 것.
    //0, 1, 2, 3 총 4개의 label
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    if(prediction[0].probability.toFixed(2) > 0.90){ // 서 있는 상태
        
        if(status == "down") { // 정상 스쿼트
            count++;
            if (count % 2 == 0){
                console.log("런지 횟수: ", count/2);
                var audio = new Audio(SOUNDURL + (count/2)%10 + '.mp3');
                audio.play();
            }
        }
        else if (isbent == true) {
            console.log("허리를 피고 런지를 하세요. no count!");
            var audio = new Audio(SOUNDURL + 'lunge_feedback_bent.mp3');
            audio.play();
        }
        else if (isshort == true) {
            console.log("다리를 더 벌리고 런지를 하세요. no count!");
            var audio = new Audio(SOUNDURL + 'lunge_feedback_leg.mp3');
            audio.play();
        }
        status = "stand";
        isbent = false; isshort = false;
    }
    else if (prediction[1].probability.toFixed(2) == 1.00) { // lunge
        status = "down";
    }

    else if (prediction[2].probability.toFixed(2) == 1.00) { // bent
        isbent = true;
    }

    else if (prediction[3].probability.toFixed(2) == 1.00) { // short
        isdown = true;
    }

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
    
    // finally draw the poses
    drawPose(pose);
    document.getElementById("count").innerHTML = String(count/2);

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