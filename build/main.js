var cp = require('child_process'); //子进程 
var iconv = require("./build/iconv-lite");
var fs = require('fs');  

//监控页面的键盘事件
$("body").keyup(function(e){
	console.log(e.keyCode);
	//CTRL + C
	if(e.ctrlKey && e.keyCode == 67){
		if(getSelection().toString() == ""){
			//增加一行
			addRow();
		}
	}
	if(e.keyCode == 13){
		//回车时调用cmd
		var text = $noinput.val();
		if(text != ""){
			cmdList.push(text);
			window.localStorage.setItem("cmdList", JSON.stringify(cmdList));
			if(text == "list"){
				if(path == ""){
					cmdStr = "\n请使用list -F:/CloudMusic 设置根目录";
					showCMD();
					addRow();
				}
				showList();
			}else if(text.length > 6 && text.substring(0,6) == "list -"){
				path = text.substring(6,text.length);
				window.localStorage.setItem("path",path);
				addRow();
			}else if(text == "help"){
				cmdStr = "\n";
				cmdStr = cmdStr + "list\t显示歌单\n";
				cmdStr = cmdStr + "list -PATH\t设置根目录\n";
				cmdStr = cmdStr + "cls\t清除屏幕\n";
				showCMD();
				addRow();
			}else if(text == "cls"){
				cls();
			}else{
				var cmd = text; 
			    var nwexec = cp.spawn('cmd.exe', ['/s', '/c', cmd]);
			    nwexec.on('close', function(code) {  
			        nwexec.kill();
			        showCMD();
			        addRow();
    			}); 
			    nwexec.stdout.on('data', function(data) {
			        var stdout = iconv.decode(data, 'GBK');
			        cmdStr = cmdStr + stdout;
    			});
    			nwexec.stderr.on('data', function (data) { 
					var stdout = iconv.decode(data, 'GBK');
			        cmdStr = cmdStr + stdout;
				}); 
			}
		}else{
			addRow();
		}
	}else if(e.keyCode == 38){

	}else{
		$span.text($noinput.val());
	}
}).mousedown(function(){
	mouseStatus = true;
}).mouseup(function(){
	mouseStatus = false;
});
var bulingIndex,
	$noinput = $(".noinput"),
	$buling,
	$span,
	bulingInterval,
	cmdStr="",
	mouseStatus,
	musicList = [],
	path = window.localStorage.getItem("path")?window.localStorage.getItem("path"):"",
	music = $("#music")[0],
	musicIndex = -1,
	ctrl,
	playpause,
	cmdList = window.localStorage.getItem("cmdList")?JSON.parse(window.localStorage.getItem("cmdList")):[],
	cmdIndex;

addRow(true);
//定时buling
function changeBuling(){
	bulingInterval = setInterval(function(){
		if(!$noinput.is(":focus") && !mouseStatus){
			$noinput.focus();
		}
		if(bulingIndex % 2){
			$buling.text("");
		}else{
			$buling.text("▍");
		}
		bulingIndex ++;
	},500);
}
//新增一行
function addRow(bool){
	if(!bool){
		clearInterval(bulingInterval);
		$buling.text("");
	}
	bulingIndex = 0;
	var rowHtml = 
	"\t<div class=\"container md\">\n" +
	"\t\t<div class=\"pad\"><br>\n" +
	"\t\t\t<span class=\"blue left marginr\">C:\\Users\\Adminisitrator></span>\n" +
	"\t\t\t<span class=\"yellow left span\"></span>\n" +
	"\t\t\t<a class=\"yellow buling\"></a>\n" +
	"\t\t</div>\n" +
	"\t</div>";
	$("body").append(rowHtml);
	$buling = $(".buling:last");
	$span = $(".span:last");
	$noinput.val("").focus();
	changeBuling();
	window.scrollTo(0,document.body.scrollHeight);
}
//显示歌曲列表
function showList(){
	musicList = [];
	fs.readdir(path, function(err, files) {  
        if (err) {  
            console.log('read dir error');  
        } else {
            files.forEach(function(item) {
                var items = item.split(".");
            	var type = items[items.length-1];
            	if(type.toLowerCase() == "mp3"){
            		musicList.push(item);
            	}
            });
            $(".playerControls pre").removeAttr("onclick");
            var listHtml = 
			"\t<div class=\"container md\">\n" +
			"\t\t<div class=\"pad\">\n" +
			"\t\t\t&nbsp;<br>\n" +
			"\t\t\t<span class=\"grey oneliner\">//List</span><br>\n" +
			"\t\t\t<br>\n" +
			"\t\t\t<div class=\"multi-column\">\n";
			for(var i=0;i<musicList.length;i++){
				listHtml = listHtml + "\t\t\t\t<a onclick=\"play('"+i+"')\">"+(i+1)+": "+musicList[i]+"</a><br>\n";
			}
			listHtml = listHtml +
			"\t\t\t</div>\n" +
			"\t\t\t<div class=\"playerControls noselect\">\n" +
			"\t\t\t\t<br>\n" +
			"\t\t\t\t<pre class=\"grey\" name=\"time\">--:--:--</pre>\n" +
			"\t\t\t\t<pre class=\"grey\" name=\"playpause\">[PLAY]</pre>\n" +
			"\t\t\t\t<pre class=\"grey\" onclick=\"stop();\">[STOP]</pre>\n" +
			"\t\t\t\t<pre class=\"grey\" onclick=\"prechag();\">[-30s]</pre>\n" +
			"\t\t\t\t<pre class=\"grey\" onclick=\"nextchag();\">[+30s]</pre><br>\n" +
			"\t\t\t</div>"
			"\t\t</div>\n" +
			"\t</div>";
			$("body").append(listHtml);
			addRow();
			ctrl = $(".playerControls:last pre[name='time']");
			$(".playerControls pre[name='playpause']").unbind();
			playpause = $(".playerControls:last pre[name='playpause']");
			playpause.click(function(){
				play();
			});
        }  
    });  
}
//清屏
function cls(){
	$("#container").siblings("div").remove();
	addRow();
}
//显示cmd信息
function showCMD(){
	var span = cmdStr.replace(/\r{0,}\n/g,"<br>").replace(/\s/g,"&nbsp;");
	var cmdHtml = 
	"\t<div class=\"container md\">\n" +
	"\t\t<div class=\"pad\">\n" +
	"\t\t\t<span class=\"blue left marginr\">"+span+"</span>\n" +
	"\t\t</div>\n" +
	"\t</div>";
	$("body").append(cmdHtml);
	cmdStr = "";
}
//播放/暂停
function play(name){
	if(name || name == '0'){
		var audioSrc = path + "/" + musicList[name-0];
		musicIndex = name-0;
		music.src = audioSrc;
        music.volume = 1;
        music.play();
        playpause.text("[PAUSE]");
	}else{
		if(music.paused){
			if(musicIndex < 0){
				play(0);
			}
			music.play();
			playpause.text("[PAUSE]");
		}else{
			music.pause();
			playpause.text("[PLAY]");
		}
	}
}
//停止
function stop(){
	music.load();
	playpause.text("[PLAY]");
}
//向后30s
function nextchag(){
	var time = music.currentTime;
	music.pause();
    music.currentTime = time + 30;
    music.play();
}
//向前30s
function prechag(){
	var time = music.currentTime;
	music.pause();
    music.currentTime = (time - 30)>0?(time - 30):0;
    music.play();
}
//下一首
function next(){
	if(musicIndex < musicList.length -1){
		play(musicIndex + 1);
	}else{
		play(0);
	}
}
//上一首
function prev(){
	if(musicIndex > 0){
		play(musicIndex - 1);
	}else{
		play(musicList.length -1);
	}
}
//继续播放下一首
music.addEventListener('ended', function () {
    next();
}, false);
//时间
music.addEventListener('timeupdate', function () {
    var currentTime = this.currentTime;
    var nowTime = parseInt(currentTime);
    var seconds = parseInt(nowTime % 60);
    var minutes = parseInt((nowTime / 60) % 60);
    var hour = parseInt(nowTime / (60 * 60));
    ctrl.text((hour<10?"0"+hour:hour) + ":" + (minutes<10?"0"+minutes:minutes) + ":" + (seconds<10?"0"+seconds:seconds));
},false);