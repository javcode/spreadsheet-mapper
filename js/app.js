var xlsMapperApplication = angular.module('xlsMapperApplication', [
  'ngRoute',
  'angular-js-xlsx'
]);
xlsMapperApplication.config(function($routeProvider) {
  $routeProvider
    .when('/', {
        templateUrl : 'partials/mapper.html',
        controller  : 'mainController'
    })
});
