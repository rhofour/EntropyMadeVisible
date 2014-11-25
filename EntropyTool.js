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
  my.colors = 1;
  my.findQs = [];
  my.makeQs = [];
  var fixedProbabilities = false;
  var maxColors = 2;
  var n = 1;

  var log2 = function(x) {
    return Math.log(x) / Math.LN2;
  }

  var increaseTableN = function() {
    var table = $("#JointProbGrid").get(0);
    var row;
    var cell;
    // Add new column header
    row = table.rows[0];
    var th = document.createElement('th');
    th.innerHTML = "Y=" + n;
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
    th.innerHTML = "X=" + n;
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
    var histClass = hist.getElementById("bar1").className.baseVal;
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
    bar.setAttributeNS(null, "class", histClass);
    hist.appendChild(bar);
    resizeColumns(id);
  }

  var decreaseHistN = function (id) {
    var hist = $(id).get(0);
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

  var getTotalMass = function () {
    var totalMass = 0;
    for (var i = 1; i <= n; i++) {
      for (var j = 1; j <= n; j++) {
        totalMass = totalMass + my.colorGrid[i][j];
      }
    }
    return totalMass;
  }

  var recalcColorProbs = function () {
    var totalMass = getTotalMass();
    var prob = totalMass == 0 ? 0 : 1/totalMass;
    var colorProbsTable = $("#ColorProbsTable").get(0);
    for(var i = 0; i < my.colors; i++) {
      var row = colorProbsTable.rows[i];
      row.cells[1].innerHTML = prob;
      prob = prob * 2;
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
    var totalMass = getTotalMass();
    for (var i = 1; i <= n; i++) {
      probs[i] = 0;
      for (var j = 1; j <= n; j++) {
        probs[i] = probs[i] + my.colorGrid[i][j];
      }
      if(totalMass > 0) {
        probs[i] = probs[i] / totalMass;
      }
    }
    my.xProbs = probs.slice(0); // Do this to copy the array by value
    changeHist("#XHist", my.xProbs);
    // Calculate Y probabilities
    for (var i = 1; i <= n; i++) {
      probs[i] = 0;
      for (var j = 1; j <= n; j++) {
        probs[i] = probs[i] + my.colorGrid[j][i];
      }
      if(totalMass > 0) {
        probs[i] = probs[i] / totalMass;
      }
    }
    my.yProbs = probs.slice(0); // Do this to copy the array by value
    changeHist("#YHist", my.yProbs);
  }

  var entropy = function(probs) {
    var ent = 0;
    for (var i = 1; i <= n; i++) {
      var x = log2(probs[i]) * probs[i];
      if(!isNaN(x)) {
        ent = ent + x;
      }
    }
    return -ent;
  }

  var jointEntropy = function() {
    var ent = 0;
    var totalMass = 0;
    for (var i = 1; i <= n; i++) {
      for (var j = 1; j <= n; j++) {
        totalMass = totalMass + my.colorGrid[i][j];
      }
    }
    for (var i = 1; i <= n; i++) {
      for (var j = 1; j <= n; j++) {
        var prob = my.colorGrid[i][j] / totalMass;
        var x = log2(prob) * prob; 
        if(!isNaN(x)) {
          ent = ent + x;
        }
      }
    }
    return -ent;
  }

  var mutualInformation = function() {
    var mi = 0;
    var totalMass = getTotalMass();
    for (var i = 1; i <= n; i++) {
      for (var j = 1; j <= n; j++) {
        var prob = my.colorGrid[i][j] / totalMass;
        var x = log2(prob / (my.xProbs[i] * my.yProbs[j])) * prob; 
        if(!isNaN(x)) {
          mi = mi + x;
        }
      }
    }
    return mi;
  }

  var resetStats = function() {
    if(isNaN(my.correctHx)) {
      $("#HX_input").val(entropy(my.xProbs) + " bits");
    }
    if(isNaN(my.correctHy)) {
      $("#HY_input").val(entropy(my.yProbs) + " bits");
    }
    if(isNaN(my.correctHxy)) {
      $("#HXY_input").val(jointEntropy() + " bits");
    }
    if(isNaN(my.correctMi)) {
      $("#MI_input").val(mutualInformation() + " bits");
    }
    for(var i = 0; i < my.makeQs.length; i++) {
      var q = my.makeQs[i];
      var x = q[0] ? getProb(q[1], q[2], q[3], q[4]) : getEntropy(q[1], q[2], q[3], q[4]);
      var id = "#Q_" + q[0] + "_" + q[1] + "_" + q[2] + "_" + q[3] + "_" + q[4];
      $(id).val(x);
      $(id).get(0).className =
        Math.abs(x - q[5]) < 0.01 ? "correctStatDisplay" : "incorrectStatDisplay";
    }
  }

  /* Stolen from:
   * http://math.stackexchange.com/questions/97850/get-the-size-of-an-area-defined-by-2-overlapping-circles */
  function areaOfIntersection(x0, y0, r0, x1, y1, r1) {
    var rr0 = r0*r0;
    var rr1 = r1*r1;
    var c = Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0));
    var phi = (Math.acos((rr0+(c*c)-rr1) / (2*r0*c)))*2;
    var theta = (Math.acos((rr1+(c*c)-rr0) / (2*r1*c)))*2;
    var area1 = 0.5*theta*rr1 - 0.5*rr1*Math.sin(theta);
    var area2 = 0.5*phi*rr0 - 0.5*rr0*Math.sin(phi);
    return area1 + area2;
  }

  var updateVennDiagram = function() {
    var hX = entropy(my.xProbs);
    var hY = entropy(my.yProbs);
    var xCirc = $("#redCircle").get(0);
    var yCirc = $("#greenCircle").get(0);
    // Larger circle is always 70, smaller circle is proportional
    if(hX > hY) {
      var r1 = 70;
      var r2 = hY == 0 ? 0 : 70*(Math.sqrt(hY) / Math.sqrt(hX));
    } else {
      var r2 = hY == 0 ? 0 : 70;
      var r1 = hY == 0 ? 0 : 70*(Math.sqrt(hX) / Math.sqrt(hY));
    }
    xCirc.setAttributeNS(null, "r", r1);
    yCirc.setAttributeNS(null, "r", r2);
    // Numerically find area
    var targetArea = (mutualInformation() / Math.max(hX, hY)) * Math.PI * 70 * 70;
    var lowerD = Math.abs(r1 - r2);
    var upperD = r1 + r2;
    var lowerArea = Math.min(Math.PI * r1*r1, Math.PI * r2*r2);
    var upperArea = 0;
    var d = 0;
    while(r1 > 0 && r2 > 0) {
      if(Math.abs(targetArea - lowerArea) < 1) {
        d = lowerD;
        break;
      } else if(Math.abs(targetArea - upperArea) < 1) {
        d = upperD;
        break;
      }
      var newD = (upperD + lowerD) / 2;
      var newArea = areaOfIntersection(0, 0, r1, newD, 0, r2);
      if(newArea > targetArea) {
        lowerArea = newArea;
        lowerD = newD;
      } else {
        upperArea = newArea;
        upperD = newD;
      }
    }
    var spacing = (1/28) * (r1 + d + r2);
    if(r1 > 0 && r2 > 0) {
      xCirc.setAttributeNS(null, "cx", spacing + r1);
      yCirc.setAttributeNS(null, "cx", spacing + r1 + d);
      $("#VennDiagram").get(0).setAttributeNS(null, "viewBox", "0 0 " + (2*spacing + r1 + d + r2) + " 150");
      $("#vdBorder").get(0).setAttributeNS(null, "width", (2*spacing + r1 + d + r2));
    } else {
      xCirc.setAttributeNS(null, "cx", 100);
      yCirc.setAttributeNS(null, "cx", 200);
      $("#VennDiagram").get(0).setAttributeNS(null, "viewBox", "0 0 300 150");
      $("#vdBorder").get(0).setAttributeNS(null, "width", 300);
    }
  }

  var resetGraphics = function() {
    recalcProbs();
    recalcColorProbs();
    resetStats();
    updateVennDiagram();
  }

  my.increaseN = function() {
    n = n + 1;
    increaseTableN();
    increaseHistN("#XHist");
    increaseHistN("#YHist");
    resetGraphics();
  };

  my.decreaseN = function() {
    if(n <= 1) return;
    n = n - 1;
    decreaseTableN();
    decreaseHistN("#XHist");
    decreaseHistN("#YHist");
    resetGraphics();
  };

  my.increaseColors = function() {
    if(my.colors < maxColors) {
      my.colors = my.colors + 1;
      $("#Ncolors").val(my.colors);
      var colorProbsTable = $("#ColorProbsTable").get(0);
      var row = colorProbsTable.insertRow(-1);
      var cell = row.insertCell(-1);
      cell.innerHTML = "0";
      cell.className = "coloredCell" + my.colors;
      row.insertCell(-1);
      recalcColorProbs();
    }
  };

  my.decreaseColors = function() {
    if(my.colors > 1) {
      my.colors = my.colors - 1;
      $("#Ncolors").val(my.colors);
      // Remove any colors out of this range
      for (var i = 1; i <= n; i++) {
        for (var j = 1; j <= n; j++) {
          if(my.colorGrid[i][j] > my.colors) {
            my.colorGrid[i][j] = my.colors;
            $("#JointProbGrid")[0].rows[i].cells[j].className = "coloredCell" + my.colors;
          }
        }
      }
      resetGraphics();
    }
  };

  var cycleCell = function( event ) {
    event.stopPropagation();
    if(fixedProbabilities) return;
    var cell = event.target;
    if(cell.className == "uncoloredCell") {
      cell.className = "coloredCell1";
      my.colorGrid[$(this).parent().index()][$(this).index()] = 1;
      my.coloredCells++;
    } else {
      var n = my.colorGrid[$(this).parent().index()][$(this).index()];
      if(n < my.colors) {
        cell.className = "coloredCell" + (n+1);
        my.colorGrid[$(this).parent().index()][$(this).index()] = n + 1;
        my.coloredCells++;
      } else {
        cell.className = "uncoloredCell";
        my.colorGrid[$(this).parent().index()][$(this).index()] = 0;
        my.coloredCells--;
      }
    }
    resetGraphics();
  }

  var getProb = function(x, y, givenX, givenY) {
    if(x > n || y > n || givenX > n || givenY > n) return;
    var totalMass = getTotalMass();
    var ans = 0;
    if(isNaN(y)) { // No Y
      if(isNaN(givenY)) { // P(X = x)
        ans = my.xProbs[x];
      } else { // P(X = x|Y = givenY)
        ans = (my.colorGrid[x][givenY] / totalMass) / my.yProbs[givenY];
      }
    } else if(isNaN(x)) { // No X
      if(isNaN(givenX)) { // P(Y = y)
        ans = my.yProbs[y];
      } else { // P(Y = y|X = givenX)
        ans = (my.colorGrid[givenX][y] / totalMass) / my.xProbs[givenX];
      }
    } else { // P(X = q[0], Y = q[1])
      ans = my.colorGrid[x][y] / totalMass;
    }
    if(isNaN(ans)) {
      ans = 0;
    }
    return ans;
  }

  var getEntropy = function(x, y, givenX, givenY) {
    if(x > n || y > n || givenX > n || givenY > n) return;
    var totalMass = getTotalMass();
    if(isNaN(y)) { // No Y
      if(isNaN(givenY)) { // H(X)
        return entropy(my.xProbs);
      } else if(givenY == 0) { // P(X|Y)
        return jointEntropy() - entropy(my.xProbs);
      } else { // H(X|Y = givenY)
        var condProbs = [];
        for(var i = 1; i <= n; i++) {
          condProbs[i] = getProb(i, NaN, NaN, givenY);
        }
        return entropy(condProbs);
      }
    } else if(isNaN(x)) { // No X
      if(isNaN(givenX)) { // H(Y)
        return entropy(my.yProbs);
      } else if(givenX == 0) { // P(Y|X)
        return jointEntropy() - entropy(my.xProbs);
      } else { // P(Y|X = givenX)
        var condProbs = [];
        for(var i = 1; i <= n; i++) {
          condProbs[i] = getProb(NaN, i, givenX, NaN);
        }
        return entropy(condProbs);
      }
    } else { // H(X,Y)
      return jointEntropy();
    }
  }

  var checkAnswers = function() {
    var correct = true;
    for(var i = 0; i < my.findQs.length; i++) {
      var q = my.findQs[i];
      var id = "#Q_" + q[0] + "_" + q[1] + "_" + q[2] + "_" + q[3] + "_" + q[4];
      var ans = parseFloat($(id).val());
      var calculated = 0;
      if(q[0]) {
        calculated = getProb(q[1], q[2], q[3], q[4]);
      } else {
        calculated = getEntropy(q[1], q[2], q[3], q[4]);
      }
      correct = correct && (Math.abs(calculated - ans) < 0.01);
      console.log("Got " + ans + " calculated: " + calculated);
    }
    for(var i = 0; i < my.makeQs.length; i++) {
      var q = my.makeQs[i];
      var id = "#Q_" + q[0] + "_" + q[1] + "_" + q[2] + "_" + q[3] + "_" + q[4];
      correct = correct && $(id).get(0).className == "correctStatDisplay";
    }
    if(correct) {
      alert("Correct!");
    } else {
      alert("Not quite, try again.");
    }
  }

  // This function takes the id of a div and an optional list of parameters and
  // fills the div with our tool
  // params: an array of string options to control the tool created
  // Possible options include:
  // Nx: Sets the default grid size to be x by x (ex: N5 makes a 5x5 grid)
  // Cx: Sets the starting number of colors to be x (ex: C5 starts with 5 colors)
  // fixedSize: disables the buttons to change the size of the grid
  // fixedColors: disables the buttons to change the number of colors
  // TODO: add in findH(X), findH(Y), findH(Y|X=x)
  // TODO: add makeH(X)=x, makeH(Y|X=x)=y, makeH(X,Y)=z, makeMI(X;Y)=z
  // makeP(X=4,Y=2)=0.25
  // findP(X=x): Adds a P(X=x) field to fill in with an answer
  // findP(Y=y): Adds a P(X=x) field to fill in with an answer
  // findP(X=x,Y=y): Adds a P(X=x,Y=y) field to fill in with an answer
  // row<x>:<values> Sets the value of a row
  //  In a 4x4 grid row2:0121 would set row 2 to use those colors
  my.makeTool = function (id, params) {
    if(params === undefined) {
      params = [];
    }
    $("#" + id).load("Tool.html", function() {
      $('#JointProbGrid').on('click', '.uncoloredCell', cycleCell);
      for(var i = 1; i <= maxColors; i++) {
        $('#JointProbGrid').on('click', ('.coloredCell' + i), cycleCell);
      }
      $('#N').attr("disabled", "disabled");
      $("#N").val(n);
      $('#Ncolors').attr("disabled", "disabled");
      $("#Ncolors").val(my.colors);
      // Parse input options
      var targetN = 1;
      var storedRows = [];
      for(var i = 0; i < params.length; i++) {
        var param = params[i];
        if(param[0] == "N") { // Grid size
          targetN = parseInt(param.slice(1));
          if(!(targetN > 1)) {
            targetN = 1;
          }
        } else if(param[0] == "C") { // # of colors
          var targetColors = parseInt(param.slice(1));
          if(!(targetColors > 1)) {
            targetColors = 1;
          }
          for(var j = 1; j < targetColors; j++) {
            my.increaseColors();
          }
        } else if(param == "fixedSize") { // Disable changing grid size
          $("#nPlus").attr("disabled", "disabled");
          $("#nMinus").attr("disabled", "disabled");
        } else if(param == "fixedColors") { // Disable changing grid size
          $("#cPlus").attr("disabled", "disabled");
          $("#cMinus").attr("disabled", "disabled");
        } else if(param == "fixedProbabilities") { // Disable changing probabilities
          fixedProbabilities = true;
        } else if(param.substring(0,6) == "findP(" || param.substring(0,6) == "makeP(" ||
            param.substring(0,6) == "findH(" || param.substring(0,6) == "makeH(") {
          var find = param.substring(0,4) == "find";
          var prob = param[4] == "P";
          var outerParts = param.substring(6).split(')');
          var inner = outerParts[0];
          var parts = inner.split('|');
          var leftInner = parts[0].trim().split(',');
          var x = NaN;
          var y = NaN;
          var givenX = NaN;
          var givenY = NaN;
          var target = NaN;
          if(outerParts[1] !== undefined) {
            target = parseFloat(outerParts[1].substring(1));
          }
          for(var j = 0; j < leftInner.length; j++) {
            var innerParts = leftInner[j].split('=');
            if(innerParts[0].trim() == 'X') {
              x = prob ? parseInt(innerParts[1].trim()) : 0;
            } else if(innerParts[0].trim() == 'Y') {
              y = prob ? parseInt(innerParts[1].trim()) : 0;
            }
          }
          if(parts[1] !== undefined) {
            var rightParts = parts[1].trim().split('=');
            if(rightParts[0].trim() == 'X') {
              givenX = rightParts[1] == undefined ? 0 : parseInt(rightParts[1].trim());
            } else if(rightParts[0].trim() == 'Y') {
              givenY = rightParts[1] == undefined ? 0 : parseInt(rightParts[1].trim());
            }
          }
          console.log("Parsed out: [" + prob + ", " + x + ", " + y + ", " + givenX +
              ", " + givenY + ", " + target + "]");
          if(!isNaN(x) || !isNaN(y)) {
            if(find) {
              my.findQs.push([prob,x,y,givenX,givenY]);
            } else {
              my.makeQs.push([prob,x,y,givenX,givenY,target]);
            }
            var li = document.createElement('li');
            var text = "";
            if(prob) {
              text = text +"P(";
            } else {
              text = text +"H(";
            }
            if(!isNaN(x)) {
              text = text + "X";
              if(prob) {
                text = text + "=" + x;
              }
              if(!isNaN(y)) {
                text = text + ", ";
              }
            }
            if(!isNaN(y)) {
              text = text + "Y";
              if(prob) {
                text = text + "=" + y;
              }
            }
            if(givenX == 0) {
              text = text + "|X";
            } else if(givenX > 0) {
              text = text + "|X=" + givenX;
            }
            if(givenY == 0) {
              text = text + "|Y";
            } else if(givenY > 0) {
              text = text + "|Y=" + givenY;
            }
            text = text + ")";
            if(!isNaN(target)) {
              text = text + "=" + target;
            }
            text = text + ": <input id=\"Q_" + prob + "_" + x + "_" + y + "_" + givenX + "_" + givenY;
            if(find) {
              text = text + "\" class=\"answerInput\" />";
            } else {
              text = text + "\" class=\"incorrectStatDisplay\" />";
            }
            li.innerHTML = text;
            var statDisplay = $("#statList").get(0);
            statDisplay.appendChild(li);
            if(!prob && x == 0 && isNaN(y) && isNaN(givenX) && isNaN(givenY)) {
              $("#HX_li").hide();
            }
            if(!prob && y == 0 && isNaN(x) && isNaN(givenX) && isNaN(givenY)) {
              $("#HY_li").hide();
            }
            if(!prob && x == 0 && y == 0 && isNaN(givenX) && isNaN(givenY)) {
              $("#HXY_li").hide();
            }
          }
        } else if(param.substring(0,3) == "row") {
          var parts = param.slice(3).split(':');
          var row = parseInt(parts[0]);
          storedRows[row] = parts[1];
        }
      }
      console.log("Setting initial size to " + targetN);
      for(var j = 1; j < targetN; j++) {
        my.increaseN();
      }
      var jointProbGrid = $("#JointProbGrid").get(0);
      for(var j = 1; j < storedRows.length; j++) {
        for(var k = 0; k < storedRows[j].length; k++) {
          var x = parseInt(storedRows[j][k]);
          if(x > 0) {
            my.colorGrid[j][k+1] = x;
            jointProbGrid.rows[j].cells[k+1].className = "coloredCell" + x;
            my.coloredCells++;
          }
        }
      }
      $('.statDisplay').attr("disabled", "disabled");
      $('.incorrectStatDisplay').attr("disabled", "disabled");
      $('.correctStatDisplay').attr("disabled", "disabled");
      if(true) {
        // If we have any possible answers display the check answers button
        $('#checkAnswersLi').css("display", "block");
        $('#checkAnswersLi').click(checkAnswers);
      }
      resetGraphics();
      console.log("Tool created.");
    });
  };

  return my;
}(EntropyMadeVisible));
console.log("Loaded EntropyTool.js");
}());
