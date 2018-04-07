var quizData;
var quizDiv;
var flag_attempt=0;
function loadQuiz(uri, div) {

  //$('#debug').show();
  quizDiv = div;
  $.get(uri, function(data){
    initQuiz(data);
  });
}

function initQuiz(data) {

	quizData = {};
flag_attempt=0;
	// alert(flag_attempt);
  quizData.answerCodes = new Array("A","B","C","D","E","F","G");
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

  nextQuestion();
}

function nextQuestion() {
	flag_attempt++;
	
  quizData.currentQuestionNum++;
  //debug("quizData.currentQuestionNum:"+quizData.currentQuestionNum);
  var s = '<div class="quiz">';
  s += '<div class="instructions">You will now be presented with a learning activity. Please answer the question and click submit to proceed.</div>';
  s += '<div class="stem">'+quizData.questions[quizData.currentQuestionNum-1].stem+'</div>';
  s += '<ul>';
  for(var j=0; j<quizData.questions[quizData.currentQuestionNum-1].choices.length; j++) {
    s += '<li id="choice'+j+'">'+quizData.questions[quizData.currentQuestionNum-1].choices[j]+'</li>';
  }
  s += '</ul>';
  s += '<div class="feedback">feedback</div>';
  s += '<div class="quiz-submit btn"><img src="images/quiz-submit.png" width="131" height="38" border="0" alt=""></div>';
  $(quizDiv).html(s);
  $(quizDiv +" li").bind(clickHandler, function() {
    var question = quizData.questions[quizData.currentQuestionNum-1];
    if (question.type=="select-multiple") {
      //check-all-that-apply
      if ($(this).hasClass('selected')) $(this).removeClass('selected');
      else $(this).addClass('selected');
    } else {
      //select one
      $(quizDiv +" li").removeClass('selected');
      $(this).addClass('selected');
    }
    if ($(quizDiv +" li.selected").length > 0) $(quizDiv +" .quiz-submit").show();
    else $(quizDiv +" .quiz-submit").hide();
  });
  $(quizDiv +" .quiz-submit img").attr("src", "images/quiz-submit.png");
  $(quizDiv +" .quiz-submit").hide();
  $(quizDiv +" .quiz-submit").unbind(clickHandler);
  $(quizDiv +" .quiz-submit").bind(clickHandler, function() {
      $(quizDiv +" li").unbind(clickHandler);
	  $(quizDiv +" li").css("cursor","auto");
      $(quizDiv +" .feedback").show();
      var userAnswer = "";
      var choiceIndex = 0;
      $(quizDiv +" li.selected").each(function () {
        choiceIndex = parseInt($(this).attr("id").substring(6));
        if (userAnswer.length>0) userAnswer += ",";
        userAnswer += quizData.answerCodes[choiceIndex];
      });
      
      $(quizDiv +" li").each(function () {
	      var question = quizData.questions[quizData.currentQuestionNum-1];
	      var choiceNum = parseInt($(this).attr("id").substring(6));
	      var letter = quizData.answerCodes[choiceNum];
	      if ($(this).hasClass("selected")) {
		if (question.correctAnswer.indexOf(letter)>-1) {
			$(this).css({"font-weight":"bold"});
			if (userAnswer==$.trim(question.correctAnswer)) {	$(this).append('<div class="correct">');}
			if(flag_attempt==2)$(this).append('<div class="correct">');
			} 
			else{ $(this).append('<div class="incorrect">');}
	      }// selected
		  else if (question.correctAnswer.indexOf(letter)>-1) {
			
			if(flag_attempt==2)$(this).append('<div class="correct">');
	      }
      });
	
      var question = quizData.questions[quizData.currentQuestionNum-1];
      debug("userAnswer:"+userAnswer+" | "+question.correctAnswer);
      if (userAnswer==$.trim(question.correctAnswer)) {	
		playExtraVideo("f"+currentFrame+"_q"+quizData.currentQuestionNum+"_correct");
		setTimeout(function(){registerAttractor(showAttractorMessage,98);},2000);
		if (question.type=="select-multiple") $(quizDiv +" .feedback").html(question.feedback[0]);
        else $(quizDiv +" .feedback").html(question.feedback[choiceIndex]);
		//flag_attempt=0;
        $(quizDiv +" .quiz-submit img").attr("src", "images/quiz-next.png");
      } else {
		//alert("userAnswer"+userAnswer);
		//alert("question.correctAnswer"+question.correctAnswer);
		if (question.type=="select-multiple") {
			if(flag_attempt==2){
				$(quizDiv +" .feedback").html(question.feedback[1]);
				playExtraVideo("f"+currentFrame+"_q"+quizData.currentQuestionNum+"_incorrect2");
				setTimeout(function(){registerAttractor(showAttractorMessage,98);},1000);
			}
			else{ 
				$(quizDiv +" .feedback").html("<b>Incorrect</b><br><br>Please try again.");
				playExtraVideo("f"+currentFrame+"_q"+quizData.currentQuestionNum+"_incorrect1");				
			}
		}
        else $(quizDiv +" .feedback").html(question.feedback[choiceIndex]);
		if(flag_attempt<2)$(quizDiv +" .quiz-submit img").attr("src", "images/quiz-tryagain.png");
		else {flag_attempt=0; $(quizDiv +" .quiz-submit").hide();}
        quizData.currentQuestionNum--;
      }
		
	  //$(quizDiv +" .quiz-submit img").attr("src", "images/quiz-next.png");
      $(this).unbind(clickHandler);
      if (quizData.currentQuestionNum==quizData.questions.length) {
        $(this).hide();
        
      } else {
        $(this).bind(clickHandler, function() { nextQuestion()});
      }
  });
}

function destroyQuiz() {
  $(quizDiv).html('');
  $(quizDiv).remove();
}


