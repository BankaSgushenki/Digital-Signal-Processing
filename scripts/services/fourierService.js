dsp.service('transform', function() {
  this.iterations = 0;

  this.DFT = function (input) {
    this.iterations = 0;
    var n = input.length,
      result = [];
      for (var k = 0; k < n; k++) {
          var re = 0;
          var im = 0;
          for (var t = 0; t < n; t++) {
              var angle = 2 * Math.PI * t * k / n;
              re +=  input[t] * Math.cos(angle);
              im += -input[t] * Math.sin(angle);
              this.iterations++;
          }
          result.push(math.complex(re, im));
      }
    return result;
  }

  this.FFT = function (input) {
      if (input.length === 1) return input;

      var evenElements = this.FFT(input.filter(function(element, index) { return (index % 2 === 0)}));
      var oddElements = this.FFT(input.filter(function(element, index) { return !(index % 2 === 0)}));
      
      var result  = [];
      var N = input.length/2;
      for (var k = 0; k < N; k++) {
            var kth = - k * Math.PI/N;
            var W =  math.complex(Math.cos(kth), Math.sin(kth));
            result[k] = math.add(evenElements[k], math.multiply(W, oddElements[k]));
            result[k + N] = math.subtract(evenElements[k], math.multiply(W, oddElements[k]));
            this.iterations+=2;
          }
      return result;
  }

  this.IFFT = function (input) {
      input.forEach(function(x) { 
        x = math.conj(x)
      });
      var result = this.FFT(input);
      return result;
  }
});