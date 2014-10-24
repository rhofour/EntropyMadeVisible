(function(){
"use strict";
var EntropyMadeVisible = (function(my) {
  var increaseN = function increaseN() {
    var n = Math.sqrt($("#JointProbGrid").cells.length);
    console.log(n);
  };

  my.makeTool = function makeTool(id) {
    $("#" + id).load("Tool.html");
    increaseN();
  };

  return my;
}({}));
console.log("Loaded EntropyTool.js");
}());
