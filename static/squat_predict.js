const URL = `../sqrt_model/`;
const SOUNDURL = `../sound/`;

let model, webcam, ctx, labelContainer, maxPredictions;
let status = "stand"; // stand or down
let count = 0;
let isbent = false; let isbent_down = false; 
let isover_down = false; let isnormal = false;
let isdown = false;

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
    //["stand","over-down","bent-down","down","normal","bent"] 
    //0, 1, 2, 3, 4, 5, 6 총 6개의 label
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    if(prediction[0].probability.toFixed(2) == 1.00){ // 서 있는 상태
        
        if(status == "down" && isdown == true) { // 정상 스쿼트
            count++;
            console.log("스쿼트 횟수: ", count);
            var audio = new Audio(SOUNDURL + count%10 + '.mp3');
            audio.play();
        }
        else if (status == "stand" && isnormal == true) {
            console.log("더 내려가세요. no count!");
            var audio = new Audio(SOUNDURL + 'squrt_feedback_moredown.mp3');
            audio.play();
        }

        else if (isover_down == true) {
            console.log("너무 내려갔어요. 정 자세로 하세요. no count!");
            var audio = new Audio(SOUNDURL + 'squrt_feedback_muchdown.mp3');
            audio.play();
        }
        else if (isbent_down == true) {
            console.log("내려갈 때 허리가 굽었어요. 허리를 피고 해. no count!");
            var audio = new Audio(SOUNDURL + 'squrt_feedback_bent.mp3');
            audio.play();
        }
        else if (status == "stand" && isbent == true) {
            console.log("허리만 굽히고 다리는 접지도 않네요. 꼼수부리지 마세요");
            var audio = new Audio(SOUNDURL + 'squrt_feedback_wrong.mp3');
            audio.play();
        }
        status = "stand";
        isdown = false; isnormal = false; isover_down = false; isbent_down=false;
        isbent = false;
    }
    else if (prediction[1].probability.toFixed(2) > 0.90) { // over-down
        status = "down";
        isover_down = true;
    }

    else if (prediction[2].probability.toFixed(2) == 1.00) { // bent-down
        status = "down";
        isbent_down = true;
    }

    else if (prediction[3].probability.toFixed(2) == 1.00) { // down (정상)
        status = "down";
        isdown = true;
    }

    else if (prediction[4].probability.toFixed(2) == 1.00) { // normal
        isnormal = true;
    }

    else { // bent 
        isbent = true;
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