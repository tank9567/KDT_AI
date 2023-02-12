//const URL = 'https://teachablemachine.withgoogle.com/models/3lpY_AmJM/';
//const URL = 'https://teachablemachine.withgoogle.com/models/s3O2yBTRx/';
const URL = 'https://teachablemachine.withgoogle.com/models/wm2RjsZUV/';

let model, webcam, labelContainer, maxPredictions;
let inputType,
    stopped,
    requestId = 0;

async function init() {
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById('label-container');
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement('div'));
    }
}
document.addEventListener('DOMContentLoaded', init);

async function InitWebcam() {
    stopped = false;
    webcam = new tmImage.Webcam(400, 400, false); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    requestId = window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById('webcam-container').appendChild(webcam.canvas);
}

async function loop() {
    if (!stopped) {
        webcam.update(); // update the webcam frame
        await predict();
        requestId = window.requestAnimationFrame(loop);
    }
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    let prediction;

    if (inputType === 'webcam') {
        prediction = await model.predict(webcam.canvas);
    } else {
        let image = document.getElementById('file_img');
        prediction = await model.predict(image);
    }
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ': ' + prediction[i].probability.toFixed(3);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}

async function stop() {
    if (requestId) {
        window.cancelAnimationFrame(requestId);
        await webcam.stop();
    }
    stopped = true;
}

function clearLabel() {
    labelContainer = document.getElementById('label-container');
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.childNodes[i].innerHTML = '';
    }
}

async function changeInputType() {
    var inputSelect = document.getElementById('input-type');
    inputType = inputSelect.options[inputSelect.selectedIndex].value;
    clearLabel();
    switch (inputType) {
        case 'webcam':
            $('#file-container').hide();
            $('#webcam-container').show();
            await InitWebcam();
            break;
        case 'file':
            stop();
            $('#file-container').show();
            $('#webcam-container').hide();
            $('#webcam-container').empty();
            break;
    }
}