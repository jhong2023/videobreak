google.load('jquery', '1');
google.load('swfobject', '2.1');

var shots = ['3.00']; // dummy shot 1
var results = [];
var index = 0;
var timeoutId;
var flashTimeout;

google.setOnLoadCallback(load);
function load() {
  var vid = getParameterByName("vid");
  if (vid) {
    loadPlayer(vid);
    loadShots(vid);
    setTimeout(function() {
      var ytplayer = $('#ytPlayer').get(0);
      ytplayer.seekTo(shots[index] - 3);
      ytplayer.playVideo();
      displayTime(shots[index]);
    }, 1000);
  }
  document.getElementById('preBtn').disabled = true;
}

function displayTime(time) {
  $('#breaktime').html(formatTime(parseFloat(time)));
  $('#current-break').html("Break " + (index + 1) + " of " + shots.length);
}

function formatTime(t) {
  var minutes = Math.floor(t/60);
  var seconds = t - 60 * minutes;
  return minutes + ':' + seconds.toFixed(2);
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
  var tmp_shots = shot_map[vid];
  if (tmp_shots) {
    for(var i in tmp_shots) {
      shots.push( (tmp_shots[i] / 1000).toFixed(2) );
    }
  }
}

function jump(t) {
  var ytplayer = $('#ytPlayer').get(0);
  ytplayer.seekTo(t - 3);
  clearTimeout(flashTimeout);
  flashTimeout = setTimeout(function() {
    flash();
  }, 3000);
  ytplayer.playVideo();
  displayTime(shots[index]);
  clearTimeout(timeoutId);
  timeoutId = setTimeout(function() {
    ytplayer.pauseVideo();
  }, 6000);
}

function flash(ytplayer) {
  $('#overlay').show();
  flashTimeout = setTimeout(function() {
    $('#overlay').hide();
  }, 800);
}

function setResult(val){
  results[index] = val;
  var shot_html = "";
  var good = [];
  var bad = [];
  for(var i in results) {
    if (results[i] === 1) {
      good.push(shots[i]);
    } else {
      bad.push(shots[i]);
    }
  }
  shot_html += 'Good breaks:&nbsp;&nbsp;'  + good.join(', ') + '<br>';
  shot_html += 'Bad breaks:&nbsp;&nbsp;&nbsp;'  + bad.join(', ') + '<br>';
  document.getElementById('result').innerHTML = shot_html;
  setTimeout(function() {
    document.getElementsByName('question')[0].checked = false;
    document.getElementsByName('question')[1].checked = false;
    next();
  }, 500);
}

function next() {
  console.log(index + " " + shots[index]);
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
  $('#current-time').text(formatTime(curTime));
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
  // Lets Flash from another domain call JavaScript
  var params = { allowScriptAccess: 'always' };
  var atts = { id: 'ytPlayer' };
  swfobject.embedSWF('//www.youtube.com/v/' + videoID +
                     '?version=3&enablejsapi=1&playerapiid=player1&&el=embedded&forced_experiments=no_ads',
                     'video', '720', '480', '9', null, null, params, atts);

}
