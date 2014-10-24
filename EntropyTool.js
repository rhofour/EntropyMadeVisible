var EntropyMadeVisible; // Declare this to be global
(function(){
"use strict";
EntropyMadeVisible = (function(my) {
  var increaseN = function increaseN() {
    var n = Math.sqrt($("#JointProbGrid").cells.length);
    console.log(n);
  };

  my.makeTool = function makeTool(id) {
    $("#" + id).load("Tool.html");
    increaseN();
  };

  return my;
}(EntropyMadeVisible));
console.log("Loaded EntropyTool.js");
}());
