angular.module('xlsMapperApplication').controller('mapperController', function($scope, safeApply, propertiesMapper, validationService) {

  $scope.generalMapping = {
    headerRow: 0
  }
  $scope.sheets = [];
  $scope.columns = propertiesMapper.mappingColumns;

  $scope.apply = function() {
    safeApply($scope);
  }

  $scope.isTouchedAndInvalid = validationService.isTouchedAndInvalid;

  $scope.read = function (workbook) {
    convertToTable(workbook);
    window.workbook = workbook;
  }

  $scope.error = function (e) {
    console.log(e);
  }
  
  function convertToTable(workbook) {
    var table = {
      sheets: []
    };
    _.each(workbook.SheetNames, function(sheetName) {
      var sheet = workbook.Sheets[sheetName];
      var rawData = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        range: 'A1-AAA50'
      });

      if(rawData.length > 1) {
        var tableSheet = {
          title: sheetName,
          header: rawData[0],
          data: rawData,
          maxColumns: _.max(_.map(rawData,function(row) { return row.length }))
        };
        table.sheets.push(tableSheet);
      }

    });
    if(table.sheets.length > 0) {
      $scope.workbook = table;
      console.log(table)
      safeApply($scope);
      $(".sheets-doublescroll").doubleScroll();
    }
  }

  $scope.showMetadata = function(sheetTitle, columnIndex) {
    var columnMapped = _.get($scope.sheets, sheetTitle + '.mappings.' + columnIndex + '.value');
    if(_.isNil(columnMapped)) {
      return false;
    } else {
      var column = _.find($scope.columns, { key: columnMapped });
      return column.metadata;
    }
  }

  $scope.getMetadata = function(sheetTitle, columnIndex) {
    var columnMapped = _.get($scope.sheets, sheetTitle + '.mappings.' + columnIndex + '.value');
    if(_.isNil(columnMapped)) {
      return {}
    } else {
      var column = _.find($scope.columns, { key: columnMapped });
      return column.metadata;
    }
  }

  $scope.loopRange = function(min, max, step) {
    step = step || 1;
    var input = [];
    for (var i = min; i <= max; i += step) {
        input.push(i);
    }
    return input;
  };

  var map = function(obj) {
    var result = {};
    _.each(obj, function(element, index) {
      var newElement = {
        index: index,
        metadata: element.metadata
      };
      if(result[element.value]) {
        if(_.isArray(result[element.value])) {
          result[element.value].push(newElement);
        } else {
          result[element.value] = [
            result[element.value],
            newElement
          ]
        }
      } else {
        result[element.value] = newElement;
      }
    })
    return result;
  };

  function readMappings(sheetName) {
    var sheet = $scope.sheets[sheetName];
    var mappings = map(sheet.mappings);
    var sheetData = _.find($scope.workbook.sheets, { title: sheetName}).data;

    var memos = mappings.memo && mappings.memo.length ? 
      _.map(mappings.memo, 'index') : _.get(mappings, 'memo.index');
    var bankComments = mappings.bankComment && mappings.bankComment.length ? 
      _.map(mappings.bankComment, 'index') : _.get(mappings, 'bankComment.index');

    var properties = {
      parser: $scope.generalMapping.parser,
      template: $scope.generalMapping.parser + '_' + $scope.generalMapping.template,
      header: sheetData[sheet.headerRow].join(','),
      summary: {
        le: {
          account: 'asd',
          name: 'asd'
        },
        currency: 'asd'
      },
      trx: {
        date: {
          position: _.get(mappings, 'txDate.index,'),
          format: _.get(mappings, 'txDate.metadata')
        },
        time: {
          position: _.get(mappings, 'txTime.index,'),
          format: _.get(mappings, 'txTime.metadata')
        },
        number: {
          position: _.get(mappings, 'txNumber.index')
        }
      },
      dr: {
        amount: {
          position: _.get(mappings, 'drAmount.index')
        },
        flag: {
          position: _.get(mappings, 'drAmount.metadata')
        }
      },
      cr: {
        amount: {
          position: _.get(mappings, 'crAmount.index')
        },
        flag: {
          position: _.get(mappings, 'crAmount.metadata')
        }
      },
      balance: {
        amount: {
          position: _.get(mappings, 'balance.index')
        }
      },
      customer: {
        account: {
          position: _.get(mappings, 'customerAccount.index')
        },
        name: {
          position: _.get(mappings, 'customerNumber.index')
        }
      },
      cash: {
        type: {
          position: _.get(mappings, 'cashType.index')
        }
      },
      user: {
        memo: {
          positions: memos
        }
      },
      bank: {
        comment: {
          positions: bankComments
        }
      }
    }
    return properties;
  }

  $scope.createMappinsFile = function(sheetName) {
    var properties = readMappings(sheetName)
    
    var results = []
    if($scope.generalMapping.bank) { results.push('bank=' + $scope.generalMapping.bank); }

    var options = {
      object: properties,
      accumulator: function(key, value) {
        if(value) {
          results.push(key + '=' + value);
        }
      },
      done: function() {
        $scope.outputFile = results.join('\n')
        safeApply($scope);
      }
    }
    propertiesMapper.objectTree(options);
  }

  $scope.downloadPropertiesFile = function() {
    var binaryFile = btoa(unescape(encodeURIComponent($scope.outputFile)));
    //var binaryFile = btoa($scope.outputFile);
    var inlineDataFile = "data:application/octet-stream;charset=utf-8;base64," + binaryFile;
    window.open(inlineDataFile);
  }

});