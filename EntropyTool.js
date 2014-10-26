var EntropyMadeVisible = {}; // Declare this to be global
(function(){
"use strict";
EntropyMadeVisible = (function(my) {
  my.coloredCells = 0;

  var increaseTableN = function increaseN() {
    var table = $("#JointProbGrid").get(0);
    var n = table.rows.length;
    var row;
    var cell;
    // Add new column header
    row = table.rows[0];
    var th = document.createElement('th');
    th.innerHTML = "" + n;
    th.className = "jointProbHeader";
    row.appendChild(th);
    for (var i = 1; i < n; i++) {
      row = table.rows[i];
      cell = row.insertCell(-1);
      cell.innerHTML = "o";
      cell.className = "uncoloredCell";
    }
    // Add new row
    row = table.insertRow(-1);
    // Add new row header
    var th = document.createElement('th');
    th.innerHTML = "" + n;
    th.className = "jointProbHeader";
    row.appendChild(th);
    for (var i = 0; i < n; i++) {
      cell = row.insertCell(-1);
      cell.innerHTML = "o";
      cell.className = "uncoloredCell";
    }
  };

  var decreaseTableN = function increaseN() {
    var table = $("#JointProbGrid").get(0);
    var n = table.rows.length - 1;
    if(n <= 2) return;
    var row;
    var cell;
    table.deleteRow(-1);
    for (var i = 0; i < n; i++) {
      row = table.rows[i];
      row.deleteCell(-1);
    }
  };

  my.increaseN = function() {
    increaseTableN();
  };

  my.decreaseN = function() {
    decreaseTableN();
  };

  var switchCellOn = function( event ) {
    event.stopPropagation();
    var cell = event.target;
    cell.className = "coloredCell";
    my.coloredCells++;
    console.log(my.coloredCells);
  }

  var switchCellOff = function( event ) {
    event.stopPropagation();
    var cell = event.target;
    cell.className = "uncoloredCell";
    my.coloredCells--;
    console.log(my.coloredCells);
  }

  my.makeTool = function (id) {
    $("#" + id).load("Tool.html", function() {
      my.increaseN(); // Start out 2x2
      $('#JointProbGrid').on('click', '.uncoloredCell', switchCellOn);
      $('#JointProbGrid').on('click', '.coloredCell', switchCellOff);
      console.log("Tool created.");
    });
  };

  return my;
}(EntropyMadeVisible));
console.log("Loaded EntropyTool.js");
}());
