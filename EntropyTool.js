"use strict";
var EntropyMadeEasy = (function(my) {
  my.makeTool = function makeTool(id) {
    $("#" + id).load("Tool.html");
    increaseN();
  }

  function increaseN() {
    var n = Math.sqrt($("#JointProbGrid").cells.length);
    console.log(n);
  }

  return my;
}({}));
console.log("TESTING");
