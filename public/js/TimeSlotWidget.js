"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Created by vkaza on 2018/4/18.
 */
var TimeSlotWidget =
/*#__PURE__*/
function () {
  function TimeSlotWidget($container) {
    var _this = this;

    _classCallCheck(this, TimeSlotWidget);

    this.$container = $container;
    this.$container.attr('id', 'widget-container');
    this.$pickerContainer = $('<div id="picker-container"></div>');
    this.$presenterContainer = $('<div id="presenter-container"></div>');
    this.$priorityContainer = $('<div id="priority-container"></div>');
    this.$priorityContainer.append($('<div> <a class="btn-floating btn-large waves-effect waves-light green" id="btn-p1">Free</a> </div>')).append($('<div> <a class="btn-floating btn-large waves-effect waves-light blue" id="btn-p2">OK</a> </div>')).append($('<div> <a class="btn-floating btn-large waves-effect waves-light yellow" id="btn-p3">Busy</a> </div>'));
    this.$priorityContainer.find('#btn-p1').click(function () {
      _this.currentPriority = 1;
    });
    this.$priorityContainer.find('#btn-p2').click(function () {
      _this.currentPriority = 2;
    });
    this.$priorityContainer.find('#btn-p3').click(function () {
      _this.currentPriority = 3;
    });
    this.$container.append(this.$priorityContainer).append(this.$pickerContainer).append(this.$presenterContainer);
    this.currentPriority = 1;
    this.slotData = [];
  }

  _createClass(TimeSlotWidget, [{
    key: "renderPicker",
    value: function renderPicker(slotList) {
      this.slotData = _.cloneDeep(slotList);
      this.$pickerContainer.empty();
      var $pickerTable = $('<table id="picker-table"></table>');
      this.$pickerContainer.append($pickerTable); // Paint table

      var $firstRow = $('<tr class="firstRow"></tr>').append('<td></td>');
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = slotList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _slot = _step.value;
          $firstRow.append($("<td>".concat(_slot.date, "</td>")).attr('data-date', _slot.date));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      $firstRow.find('td').addClass('unselectable');
      $pickerTable.append($firstRow);

      for (var i = 16; i < 41; i++) {
        var $row = $('<tr></tr>');
        $row.append("<td class=\"unselectable\">".concat(i % 2 === 0 ? parseInt(i / 2) : '', "</td>"));
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = slotList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var slot = _step2.value;
            var disabled = i < slot.startTime || i > slot.endTime;
            $row.append($("<td class=\"".concat(disabled ? 'disabled' : '', "\"></td>")).attr('data-date', slot.date).attr('data-index', i));
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        $pickerTable.append($row);
      } // Bind events


      var isMouseDown = false;
      var isSelecting = true;
      var startRowIndex = null;
      var startCellIndex = null;
      var self = this;

      function selectTo(cell) {
        var row = cell.parent();
        var cellIndex = cell.index();
        var rowIndex = row.index();
        var rowStart, rowEnd, cellStart, cellEnd;

        if (rowIndex < startRowIndex) {
          rowStart = rowIndex;
          rowEnd = startRowIndex;
        } else {
          rowStart = startRowIndex;
          rowEnd = rowIndex;
        }

        if (cellIndex < startCellIndex) {
          cellStart = cellIndex;
          cellEnd = startCellIndex;
        } else {
          cellStart = startCellIndex;
          cellEnd = cellIndex;
        }

        for (var _i = rowStart; _i <= rowEnd; _i++) {
          var rowCells = $pickerTable.find("tr").eq(_i).find("td");

          for (var j = cellStart; j <= cellEnd; j++) {
            if (isSelecting) rowCells.eq(j).addClass("selected").addClass("priority-".concat(self.currentPriority));else rowCells.eq(j).removeClass("selected").removeClass();
          }
        }
      }

      $pickerTable.find("td").mousedown(function (e) {
        var cell = $(this);
        if (cell.hasClass('unselectable') || cell.hasClass('disabled')) return false;
        isMouseDown = true;
        isSelecting = !cell.hasClass('selected');

        if (e.shiftKey) {
          selectTo(cell);
        } else {
          if (isSelecting) cell.addClass("selected").addClass("priority-".concat(self.currentPriority));else cell.removeClass('selected').removeClass();
          startCellIndex = cell.index();
          startRowIndex = cell.parent().index();
        }

        return false; // prevent text selection
      }).mouseover(function () {
        if (!isMouseDown) return;
        var cell = $(this);
        if (cell.hasClass('unselectable') || cell.hasClass('disabled')) return;
        selectTo($(this));
      }).bind("selectstart", function () {
        return false;
      });
      $(document).mouseup(function () {
        isMouseDown = false;
      });
    }
  }, {
    key: "getPickerData",
    value: function getPickerData() {
      var res = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.slotData[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var slot = _step3.value;
          var colGrid = this.$pickerContainer.find("td[data-date=\"".concat(slot.date, "\"]"));
          var arr = [];

          for (var i = 0; i < 48; i++) {
            arr.push(0);
          }

          for (var _i2 = 16; _i2 < 41; _i2++) {
            var $ele = $(colGrid[_i2 - 16]);

            if ($ele.hasClass('selected')) {
              if ($ele.hasClass('priority-1')) arr[_i2] = 3;else if ($ele.hasClass('priority-2')) arr[_i2] = 2;else if ($ele.hasClass('priority-3')) arr[_i2] = 1;
            }
          }

          res.push({
            date: slot.date,
            slotScoreList: arr
          });
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return res;
    }
  }, {
    key: "renderPresenter",
    value: function renderPresenter(data) {
      this.$presenterContainer.empty();
      var $presenterTable = $('<table id="presenter-table"></table>');
      this.$presenterContainer.append($presenterTable); // Find maximum value

      var maxV = 0;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = data[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _item = _step4.value;
          maxV = Math.max(maxV, _.max(_item.scoreList));
        } // Paint table

      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      var $firstRow = $('<tr class="firstRow"></tr>').append('<td></td>');
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = data[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var slot = _step5.value;
          $firstRow.append($("<td>".concat(slot.date, "</td>")));
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      $firstRow.find('td').addClass('unselectable');
      $presenterTable.append($firstRow);

      for (var i = 16; i < 41; i++) {
        var $row = $('<tr></tr>');
        $row.append("<td class=\"unselectable\">".concat(i % 2 === 0 ? parseInt(i / 2) : '', "</td>"));
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = data[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var item = _step6.value;
            var clr = item.scoreList[i] / maxV;
            var $td = $("<td style=\"background-color: ".concat(d3.interpolateBlues(clr), "\"></td>"));
            $row.append($td);
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }

        $presenterTable.append($row);
      }
    }
  }]);

  return TimeSlotWidget;
}();

var TimeSlotSelector =
/*#__PURE__*/
function () {
  function TimeSlotSelector($container) {
    _classCallCheck(this, TimeSlotSelector);

    this.$container = $container;
    this.$container.attr('id', 'widget-container');
    this.$presenterContainer = $('<div id="presenter-container"></div>');
    this.$container.append(this.$presenterContainer);
    this.dateTime = "";
  }

  _createClass(TimeSlotSelector, [{
    key: "renderPresenter",
    value: function renderPresenter(data) {
      var _this2 = this;

      this.$presenterContainer.empty();
      var $presenterTable = $('<table id="presenter-table"></table>');
      this.$presenterContainer.append($presenterTable); // Find maximum value

      var maxV = 0;
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = data[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var _item2 = _step7.value;
          maxV = Math.max(maxV, _.max(_item2.scoreList));
        } // Paint table

      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      var $firstRow = $('<tr class="firstRow"></tr>').append('<td></td>');
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = data[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var slot = _step8.value;
          $firstRow.append($("<td>".concat(slot.date, "</td>")));
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      $firstRow.find('td').addClass('unselectable');
      $presenterTable.append($firstRow);

      for (var i = 16; i < 41; i++) {
        var $row = $('<tr></tr>');
        $row.append("<td class=\"unselectable\">".concat(i % 2 === 0 ? parseInt(i / 2) : '', "</td>"));
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = data[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var item = _step9.value;
            var clr = item.scoreList[i] / maxV;
            var time = i % 2 === 0 ? "".concat(parseInt(i / 2), ":00") : "".concat(parseInt(i / 2), ":30");
            var $td = $("<td style=\"background-color: ".concat(d3.interpolateBlues(clr), "\" data-datetime=\"").concat(item.date, " ").concat(time, "\"></td>"));
            $td.addClass('tooltipped').attr('data-position', 'top').attr('data-tooltip', "".concat(item.date, " ").concat(time));
            $row.append($td);
            $td.click(function (e) {
              var $ele = $(e.target);
              _this2.dateTime = $ele.attr('data-datetime');
              $('td').removeClass('selected');
              $ele.addClass('selected');
            });
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }

        $presenterTable.append($row);
      }

      $('.tooltipped').tooltip({
        enterDelay: 50,
        inDuration: 100,
        outDuration: 100
      });
    }
  }]);

  return TimeSlotSelector;
}();