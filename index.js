Array.prototype._append = function (x, y) {
  this.push({x: x, y: y})
}

var graph = angular.module('graph', []);

graph.controller('graphController', function ($scope) {
    $scope.data = [];
    $scope.fourierData = [];
    $scope.graphParameters = {
      expression: 'sin(2x) + cos(3x)',
      step: 0.1,
      right: 16,
      left: 0,
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

    function scope(x, k) {
        return {x: x, k : k}
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

    $scope.base = function() {
      drawGraph($scope.data);
    }

    $scope.fourier = function(expression) {
      $scope.fourierData = [];
      for (var i = 0; i < 16; i += 0.1) {
        $scope.fourierData._append(i,math.eval(expression, scope(i)));
      }
      $scope.fourierData = $scope.fourierData.map(function (entry) {
        return {
          x: entry.x,
          y: math.eval('x*e^(-2*PI*i/16)',scope(entry.y, entry.x))
        }
      });
      $scope.fourierData = $scope.fourierData.map(function (entry) {
        return {
          x: entry.x,
          y: math.sqrt(entry.y.re*entry.y.re + entry.y.im*entry.y.im)
        }
      });
      drawGraph($scope.fourierData);
    }

    $scope.$watch('graphParameters', function(newVal, oldVal){
      $scope.data = [];
      for (var i = Number($scope.graphParameters.left); i < Number($scope.graphParameters.right); i += Number($scope.graphParameters.step)) {
        $scope.data._append(i,math.eval($scope.graphParameters.expression, scope(i)));
      }     
      drawGraph($scope.data)
    }, true);
});