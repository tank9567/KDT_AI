//const URL = 'https://teachablemachine.withgoogle.com/models/3lpY_AmJM/';
//const URL = 'https://teachablemachine.withgoogle.com/models/s3O2yBTRx/';
const URL = 'https://teachablemachine.withgoogle.com/models/wm2RjsZUV/';

let model, webcam, labelContainer, maxPredictions;
let inputType,
    stopped,
    requestId = 0;

async function init() {     console.log("FUNC - init");
    const modelURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';

    model = await tmImage.load(modelURL, metadataURL);  //console.log("model", model);
    maxPredictions = model.getTotalClasses();           //console.log("maxPredictions", maxPredictions);

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
async function predict() {		console.log("FUNC - predict");
    // predict can take in an image, video or canvas html element
    let prediction;

    if (inputType === 'webcam') {
        prediction = await model.predict(webcam.canvas);
    } else {
        let image = document.getElementById('file_img');
						console.log("image", image);
        prediction = await model.predict(image);
    }

    clearLabel();
    
    const arrScore = new Array();
    for (let i = 0; i < maxPredictions; i++) {
        //const classPrediction = prediction[i].className + ': ' + prediction[i].probability.toFixed(3) + ': ' + (prediction[i].probability*100) +'%';
        const classPrediction = prediction[i].className + ': ' + (prediction[i].probability*100).toFixed(3) +'%';
        labelContainer.childNodes[i].innerHTML = classPrediction;

        var score = (prediction[i].probability*100).toFixed(2);
        arrScore[i] = score
        if ( prediction[i].className == "숙성" ) {
            $(".fruit0").text( score +'%' );
        } else if ( prediction[i].className == "미숙성" ) {
            $(".fruit1").text( score +'%' );
        } else if ( prediction[i].className == "과숙성" ) {
            $(".fruit2").text( score +'%' );
        }
    }                              console.log("arrScore", arrScore);

    let maxIndex = 0;
    let maxScore = parseFloat(arrScore[0]);
    for ( let i=0; i<arrScore.length; i++ ) {
        if ( i == 0 ) continue;     //console.log(typeof(maxScore), typeof(arrScore[i]));
        if ( arrScore[i] >= maxScore ) {
            maxScore = parseFloat(arrScore[i]);
            maxIndex = i;
        }
    }                           console.log(maxIndex, maxScore);

    $(".tFruit"+ maxIndex).addClass('select');
    $(".fruit"+ maxIndex).addClass('select');
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

    $("th[class^='tFruit']").each(function(index, item){
		$(item).removeClass('select');
	});
    $("td[class^='fruit']").each(function(index, item){
		$(item).removeClass('select');
	});
    $(".result-container td").text("-")
}



async function clickTabBtn(tabBtn) {    console.log("FUNC - clickTabBtn", tabBtn);
    inputType = tabBtn;
	clearLabel();
    switch (tabBtn) {
        case 'webcam':
            $("#tab-container button").eq(1).css("background", "#1fb264");
            $("#tab-container button").eq(0).css("background", "#036832");
            $('#file-container').hide();
            $('#webcam-container-big').show();
            await InitWebcam();
            break;
        case 'file':
            stop();
            $("#tab-container button").eq(0).css("background", "#1fb264");
            $("#tab-container button").eq(1).css("background", "#036832");
            $('#file-container').show();
            $('#webcam-container-big').hide();
            $('#webcam-container').empty();			
			$(".remove-image").click();
            break;
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