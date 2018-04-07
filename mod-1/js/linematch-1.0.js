var qnsLength = 5;
var shuffleQuestions = false; /* Shuffle questions ? */
var shuffleAnswers = true; /* Shuffle answers ? */
var lockedAfterDrag = false;

function quizIsFinished() {
	//            var dvCorrect = getElementsByClassName(document, "correctAnswer");
	//            dvCorrect.style.background = "background-image: url('tick.png') no-repeat";
	//            var dvWrong = getElementsByClassName(document, "wrongAnswer");
	//            dvWrong.style.background = "background-image: url('cross.png') no-repeat";

	           $("div.correctAnswer").css("background-image", "url(tick.png)");
	           $("div.correctAnswer").css("background-repeat", "no-repeat");
	           $("div.wrongAnswer").css("background-image", "url(cross.png)");
	           $("div.wrongAnswer").css("background-repeat", "no-repeat");


}


/* Don't change anything below here */
var dragContentDiv = false;
var dragContent = false;
var nolstAnswers;

var dragSource = false;
var dragDropTimer = -1;
var destinationObjArray = new Array();
var destination = false;
var dragSourceParent = false;
var dragSourceNextSibling = false;
var lstAnswers;
var lstQuestions;
var sourceObjectArray = new Array();
var arrayOfEmptyBoxes = new Array();
var arrayOfAnswers = new Array();

function getTopPos(inputObj) {
	if (!inputObj || !inputObj.offsetTop) return 0;
	var returnValue = inputObj.offsetTop;
	while ((inputObj = inputObj.offsetParent) != null) returnValue += inputObj.offsetTop;
	return returnValue;
}

function getLeftPos(inputObj) {
	if (!inputObj || !inputObj.offsetLeft) return 0;
	var returnValue = inputObj.offsetLeft;
	while ((inputObj = inputObj.offsetParent) != null) returnValue += inputObj.offsetLeft;
	return returnValue;
}

function cancelEvent() {
	return false;
}

function initDragDrop(e) {
	if (document.all) e = event;
	if (lockedAfterDrag && this.parentNode.parentNode.id == 'lstQuestions') return;	
	dragContentDiv.style.left =parseInt(e.pageX-$('#lstAnswers').offset().top-100)+"px"; //e.pageX + Math.max(document.documentElement.scrollLeft, document.body.scrollLeft) + 'px';
	dragContentDiv.style.top = parseInt(e.pageY-$('#lstAnswers').offset().top-20)+"px";//e.pageY + Math.max(document.documentElement.scrollTop, document.body.scrollTop) + 'px';
	//$(this).attr("style","position: absolute; top: "+parseInt(e.pageY-$('#lstAnswers').offset().top-20)+"px; left: "+parseInt(e.pageX-$('#lstAnswers').offset().left-100)+"px;");
	dragSource = this;
	dragSourceParent = this.parentNode;
	dragSourceNextSibling = false;
	if (this.nextSibling) dragSourceNextSibling = this.nextSibling;
	if (!dragSourceNextSibling.tagName) dragSourceNextSibling = dragSourceNextSibling.nextSibling;

	dragDropTimer = 0;
	timeoutBeforeDrag();

	return false;
}

function timeoutBeforeDrag() {
	if (dragDropTimer >= 0 && dragDropTimer < 10) {
		dragDropTimer = dragDropTimer + 1;
		setTimeout('timeoutBeforeDrag()', 10);
		return;
	}
	if (dragDropTimer >= 10) {
		dragContentDiv.style.display = 'block';
		dragContentDiv.innerHTML = '';
		dragContentDiv.appendChild(dragSource);


	}
}

function dragDropMove(e) {
/*  	if (dragDropTimer < 10) {
		return;
	} 
	
	if (document.all) e = event; */

	var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
	var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);

	dragContentDiv.style.left = e.pageX + scrollLeft - 400 + 'px';
	dragContentDiv.style.top = e.pageY + scrollTop - 95 + 'px';
	
	
		
	var dragWidth = dragSource.offsetWidth;
	var dragHeight = dragSource.offsetHeight;

	var objFound = false;

	var mouseX = parseInt(e.pageX + scrollLeft);
	var mouseY = parseInt(e.pageY + scrollTop);

	destination = false;
	for (var no = 0; no < destinationObjArray.length; no++) {
		var left = destinationObjArray[no]['left'];
		var top = destinationObjArray[no]['top'];
		var width = destinationObjArray[no]['width'];
		var height = destinationObjArray[no]['height'];

		destinationObjArray[no]['obj'].className = 'destinationBox';
		var subs = destinationObjArray[no]['obj'].getElementsByTagName('DIV');
		if (!objFound && subs.length == 0) {
			if (mouseX < (left / 1 + width / 1) && (mouseX + dragWidth / 1) > left && mouseY < (top / 1 + height / 1) && (mouseY + dragHeight / 1) > top) {
				destinationObjArray[no]['obj'].className = 'dragContentOver';
				destination = destinationObjArray[no]['obj'];
				objFound = true;
			}
		}
	}
	sourceObjectArray['obj'].className = '';

	if (!objFound) {
		var left = sourceObjectArray['left'];
		var top = sourceObjectArray['top'];
		var width = sourceObjectArray['width'];
		var height = sourceObjectArray['height'];

		if (mouseX < (left / 1 + width / 1) && (mouseX + dragWidth / 1) > left && mouseY < (top / 1 + height / 1) && (mouseY + dragHeight / 1) > top) {
			destination = sourceObjectArray['obj'];
			sourceObjectArray['obj'].className = 'dragContentOver';
		}
	}
	$('#fr28debug').html(destination+" : "+objFound+" : "+subs.length+" : "+mouseX+" : "+mouseY+" : "+e.clientX+" : "+e.clientY+" : "+e.pageX+" : "+e.pageY+" : "+dragContentDiv.style.left+" : "+dragContentDiv.style.top);
	return false;
}


function dragDropEnd() {
	// if (dragDropTimer < 10) {
		// dragDropTimer = -1;
		// return;
	// }
	alert("end");
	dragContentDiv.style.display = 'none';
	sourceObjectArray['obj'].style.backgroundColor = '#FFF';
	if (destination) {
		destination.appendChild(dragSource);
		destination.className = 'destinationBox';


		// Check if position is correct, i.e. correct answer to the question

		if (!destination.id || destination.id != 'lstAnswers') {
			var previousEl = dragSource.parentNode.previousSibling;
			if (!previousEl.tagName) previousEl = previousEl.previousSibling;
			var numericId = previousEl.id.replace(/[^0-9]/g, '');
			var numericIdSource = dragSource.id.replace(/[^0-9]/g, '');

			if (numericId == numericIdSource) {
				dragSource.className = 'correctAnswer';
				checkAllAnswers();
			}
			else
				dragSource.className = 'wrongAnswer';
		}
		nolstAnswers--;
		if (nolstAnswers == 0) {
			quizIsFinished();
			//autoReset();
		}
		if (destination.id && destination.id == 'lstAnswers') {
			dragSource.className = 'dragBox';
		}

	} else {
		if (dragSourceNextSibling)
			dragSourceNextSibling.parentNode.insertBefore(dragSource, dragSourceNextSibling);
		else
			dragSourceParent.appendChild(dragSource);
	}
	dragDropTimer = -1;
	dragSourceNextSibling = false;
	dragSourceParent = false;
	destination = false;
	
}

function checkAllAnswers() {
	for (var no = 0; no < arrayOfEmptyBoxes.length; no++) {
		var sub = arrayOfEmptyBoxes[no].getElementsByTagName('DIV');
		if (sub.length == 0) return;
		if (sub[0].className != 'correctAnswer') {
			return;
		}
	}
	quizIsFinished();
}



function resetPositions() {
	if (dragDropTimer >= 10) return;

	for (var no = 0; no < destinationObjArray.length; no++) {
		if (destinationObjArray[no]['obj']) {
			destinationObjArray[no]['left'] = getLeftPos(destinationObjArray[no]['obj'])
			destinationObjArray[no]['top'] = getTopPos(destinationObjArray[no]['obj'])
		}

	}
	sourceObjectArray['left'] = getLeftPos(lstAnswers);
	sourceObjectArray['top'] = getTopPos(lstAnswers);
}



        function initDragDropScript() {
            dragContentDiv = document.getElementById('dragContent');

            lstAnswers = document.getElementById('lstAnswers');
            lstAnswers.onselectstart = cancelEvent;
            var divs = lstAnswers.getElementsByTagName('DIV');
            var answers = new Array();

            for (var no = 0; no < divs.length; no++) {
                if (divs[no].className == 'dragBox') {
                    divs[no].onmousedown = initDragDrop;
                    answers[answers.length] = divs[no];
                    arrayOfAnswers[arrayOfAnswers.length] = divs[no];
                }

            }

            if (shuffleAnswers) {
                for (var no = 0; no < (answers.length * 10); no++) {
                    var randomIndex = Math.floor(Math.random() * answers.length);
                    lstAnswers.appendChild(answers[randomIndex]);
                }
            }
            nolstAnswers = arrayOfAnswers.length;
            sourceObjectArray['obj'] = lstAnswers;
            sourceObjectArray['left'] = getLeftPos(lstAnswers);
            sourceObjectArray['top'] = getTopPos(lstAnswers);
            sourceObjectArray['width'] = lstAnswers.offsetWidth;
            sourceObjectArray['height'] = lstAnswers.offsetHeight;


            lstQuestions = document.getElementById('lstQuestions');

            lstQuestions.onselectstart = cancelEvent;
            var divs = lstQuestions.getElementsByTagName('DIV');

            var questions = new Array();
            var questionsOpenBoxes = new Array();


            for (var no = 0; no < divs.length; no++) {
                if (divs[no].className == 'destinationBox') {
                    var index = destinationObjArray.length;
                    destinationObjArray[index] = new Array();
                    destinationObjArray[index]['obj'] = divs[no];
                    destinationObjArray[index]['left'] = getLeftPos(divs[no])
                    destinationObjArray[index]['top'] = getTopPos(divs[no])
                    destinationObjArray[index]['width'] = divs[no].offsetWidth;
                    destinationObjArray[index]['height'] = divs[no].offsetHeight;
                    questionsOpenBoxes[questionsOpenBoxes.length] = divs[no];
                    arrayOfEmptyBoxes[arrayOfEmptyBoxes.length] = divs[no];
                }
                if (divs[no].className == 'dragBox') {
                    questions[questions.length] = divs[no];
                }

            }

            if (shuffleQuestions) {
                for (var no = 0; no < (questions.length * 10); no++) {
                    var randomIndex = Math.floor(Math.random() * questions.length);

                    lstQuestions.appendChild(questions[randomIndex]);
                    lstQuestions.appendChild(questionsOpenBoxes[randomIndex]);

                    destinationObjArray[destinationObjArray.length] = destinationObjArray[randomIndex];
                    destinationObjArray.splice(randomIndex, 1);

                    questionsOpenBoxes[questionsOpenBoxes.length] = questionsOpenBoxes[randomIndex];
                    questionsOpenBoxes.splice(randomIndex, 1);
                    questions[questions.length] = questions[randomIndex];
                    questions.splice(randomIndex, 1);


                }
            }

            lstQuestions.style.visibility = 'visible';
            lstAnswers.style.visibility = 'visible';
	
 			// document.documentElement.onmouseup = dragDropEnd;
			// document.documentElement.onmousemove = dragDropMove;
			
	/*$('#a1').bind( "touchmove", function(e){
		alert("here1");
		dragDropMove(e);
	});
	$('#lstAnswers.dragbox').bind( "touchend", function(e){
		alert("here2");
		dragDropEnd();
	});*/


	//$('.dragbox').bind("mousemove touchstart", function(e){ dragDropMove(e);});
	//---------touch code works on ipad ---------
	$('.dragbox').bind("mousemove touchmove", function(e){
	
	//this.style.top="320px";
	
	 $(this).attr("style","position: absolute; top: "+parseInt(e.pageY-20)+"px; left: "+parseInt(e.pageX-100)+"px;");
	});
	//------Touch code ends-------------
	//$('#fr28').bind("mousemove touchmove", function(e){ $('.dragbox:eq(5)').attr("style","position: absolute; top: "+parseInt(e.pageY-$('#lstAnswers').offset().top-25)+"px; left: "+parseInt(e.pageX-$('#lstAnswers').offset().left-100)+"px;");});
	//$('#fr28').bind("mouseup touchend", function(e){ dragDropEnd();});
	
	setTimeout('resetPositions()', 150);
	window.onresize = resetPositions;
}

function shuffleAns() {

}
/* Reset the form */
function dragDropResetForm() {
	var qnDvId = getElementsByClassName(document, "destinationBox");

	for (var no = 0; no < qnDvId.length; no++) {
		
		if (arrayOfAnswers[no].className != "correctAnswer") {
			arrayOfAnswers[no].className = 'dragBox';
			arrayOfAnswers[no].style.display = "block";
			qnDvId[no].innerHTML = "";
			lstAnswers.appendChild(arrayOfAnswers[no]);
		}
	}
	shuffleAns();
}

function autoReset() {
	for (var no = 0; no < arrayOfAnswers.length; no++) {
//                if (arrayOfAnswers[no].className == 'wrongAnswer' || arrayOfAnswers[no].className == 'dragBox') {
			arrayOfAnswers[no].className = 'dragBox'
			lstAnswers.appendChild(arrayOfAnswers[no]);
			nolstAnswers++;	

	}

}

function showAnswer() {
	var qnDvId = getElementsByClassName(document, "destinationBox");
	var divs = document.getElementById('lstAnswers').getElementsByTagName('DIV');
	var answers = new Array();
	autoReset();
	for (var no = 0; no < divs.length; no++) {                
			qnDvId[no].innerHTML = "";
			divs[no].onmousedown = initDragDrop;
			answers[answers.length] = divs[no];
			qnDvId[no].innerHTML = arrayOfAnswers[no].innerHTML;
			//                qnDvId[no].className = "correctAnswer";
			divs[no].style.display = "none";
			arrayOfAnswers[arrayOfAnswers.length] = divs[no];	   

	}

}

function getElementsByClassName(node, classname) {
	if (node.getElementsByClassName) { // use native implementation if available
		return node.getElementsByClassName(classname);
	} else {
		return (function getElementsByClass(searchClass, node) {
			if (node == null)
				node = document;
			var classElements = [],
	els = node.getElementsByTagName("*"),
	elsLen = els.length,
	pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)"), i, j;

			for (i = 0, j = 0; i < elsLen; i++) {
				if (pattern.test(els[i].className)) {
					classElements[j] = els[i];
					j++;
				}
			}
			return classElements;
		})(classname, node);
	}
}

//window.onload = initDragDropScript;
$(document).ready(function(){
	initDragDropScript();
});