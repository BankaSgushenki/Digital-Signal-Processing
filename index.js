Array.prototype._append = function (x, y) {
  this.push({x: x, y: y})
}

var graph = angular.module('graph', []);

graph.controller('graphController', function ($scope) {
    $scope.data = [];
    $scope.iterations = 0;
    $scope.graphParameters = {
      expression: 'sin(2x) + cos(2x)',
      N: 16,
      right: 6,
      left: 0
    }

    $scope.app = {
      state: 'fn',
      checkState: function(state) {
        if(state === this.state) return true;
      }
    }

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    var svg = d3.select(".container").append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scale.linear()
      .range([0, width]);

    var y = d3.scale.linear()
      .range([height, 0]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    var line = d3.svg.line()
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(d.y); });

    function scope(t, k, n) {
        return {x: t, k : k, n : n}
    }

    function drawGraph(data) {
        svg.selectAll("path").remove();
        svg.selectAll("g").remove();
  
        x.domain(d3.extent(data, function(d) { return d.x; })).nice();
        y.domain(d3.extent(data, function(d) { return d.y; })).nice();
  
        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
  
        svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line);
    }

    function DFT(input) {
      var n = input.length;
      var result = [];
      for (var k = 0; k < n; k++) {
          var re = 0;
          var im = 0;
          for (var t = 0; t < n; t++) {
              var angle = 2 * Math.PI * t * k / n;
              re +=  input[t] * Math.cos(angle);
              im += -input[t] * Math.sin(angle);
              $scope.iterations++;
          }
          result.push(math.complex(re, im));
      }
      return result;
    }

    function FFT(input) {
      if (input.length === 1) return input;

      var evenElements = FFT(input.filter(function(element, index) { return (index % 2 === 0)}));
      var oddElements = FFT(input.filter(function(element, index) { return !(index % 2 === 0)}));
      
      var result  = [];
      var N = input.length/2;
      for (var k = 0; k < N; k++) {
            var kth = - k * Math.PI/N;
            var W =  math.complex(Math.cos(kth), Math.sin(kth));
            result[k] = math.add(evenElements[k], math.multiply(W, oddElements[k]));
            result[k + N] = math.subtract(evenElements[k], math.multiply(W, oddElements[k]));
            $scope.iterations+=2;
          }
      return result;
    }

    function IDFT(input) {
      input.forEach(function(x) { 
        x = math.conj(x)
      });
      var result = FFT(input);
      return result;

    }

    function format(input, type) {
      var N = input.length;
      switch(type) {
        case 'phase':
          return input.map(function (entry, index) {
            return {
              x: index/N,
              y: entry.toPolar().phi/N
            }
          });
        case 'amp':
           return input.map(function (entry, index) {
             return {
               x: index/N,
               y: entry.toPolar().r/N
             }
           });
      }
    }

    $scope.drawFunction = function() {
      $scope.app.state = 'fn';
      var step =  ($scope.graphParameters.right - $scope.graphParameters.left)/$scope.graphParameters.N;
      $scope.data = [];
      for (var i = $scope.graphParameters.left; i < $scope.graphParameters.right; i += step) {
        try {
          $scope.data._append(i,math.eval($scope.graphParameters.expression, scope(i)));
        }
        catch(e) {
          console.log(e);
        }
      }     
      drawGraph($scope.data);
    }

    $scope.fourier = function(expression, transformType, spectrType) {
      $scope.app.state = transformType + spectrType;
      var step =  ($scope.graphParameters.right - $scope.graphParameters.left)/$scope.graphParameters.N;
      var fourierData = [];
      $scope.iterations = 0;
      for (var i = $scope.graphParameters.left; i < $scope.graphParameters.right; i += step) {
        fourierData.push(math.eval(expression, scope(i)));
      }

      switch(transformType) {
          case 'dft':
            fourierData = DFT(fourierData);
            break;
          case 'fft':
            fourierData = FFT(fourierData);
            break;
      }

      $scope.data = fourierData;
      var graphData = format(fourierData, spectrType);
      drawGraph(graphData);
    }

    $scope.inverseFourier = function() {
        $scope.app.state = 'ift';
        $scope.data = IDFT($scope.data);
        $scope.iterations = 0;

        var step =  ($scope.graphParameters.right - $scope.graphParameters.left)/$scope.graphParameters.N;
        for (var i = 0; i < $scope.data.length; i++) {
          $scope.data[i] = {x: i*step, y: $scope.data[i].re/$scope.data.length}
        }
        drawGraph($scope.data);
    }

    $scope.$watch('graphParameters', function(newVal, oldVal){ $scope.drawFunction() }, true);
});