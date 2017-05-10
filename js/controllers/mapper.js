angular.module('xlsMapperApplication').controller('mapperController', function($scope, safeApply, propertiesMapper, validationService) {

  $scope.generalMapping = {
    headerRow: 0
  }
  $scope.sheets = [];
  $scope.columns = propertiesMapper.mappingColumns;
  $scope.pendingAction = null;

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
      safeApply($scope);
      $(".sheets-doublescroll").doubleScroll();
    }
  }

  $scope.showMetadata = function(sheetTitle, columnIndex) {
    var columnMapped = _.get($scope.sheets, sheetTitle + '.mappings.' + columnIndex + '.value');
    if(_.isNil(columnMapped) || _.isEmpty(columnMapped)) {
      return false;
    } else {
      var column = _.find($scope.columns, { key: columnMapped });
      return column.metadata;
    }
  }

  $scope.getMetadata = function(sheetTitle, columnIndex) {
    var columnMapped = _.get($scope.sheets, sheetTitle + '.mappings.' + columnIndex + '.value');
    if(_.isNil(columnMapped) || _.isEmpty(columnMapped)) {
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
      template: $scope.generalMapping.parser + '_' + _.isNil($scope.generalMapping.template) ? '' : $scope.generalMapping.template,
      header: sheetData[sheet.headerRow].join(','),
      summary: {
        le: {
          account: sheet['summary.le.account'],
          name: sheet['summary.le.name']
        },
        currency: sheet['summary.currency']
      }
    };

    _.each(propertiesMapper.mappingColumns, function(column) {
      var value = mappings[column.key];
      if(value) {
        if(_.isArray(value)) {
          var arrayOfValues = _.map(value, 'index').join(',');
          _.set(properties, column.key, arrayOfValues);
        } else {
          _.set(properties, column.key, value.index);
          if(column.metadata) {
            _.set(properties, column.metadata.key, value.metadata);          
          }
        }
      }
    });

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
    var inlineDataFile = "data:application/octet-stream;charset=utf-8;base64," + binaryFile;
    window.open(inlineDataFile);
  }

  $scope.startCellSelection = function(action) {
    $scope.pendingAction = action;
    safeApply($scope);
  }

  $scope.selectCell = function(sheetTitle, cellValue, column) {
    if($scope.pendingAction) {
      $scope.sheets[sheetTitle][$scope.pendingAction] = '|' + cellValue + '|' + toColumnName(column + 1);
      $scope.pendingAction = null;
      safeApply($scope);
    }
  }

  /**
   * Takes a positive integer and returns the corresponding column name.
   * @param {number} num  The positive integer to convert to a column name.
   * @return {string}  The column name.
   */
  function toColumnName(num) {
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;
  }

});