(function(){

var container = document.getElementById("container");
var ballCreatingButton = document.getElementById("create-ball");
var ballsNotMoved = [];
var startShiningButton = document.getElementById("start-shining")

function Ball(){
    this.elem = document.createElement("div");
    document.body.appendChild(this.elem);
    this.elem.classList.add("ball");
    var ranNum = Math.floor(Math.random()*10);
    this.elem.style.backgroundImage = `url(${ranNum}.png)`;
    this.falling();
    this.elem.addEventListener("ballMoved", this.falling.bind({elem:this.elem}));
};

Ball.prototype.falling = function(event){
    this.elem.classList.remove("graggable");
    var timerID = setInterval(()=>{

        this.elem.style.top = parseFloat(getComputedStyle(this.elem).top)+2+"px";
        var stop = false;
        var elemIndex = ballsNotMoved.indexOf(this.elem);
        
        if (!ballsNotMoved.length || !elemIndex) {
            if (240<this.elem.getBoundingClientRect().bottom) stop = true;
        } else if (elemIndex === -1) {
            if (ballsNotMoved[ballsNotMoved.length-1].getBoundingClientRect().top<=this.elem.getBoundingClientRect().bottom) stop = true;
        } else {
            if (ballsNotMoved[elemIndex-1].getBoundingClientRect().top<=this.elem.getBoundingClientRect().bottom) stop = true;
        }

        if (stop) {
            this.elem.classList.add("draggable");
            if (!~elemIndex) ballsNotMoved.push(this.elem);
            clearTimeout(timerID);
        }

    }, 10); 
}

var handler = event=>{
    if (ballsNotMoved.length>4) return;
    var ball = new Ball();    
    ballCreatingButton.removeEventListener("click", handler);
    setTimeout(()=>{
        ballCreatingButton.addEventListener("click", handler)
    }, 140);
};

ballCreatingButton.addEventListener("click", handler);

document.addEventListener("mousedown", event=>{
    if (!event.target.classList.contains("draggable")) return;
    var ball = event.target;
    var coords = getCoords(ball);
	var shiftX = event.pageX-coords.left;
	var shiftY = event.pageY-coords.top;

	var okToMove = (function (){
			var containerCoords = container.getBoundingClientRect();

			var borders = {
				top: parseFloat(getComputedStyle(container).borderTop),
				left: parseFloat(getComputedStyle(container).borderLeft),
				bottom: parseFloat(getComputedStyle(container).borderBottom),
				right: parseFloat(getComputedStyle(container).borderRight)
			};

			return {
				top: containerCoords.top + pageYOffset + borders.top,
				bottom: containerCoords.bottom + pageYOffset - borders.bottom - ball.offsetHeight,
				left: containerCoords.left + pageXOffset + borders.left,
				right: containerCoords.right + pageXOffset - borders.right - ball.offsetWidth
			};
		})();

	ball.style.position = "absolute";
	document.body.appendChild(ball);
	moveAt(event);
	ball.style.zIndex = 1000;

	function moveAt(e) {
		var top = e.pageY - shiftY;
		var left = e.pageX - shiftX;

		top = top < okToMove.top ? okToMove.top
			: top > okToMove.bottom ? okToMove.bottom : top;
		left = left < okToMove.left ? okToMove.left
            : left > okToMove.right? okToMove.right: left;
    
        if (!(top < 33 || top > 257 || top < left * (-2.9342) + 970 || top < left * 2.9342 - 902)) {
            ball.classList.add("shining");         
        } else {
            ball.classList.remove("shining");
        };

        ball.style.top = top + "px";
        ball.style.left = left + "px";          
	};

	document.onmousemove = function(e){
		moveAt(e);
	};

	document.onmouseup = function(e){
        document.onmousemove = null;
        if ( parseFloat( getComputedStyle(ball).left ) < 125 ) ball.style.left = "124px";
        ball.onmouseup = null;

        if (~ballsNotMoved.indexOf(ball)) {
            var ballMoved = new Event("ballMoved");
            ballMoved.index = ballsNotMoved.indexOf(ball);
            ballsNotMoved.splice(ballMoved.index, 1);
            var fallsSkipped = 0;
            ballsNotMoved.forEach((item,i)=>{
                if (ballMoved.index>i) return fallsSkipped++;
                setTimeout(()=>{item.dispatchEvent(ballMoved)}, 100*(i-fallsSkipped));
            });
        };

        document.onmouseup = null;
	};

	ball.ondragstart = function() {return false};

	function getCoords(elem) {
		var box = elem.getBoundingClientRect();
		return {
			top: box.top + pageYOffset,
			left: box.left + pageXOffset
		};
	};
});

function startShiningHandler(event){
    startShiningButton.removeEventListener("click", startShiningHandler);

    var timerID = setInterval(()=>{
        var shining = [].slice.call(document.getElementsByClassName("shining"));
        shining.forEach(item=>{
            var ranNum = Math.floor(Math.random()*10);
            item.style.backgroundImage = `url(${ranNum}.png)`;
        });
    }, 800);
        
    startShiningButton.addEventListener("click", ()=>{
        clearTimeout(timerID);
        startShiningButton.addEventListener("click", startShiningHandler);    
    });
};

startShiningButton.addEventListener("click", startShiningHandler);
document.onselectstart = event=>{return false};

})();