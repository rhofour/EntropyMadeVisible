"use strict";
function makeTool(id) {
	$("#" + id).load("Tool.html");
	increaseN();
}

function increaseN() {
	var n = Math.sqrt($("#JointProbGrid").cells.length);
	console.log(n);
}
