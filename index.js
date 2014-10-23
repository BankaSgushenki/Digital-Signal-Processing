Array.prototype._append = function (x, y) {
  this.push({x: x, y: y})
}

var graph = angular.module('graph', []);

graph.controller('graphController', function ($scope) {
    $scope.data = [];
    $scope.graphParameters = {
      expression: 'sin(2x) + cos(x)',
      step: 0.1,
      right: 16,
      left: 0,
    }

    $scope.expression = 'sin(2x) + cos(x)';
    $scope.step = 0.1;

    for (var i = 0; i < 16; i += 0.5) {
        $scope.data._append(i,math.eval($scope.expression, scope(i)));
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

    function scope(x) {
        return {x: x}
    }

    $scope.$watch('graphParameters', function(newVal, oldVal){
      $scope.data = [];
      for (var i = Number($scope.graphParameters.left); i < Number($scope.graphParameters.right); i += Number($scope.graphParameters.step)) {
        $scope.data._append(i,math.eval($scope.graphParameters.expression, scope(i)));
      }
      svg.selectAll("path").remove();
      svg.selectAll("g").remove();

      x.domain(d3.extent($scope.data, function(d) { return d.x; })).nice();
      y.domain(d3.extent($scope.data, function(d) { return d.y; })).nice();

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      svg.append("path")
        .datum($scope.data)
        .attr("class", "line")
        .attr("d", line);
    }, true);
});