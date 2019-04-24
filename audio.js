//La,la,la,我的微信是15107573644


total_audio_data = [];
var total_time_counter = 0;
finish_count = 0;
//由于js允许向数组超限制添加，有解决办法了,但还是不行
function rendering(hz, loudness, myindex) {
    let audioCtx = new AudioContext();
    // let offlineCtx = new OfflineAudioContext(2, 44100 * one_tone_time + 0.5, 44100);//这个44100 * 40，40是秒数，怪不得卡
    // let source = offlineCtx.createBufferSource();
    //由于var所以内存爆炸？
    //确实顺畅许多 ，参考文章 XXXXXXXXXXXXXXXXXX
    let time = one_tone_time;
    //https://www.zhangxinxu.com/wordpress/2017/06/html5-web-audio-api-js-ux-voice/comment-page-1/#comment-394545
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    // let audioCtx = new AudioContext();
    let oscillator = audioCtx.createOscillator();//弄成全局的所以卡？
    let gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = mytype;//sine'，'square'方波，'triangle'三角波以及'sawtooth'锯齿波
    // console.log(hz);
    oscillator.frequency.value = Math.round(hz);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);//可以分析出是响度
    gainNode.gain.linearRampToValueAtTime(loudness, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + time - 0.01);
    oscillator.start(audioCtx.currentTime);//start的为止可以放下来
    oscillator.stop(audioCtx.currentTime + time - 0.05);
    total_audio_data[myindex]=oscillator;

    // //此处异步？
    // //单个可以播放，很明显是异步问题
    // //也许不是，因为要等待好久之后再播放的话是可以的
    // offlineCtx.startRendering().then(function (renderedBuffer) {
    //     var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    //     var song = audioCtx.createBufferSource();
    //     song.buffer = renderedBuffer;
    //     song.connect(audioCtx.destination);
    //     // total_audio_data.push(song);
    //     total_audio_data[myindex] = song;
    //     song.start();
    // }).catch(function (err) {
    //     console.log('渲染失败: ' + err);
    //     // 注意: 当 OfflineAudioContext 上 startRendering 被立刻调用，Promise 应该被 reject
    // });

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
    document.getElementById("button").innerHTML='<button data-role="button" onclick="getData();">GO!</button>';

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
    mytype = document.getElementById("wave_type").value;
    if (mytype == "0") {
        mytype = "sine";
    }
    len = gdata.length;
    each_len = Math.round(len / tempo);
    mytime = total_time = document.getElementById("audio_player").duration;
    f_per_sec = len / mytime;//每秒的帧数
    // console.log(mytime);
    number_of_beats = beats.length;
    pl_list = [];
    loudness_list = [];//怎么查看此处变量
    for (let beat = 0; beat < number_of_beats; beat++) {
        // console.log(beat);
        begin_time = beats[beat];
        end_time = beats[beat + 1];//时间，不能减一
        // console.log(beat)
        begin_fe = Second2frame(begin_time);
        end_f = Second2frame(end_time);
        // console.log(beat)
        // console.log(begin_fe);
        let loudness = getLoudness(gdata.slice(begin_fe, begin_fe + (end_f - begin_fe) / 5));
        // console.log(beat)
        let pl = getF(gdata.slice(begin_fe, end_f))//频率，别和帧搞混
        pl_list.push(pl);
        loudness_list.push(loudness);
    }
    // console.log(loudness_list);
    var sum_loudness = 0;//for avg loudness
    for (let s = 0; s < loudness_list.length - 1; s++) {
        sum_loudness += loudness_list[s];//原来错误：+=s
    }
    var avg_loudness = sum_loudness / loudness_list.length;
    //重写为比例
    //此部分算法还需要优化
    for (let s = 0; s < loudness_list.length; s++) {
        loudness_list[s] = loudness_list[s] / avg_loudness;
    }
    // 开始渲染
    console.log("GO!");
    for (let s = 0; s < loudness_list.length-1; s++) {//loudness_list.length-150
        //不用settimeout还是会有问题
        setTimeout(
            function () {
                rendering(pl_list[s], loudness_list[s], s);//也不知道await有没有用
                console.log(s);
            },
            s * 1000 * one_tone_time
        )
    }
    play_my_music();
}

async function play_my_music() {
    // console.log("Play!");
    // for (var s = 0; s < total_audio_data.length; s++) {
    //     await total_audio_data[s].start();
    // }
}