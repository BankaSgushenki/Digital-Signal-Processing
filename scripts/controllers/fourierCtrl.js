dsp.controller('fourierController', ['$scope', 'transform', 'graph', function ($scope, transform, graph) {
    $scope.data = [];
    $scope.iterations = 0;
    $scope.parameters = {
      expression: 'sin(2x) + cos(2x)',
      N: 64,
      x_max: 6,
      x_min: 0
    }

    $scope.app = {
      state: 'fn',
      checkState: function(state) {
        if(state === this.state) return true;
      }
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

    function scope(t, k, n) {
        return {x: t, k : k, n : n}
    }

    $scope.drawFunction = function() {
      $scope.app.state = 'fn';
      var step =  ($scope.parameters.x_max - $scope.parameters.x_min)/$scope.parameters.N;
      $scope.data = [];
      for (var i = $scope.parameters.x_min; i < $scope.parameters.x_max; i += step) {
        try {
          $scope.data.push({
              x: i,
              y: math.eval($scope.parameters.expression, scope(i))
            });
        }
        catch(e) {}
      }     
      graph.draw($scope.data, "steelblue");
    }

    $scope.fourier = function(expression, transformType, spectrType) {
      $scope.app.state = transformType + spectrType;
      var fourierData = $scope.data.map(function(entry) {return entry.y});

      switch(transformType) {
          case 'dft':
            fourierData = transform.DFT(fourierData);
            $scope.iterations = transform.iterations;
            break;
          case 'fft':
            fourierData = transform.FFT(fourierData);
            $scope.iterations = transform.iterations;
            break;
      }

      $scope.data = fourierData;
      graph.draw(format(fourierData, spectrType), "steelblue");
    }

    $scope.inverseFourier = function() {
        $scope.app.state = 'ift';
        $scope.data = transform.IFFT($scope.data);
        $scope.iterations = 0;

        var step =  ($scope.parameters.x_max - $scope.parameters.x_min)/$scope.parameters.N;
        for (var i = 0; i < $scope.data.length; i++) {
          $scope.data[i] = {x: i*step, y: $scope.data[i].re/$scope.data.length}
        }
        graph.draw($scope.data, "steelblue");
    }

    $scope.$watch('parameters', function(newVal, oldVal){ $scope.drawFunction() }, true);
}]);