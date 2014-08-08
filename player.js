google.load('jquery', '1');
google.load('swfobject', '2.1');

var shots = [];
var results = [];
var index = 0;
var timeoutId;
var flashTimeout;

google.setOnLoadCallback(load);
function load() {
  var vid = getParameterByName("vid");
  if (vid) {
    loadPlayer(vid);
    // loadShots(vid);
    shots = [2.10, 3.20, 10.50, 15.33];
    timeoutId = setTimeout(function() {
      console.log(index);
      console.log(shots);
      var t = shots[index];
      displayTime(t);
      var ytplayer = $('#ytPlayer').get(0);
      ytplayer.seekTo(t - 3);
      ytplayer.playVideo();
    }, 1000);
  }
  document.getElementById('preBtn').disabled = true;
}

function displayTime(time) {
  var t = parseFloat(time);
  var minutes = Math.floor(t/60);
  var seconds = t.toFixed(0) - 60 * minutes;
  $('#breaktime').html(t + ' (' + minutes + ':' + seconds + ')');
}

function play(){
  var ytplayer = $('#ytPlayer').get(0);
  ytplayer.playVideo();
}

function pause(){
  var ytplayer = $('#ytPlayer').get(0);
  ytplayer.pauseVideo();
}

function loadShots(vid) {
  var client = new XMLHttpRequest();
  client.open('GET', '/shot/' + vid);
  client.onreadystatechange = function() {
    if (shots.length > 0) {
      return;
    }
    var text = client.responseText;
    var ss = text.split('\n');
    for(var i in ss) {
      if (ss[i]) {
        shots.push( (parseInt(ss[i]) / 1000).toFixed(2) );
      }
    }
  }
  client.send();
}

function jump(t) {
  var ytplayer = $('#ytPlayer').get(0);
  ytplayer.seekTo(t - 3);
  clearTimeout(flashTimeout);
  flashTimeout = setTimeout(function() {
    flash(ytplayer);
  }, 3000);
  ytplayer.playVideo();
  displayTime(t);
  $('#overlay').hide();
  clearTimeout(timeoutId);
  timeoutId = setTimeout(function() {
    ytplayer.pauseVideo();
  }, 6000);
}

function flash(ytplayer) {
  $('#overlay').show();
  ytplayer.pauseVideo();
  flashTimeout = setTimeout(function() {
    ytplayer.playVideo();
    $('#overlay').hide();
  }, 800);
}

function setResult(val){
  results[index] = val;
  var shot_html = "";
  var yes = [];
  var no = [];
  for(var i in results) {
    if (results[i] === 1) {
      yes.push(shots[i]);
    } else {
      no.push(shots[i]);
    }
  }
  shot_html += 'Good breaks:&nbsp;&nbsp;'  + yes.join(', ') + '<br>';
  shot_html += 'Bad breaks:&nbsp;&nbsp;&nbsp;'  + no.join(', ') + '<br>';
  document.getElementById('result').innerHTML = shot_html;
  setTimeout(function() {
    document.getElementsByName('question')[0].checked = false;
    document.getElementsByName('question')[1].checked = false;
    next();
  }, 500);
}

function next() {
  if (index === shots.length - 1) {
    return;
  }
  index++;
  jump(shots[index]);
  if (index === shots.length - 1) {
    document.getElementById('nextBtn').disabled = true;
  }
  document.getElementById('preBtn').disabled = false;
}

function pre() {
  index--;
  jump(shots[index]);
  if (index === 0) {
    document.getElementById('preBtn').disabled = true;
  }
  document.getElementById('nextBtn').disabled = false;
}

function replay() {
  jump(shots[index]);
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


function updatePlayerInfo(ytplayer) {
  if (!ytplayer || !ytplayer.getDuration) {
    return;
  }
  var curTime = ytplayer.getCurrentTime();
  $('#current-time').text(curTime.toFixed(2));
}

function onYouTubePlayerReady(playerId) {
  var ytplayer = $('#ytPlayer').get(0);
  if (!ytplayer) {
    console.error(
        'YouTube player is not loaded when onYouTubePlayerReady is called!');
    return;
  }
  var step = function() {
    updatePlayerInfo(ytPlayer);
    window.requestAnimationFrame(step);
  };
  step();
}

function loadPlayer(videoID) {
  var params = { allowScriptAccess: 'always' };
  var atts = { id: 'ytPlayer' };
  swfobject.embedSWF('//www.youtube.com/v/' + videoID +
                     '?version=3&enablejsapi=1&playerapiid=player1&&el=embedded&forced_experiments=no_ads',
                     'video', '720', '480', '9', null, null, params, atts);
}
