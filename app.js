'use strict';

angular
  .module('dsp', ['ngRoute'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/fourier.html',
        controller: 'fourierController'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

  var dsp = angular.module('dsp', []);