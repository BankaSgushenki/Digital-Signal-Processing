dsp.controller('fourierController', ['$scope', 'transform', 'graph', function ($scope, transform, graph) {
    $scope.data = [];
    $scope.iterations = 0;
    $scope.parameters = {
      expression: ['sin(2x) + cos(2x)', ''],
      N: 256,
      x_max: 30,
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
      graph.clear();
      var step =  ($scope.parameters.x_max - $scope.parameters.x_min)/$scope.parameters.N;
      $scope.data = [];

      $scope.parameters.expression.forEach(function(entry, index) {
          var temp = [];
          for (var i = $scope.parameters.x_min; i < $scope.parameters.x_max; i += step) {
            try {
              temp.push({
                  x: i,
                  y: math.eval(entry, scope(i))
                });
            }
            catch(e) {}
      }
      graph.draw(temp, index);
      $scope.data.push(temp); 
      });
    }

    //Correlation and convolution start here

    $scope.convolution_fft = function() {
      $scope.app.state = 'cnv';
      var fourierData1 = $scope.data[0].map(function(entry) {return entry.y});
      var fourierData2 = $scope.data[1].map(function(entry) {return entry.y});

      fourierData1 = transform.FFT(fourierData1);
      fourierData2 = transform.FFT(fourierData2);

      var result = [];
      for (var i = 0; i < fourierData1.length; i++) {
         result[i] = math.multiply(fourierData1[i], fourierData2[i]); 
      }
      var convData = transform.IFFT(result); 

      var step =  ($scope.parameters.x_max - $scope.parameters.x_min)/$scope.parameters.N;
      for (var i = 0; i < convData.length; i++) {
         convData[i] = {x: i*step, y: convData[i].re/convData.length}
      }
      graph.clear();
      graph.draw(convData, 0);
    }

    $scope.convolution_base = function() {
      $scope.app.state = 'cnv-base';
      var data1 = $scope.data[0].map(function(entry) {return entry.y});
      var data2 = $scope.data[1].map(function(entry) {return entry.y});
      console.log(data1);
      console.log(data2);
      var N = data1.length;
      var result = [];
      for(var m = 0; m < N; m++) {
        result[m] = 0;
        for(var h = 0; h < N; h++)
        {
          if (m - h >= 0) {
            result[m] += data1[h] * data2[m - h];
          }
          else {
            result[m] += data1[h] * data2[m - h + N];
          }
        }
        result[m] = result[m]/N;
      }
      var convData = result.map(function(entry, index) {
        return {
          x: index,
          y: entry
        }
      });

      graph.clear();
      graph.draw(convData, 0);
    }

    $scope.correlation_fft = function() {
      $scope.app.state = 'cor';
      var fourierData1 = $scope.data[0].map(function(entry) {return entry.y});
      var fourierData2 = $scope.data[1].map(function(entry) {return entry.y});

      fourierData1 = transform.FFT(fourierData1);
      fourierData2 = transform.FFT(fourierData2);

      var result = [];
      for (var i = 0; i < fourierData1.length; i++) {
         result[i] = math.multiply(math.conj(fourierData1[i]), fourierData2[i]); 
      }
      var convData = transform.IFFT(result); 

      var step =  ($scope.parameters.x_max - $scope.parameters.x_min)/$scope.parameters.N;
      for (var i = 0; i < convData.length; i++) {
         convData[i] = {x: i*step, y: convData[i].re/convData.length}
      }
      graph.clear();
      graph.draw(convData, 0);
    }

    $scope.correlation_base = function() {
      $scope.app.state = 'cor-base';
      var data1 = $scope.data[0].map(function(entry) {return entry.y});
      var data2 = $scope.data[1].map(function(entry) {return entry.y});
      console.log(data1);
      console.log(data2);
      var N = data1.length;
      var result = [];
      for(var m = 0; m < N; m++) {
        result[m] = 0;
        for(var h = 0; h < N; h++)
        {
          if (m + h < N) {
            result[m] += data1[h] * data2[m + h];
          }
          else {
            result[m] += data1[h] * data2[m + h - N];
          }
        }
        result[m] = result[m]/N;
      }
      var convData = result.map(function(entry, index) {
        return {
          x: index,
          y: entry
        }
      });

      graph.clear();
      graph.draw(convData, 0);
    }

    //Correlation and convolution end here

    //walsh here
    $scope.walsh = function(dir) {
      $scope.app.state = "Walsh" + dir;
      var input = $scope.data[0].map(function(entry) {return entry.y});
      var result = transform.walsh(input, dir);
      console.log(result);

      for (var i = 0; i < result.length; i++) {
        $scope.data[0][i] = {x: i, y: result[i]}
      }

      graph.clear();
      graph.draw($scope.data[0], dir);
    }

    //walsh is over

    $scope.fourier = function(expression, transformType, spectrType) {
      $scope.app.state = transformType + spectrType;
      var fourierData = $scope.data[0].map(function(entry) {return entry.y});

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
      graph.clear();
      $scope.data[0] = fourierData;
      graph.draw(format(fourierData, spectrType), 0);
    }

    $scope.inverseFourier = function() {
        $scope.app.state = 'ift';
        $scope.data[0] = transform.IFFT($scope.data[0]);
        $scope.iterations = 0;

        var step =  ($scope.parameters.x_max - $scope.parameters.x_min)/$scope.parameters.N;
        for (var i = 0; i < $scope.data[0].length; i++) {
          $scope.data[0][i] = {x: i*step, y: $scope.data[0][i].re/$scope.data[0].length}
        }
        graph.clear();
        graph.draw($scope.data[0], 0);
    }

    $scope.$watch('parameters', function(newVal, oldVal){ $scope.drawFunction() }, true);
}]);