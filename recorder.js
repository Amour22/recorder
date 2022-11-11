//neccessary elements from html interface
let logButton = document.querySelector('.seeLogs');
let resetLog = document.querySelector('.resetLog');
let logContainer = document.querySelector('.logs-container');
let record = document.querySelector('.record');
let stopRec = document.querySelector('.stop');
let canvas = document.querySelector('canvas');

// let's disable stop-record button if reccord isn't started
stopRec.disabled = true;

//check if getMedia API is available
if (navigator.mediaDevices.getUserMedia) {
    setLog('getUserMedia suported');
    const constraints = { audio: true };
    let audioChunks = [];
    let recordId = 0;

    function onSuccess(stream) {
        let mediaRecorder = new MediaRecorder(stream);

        visualize(stream);

        record.onclick = function () {
            mediaRecorder.start();
            setLog(mediaRecorder.state);
            setLog('record started');
            record.style = 'background:#431200;color:white';

            stopRec.disabled = false;
            record.disabled = true;
        }

        stopRec.onclick = function () {
            mediaRecorder.stop();
            setLog(mediaRecorder.state);
            setLog('record stopped');
            record.style = 'background:goldenrod';

            stopRec.disabled = true;
            record.disabled = false;
        }

        mediaRecorder.onstop = (e) => {
            setLog('data available after mediaRecorder.stop() called');
            const clipName = prompt('rename clip ?');

            const clipContainer = document.createElement('div');
            const clipLabel = document.createElement('p');
            clipLabel.className = 'clipLabel';
            const audio = document.createElement('audio');
            const deleteBtn = document.createElement('button');

            clipContainer.classList.add('clip');
            audio.setAttribute('control', '');
            deleteBtn.textContent = 'X';
            deleteBtn.className = 'delete';

            if (clipName === null || clipName == '') {
                recordId += 1;
                clipLabel.textContent = "rec 0" + recordId;
                setLog('clip named by default value');
            } else {
                clipLabel.textContent = clipName;
                setLog('clip named succesfuly');
            }

            clipContainer.append(clipLabel,audio,deleteBtn);
            document.querySelector('.files-container').append(clipContainer)
            audio.controls = true;
            const blob = new Blob(audioChunks, { 'type': 'audio/ogg: codecs=opus' });
            audioChunks = [];
            const audioUrl = window.URL.createObjectURL(blob);
            audio.src = audioUrl;
            setLog('record stopped');

            deleteBtn.onclick = (e) => {
                e.target.parentNode.parentNode.removeChild(e.target.parentNode);
                setLog(`clip ${clipLabel.textContent} are deleted`);
            }

            clipLabel.onclick = () => {
                const existingName = clipLabel.textContent;
                const newClipName = prompt('rename clip?');
                if (newClipName === null || newClipName == '') {
                    clipLabel.textContent = existingName;
                } else {
                    clipLabel.textContent = newClipName;
                    setLog(`clip ${existingName} are renamed ${clipLabel.textContent}`);
                }
            }
        }

        mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        }
    }

    function onError(err) {
        setLog('An error occurred ' + err);
    }
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
    setLog('getUserMedia not suported');
}


/**
 * vizualize: set audio analyser then call  a graphic drawer function 
 * @param{} stream - 
 */

let audioCtx;
const canvasCtx = canvas.getContext('2d');
function visualize(stream) {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }

    const source = audioCtx.createMediaStreamSource(stream);

    const analyser = audioCtx.createAnalyser();

    analyser.fftSize = 2048;

    const bufferLength = analyser.frequencyBinCount;

    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    draw();

    /**
     * draw : draw a vizualizer
     */
    function draw() {
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 3;
        canvasCtx.strokeStyle = 'rgb(218, 165, 32)';

        canvasCtx.beginPath();

        let sliceWidth = WIDTH * 1.0 / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {

            let v = dataArray[i] / 128.0;
            let y = v * HEIGHT / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }
}


/**
 * setLog: allow to catch error and display it to graphic interface
 * @param {String} log -string
 */
function setLog(log) {
    let date = new Date();
    let logTimeH = date.getHours();
    let logTimeMin = date.getMinutes();
    let logTimeSec = date.getSeconds();
    let logItem = document.createElement('li');
    logItem.textContent = `${logTimeH}:${logTimeMin}:${logTimeSec} ${log}`;
    document.querySelector('ul').appendChild(logItem);
}


//Log section displaying
logButton.onclick = () => {
    logContainer.classList.toggle('showLog');
    if (logContainer.classList.contains('showLog')) {
        logButton.innerHTML = 'close X';
    } else {
        logButton.innerHTML = 'logs ?';
    }
}


//log resetting
resetLog.onclick = () => {
    document.querySelector('ul').innerHTML = '';
}

//copyright update
document.querySelector('.copyrightYear').textContent = new Date().getFullYear();