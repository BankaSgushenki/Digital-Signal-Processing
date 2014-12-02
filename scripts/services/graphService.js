dsp.service('graph', function() {
    var color = ['steelblue', 'red', 'green'];
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    var svg = newGraph("svg");

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

    function newGraph(name) {
      var svg = d3.select(".container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      return svg;
    }
    this.clear = function() {
        svg.selectAll("path").remove();
        svg.selectAll("g").remove();
    }

    this.draw = function(data, index) {
  
        x.domain(d3.extent(data, function(d) { return d.x; })).nice();
        if(!index) {
          y.domain(d3.extent(data, function(d) { return d.y; })).nice();
        }
  
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
          .attr("d", line)
          .attr("stroke", color[index]);
    }
});