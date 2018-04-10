var totalFrames = 0;
var loadCount = 0;
var currentFrame = 0;
var previousFrame =0;
var clickHandler = "click";
var transcriptInside = true;
var transcriptScroll = null;
var glossaryScroll;
var glossaryRefScroll;
var popupScroll;
var imgCache = {};
var wsbXML;
var glossaryXML;
var sectionTitles = new Array();
var fullFrameTitles = new Array();
var isPlaying = false;
var wasPlaying = false;
var clipFinished = false;
var videoInitialized = false;
var frameType = null;
var showAudioControls = true;
var attractorCallback;
var attractorCallbackPercentage;
var timer = null;
var frameStartTime;
var extraVideos = new Array('fr35a','fr7a','fr13a','fr20a','fr22a','fr11a','fr20a','fr25a','fr30a','fr40a','fr44a','f47a','f50_q1_correct', 'f50_q1_incorrect1','f50_q1_incorrect2','fr17a','fr43a');
var transcript_inner = null;
var tocScroll = null;
var tabAlphabet = new Array('a','b','c','d');
var frame1Flag = false;
var isSliderDrag = false;
var htmlPercentCalled;
var sliderReplay = false;
var isIpad = false;
var slideTimer;
var ch = new String();
var unlockFlag = false;
var fr9Data = new Array();
var fr13Data = new Array();
var fr14Data = new Array();
$(document).ready(function(){
  $.ajaxSetup({ cache: false });
  playerInit();
  if(clickHandler == "touchstart") {
	  var meta = document.createElement('meta');
	  meta.name = 'viewport';
	  meta.content = 'width=1024, user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0';
	  top.document.getElementsByTagName('head')[0].appendChild(meta);
  }
  //setTimeout(playerStart, 500);
});

var cacheLoadCount = 0;
var cacheSize = 0;
function checkLoading() {
  //debug("checkLoading: "+cacheLoadCount+","+cacheSize);
  $('#progress').html(Math.round(30+cacheLoadCount));
  if (cacheLoadCount>=cacheSize-1) {
    clearInterval(timer);
    initBookmarkData(totalFrames, playerStart); //scorm tracking
    //playerStart();
  }
}

/* adds uri to image cache if does not exist and return the cached version */
function cachedImage(uri) {
  cacheSize++;
  var img = imgCache[uri];
  if (!img) {
    img = new Image();
    img.onload = function() {
      cacheLoadCount++;
      //debug(numLoaded);
    }
    img.src = uri;
    imgCache[uri] = img;
  }
  return img;
}

function playerInit() {


  $('#progress').html(10);
	//$("#frame-title").hide();
  if('ontouchstart' in document.documentElement) {
	clickHandler = "touchstart";
    $('.btn').bind('touchstart', function() { $(this).addClass("btndwn");});
    $('.btn').bind('touchend', function() { $(this).removeClass("btndwn");});
    $('body').bind('touchmove', function() { event.preventDefault();}); // prevent page dragging
    $('body').bind('touchend', function() { event.preventDefault();}); // prevent double-tap zoom
    glossaryScroll = new iScroll('glossary_list');
    //glossaryRefScroll = new iScroll('glossary_references');
    transcriptScroll = new iScroll('transcript_inner');
    popupScroll = new iScroll('popup_information');
    document.documentElement.style.webkitUserSelect = "none";
    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
		isIpad = true;
  }
  else {
    $('.btn').bind('mousedown', function() { $(this).addClass("btndwn");});
    $('.btn').bind('mouseup', function() { $(this).removeClass("btndwn");});
    glossaryScroll = new iScroll('glossary_list');
  }
  $("#slider").slider({ animate: true, min: 0, max: 108 ,
				slide: function(event, ui) { 
					//$('#sliderMsg').show().html(ui.value+"%");
					if(ui.value > 100) event.preventDefault();
					pauseVideo();
					isSliderDrag = true;
				}
	});
  	$("#slider" ).bind( "slidestop", function(event, ui) {
		var tempisclipfinished = clipFinished;
		var duration = (iPlayer.clipDuration() * ui.value)/100;
		if(tempisclipfinished) sliderReplay = true;
		slideTimer = setTimeout(function(){ sliderReplay = false}, 100);		
		playVideo();
		$('#sliderMsg').hide();	
		
		if(ui.value==100) iPlayer.seek(duration-0.1);
		else iPlayer.seek(duration); 
		
		if(attractorCallbackPercentage==0 && ui.value < htmlPercentCalled && frameType.indexOf("html")>-1 && currentFrame!=1) setTimeout(function(){ loadframehtml();}, 100);	//-- to reload the page to the instance before the html registerattractor was called.
		
		setTimeout(function(){isSliderDrag = false; }, 300);
		$("#slider").blur();
		//$('#sliderMsg').show().html(Math.round(duration));
		//alert("iPlayer.clipDuration="+iPlayer.clipDuration()+"\n ui.value="+ui.value+"\n duration="+duration+"\n htmlPercentCalled"+htmlPercentCalled);
	});
  
  $('#exitbtn').bind(clickHandler, function() { playerFinish();});
  $('#pdfbtn').bind(clickHandler, function() { 
		$('#player').unbind(clickHandler);
		$('#pdfcontent').fadeIn(1000,function(){											
        $('#player').bind(clickHandler, function(){
          $('#pdfcontent').fadeOut();
        });									
      });
	});
  $('#helpbtn').bind(clickHandler, function() { toggleResource('#help');});
  $('#helpCls').bind(clickHandler, function() { toggleResource('#help');});
  $('#nextbtn').bind(clickHandler, function() { nextFrame(this);});
  $('#prevbtn').bind(clickHandler, function() { prevFrame(this);});
  $('#counter').bind(clickHandler, function() { $("#toc").toggle(); $("#toc").scrollTop(0); if(tocScroll) setTimeout( function(){tocScroll.refresh();},100); });
  $('#pauseplaybtn').bind(clickHandler, function() { toggleVideo(this);});
  $('#mutebtn').bind(clickHandler, function() { iPlayer.volumeToggle(); $('#mutebtn i').toggleClass('fa-volume-off'); });
  $('#replaybtn').bind(clickHandler, function() { replayVideo(this);});
  $('#glossarybtn').bind(clickHandler, function() { toggleResource('#glossary'); });
  $("#glossary .close").bind(clickHandler, function() { toggleResource('#glossary'); });
  $('#referencesbtn').bind(clickHandler, function() { toggleResource('#references'); });
	$("#referencesClose").bind(clickHandler, function() { toggleResource('#references'); });
  $('#popupbtn').bind(clickHandler, function() { toggleResource('#popup');});
  $("#popup .close").bind(clickHandler, function() { toggleResource('#popup'); });
  $("#modal-bookmark").bind(clickHandler, function() {});
  $("#modal-bookmark button").bind(clickHandler, function() {
    $("#modal-bookmark").hide();
    if ($(this).html().indexOf("YES") > -1) showFrame(_cmiData.initialLessonLocation);
  });

	$('#glossary_letters li').bind(clickHandler, function(){
		if(!$(this).hasClass('link_inactive')){
			$('#glossary_letters li').removeClass("letterSelect");
			$(this).addClass("letterSelect");
			var glossaryCharacter = $(this).html();
			var currentPos = 0;
			var maxScroll = parseInt($('#glossary_scroller').height()) - parseInt($('#glossary_list').height()) - 12;
			$('#glossary_scroller a').each(function(index){
				var currentWord = $(this).html();
				currentPos = index;
				if(glossaryCharacter == currentWord[0]) { return false;}
				if(glossaryCharacter < currentWord[0]) { currentPos--; return false;}
			});
			currentPos = currentPos*-22;
			//alert(currentPos+" : "+maxScroll);
			if(Math.abs(currentPos) > maxScroll) currentPos = -maxScroll;	//786
			glossaryScroll.scrollTo(0,currentPos,500,false);
		}
  });
  


  $("#video-intercept").bind(clickHandler, function() {$("#toc").hide(); return false;});
  $("#notesbtn").bind(clickHandler, function() { toggleResource('#notesContent'); });
  
  
  $('#transcript_btn').bind(clickHandler, function() {
	if(transcriptInside==false) 
	{ 	$('#transcript').animate({height: '0'}, 500, function() { 
        $(this).animate({width: '+=0'},200);   	
  		});
		$('#transcript_inner').fadeOut(1000);
		transcriptInside=true;
    $('#transcript').css("background","#fff");
    $('#transcript_btn i').removeClass("fa-angle-down").addClass("fa-angle-up");
	}
	else
	{
		$('#transcript').animate({
			height: '180'
    		}, 500, function() { // Animation complete.    	
  		});
		$('#transcript_inner').fadeIn();
		transcriptInside=false;
    $('#transcript').css("background","#fff");
    $('#transcript_btn i').removeClass("fa-angle-up").addClass("fa-angle-down");
		setTimeout(function () { if (transcriptScroll) transcriptScroll.refresh(); }, 100);
	}
	
 });
  $("#homeBtn").bind(clickHandler, function(){
    $('#splash, #frame-title, #video-preload').hide();
  showFrame(1);
  
  });
  
  $('#notesextbtn').bind(clickHandler, function(){ toggleResource('#notesContent'); });
  $('#notesPrint').bind(clickHandler, function(){
	w = window.open('', '_blank', 'status=no,toolbar=no,menubar=yes,height=400px,width=640px'); 
	w.document.open(); 
	w.document.write('<html><head><title>notes</title></head><body>');
	w.document.write('<textarea style="height: 800px; width: 560px; resize: none; border: none; overflow: hidden;" wrap="off">'+$('#notesTxt').val()+'</textarea></div>'); 
	w.document.write('</body></html>');
	w.document.close();
	w.print();
	w.close();
  });
  
  $.ajax({
    url: "glossary.xml",
    dataType: "xml",
    success: function(data){
      if (typeof data == "string" && window.ActiveXObject) {
        glossaryXML = new ActiveXObject("Microsoft.XMLDOM");
        glossaryXML.async = false;
        glossaryXML.loadXML(data);
      } else {
        glossaryXML = data;
      }
      loadGlosary();
    }
  });
  
  $.ajax({
    url: "wsb.xml",
    dataType: "xml",
    success: function(data){
      if (typeof data == "string" && window.ActiveXObject) {
        wsbXML = new ActiveXObject("Microsoft.XMLDOM");
        wsbXML.async = false;
        wsbXML.loadXML(data);
      } else {
        wsbXML = data;
      }
      loadFrames();
    }
  });
  var preloadIMG = new Array("splash_new.png","next_off.png","prev_off.png","Hide_Transcript.png","Show_Transcript.png","modal-bg.png");
  for(var i=0; i<preloadIMG.length; i++) {
    cachedImage("images/"+preloadIMG[i]);
  }
}

function playerStart(session) {
  var chapterStatus = _cmiData.suspendData.split(",");
  var tocNum = 0;
    $('#progress').html(100);
    $('#loading').fadeOut();
    $('#topnav').show();
    $('#topnav .btn').hide();
    $('#nav').show();
  //showFrame(_cmiData.lessonLocation);
  for(var i=0;i<chapterStatus.length;i++) {
	if(chapterStatus[i]==1) tocNum++;
	else break;
  }
  updateToc(tocNum);
  showFrame(1);
  if (_cmiData.initialLessonLocation>1) $("#modal-bookmark").delay(100).show();
  setInterval(updateProgressBar, 100);
}

function playerFinish() {
    pauseVideo();
    parent.lmsFinish();
}

function nextFrame() {
previousFrame = currentFrame;
  if (currentFrame < totalFrames) {
    currentFrame++;
    showFrame(currentFrame);
  }
}

function prevFrame() {
	previousFrame = currentFrame;
  if (currentFrame > 1) {
    currentFrame--;
    showFrame(currentFrame);
  }
}


function loadGlosary() {
  $('#progress').html(15);
  var glossaryEntries = $(glossaryXML).find("entry");
  for (var i=0; i<glossaryEntries.length; i++) {
    $("#glossary_scroller").append('<a>'+$(glossaryEntries[i]).find("term").text()+'</a>');
  }
  //$("#glossary_scroller").append('<br><br><br>');

  $("#glossary_scroller a").bind(clickHandler, function() { 
      var term = $(this).html();
      $(glossaryXML).find("entry").each(function () {
        if ($(this).find("term").text()==term) {
        //  $("#glossary_term").html('<h1>'+$(this).find("term").text()+'</h1>'+$(this).find("definition").text());
     	$("#glossary_definition").html('<h1>'+$(this).find("term").text()+'</h1>'+$(this).find("definition").text());
     
        }
      });
      $("#glossary a").removeClass("selected");
      $(this).addClass("selected");
  });
}

function toggleResource(divID) {
  var divs = new Array("#popup", "#glossary", "#toc", "#help");
  for (var i=0; i<divs.length; i++) {
    if (divs[i]!=divID) $(divs[i]).hide();
  }
  if (divID) {
    $(divID).toggle();
    $("#playerDisable").toggle();
    if ($(divID).is(":visible")) {
        pauseVideo();
        $("#modal-bg").show();
    }
    else {
        resumeVideo();
        $("#modal-bg").hide();
    }
  }
  setTimeout(function () { if (popupScroll) popupScroll.refresh(); }, 0);
  //setTimeout(function () { if (transcriptScroll) transcriptScroll.refresh(); }, 0);
  setTimeout(function () { if (glossaryScroll) glossaryScroll.refresh(); }, 0);
  //setTimeout(function () { if (glossaryRefScroll) glossaryRefScroll.refresh(); }, 0);
}


function loadFrames() {
  $('#progress').html(20);
  //debug("course_title: "+$(wsbXML).find("frames frame").length);
  totalFrames = $(wsbXML).find("frames").attr("count");
  var videoList = new Array();
  var totalSections = 0;
  for(var i=1; i<=totalFrames; i++) {
    var sectionTitle = $(wsbXML).find("frames frame[id="+i+"] section_title").text();
	  var frsectionTitle = $(wsbXML).find("frames frame[id="+i+"] section_title").text();
    for (var n=i; (!frsectionTitle || frsectionTitle.length==0) && n>0; n--) frsectionTitle = sectionTitles[n];
    sectionTitles[i] = frsectionTitle;
    var frameTitle = $(wsbXML).find("frames frame[id="+i+"] frame_title").text();
    fullFrameTitles[i] = sectionTitles[i];
    if (frameTitle && frameTitle.length>2) fullFrameTitles[i] += " > "+frameTitle;
    if (sectionTitle != "") {
		$("#toc_list1").append('<a  frame="'+i+'" class="inactive"><div>'+sectionTitle+'</div><div> '+frameTitle+'</div></a>');
		//$("#toc").append('<a frame="'+i+'"> Section : '+sectionTitle+'</a>');
        totalSections++;
    }
    $("#player").append('<div id="f'+i+'" class="frame"/>');
    if (i>1) videoList.push("video/f"+i+".mp4");
  }  
  for(i=0;i<extraVideos.length;i++) videoList.push("video/extra/"+extraVideos[i]+".mp4");
  //$("#toc").css("top", (582-4-totalSections*25)+"px");
  //$("#toc").css("height", (4+totalSections*25)+"px");
  $("#toc a").click(function(e) {  
		if(!$(this).hasClass("inactive")) showFrame($(this).attr("frame"));	
  });
  if (navigator.userAgent.indexOf("iPad;")>0) tocScroll = new iScroll('toc', { checkDOMChanges: false, fadeScrollbar: false });
 

  timer = setInterval(checkLoading, 100);
  $("#video").show(); // flash will not load until visible
  iPlayer.init("#video", videoList,
    {
        onInit: function() {
          //$("#video").hide(); //chrome flash won't load if you hide it too soon
        },
        onClipStart: function() { 
          videoInitialized = false;
          isPlaying = true;
          wasPlaying = true;
          clipFinished = false;
        },
        onClipFinish: function() { 
          $("#pauseplaybtn i").addClass("fa-play").removeClass("fa-pause");
          isPlaying = false;
          wasPlaying = false;
          clipFinished = true;
		  $("#progressbar").css("width","100%");
		  $("#slider" ).slider({ value: 100 });
          if ((showAudioControls) && !(frameType.indexOf("nomsg")>-1)) {
            setTimeout(attractorCallback, 0);
			setTimeout(showAttractorMessage, 0);
          }
        }
    }
  );
  //initBookmarkData(totalFrames, playerStart); //scorm tracking
}

function registerAttractor(clipFinishFunction, percentComplete) {
	if (clipFinishFunction) attractorCallback = clipFinishFunction;
	if (percentComplete) { attractorCallbackPercentage = percentComplete; htmlPercentCalled = percentComplete; }
}

function showAttractorMessage() {
  if (currentFrame<totalFrames) showMessage("Click/Tap on the <b>forward</b> arrow to continue");
  unlockFrame();
}

function updateProgressBar() {
  try {
	var p = iPlayer.clipPercentPlayed();
    if (p>0 && $("#video-loading").is(":visible") && !clipFinished) {
      $("#video-loading").fadeOut();
      $("#video-intercept").show();
      //if (iPlayer._type=="HTML5") $("#video").show(); // hiding the flash version breaks Chrome
      if (showAudioControls) {
        $("#pauseplaybtn i").addClass("fa-pause").removeClass("fa-play");
        //$("#pauseplaybtn").show();
        //$("#replaybtn").show();
      }
    }
		if (p>0 && $("#slider a").is(":hidden")) $('#slider a').show();
    if (attractorCallbackPercentage>0 && p>=attractorCallbackPercentage && (new Date().getTime()-frameStartTime.getTime())>2000) {
      attractorCallbackPercentage = 0;
      setTimeout(attractorCallback, 0);
    }
    if (currentFrame>1 && !clipFinished){ 
			$("#progressbar").css("width", p+"%");
		}
		if(!isSliderDrag && !clipFinished) $("#slider" ).slider({ value: p });
		$('#slider').css('z-index','11');
		setTimeout(function(){ $('#slider').css('z-index','12');},50);
		$('#slider .ui-slider-handle').css('z-index','11');
		setTimeout(function(){ $('#slider .ui-slider-handle').css('z-index','12');},50);
  } catch(err){}
}

function playVideo() {
	if (clipFinished && !sliderReplay) {		// To prevent replaying a frame if just the slider is moved from 100% to something less.
		iPlayer.replay();
		clipFinished = false;
		$("#pauseplaybtn i").addClass("fa-pause").removeClass("fa-play");
		wasPlaying = isPlaying;
		isPlaying = true;			// To completely reload the frame.
	}
	else {
		toggleResource(null);
		iPlayer.play();
		clipFinished = false;
		$("#pauseplaybtn i").addClass("fa-pause").removeClass("fa-play");
		wasPlaying = isPlaying;
		isPlaying = true;
	}
}
function pauseVideo() {
    iPlayer.pause();
    $("#pauseplaybtn i").addClass("fa-play").removeClass("fa-pause");
    wasPlaying = isPlaying;
    isPlaying = false;
    $("#toc").hide();
}
function replayVideo() {
	$("#video-loading").show();
    attractorCallbackPercentage = 0;
    frameStartTime = new Date();
    resetTranscript();
    clipFinished = false;
    //iPlayer.replay();
	iPlayer.playClip(currentFrame-2);
    toggleResource(null);
    $("#pauseplaybtn i").addClass("fa-pause").removeClass("fa-play");
	$('#frameDisable').hide();
    wasPlaying = isPlaying;
    isPlaying = true;
    //playVideo();
    if (frameType.indexOf("html")>-1) {
      loadframehtml();
    }
    $('#msg').hide();
}
function toggleVideo() {
  if (isPlaying) pauseVideo();
  else playVideo();
}

function resumeVideo() {
  if (wasPlaying) playVideo();
  else pauseVideo();
}

function resetTranscript() {
  setTimeout(function () { 
    if (transcriptScroll) {
      transcriptScroll.refresh(); 
      transcriptScroll.scrollTo(0,0,0); 
    }
  }, 0);
  if (transcript_inner) transcript_inner.scrollTop = 0;
  $('#transcript').css({'width': '100%'});
  transcriptInside=true;
}

function showFrame(frameNum) {
  if (!frameNum) frameNum = _cmiData.lessonLocation;
  attractorCallback = showAttractorMessage;
  attractorCallbackPercentage = 0;
  frameStartTime = new Date();
  $('.frame').hide();
  $("#modal-bg").hide();
  $("#glossary").hide();
  $("#popup").hide();
  $("#playerDisable").hide();
  $('#msg').hide();
  $("#toc").fadeOut();
  $("#help").hide();
  $("#video-intercept").hide();
  $('#frameDisable').hide();
  $('#f'+currentFrame).html("");
	$("#slider" ).hide();
	$('#slider a').hide();
  //if (iPlayer._type=="HTML5") $("#video").hide();
  //if (isPlaying) iPlayer.pause();
  
  currentFrame = parseInt(frameNum);
  frameType = $(wsbXML).find("frames frame[id="+currentFrame+"]").attr("type");
  showAudioControls = !(currentFrame==1 || frameType=="quiz" || frameType=="quizmcq" || frameType=="html" || frameType.indexOf("noaudio")>-1);
  $('#frame-title').html(fullFrameTitles[currentFrame]);
	checklockFrame();
  
  $("#counterText").text(currentFrame+" of "+totalFrames);
  if (currentFrame==1) {
  if($('#mutebtn').hasClass('fa-volume-off')) {_iPlayer.volumeToggle();$('#mutebtn i').toggleClass('fa-volume-off');}// to make sound enabled at start of module
  $("#video-preload").show();
    $("#prevbtn img").attr("src", "images/prev_off.png");
    $("#splash").delay().fadeIn();
	showMessage("Click the <b>forward</b> arrow to begin");
	$('#topnav').hide();
	$('#nav').hide();	
  } else {
  $('#video-loading').css({"top":"70px","height":"500px"});
		chapterViewed(1);
	$('#nav').show();
	$('#topnav').show();
    $("#video-preload").hide();
    $('#topnav .btn').show();
    $("#prevbtn img").attr("src", "images/prev.png");
    $("#splash").hide();
    $("#video-loading").show();
    $("#video-intercept").show();
  }
  clipFinished = true;
  iPlayer.playClip(currentFrame-2); // moduleplayer starts with frame 2. iPlayer is zero-indexed
  
  if (showAudioControls) {
    $("#pauseplaybtn").show();
    $("#replaybtn").show();
		$("#slider,#sliderHover" ).show();
		if(!isIpad) $("#mutebtn" ).show();
  } else {
    $("#pauseplaybtn").hide();
    $("#replaybtn").hide();
	$("#mutebtn" ).hide();
	$("#slider, #sliderHover" ).hide();
  }
  $("#transcript").hide();
  $("#progressbar").hide();
  $("#progressbar").css("width","0%"); 
  if (frameType.indexOf("html")>-1) {
  	loadframehtml();
  }
  //if (showAudioControls) $("#progressbar").show();
  
  if (frameType.indexOf("text")>-1 && $(wsbXML).find("frames frame[id="+currentFrame+"] transcript").text() != "") {
    if (currentFrame > 1 && currentFrame < totalFrames) { //exclude frames 1,2 & last
      $("#transcript_scroller").html($(wsbXML).find("frames frame[id="+currentFrame+"] transcript").text()+"<br><br>");
      $("#transcript").show();
      resetTranscript();
    }
  }
  if (frameType=="quiz") {
    $('#f'+currentFrame).html("");
    loadQuiz('quizdata'+currentFrame+'.txt', '#f'+currentFrame);
  }
  if (frameType=="quizmcq") {
    $('#f'+currentFrame).html("");
    loadMcqQuiz('xml/quizmcqdata'+currentFrame+'.xml', '#f'+currentFrame);
  }
  
  var popupInformation = $(wsbXML).find("frames frame[id="+currentFrame+"] popup").text();
  if (popupInformation && popupInformation.length>2) {
    $("#popup_scroller").html(popupInformation+"<br><br>");
    $('#popupbtn').show();
  } else {
    $('#popupbtn').hide();
  }
  $('#f'+currentFrame).show();
	unlockVisitedToc();
	scormcurrentFrame();
	if(currentFrame==totalFrames) chapterViewed(currentFrame);
}

function showMessage(msg) {
  $('#msg').html(msg);
  $('#msg').show();
}

function debug(txt) {
  $("#debug").append("<br>"+txt);
}

$.fn.smartBackgroundImage = function(url){
  var t = this;
  //create an img so the browser will download the image:
  //debug("loading: "+url);
  $('<img />')
    .attr('src', url)
    .load(function(){ //attach onload to set background-image
       t.each(function(){ 
          $(this).css('backgroundImage', 'url('+url+')' );
          //loadCount++;
          debug("loaded: "+url);
          //debug(loadCount+" "+new Date().getTime());
       });
    });
   return this;
}

function openWindow(url) {
  pauseVideo();
  window.open(url);
}


function checkTocStatus() { 
	var chapterStatus = _cmiData.suspendData.split(",");
	var total = 0;
	for(var i=0;i<chapterStatus.length;i++) total += chapterStatus[i];
	if(total==chapterStatus.length) $('#toc a').removeClass("inactive");  
}
function checklockFrame() {
	var chapterStatus = _cmiData.suspendData.split(",");
	//alert(chapterStatus+"\n"+chapterStatus[currentFrame-1]+" : "+currentFrame);
	if(chapterStatus[currentFrame-1]==1 || unlockFlag) unlockFrame();
	else lockFrame();
	if(currentFrame==totalFrames) $("#nextbtn").unbind().removeClass("btn orangeColor");
}
function lockFrame() { 
	$("#nextbtn").unbind().removeClass("btn orangeColor"); 
	$("#slider").addClass("disabled");
	$("#sliderOverlay").show();
}
function unlockFrame() { 
	if(currentFrame<totalFrames) $("#nextbtn").unbind().bind(clickHandler, function(){ nextFrame(this);}).addClass("btn orangeColor");
	$("#slider").removeClass("disabled");
	$("#sliderOverlay").hide();
	chapterViewed(currentFrame);
}
function unlockVisitedToc() {
	$('#toc .inactive').each(function(){
		if(currentFrame==$(this).attr('frame')) { $(this).removeClass('inactive'); return;}
	});	
}
function updateToc(frameNo) {
	var returnFlag = false;
	for(var i=1;i<=frameNo;i++) {
		$('#toc .inactive').each(function(index){
			if(i==$(this).attr('frame')) { 
				$(this).removeClass('inactive');				
			}	
		});
	}
}
function loadframehtml() {
	$.get('html'+currentFrame+'.html', function(data){ 
$('#f'+currentFrame).load('html'+currentFrame+'.html');
	});
	//$('#f'+currentFrame).load('html'+currentFrame+'.html');
}
function playExtraVideo(videoname) {

	for(i=0;i<extraVideos.length;i++)
	{
		if(videoname == extraVideos[i])
		{
			//alert("yes: "+i);
			//$("#video-loading").show();
			iPlayer.playClip(parseInt(totalFrames)-1+i);
			$("#pauseplaybtn i").addClass('fas fa-pause');
			wasPlaying = isPlaying;
			isPlaying = true;
		}
	}
	
}
$(document).keydown(function (event) {
	ch = ch + String.fromCharCode(event.which);
	//alert(ch.substr(0,4));
	var str = new String(ch);
	//alert(ch+" : "+ch.substr(ch.length-8)+" : "+ch.length);
	
	if(ch.substr(ch.length-8) == "INDLOCK0")	{ unlockFlag = true; unlockFrame(); }
	if(ch.substr(ch.length-15) == "INDJUMPTOFRAME0")	{
		var tempnum = parseInt(prompt("Enter the frame number you wish to jump to",""));		
		if(tempnum>0 && tempnum<=totalFrames) showFrame(tempnum);
		else alert("invalid frame number :"+tempnum);
	}
});

