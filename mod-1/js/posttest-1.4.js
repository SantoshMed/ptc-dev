var quizData;
var quizDiv = ".quiz";
var answerCodes = new Array("A","B","C","D","E","F","G");
var clickHandler = "click";
var feedbackScroll = null;
var referencesScroll = null;
	
$(document).ready(function(){
  playerInit();
});

function playerInit() {
  $('#progress').html(10);
  var videoList = new Array();
  videoList.push("video/certificate.mp4");
  videoList.push("video/certificate.mp4");
  videoList.push("video/certificate.mp4");
  iPlayer.init("#video", videoList,
	{
		onInit: function() {
		  //$("#video").hide(); //chrome flash won't load if you hide it too soon
		},
		onClipStart: function() { 
			$('#video-loading').hide();
		},
		onClipFinish: function() { 
			page58();
		}
	});
	$('#video').hide();
  if('ontouchstart' in document.documentElement) {
    clickHandler = "touchstart";
    $('.btn').bind('touchstart', function() { $(this).addClass("btndwn");});
    $('.btn').bind('touchend', function() { $(this).removeClass("btndwn");});
    $('body').bind('touchmove', function() { event.preventDefault();}); // prevent page dragging
    $('body').bind('touchend', function() { event.preventDefault();}); // prevent double-tap zoom
  }
  $('#exitbtn').bind(clickHandler, function() { playerFinish();});
  $('#quizsuccessbtn').bind(clickHandler, function(){
		$('#quizsuccessbtn').hide();		
		$('#video').show();
		$('#video-loading').show();
		$('.quiz').load('certificate.html').css("background","none");
		iPlayer.playClip(1);
  });
  $.get("quizdata.txt", function(data){
    initQuiz(data);
    playerStart();
  });
}

function playerStart(session) {
  $('#progress').html(100);
  $('#loading').fadeOut();
  $('#topnav').show();
  $('#nav').show();
  $('.frame').show(); 
  nextQuestion();
}

function playerFinish() {
    parent.lmsFinish();
}

function initQuiz(data) {
  $('#progress').html(30);
  quizData = {};
  quizData.questions = new Array();
  var params = data.split("&");
  var quizVars = {};
  
  var questionsStarted = false;
  for (var i=0; i<params.length; i++) {
    //var keyVal = params[i].split("=");
    var index = params[i].indexOf("=");
    if (index > 0) {
      var pName = params[i].substring(0, index);
      var pVal = params[i].substring(index+1);
      quizVars[pName] = decodeURIComponent(pVal);
      //debug(pName+"="+pVal);
    }
  }
  quizData.passingText = quizVars["PASSING_TEXT"];
  quizData.failingText = quizVars["FAILING_TEXT"];
  quizData.scoreMessage = quizVars["scoreMessage"];
  quizData.passingScore = quizVars["PASSING"];
  
  for(var i=0; i<quizVars.questions; i++) {
    var n = i*16;
    var question = {};
    var typeNum = quizVars.types.split(",")[i];
    if (typeNum==2) question.type = "select-multiple";
    else question.type = "select-one";
    question.choices = new Array();
    question.feedback = new Array();
    quizData.questions.push(question);
    question.stem = quizVars["t"+(n+1)];
    question.correctAnswer = quizVars["t"+(n+2)];
    for(var j=0; j<7; j++) {
        var choice = quizVars["t"+(n+3+j)];
        if (choice && choice.length>0) question.choices.push(choice);
        //debug(j+" choice:"+choice);
    }
    for(var j=0; j<7; j++) {
        var feedback = quizVars["t"+(n+10+j)];
        if (feedback && feedback.length>0) question.feedback.push(feedback);
    }
  }
  quizData.currentQuestionNum = 0;
  quizData.points = 0;
}

function nextQuestion() {
  quizData.currentQuestionNum++;
  var question = quizData.questions[quizData.currentQuestionNum-1];
  //debug("quizData.currentQuestionNum:"+quizData.currentQuestionNum);
  var s = '<div class="quiz">';
  s += '<div class="count"><b>Question '+quizData.currentQuestionNum+' of '+quizData.questions.length+'</b></div>';
  if (question.type=="select-multiple") s += '<div class="instructions">Choose all that apply and click the <b>submit</b> button</div>';
  else s += '<div class="instructions">Choose the best response and click the <b>Submit</b> button</div>';
  s += '<div class="stem">'+question.stem+'</div>';
  s += '<ul>';
  for(var j=0; j<question.choices.length; j++) {
    s += '<li id="choice'+j+'" class="'+question.type+'">'+question.choices[j]+'</li>';
  }
  s += '</ul>';
  s += '<div class="feedback"><div id="feedback-scroller"><div id="feedback-content">feedback</div></div></div>';
  s += '<div id="quiz-submit" class="btn"><img src="images/quiz-submit.png" width="131" height="38" border="0" alt=""></div>';
  $(quizDiv).html(s);
  if(question.type=="select-multiple") $(quizDiv +" li").css("background-image","url(images/quiz-choicebgm.png)");
  $(quizDiv +" li").bind(clickHandler, function() {
	var question = quizData.questions[quizData.currentQuestionNum-1];
    if (question.type=="select-multiple") {
      //check-all-that-apply
      if ($(this).hasClass('selected')) $(this).removeClass('selected').css("background-image","url(images/quiz-choicebgm.png)");
      else $(this).addClass('selected').css("background-image","url(images/quiz-choicebg-selectedm.png)");
    } else {
      //select one
      $(quizDiv +" li").removeClass('selected');
      $(this).addClass('selected');
    }
    if ($(quizDiv +" li.selected").length > 0) $("#quiz-submit").show();
    else $("#quiz-submit").hide();
    
  });
  $("#quiz-submit img").attr("src", "images/quiz-submit.png");
  $("#quiz-submit").hide();
  $("#quiz-submit").unbind(clickHandler);
  $("#quiz-submit").bind(clickHandler, function() {
      $(quizDiv +" li").unbind(clickHandler);
      var userAnswer = "";
      var choiceIndex = 0;
      $(quizDiv +" li.selected").each(function () {
        choiceIndex = parseInt($(this).attr("id").substring(6));
        if (userAnswer.length>0) userAnswer += ",";
        userAnswer += answerCodes[choiceIndex];
      });
      $(quizDiv +" li").each(function () {
        var question = quizData.questions[quizData.currentQuestionNum-1];
        var choiceNum = parseInt($(this).attr("id").substring(6));
        var letter = answerCodes[choiceNum];
        if ($(this).hasClass("selected")) {
		if (question.correctAnswer.indexOf(letter)>-1) { $(this).append('<div class="correct">'); $(this).css({"font-weight":"bold"});} 
          else $(this).append('<div class="incorrect">');
        } else if (question.correctAnswer.indexOf(letter)>-1) {
          $(this).append('<div class="correct">');
	  $(this).css({"font-weight":"bold"});
        }
      });
      var question = quizData.questions[quizData.currentQuestionNum-1];
      debug("userAnswer:"+userAnswer+" | "+question.correctAnswer);
      
      if (userAnswer==question.correctAnswer) {
        quizData.points++;
        if (question.type=="select-multiple") $("#feedback-content").html(question.feedback[0]);
        else $("#feedback-content").html(question.feedback[choiceIndex]);
      } else {
        if (question.type=="select-multiple") $("#feedback-content").html(question.feedback[1]);
        else $("#feedback-content").html(question.feedback[choiceIndex]);
      }
      $(quizDiv +" .feedback").show();
      if (clickHandler=="touchstart") {
        feedbackScroll = new iScroll('feedback-scroller');
        setTimeout(function () { if (feedbackScroll) feedbackScroll.refresh(); }, 100);
      }

      $(this).unbind(clickHandler);
      if (quizData.currentQuestionNum==quizData.questions.length) { //lastquestion
        $(this).bind(clickHandler, function() { showResultsScreen(); });
        $(".instructions").html("Click the <b>Test Result</b> button to finish the assessment.");
        $("#quiz-submit img").attr("src", "images/quiz-result.png");
      } else {
        $(this).bind(clickHandler, function() { nextQuestion(); });
        $(".instructions").html("Click the <b>Next Question</b> button to continue.");
        $("#quiz-submit img").attr("src", "images/quiz-next.png");
      }
  });
}

function showResultsScreen() {
  var s = '<div class="results">';
  var msg = quizData.scoreMessage;
  var score = Math.round(100*quizData.points/quizData.questions.length);
  //var score = 100;
  msg = msg.replace("{correct}", quizData.points);
  msg = msg.replace("{total}", quizData.questions.length);
  msg = msg.replace("{percent}", score);
  
  if (score >= quizData.passingScore) {
    msg = msg.replace("{passFail}", quizData.passingText);
    doLMSSetValue("cmi.core.lesson_status", "passed");
    doLMSSetValue("cmi.core.lesson_location", "1");
    doLMSSetValue("cmi.core.score.raw", score);
    doLMSSetValue('cmi.core.exit','');
	$('#quizsuccessbtn').fadeIn();	
  } else {
    msg = msg.replace("{passFail}", quizData.failingText);
    //doLMSSetValue("cmi.core.lesson_status", "failed");
  }
  
  s += msg;
  s += '</div>';
  $(".quiz").html(s);
  $("#wrapper").show();
  setTimeout(function () { if (referencesScroll) referencesScroll.refresh(); }, 0);
}

function showAttractorMessage() {
  showMessage("Click the <b>forward</b> arrow to continue");
}

function showMessage(msg) {
  $('#msg').html(msg);
  $('#msg').show();
}

function debug(txt) {
  $("#debug").append("<br>"+txt);
}

function openWindow(url) {
  pauseVideo();
  window.open(url);
}

