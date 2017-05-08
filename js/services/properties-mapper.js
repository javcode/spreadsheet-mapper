angular.module('xlsMapperApplication').factory('propertiesMapper', [function($rootScope) {

  function objectTree(options) {
    var keys = Object.keys(options.object);
    for(var i = 0; i < keys.length; i++ ) {
      var key = keys[i];
      var currentFullPath = options.parentPath ? options.parentPath + '.' + key : key;
      var obj = options.object[key];
      if(_.isPlainObject(obj)) {
        objectTree({
          accumulator: options.accumulator,
          object: obj,
          parentPath: currentFullPath
        })
      } else {
        options.accumulator(currentFullPath, obj)
      }
    }
    if(options.done) options.done();
  }

  var mappingColumns = [{
    key: "txDate",
    value: "Transaction Date",
    metadata: {
      label: 'Date format',
      type: 'text'
    }
  },
  {
    key: "txTime",
    value: "Transaction Time",
    metadata: {
      label: 'Date format',
      type: 'text'
    }
  },
  {
    key: "txNumber",
    value: "Transaction number"
  },
  {
    key: "drAmount",
    value: "Debit amount",
    metadata: {
      label: 'DR Flag position',
      type: 'text'
    }
  },
  {
    key: "crAmount",
    value: "Credit amount",
    metadata: {
      label: 'DR Flag position',
      type: 'text'
    }
  },
  {
    key: "balance",
    value: "Balance Amount"
  },
  {
    key: "customerAccount",
    value: "Customer Account"
  },
  {
    key: "customerNumber",
    value: "Customer Number"
  },
  {
    key: "cashType",
    value: "Cash type"
  },
  {
    key: "memo",
    value: "User Memo"
  },
  {
    key: "bankComment",
    value: "Bank Comment"
  }];

  return {
    objectTree: objectTree,
    mappingColumns: mappingColumns
  }
}]);