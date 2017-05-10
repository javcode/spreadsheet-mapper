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
    key: "trx.date.position",
    value: "Transaction Date",
    metadata: {
      label: 'Date format',
      type: 'text',
      key: 'trx.date.format'
    }
  },
  {
    key: "trx.time.position",
    value: "Transaction Time",
    metadata: {
      label: 'Date format',
      type: 'text',
      key: 'trx.time.format'
    }
  },
  {
    key: "trx.number.position",
    value: "Transaction number"
  },
  {
    key: "dr.amount.position",
    value: "Debit amount",
    metadata: {
      label: 'DR Flag position',
      type: 'text',
      key: 'dr.flag.position'
    }
  },
  {
    key: "cr.amount.position",
    value: "Credit amount",
    metadata: {
      label: 'DR Flag position',
      type: 'text',
      key: 'cr.flag.position'
    }
  },
  {
    key: "balance.amount.position",
    value: "Balance Amount"
  },
  {
    key: "customer.account.position",
    value: "Customer Account"
  },
  {
    key: "customer.name.position",
    value: "Customer Name"
  },
  {
    key: "cash.type.position",
    value: "Cash type"
  },
  {
    key: "user.memo.positions",
    value: "User Memo"
  },
  {
    key: "bank.comment.positions",
    value: "Bank Comment"
  }];

  return {
    objectTree: objectTree,
    mappingColumns: mappingColumns
  }
}]);