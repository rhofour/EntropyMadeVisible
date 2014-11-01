var EntropyMadeVisible = {}; // Declare this to be global
(function(){
"use strict";
EntropyMadeVisible = (function(my) {
  my.coloredCells = 0;
  my.colorGrid = [[]]; // Stores the color in each cell (with 0 being none)
  my.colorGrid[1] = []
  my.colorGrid[1][1] = 0;
  my.xProbs = [];
  my.yProbs = [];
  var n = 1;

  var increaseTableN = function() {
    var table = $("#JointProbGrid").get(0);
    var row;
    var cell;
    // Add new column header
    row = table.rows[0];
    var th = document.createElement('th');
    th.innerHTML = "" + n;
    th.className = "jointProbHeader";
    row.appendChild(th);

    // Add new column
    for (var i = 1; i < n; i++) {
      row = table.rows[i];
      cell = row.insertCell(-1);
      cell.innerHTML = "o";
      cell.className = "uncoloredCell";
      my.colorGrid[i][n] = 0;
    }
    // Add new row
    row = table.insertRow(-1);
    // Add new row header
    var th = document.createElement('th');
    th.innerHTML = "" + n;
    th.className = "jointProbHeader";
    row.appendChild(th);
    my.colorGrid[n] = [];
    for (var i = 0; i < n; i++) {
      cell = row.insertCell(-1);
      cell.innerHTML = "o";
      cell.className = "uncoloredCell";
      my.colorGrid[n][i+1] = 0;
    }
  };

  var decreaseTableN = function() {
    var table = $("#JointProbGrid").get(0);
    var row;
    var cell;
    // Unset all cells in last row before deleting it
    for (var i = 1; i <= n+1; i++) {
      if (my.colorGrid[n+1][i] > 0) {
        my.colorGrid[n+1][i] = 0;
        my.coloredCells--;
      }
    }
    table.deleteRow(-1);
    for (var i = 0; i < n+1; i++) {
      row = table.rows[i];
      // Unset each cell before deleting it
      if (my.colorGrid[i][n+1] > 0) {
        my.colorGrid[i][n+1] = 0;
        my.coloredCells--;
      }
      row.deleteCell(-1);
    }
  };

  var resizeColumns = function (id) {
    var hist = $(id).get(0);
    var totalWidth = 98/n;
    var spacing = 0.05 * totalWidth;
    for(var i = 1; i <= n; i++) {
      var bar = hist.getElementById("bar" + i);
      bar.setAttributeNS(null, "width", totalWidth - 2*spacing);
      // Account for Y-axis, space column has, and colum spacing in placement
      bar.setAttributeNS(null, "x", 2 + totalWidth*(i-1) + spacing);
    }
  }

  var increaseHistN = function (id) {
    var hist = $(id).get(0);
    var totalWidth = 98/n;
    var spacing = 0.05 * totalWidth;
    for(var i = 1; i < n; i++) {
      var bar = hist.getElementById("bar" + i);
      bar.setAttributeNS(null, "width", totalWidth - 2*spacing);
      // Account for Y-axis, space column has, and colum spacing in placement
      bar.setAttributeNS(null, "x", totalWidth*(i-1) + spacing);
    }
    var bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bar.setAttributeNS(null, "id", "bar" + n);
    bar.setAttributeNS(null, "y", 98);
    bar.setAttributeNS(null, "height", 0);
    bar.setAttributeNS(null, "style", "fill:rgb(255,0,0);stroke-width:0");
    hist.appendChild(bar);
    resizeColumns(id);
  }

  var decreaseHistN = function (id) {
    var bar = hist.getElementById("bar" + (n+1));
    hist.removeChild(bar);
    resizeColumns(id);
  }

  var changeHist = function (id, probs) {
    var hist = $(id).get(0);
    for (var i = 1; i <= n; i++) {
      var height = 98 * probs[i];
      var bar = hist.getElementById("bar" + i);
      bar.setAttributeNS(null, "height", height);
      bar.setAttributeNS(null, "y", 98 - height);
    }
  }

  var recalcProbs = function () {
    if(my.coloredCells == 0) { // Make histograms empty in this case
      var probs = [];
      for (var i = 1; i <= n; i++) {
        probs[i] = 0;
      }
      my.xProbs = probs;
      my.yProbs = probs;
      changeHist("#XHist", probs);
      changeHist("#YHist", probs);
      return;
    }
    // Calculate X probabilities first
    var probs = [];
    for (var i = 1; i <= n; i++) {
      probs[i] = 0;
      for (var j = 1; j <= n; j++) {
        if(my.colorGrid[i][j] > 0) {
          probs[i]++;
        }
      }
      probs[i] = probs[i] / my.coloredCells;
    }
    my.xProbs = probs.slice(0); // Do this to copy the array by value
    changeHist("#XHist", my.xProbs);
    // Calculate Y probabilities
    for (var i = 1; i <= n; i++) {
      probs[i] = 0;
      for (var j = 1; j <= n; j++) {
        if(my.colorGrid[j][i] > 0) {
          probs[i]++;
        }
      }
      probs[i] = probs[i] / my.coloredCells;
    }
    my.yProbs = probs.slice(0); // Do this to copy the array by value
    changeHist("#YHist", my.yProbs);
  }

  var entropy = function(probs) {
    var ent = 0;
    for (var i = 1; i <= n; i++) {
      var x = Math.log2(probs[i]) * probs[i];
      if(!isNaN(x)) {
        ent = ent + x;
      }
    }
    return -ent;
  }

  var resetStats = function() {
    $("#HX_input").val(entropy(my.xProbs) + " bits");
    $("#HY_input").val(entropy(my.yProbs) + " bits");
  }

  my.increaseN = function() {
    n = n + 1;
    increaseTableN();
    increaseHistN("#XHist");
    increaseHistN("#YHist");
    recalcProbs();
    resetStats();
  };

  my.decreaseN = function() {
    if(n <= 1) return;
    n = n - 1;
    decreaseTableN();
    decreaseHistN("#XHist");
    decreaseHistN("#YHist");
    recalcProbs();
    resetStats();
  };

  var switchCellOn = function( event ) {
    event.stopPropagation();
    var cell = event.target;
    cell.className = "coloredCell";
    my.colorGrid[$(this).parent().index()][$(this).index()] = 1;
    my.coloredCells++;
    recalcProbs();
    resetStats();
  }

  var switchCellOff = function ( event ) {
    event.stopPropagation();
    var cell = event.target;
    cell.className = "uncoloredCell";
    my.colorGrid[$(this).parent().index()][$(this).index()] = 0;
    my.coloredCells--;
    recalcProbs();
    resetStats();
  }

  my.makeTool = function (id) {
    $("#" + id).load("Tool.html", function() {
      my.increaseN(); // Start out 2x2
      $('#JointProbGrid').on('click', '.uncoloredCell', switchCellOn);
      $('#JointProbGrid').on('click', '.coloredCell', switchCellOff);
      $('#HX_input').attr("disabled", "disabled");
      $('#HY_input').attr("disabled", "disabled");
      $('#HXY_input').attr("disabled", "disabled");
      console.log("Tool created.");
    });
  };

  return my;
}(EntropyMadeVisible));
console.log("Loaded EntropyTool.js");
}());
