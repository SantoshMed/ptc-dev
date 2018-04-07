var arrQuestions = new Array();
var arrData;
var xmlIndex = 0;
var count;
var selectedValue;
var isbuzchecked = false; 
	
$(document).ready(function() {
	loadXML(xmlIndex);
	
	$('#btnTrue'+currentFrame+'').bind(clickHandler, function(){
		if(!isbuzchecked)
		{
			selectedValue = $.trim(arrQuestions[1]);
			if ("true"==selectedValue) { $('#dvFeedback'+currentFrame+'').html(arrQuestions[2]); $('#btnTrue'+currentFrame+'').attr("src","images/exelon_images/true_1.png");}
			else { $('#dvFeedback'+currentFrame+'').html(arrQuestions[3]); $('#btnTrue'+currentFrame+'').attr("src","images/exelon_images/true_2.png");}
			isbuzchecked = true;
			$('#buzContinuebtn'+currentFrame+'').fadeIn();
			if (xmlIndex==(count-1)) { showAttractorMessage(); }
		}
	});
	$('#btnFalse'+currentFrame+'').bind(clickHandler, function(){
		if(!isbuzchecked)
		{
			selectedValue = $.trim(arrQuestions[1]);
			if ("false"==selectedValue) { $('#dvFeedback'+currentFrame+'').html(arrQuestions[2]); $('#btnFalse'+currentFrame+'').attr("src","images/exelon_images/false_1.png");}
			else { $('#dvFeedback'+currentFrame+'').html(arrQuestions[3]); $('#btnFalse'+currentFrame+'').attr("src","images/exelon_images/false_2.png");}
			isbuzchecked = true;
			$('#buzContinuebtn'+currentFrame+'').fadeIn();
			if (xmlIndex==(count-1)) { showAttractorMessage(); }
		}
	});
});

function loadXML(xmlIndex) {
	$.ajax({
		url: "xml/buzzer_f"+currentFrame+".xml",
		dataType: "xml",
		success: function(data){
			if (typeof data == "string" && window.ActiveXObject) {
				buzzerXML = new ActiveXObject("Microsoft.XMLDOM");
				buzzerXML.async = false;
				buzzerXML.loadXML(data);
			} else {
				buzzerXML = data;
			}
		loadbuzzer(xmlIndex);
		}
	});
}


function loadbuzzer(xmlIndex) {
	var $questionSet = $(buzzerXML).find('questions');
	count = $(buzzerXML).find('questions').length;
	var arrFeedback = new Array();
	$questionSet.each(function(index) {
		if (xmlIndex == index) {
			arrData = $(this).find('question').text() + "_" + $(this).find('answer').text() + "_" + $(this).find('correctFeedback').text() + "_" + $(this).find('wrongFeedback').text();
		}
	});				
	arrQuestions = arrData.split("_");
	$('#dvQuestions'+currentFrame+'').html(arrQuestions[0]);
	$('#qztitle'+currentFrame+'').html("STATEMENT "+(xmlIndex+1)+" OF "+count);
	
	$('#buzContinuebtn'+currentFrame+' img').attr("src","images/exelon_images/nextquest.png");
	$('#btnTrue'+currentFrame+'').attr("src","images/exelon_images/true.png");
	$('#btnFalse'+currentFrame+'').attr("src","images/exelon_images/false.png");
	isbuzchecked = false;
	
	//alert(xmlIndex+" : "+count);
	$('#buzContinuebtn'+currentFrame+'').unbind().bind(clickHandler, function(){
		loadNextQn();
		$('#buzContinuebtn'+currentFrame+'').hide();
	});
	if (xmlIndex==(count-1)) 
	{
		$('#buzContinuebtn'+currentFrame+' img').attr("src","images/exelon_images/playagain.png");
		$('#buzContinuebtn'+currentFrame+'').unbind().bind(clickHandler, function(){
			playAgain();
			$('#buzContinuebtn'+currentFrame+'').hide();
		});		
	}
}

function loadNextQn() {
	xmlIndex++;
	if (xmlIndex < count) {
		$('#dvQuestions'+currentFrame+'').html('');
		$('#dvFeedback'+currentFrame+'').html('');
		loadXML(xmlIndex);
	}
	else { 
		alert("All questions completed");
	}
}

function playAgain() {
	xmlIndex = 0;
	$('#dvQuestions'+currentFrame+'').html('');
	$('#dvFeedback'+currentFrame+'').html('');
	replayVideo();
	loadXML(xmlIndex);
}