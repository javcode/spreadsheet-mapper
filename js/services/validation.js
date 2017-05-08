angular.module('xlsMapperApplication').factory('validationService', [function($rootScope) {

  function isTouchedAndInvalid(object) {
    if(object) {
      return object.$invalid && !object.$pristine;
    }
    return false;
  }

  return {
    isTouchedAndInvalid: isTouchedAndInvalid
  }
}]);