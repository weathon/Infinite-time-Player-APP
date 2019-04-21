function mybeep(hz, type, loudness) {
    //https://www.zhangxinxu.com/wordpress/2017/06/html5-web-audio-api-js-ux-voice/comment-page-1/#comment-394545
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioCtx = new AudioContext();
    oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = type;//sine'，'square'方波，'triangle'三角波以及'sawtooth'锯齿波
    oscillator.frequency.value = hz;
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);//可以分析出是响度
    gainNode.gain.linearRampToValueAtTime(loudness, audioCtx.currentTime + 0.01);
    oscillator.start(audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
    oscillator.stop(audioCtx.currentTime + 1);
}


audio_file.onchange = function () {
    var files = this.files;
    // console.log(files);
    var file = URL.createObjectURL(files[0]);
    // console.log(file);
    audio_player.src = file;
    audio_player.play();
}



function visual() {
    // https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var analyser = audioCtx.createAnalyser();
    // https://segmentfault.com/a/1190000011353930
    //获取audio节点
    var myAudio = document.getElementById("audio_player");
    //创建音频源
    var source = audioCtx.createMediaElementSource(myAudio);
    source.connect(analyser);

    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    console.log(dataArray);
    analyser.getByteTimeDomainData(dataArray);

    analyser.fftSize = 2048;
    var bufferLength = analyser.fftSize;
    var dataArray = new Uint8Array(bufferLength);
    //github
    var canvas = document.querySelector('.visualizer');
    var canvasCtx = canvas.getContext("2d");
    HEIGHT=500;
    WIDTH=500;
    canvasCtx.clearRect(0, 0,500, 500);
    function draw() {

        drawVisual = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx.beginPath();
        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;
        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = v * HEIGHT / 2;
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    };
draw();
}