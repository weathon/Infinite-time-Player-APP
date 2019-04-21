//La,la,la,我的微信是15107573644


function mybeep(hz, type, loudness,time) {
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
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + time-0.01);
    oscillator.stop(audioCtx.currentTime + time-0.01);
}


audio_file.onchange = function () {
    // console.log(files);
    myfile = URL.createObjectURL(this.files[0]);
    // // console.log(file);
    // audio_player.src = myfile;
    // audio_player.play();
}



//http://blog.jobbole.com/70549/
//博立叶变换，一定要找时间看懂
//参考https://killercrush.github.io/music-tempo/example/example-advanced.html
//和https://github.com/yugasun/Web-Audio-API-Practice
var concertHallBuffer;
var soundSource, vSource;
var bufferLength;
var dataArray;
// function start() {
//     canvas = document.querySelector('#bar');
//     canvasCtx = canvas.getContext('2d');
//     canvas2 = document.querySelector('#circle');
//     canvasCtx2 = canvas2.getContext('2d');

//     audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//     playAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

//     // grab the mute button to use below

//     // set up the different audio nodes we will use for the app

//     analyser = audioCtx.createAnalyser();
//     analyser.minDecibels = -90;
//     analyser.maxDecibels = -10;
//     analyser.smoothingTimeConstant = 0.85;
//     concertHallBuffer;
//     distortion = audioCtx.createWaveShaper();
//     biquadFilter = audioCtx.createBiquadFilter();
//     convolver = audioCtx.createConvolver();
//     gainNode = audioCtx.createGain();

//     // grab audio track via XHR for convolver node
//     ajaxAudioTrack();
// }

audio_file.onchange = function () {
    var files = fileInput.files;

  if (files.length == 0) return;
  var reader = new FileReader();

  reader.onload = function(fileEvent) {
    context.decodeAudioData(fileEvent.target.result, calcTempo);
  }

  reader.readAsArrayBuffer(files[0]);
    // start();
}


// 弄了一下午，眼睛超级累，白干了？
// 还是用回平均频率？
// 被可视化频谱搞糊涂了
// 现在决定每个节拍点采样一次频率响度做判断
// mybeep连续太快的话会爆炸
// 优化效率
// function ajaxAudioTrack() {
//     var ajaxRequest = new window.XMLHttpRequest();

//     ajaxRequest.open('GET', myfile, true);

//     ajaxRequest.responseType = 'arraybuffer';

//     ajaxRequest.onload = function () {
//         var audioData = ajaxRequest.response

//         audioCtx.decodeAudioData(audioData)
//             .then(function (buffer) {
//                 console.log(1);
//                 concertHallBuffer = buffer
//                 soundSource = playAudioCtx.createBufferSource()
//                 soundSource.buffer = concertHallBuffer

//                 soundSource.connect(playAudioCtx.destination)
//                 soundSource.loop = true

//                 vSource = audioCtx.createBufferSource()
//                 vSource.buffer = concertHallBuffer
//                 vSource.connect(analyser)
//                 analyser.connect(distortion)
//                 distortion.connect(biquadFilter)
//                 biquadFilter.connect(convolver)
//                 convolver.connect(gainNode)
//                 gainNode.connect(audioCtx.destination)
//                 vSource.loop = true

//                 soundSource.start()
//                 vSource.start();
//                 //注释掉第一行保留第二行是只解析不播放


//                 analyser.fftSize = 1024;//分割的份数
//                 console.log(analyser.maxDecibels);
//                 console.log(analyser.minDecibels);
//                 analyser.maxDecibels=0;
//                 analyser.minDecibels=-90;
//                 //从文档发现的两个新的参数
//                 bufferLength = analyser.frequencyBinCount
//                 dataArray = new Uint8Array(bufferLength)
//                 //刚刚创建数组
//                 //重点
//                 // console.log(dataArray);
//                 // analyser.getByteFrequencyData(dataArray);
//                 for(let i=1;i<100;i++){
//                 setTimeout(function () { output(); setTimeout(function(){console.log(dataArray)},1000); }, i*1000);
//                 }
//                 // 要过一会儿再输出
//                 // analyser.getByteFrequencyData(dataArray);
//                 // 第一次都是零？X
//                 // 因为还没有播放？
//                 // visualize1()
//                 // visualize2()
//                 // 调试半天！不去调用绘图就全部是0，绘图和dataArray有什么关系？？？？？？？？？？？？？？
//                 // analyser.getByteFrequencyData(dataArray)?YES还有异步问题
//                 // 不是，是以为领域切换的问题，是否可以按节拍取样？
//                 // 眼睛好累
//                 // output();
//             })
//         //   .catch(function (e) { throw new Error('Error with decoding audio data' + e.err) })
//     }

//     ajaxRequest.send()
// }

// function output() {
//     analyser.getByteFrequencyData(dataArray);
// }
// // set up canvas context for visualizer

// function visualize1() {
//     var WIDTH = canvas.width
//     var HEIGHT = canvas.height
//     var draw

//     canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)

//     draw = function () {
//         // window.requestAnimationFrame(draw)
//         analyser.getByteFrequencyData(dataArray)

//         // canvasCtx.fillStyle = 'rgb(0, 0, 0)'
//         // canvasCtx.fillRect(0, 0, WIDTH, HEIGHT)

//         // var barWidth = (WIDTH / bufferLength) * 2.5
//         // var barHeight
//         // var x = 0

//         // for (var i = 0; i < bufferLength; i++) {
//         //     barHeight = dataArray[i]

//         //     canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)'
//         //     canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2)

//         //     x += barWidth + 1;
//         // }
//     }

//     draw()
// }

// function visualize2() {
//     var WIDTH = canvas2.width
//     var HEIGHT = canvas2.height
//     var draw
//     canvasCtx2.clearRect(0, 0, WIDTH, HEIGHT)
//     draw = function () {
//         window.requestAnimationFrame(draw)
//         analyser.getByteFrequencyData(dataArray)

//         canvasCtx2.fillStyle = 'rgb(0, 0, 0)'
//         canvasCtx2.fillRect(0, 0, WIDTH, HEIGHT)

//         var radius
//         var x = WIDTH / 2
//         var y = HEIGHT / 2

//         for (var i = 0; i < bufferLength / 100; i++) {
//             radius = Math.abs((dataArray[i] - 128) / 255 * 150)

//             canvasCtx2.beginPath()
//             canvasCtx2.fillStyle = 'rgb(' + (dataArray[i] + 100) + ',50,50)'
//             canvasCtx2.globalAlpha = 0.2
//             canvasCtx2.arc(x, y, radius, 0, 2 * Math.PI, false)

//             canvasCtx2.fill()
//             canvasCtx2.closePath()
//         }
//     }

//     draw()
// }

var calcTempo = function (buffer) {
    var context = new AudioContext();
    var audioData = [];
    // Take the average of the two channels
    if (buffer.numberOfChannels == 2) {
      var channel1Data = buffer.getChannelData(0);
      var channel2Data = buffer.getChannelData(1);
      var length = channel1Data.length;
      for (var i = 0; i < length; i++) {
        audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
      }
    } else {
      audioData = buffer.getChannelData(0);
    }
    var mt = new MusicTempo(audioData);
  
    console.log(mt);
    // console.log(mt.beats);
  }
  