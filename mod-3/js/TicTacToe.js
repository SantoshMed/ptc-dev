(function($) {

var randomNums = [];
function generatenewRandoms(){
				randomNums = [];
				while(randomNums.length < 6){
					var randomnumber=Math.floor(Math.random()*6)
					var found=false;
									for(var i=0;i<randomNums.length;i++){
									if(randomNums[i]==randomnumber){found=true;break}
									}
					if(!found)randomNums[randomNums.length]=randomnumber;
					}
	}

	Object.clone = function(obj) {
    var newObj = [];
    for (var i = 0; i < obj.length; i++)  {
        if (typeof obj[i] == "object")
            newObj[i] = Object.clone(obj[i]);
        else 
            newObj[i] = obj[i]
    } 
    return newObj;
};

	global = {
		invertSymbol: function(symbol) {
			switch (symbol) {
				case "x":
					return "o";
				case "o":
					return "x";
			}
		}
	}

	function GameMove(symbol, row, column) {
		this.symbol = symbol;
		this.row = row;
		this.column = column;
	}


	function GamePad() {
		this.padSize = 3;
		this.pad = new Array(this.padSize);
		for (x = 0; x < this.pad.length; x++) {
			this.pad[x] = new Array(this.padSize);
		}
		this.isGameOver = false;
		this.winnerSymbol = null;
	}

	

	GamePad.prototype.checkRows = function() {

		for (var row = 0; row < this.pad.length; row++) {
			var symbol = this.pad[row][0];
			var lineMatched = symbol != null;
			for (var column = 0; column < this.pad.length; column++) {
				lineMatched &= symbol == this.pad[row][column];

				if (!lineMatched)
					break;
			}
			if (lineMatched)
				this.endGame(symbol);
		}
	}

	GamePad.prototype.checkColumns = function() {
		for (var column = 0; column < this.pad.length; column++) {
			var symbol = this.pad[0][column];
			var lineMatched = symbol != null;
			for (var row = 0; row < this.pad.length; row++) {
				lineMatched &= symbol == this.pad[row][column];

				if (!lineMatched)
					break;
			}
			if (lineMatched)
				this.endGame(symbol);
		}
	}

	GamePad.prototype.checkDiagonals = function() {

		for (var diagonal = 0; diagonal < 2; diagonal++) {
			var symbol = this.pad[diagonal][diagonal]; //Get an element of the current Diagonal
			var lineMatched = symbol != null; //Ensure that it is not empty cell
			for (var row = 0; row < this.pad.length; row++) {
				var column = 0;

				switch (diagonal) {
					case 0:
						column = row;
						break;
					case 1:
						column = (this.pad.length - 1) - row;
						break;
				}

				lineMatched &= symbol == this.pad[row][column];
				if (!lineMatched)
					break;
			}
			if (lineMatched)
				this.endGame(symbol);
		}
	}
	GamePad.prototype.processGame = function() {

		this.checkRows();
		if (this.isGameOver)
			return;
		this.checkColumns();
		if (this.isGameOver)
			return;
		this.checkDiagonals();
		if (this.isGameOver)
			return;
		this.checkGameOver();
	}


	GamePad.prototype.addMove = function(gameMove) {
		if (!this.validateMove(gameMove))
			return;
		this.pad[gameMove.row][gameMove.column] = gameMove.symbol;
		this.processGame();
	}

	GamePad.prototype.validateMove = function(gameMove) {
		return this.pad[gameMove.row][gameMove.column] == null;
	}
	GamePad.prototype.endGame = function(winnerSymbol) {
		this.isGameOver = true;
		this.winnerSymbol = winnerSymbol;
		//alert(winnerSymbol);
	}

	GamePad.prototype.checkGameOver = function() {
		var noEmptyCells = true; //Assume there is no empty cells
		for (row = 0; row < this.pad.length; row++) {
			for (column = 0; column < this.pad[row].length; column++) {
				noEmptyCells &= this.pad[row][column] != null;
			}
		}
		if (noEmptyCells)
			this.endGame("");
	}

	function GameEngine(player1, player2) {
		this.player1 = player1;
		this.player2 = player2;
		this.gamePad = new GamePad();
		this.currentPlayer = player1;
	}
	GameEngine.prototype.isGameOver = function() {
		return this.gamePad.winnerSymbol || this.gamePad.isGameOver;
	}
	GameEngine.prototype.switchPlayers = function() {
		this.currentPlayer = this.currentPlayer == this.player1 ? this.player2 : this.player1;

	}
	GameEngine.prototype.move = function(gameMove) {
		this.gamePad.addMove(gameMove);
		this.switchPlayers();

	}
	function divHoverImage()
	{
		document.getElementById("fr56playGame").getElementsByTagName("div").style.backgroundImage = "url('images/mouseover.png')";
	}
	
	function userSelection($this, this_class, gameEngine, humanPlayer, pcPlayer, _this) {
	
		var returnValue = "";
		 $('#fr56disable').show();
		//$('#fr56output').show();
		document.getElementById("fr56output").style.display="block";
		document.getElementById("fr56CorrectFB").style.display="none";
		document.getElementById("fr56inCorrectFB").style.display="none";
		$('#fr56output input[name=rbtXml]').click(function() {

			returnValue = $.trim($(this).val());
			$('#fr56output input[name=rbtXml]').attr('disabled', 'disabled');
			if (returnValue == 'yes') {
				gameEngine.move(new GameMove(humanPlayer.symbol, $this.attr("row"), $this.attr("col")));
				$this.addClass(humanPlayer.symbol);
				//$(this).addClass('fr56optionCorrect');
				document.getElementById("fr56CorrectFB").style.display="block";			
							
			}
			else
			{ 
			document.getElementById("fr56inCorrectFB").style.display="block";
			//alert("Selected answer is Incorrect."); 			
			}
			
			$('#fr56output .fbBtn').click(function(){	
				document.getElementById("fr56output").style.display="none";
			});
			gameEngine.switchPlayers();
			
			if (!gameEngine.isGameOver()) {

				var pcMove = pcPlayer.think();
				
				gameEngine.move(pcMove);

				pcCell = ">div[row=" + pcMove.row + "][col=" + pcMove.column + "]";
				// gamePad.add
				$(pcCell, $this.parent()).addClass(pcPlayer.symbol);
				//$this.addClass(pcPlayer.symbol);
				
			}
			 $('#fr56disable').hide();
			 
			 //$('#output').hide();
			// document.getElementById("fr56output").style.display="none";
			//HideModalPopup('output')
			$('#fr56output .fbBtn').click(function(){	
				GameOver(gameEngine, humanPlayer);				
			});
			return returnValue;
			//jQuery.modal.close();

		});
	}


	//shuffle an array for XML random selection
	function shuffle(o) {
		for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {
			return o;
		}
	}


	function shuffleQuestions(questionSet) {
		for (var no = 0; no < (questionSet.length * 10); no++) {
			var randomIndex = Math.floor(Math.random() * questionSet.length);
			return questionSet[randomIndex];
		}
	}
	function HumanPlayer(symbol) {
		this.symbol = symbol;
	}

	function ThinkingNode() {
		this.relatedGameMove = null;
		this.xFunction = 0;
		this.oFunction = 0;
		this.isWinningMove = false;
		this.relatedGamePad = null;
		this.nodes = null;
		this.opponentMove = false;
	}
	ThinkingNode.prototype.calculateHeuristic = function(playerSymbol) {
		var sum = 0;
		var INFINITY = 9999; //Hypothetical infinity value
		if (this.isWinningMove) {
			sum += INFINITY;
		}
		switch (playerSymbol) {
			case "x":
				sum += (this.xFunction - this.oFunction);
				break;
			case "o":
				sum += (this.oFunction - this.xFunction);
				break;
		}
		return sum;
	}
	ThinkingNode.prototype.totalHeuristic = function(playerSymbol) {
		var childHeuristics = new Array();
		var maxChildHeuristic = 0;
		var sum = 0;
		if (this.isWinningMove) {
			return this.calculateHeuristic(playerSymbol);
		}
		if (this.nodes) {
			$.each(this.nodes, function(i, childThinkingNode) {
				childHeuristics.push(childThinkingNode.totalHeuristic(global.invertSymbol(playerSymbol)));
			});
		}

		if (childHeuristics.length) {
			maxChildHeuristic = Math.max.apply(Math, childHeuristics);
		}
		if (this.opponentMove)
			sum = (-1 * this.calculateHeuristic(playerSymbol)) + maxChildHeuristic;
		else
			sum = this.calculateHeuristic(playerSymbol) + (-1 * maxChildHeuristic);
		return sum;
	}


	function MinimaxGameStrategy(gameEngine) {
		this.gameEngine = gameEngine;
		this.MAX_THINKING_LEVEL = 2;
	}
	MinimaxGameStrategy.prototype.isWinningMove = function(symbol, symbolLine) {
		var isMathced = true;
		$.each(symbolLine, function(i, symbolCell) {
			isMathced &= (symbolCell == symbol);
		});
		return isMathced;
	}
	MinimaxGameStrategy.prototype.hasPotential = function(symbol, symbolLine) {
		var isMatchedOrEmpty = true;
		$.each(symbolLine, function(i, symbolCell) {
			isMatchedOrEmpty &= (symbolCell == symbol || symbolCell == null);
		});
		return isMatchedOrEmpty;
	}
	MinimaxGameStrategy.prototype.calculateRows = function(symbol, thinkingNode) {
		for (var row = 0; row < thinkingNode.relatedGamePad.length; row++) {
			var symbolLine = new Array();
			for (var column = 0; column < thinkingNode.relatedGamePad.length; column++) {
				symbolLine.push(thinkingNode.relatedGamePad[row][column]);
			}
			if (this.isWinningMove(symbol, symbolLine)) {
				thinkingNode.isWinningMove = true;
				return;
			}
			if (this.hasPotential(symbol, symbolLine)) {
				switch (symbol) {
					case "x":
						thinkingNode.xFunction++;
						break;
					case "o":
						thinkingNode.oFunction++;
						break;
				}
			}
		}
	}
	MinimaxGameStrategy.prototype.calculateColumns = function(symbol, thinkingNode) {
		for (var column = 0; column < thinkingNode.relatedGamePad.length; column++) {
			var symbolLine = new Array();
			for (var row = 0; row < thinkingNode.relatedGamePad.length; row++) {
				symbolLine.push(thinkingNode.relatedGamePad[row][column]);
			}
			if (this.isWinningMove(symbol, symbolLine)) {
				thinkingNode.isWinningMove = true;
				return;
			}
			if (this.hasPotential(symbol, symbolLine)) {
				switch (symbol) {
					case "x":
						thinkingNode.xFunction++;
						break;
					case "o":
						thinkingNode.oFunction++;
						break;
				}
			}
		}
	}
	MinimaxGameStrategy.prototype.calculateDiagonals = function(symbol, thinkingNode) {
		for (var diagonal = 0; diagonal < 2; diagonal++) {
			var symbolLine = new Array();
			for (var row = 0; row < thinkingNode.relatedGamePad.length; row++) {
				var column = 0;
				switch (diagonal) {
					case 0: column = row;
						break;
					case 1: column = (thinkingNode.relatedGamePad.length - 1) - row;
						break;
				}
				symbolLine.push(thinkingNode.relatedGamePad[row][column]);
			}
			if (this.isWinningMove(symbol, symbolLine)) {
				thinkingNode.isWinningMove = true;
				return;
			}
			if (this.hasPotential(symbol, symbolLine)) {
				switch (symbol) {
					case "x":
						thinkingNode.xFunction++;
						break;
					case "o":
						thinkingNode.oFunction++;
						break;
				}
			}
		}
	}
	MinimaxGameStrategy.prototype.calculateXFunction = function(thinkingNode) {
		if (thinkingNode.nodes) {
			var $this = this;
			$.each(thinkingNode.nodes, function(i, childThinkingNode) {
				$this.calculateXFunction(childThinkingNode);
			});
		}
		this.calculateRows("x", thinkingNode);
		this.calculateColumns("x", thinkingNode);
		this.calculateDiagonals("x", thinkingNode);
	}
	MinimaxGameStrategy.prototype.calculateOFunction = function(thinkingNode) {
		if (thinkingNode.nodes) {
			var $this = this;
			$.each(thinkingNode.nodes, function(i, childThinkingNode) {
				$this.calculateOFunction(childThinkingNode);
			});
		}
		this.calculateRows("o", thinkingNode);
		this.calculateColumns("o", thinkingNode);
		this.calculateDiagonals("o", thinkingNode);
	}
	MinimaxGameStrategy.prototype.calculateHeuristic = function(thinkingNode) {
		this.calculateXFunction(thinkingNode);
		this.calculateOFunction(thinkingNode);

	}
	MinimaxGameStrategy.prototype.getEmptyCells = function(gamePad) {
		var emptyCellsIndecis = new Array();
		var index = 0;
		for (var row = 0; row < gamePad.length; row++) {
			for (var column = 0; column < gamePad[row].length; column++) {
				if (gamePad[row][column] == null) {

					var currentIndex = {
						row: row,
						column: column
					};
					emptyCellsIndecis.push(currentIndex);

				}
			}
		}
		return emptyCellsIndecis;
	}
	MinimaxGameStrategy.prototype.generatePossibleMoves = function(gamePad, symbol, currentLevel) {

		if (!currentLevel)
			currentLevel = 1;
		if (currentLevel > this.MAX_THINKING_LEVEL)
			return null;
		var emptyCellsIndecis;
		var possibleMoves = new Array();
		var $this = this;
		emptyCellsIndecis = this.getEmptyCells(gamePad);
		$.each(emptyCellsIndecis, function(i, currentIndex) {
			var thinkingNode = new ThinkingNode();
			thinkingNode.relatedGamePad =Object.clone(gamePad);//clone(gamePad);//gamePad.clone() //gamePad.clone();
			thinkingNode.relatedGamePad[currentIndex.row][currentIndex.column] = symbol;
			thinkingNode.relatedGameMove = new GameMove(symbol, currentIndex.row, currentIndex.column);
			var subNodes = $this.generatePossibleMoves(thinkingNode.relatedGamePad, global.invertSymbol(symbol), currentLevel + 1);
			if (subNodes)
				thinkingNode.nodes = subNodes;
			if (currentLevel % 2 == 0) //Opponent moves, as the code on Even level (2,4,6,..)
				thinkingNode.opponentMove = true;
			possibleMoves.push(thinkingNode);
		});
		return possibleMoves;
	}
	MinimaxGameStrategy.prototype.think = function(symbol) {
		var possibleMoves = this.generatePossibleMoves(this.gameEngine.gamePad.pad, symbol);
		var $this = this;
		var winningMove = null;
		var bestIndex = 0;
		var bestMove = null;
		var best = -9999999;
		var randomPossibility = 0;
		var heuristic;


		$.each(possibleMoves, function(i, possibleMove) {
			$this.calculateHeuristic(possibleMove);
			randomPossibility = Math.round(Math.random());
			heuristic = possibleMove.totalHeuristic(symbol);

			if (/*Look for best value*/heuristic > best || /*This case to select a random game move in case of a tie, to have unpredictable behaviour.*/(heuristic == best && randomPossibility == 1)) {
				best = heuristic;
				bestIndex = i;
			}
		});
		return possibleMoves[bestIndex].relatedGameMove;
	}


	function PcPlayer(symbol, gameStrategy) {
		this.symbol = symbol;
		this.strategy = gameStrategy;
	}
	PcPlayer.prototype.think = function() {
		return this.strategy.think(this.symbol);

	}


	var templates = {
		game_play: {
			html: '<div class="fr56game-pad"></div>'//<div class="fr56disable-game"></div>

		},
		game_end: {
			html: '<div class="fr56game-result" align="center" /><img id="btnPlayAgain" src="images/Reset.png"  width="112px" height="60px" class="fr56play-again" />',
			won: 'You Won!',
			lost: 'System Won!',
			draw: 'Game is Draw!'
			//<a class="character-select" href="javascript:void(0);">

		}
	};


	function GameController(gameUi) {
		this.gameUi = gameUi;
		this.humanSymbol = null;

	}
	GameController.prototype.showIntro = function() {

		_this = this;
		_this.humanSymbol = "x";
		_this.playGame();
	}

	function removeByIndex(arr, index) {
		arr.splice(index, 1);
	}

	GameController.prototype.playGame = function() {
	
		generatenewRandoms();
		var humanPlayer = new HumanPlayer(this.humanSymbol);

		var pcPlayer = new PcPlayer(this.humanSymbol == "o" ? "x" : "o");
		var gameEngine = new GameEngine(humanPlayer, pcPlayer);
		pcPlayer.strategy = new MinimaxGameStrategy(gameEngine);

		this.gameUi.removeClass();
		this.gameUi.html(templates.game_play.html);
		_this = this;
		gamepadUi =$(".fr56game-pad", this.gameUi);	

		for (var x = 0; x < 9; x++) { //Create 9 cells to play on
			var div = $("<div/>");
			div.attr("row", parseInt(x / 3));
			div.attr("col", x % 3);
			div.attr("index", x);
			//div.attr("onmouseover","divHoverImage()");			
			gamepadUi.append(div);
		}
		$(">div", gamepadUi).addClass("fr56pad-cell");
		var numofClick = 0;
		$(">div", gamepadUi).click(function() {

			var $this = $(this);
			var this_class = $this.attr("class");
			if (this_class.indexOf("x") > -1 || this_class.indexOf("o") > -1)
				return;
				

				 $.get("xml/tictactoe56.xml",{},function(xml){
				   var $questionSet = $(xml).find('QuestionSet');
					//alert(Math.floor(Math.random() * $questionSet.length));			
												
					//var $questions =$questionSet.eq(Math.floor(Math.random() * $questionSet.length));//$questionSet[fr56tempIndex];//
					var $questions =$questionSet.eq(randomNums[numofClick]);//$questionSet[fr56tempIndex];//
					numofClick++;
						//alert(Math.floor(Math.random()*$questionSet.length));
						//document.getElementById("fr56output").innerHTML = html;
                        //var $questions =$questionSet.find('Qestion'); //shuffle($("QuestionSet", xml));
                        var maxQuestions = 1;
                        var html="";
                        
                        //filter the first maxQuestions and display their information
                       // $questions.filter(":lt(" + maxQuestions + ")").each(function(index, q) {
                        subQn = $questions.find('Qestion').text();//$(q).find('Qestion').text();					
                        Options= $questions.find('Choices'); 
						correctFeedback=$questions.find('Feedback').find('Correct').text();						
						IncorrectFeedback=$questions.find('Feedback').find('Incorrect').text();						
                        html = '<p>'+subQn+'</p>'; 

                            $questions.find('Choices').find('Options').each(function(i) {
                            html += '<span><input type="radio" class="fr56radioBtn" name="rbtXml" value="'+$(this).attr('ans')+'" />'+$(this).text()+'</span>';
                            });
							html+="<div class='fr56feedback' id='fr56CorrectFB'>"+correctFeedback+"<div align='center'><img src='images/okbtn.png' class='fbBtn' id='CfbbtnOk' width='112px' height='60px' /></div></div><div class='fr56feedback' id='fr56inCorrectFB'>"+IncorrectFeedback+"<div align='center'><img id='IfbbtnOk' class='fbBtn'  src='images/okbtn.png'  width='112px' height='60px' /></div></div>";
                            $('#fr56output').html(html);
                           //  });
                            // fr56tempIndex++;
			// if (fr56tempIndex > $questionSet.length) {
				// fr56tempIndex = 0;
			// }
                        userSelection( $this,this_class,gameEngine,humanPlayer,pcPlayer,_this);
             });		 
			
		});
		//alert("here");
		GameOver(gameEngine, humanPlayer);
	}
	
	function GameOver(gameEngine, humanPlayer) {
		if (gameEngine.isGameOver()) {
			document.getElementById("fr56output").style.display="none";
			//alert(gameEngine.gamePad.winnerSymbol);
			if(gameEngine.gamePad.winnerSymbol=="")
			{			
			result="draw";
			}
			else
			{
				result = humanPlayer.symbol == gameEngine.isGameOver() ? "won" : "lost";
			}
			//alert(result);
			$(".fr56disable-game", _this.gameUi).show();
			function endWrapper() {
				_this.endGame(result);
			}
			setTimeout(endWrapper, 1100);
			//alert("Game over");
			questinIndex = 0;
		}
	}

// function appendToArray()
// {
// var arrqns={};
// $.get("xml/Questions.xml",{},function(xml){
// var $questionSet=$(xml).find('QuestionSet');
// var $question=$(xml).find('Qestion');
// var choice=$(xml).find('Choices');
// var option=$(xml).find('Options');

// $questionSet.each(function()
// {
// arrqns.append($(this).find('Qestion'));
// });
// alert(arrqns);
// });
// }
	GameController.prototype.endGame = function(result) {
		this.gameUi.removeClass();

		this.gameUi.html(templates.game_end.html);
		_this = this;

		$(">div", this.gameUi).html(templates.game_end[result]);//, templates.game_end[result]);
		$(".fr56character-select", this.gameUi).click(function() {
			_this.showIntro();
		});
		$(".fr56play-again", this.gameUi).click(function() {
			
			_this.playGame();
		});
	}


	/*var _ModalPopupBackgroundID = 'backgroundPopup_XYZ_20110418_Custom';

	function ShowModalPopup(modalPopupID) {

		var isIE6 = (navigator.appVersion.toLowerCase().indexOf('msie 6') > 0);
		var popupID = "#" + modalPopupID;

		//Get popup window margin top and left
		var popupMarginTop = $(popupID).height() / 2;
		var popupMarginLeft = $(popupID).width() / 2;


		$(popupID).css({
			'left': '50%',
			'z-index': 9999
		});
		//Special case for IE6 because it does not understand position: fixed
		if (isIE6) {
			$(popupID).css({
				'top': $(document).scrollTop(),
				'margin-top': $(window).height() / 2 - popupMarginTop,
				'margin-left': -popupMarginLeft,
				'display': 'block',
				'position': 'absolute'
			});
		}
		else {
			$(popupID).css({
				'top': '50%',
				'margin-top': -popupMarginTop,
				'margin-left': -popupMarginLeft,
				'display': 'block',
				'position': 'fixed'
			});
		}

		//Automatically adding modal background to the page.
		var backgroundSelector = $('<div id="' + _ModalPopupBackgroundID + '" ></div>');

		//Add modal background to the body of the page.
		backgroundSelector.appendTo('body');

		//Set CSS for modal background. Set z-index of background lower than popup window.
		backgroundSelector.css({
			'width': $(document).width(),
			'height': $(document).height(),
			'display': 'block',
			'background-color': '#555555',
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'z-index': 9990,
			'opacity': 0.2
		});


	}

	function HideModalPopup(modalPopupID) {
		//Hide modal popup window

		$("#" + modalPopupID).css('display', 'none');

		//Remove modal background from DOM.
		$("#" + _ModalPopupBackgroundID).remove();
	}*/


	jQuery.fn.playxo = function() {
		var questinIndex = 0;	
		
		var controller = new GameController(this);
		controller.showIntro();

		return this;
	}
})(jQuery);