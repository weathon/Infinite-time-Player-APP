//La,la,la,我的微信是15107573644


var total_time_counter=0;
function rendering(hz, type, loudness) {
    let audioCtx = new AudioContext();
    let offlineCtx = new OfflineAudioContext(2, 44100 * 40, 44100);
    // let source = offlineCtx.createBufferSource();

    var time = one_tone_time;
    //https://www.zhangxinxu.com/wordpress/2017/06/html5-web-audio-api-js-ux-voice/comment-page-1/#comment-394545
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    // let audioCtx = new AudioContext();
    let oscillator = offlineCtx.createOscillator();//弄成全局的所以卡？
    let gainNode = offlineCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(offlineCtx.destination);
    oscillator.type = type;//sine'，'square'方波，'triangle'三角波以及'sawtooth'锯齿波
    // console.log(hz);
    oscillator.frequency.value = Math.round(hz);
    gainNode.gain.setValueAtTime(0, offlineCtx.currentTime);//可以分析出是响度
    gainNode.gain.linearRampToValueAtTime(loudness, offlineCtx.currentTime + 0.01);
    oscillator.start(offlineCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, offlineCtx.currentTime + time - 0.01);
    oscillator.stop(offlineCtx.currentTime + time - 0.05);
    // sonsole
}


audio_file.onchange = function () {
    // console.log(files);
    myfile = URL.createObjectURL(this.files[0]);
    var files = fileInput.files;

    if (files.length == 0) return;
    var reader = new FileReader();

    reader.onload = function (fileEvent) {
        context.decodeAudioData(fileEvent.target.result, calcTempo);
    }

    reader.readAsArrayBuffer(files[0]);
}


fileInput = document.getElementById("audio_file");
fileInput.onchange = function () {
    myfile = URL.createObjectURL(this.files[0]);
    context = new AudioContext();
    var files = fileInput.files;

    if (files.length == 0) return;
    var reader = new FileReader();

    reader.onload = function (fileEvent) {
        context.decodeAudioData(fileEvent.target.result, calcTempo);
    }

    reader.readAsArrayBuffer(files[0]);
}


// 弄了一下午，眼睛超级累，白干了？
// 还是用回平均频率？
// 被可视化频谱搞糊涂了
// 现在决定每个节拍点采样一次频率响度做判断
// mybeep连续太快的话会爆炸

var calcTempo = function (buffer) {
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

    beats = mt.beats;//节拍标记，单位：秒
    gdata = audioData;//mt.spectralFlux;
    tempo = mt.tempo;//bpm
    one_tone_time = 1 / (mt.tempo) * 60;
    // beats = mt.beats;
    // getData();
    // console.log(audioData);
    console.log(mt);
    document.getElementById("audio_player").src = myfile;

}

function getF(data) {
    var times = 0;
    for (let i = 1; i < data.length; i++) {
        if ((data[i] < 0 && data[i - 1] > 0) || (data[i] > 0 && data[i - 1] < 0) || (data[i] == 0))//之前写错了，不能+1 -1
        {
            times++;
        }
    }
    // console.log("s:");
    // console.log([Frame2second(data.length), data.length]);
    return (times / Frame2second(data.length)) / 2;//正真的频率  要除以2
}

function getLoudness(data) {
    var sum = 0;
    for (let i = 0; i < data.length; i++) {
        num = Math.abs(data[i]);
        sum += num;
    }
    return sum / data.length;
}

function Second2frame(sec) {
    return sec * f_per_sec;
}

function Frame2second(f) {
    // console.log("f/s");
    // console.log(f_per_sec);
    return f / f_per_sec;//由*改为/
}

function getData() {
    len = gdata.length;
    each_len = Math.round(len / tempo);
    mytime = total_time = document.getElementById("audio_player").duration;
    f_per_sec = len / mytime;//每秒的帧数
    // console.log(mytime);
    number_of_beats = beats.length;
    var pl_list=[];
    var loudness_list=[];
    for (let beat = 0; beat < number_of_beats; beat++) {
        // console.log(beat);
        begin_time = beats[beat];
        end_time = beats[beat + 1];//时间，不能减一
        // console.log(beat)
        begin_fe = Second2frame(begin_time);
        end_f = Second2frame(end_time);
        // console.log(beat)
        // console.log(begin_fe);
        loudness = getLoudness(gdata.slice(begin_fe, begin_fe + (end_f - begin_fe) / 5));
        // console.log(beat)
        let pl = getF(gdata.slice(begin_fe, end_f))//频率，别和帧搞混
        ////闭包问题
        // console.log(["t",begin_time,end_time])
        // console.log(beat)
        // console.log(pl);
        // setTimeout(function () {//闭包问题
            // console.log(beat);
            mybeep(pl, "sine", 1);
        // }, one_tone_time * beat * 1000)
    }
}