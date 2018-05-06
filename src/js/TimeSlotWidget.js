/**
 * Created by vkaza on 2018/4/18.
 */

class TimeSlotWidget {
    constructor($container) {
        this.$container = $container;
        this.$container.attr('id', 'widget-container');
        this.$pickerContainer = $('<div id="picker-container"></div>');
        this.$presenterContainer = $('<div id="presenter-container"></div>');
        this.$priorityContainer = $('<div id="priority-container"></div>');

        this.$priorityContainer
            .append($('<div> <a class="btn-floating btn-large waves-effect waves-light green" id="btn-p1">Free</a> </div>'))
            .append($('<div> <a class="btn-floating btn-large waves-effect waves-light blue" id="btn-p2">OK</a> </div>'))
            .append($('<div> <a class="btn-floating btn-large waves-effect waves-light yellow" id="btn-p3">Busy</a> </div>'));

        this.$priorityContainer.find('#btn-p1').click(() => {
            this.currentPriority = 1;
        });
        this.$priorityContainer.find('#btn-p2').click(() => {
            this.currentPriority = 2;
        });
        this.$priorityContainer.find('#btn-p3').click(() => {
            this.currentPriority = 3;
        });

        this.$container.append(this.$priorityContainer)
            .append(this.$pickerContainer)
            .append(this.$presenterContainer);

        this.currentPriority = 1;
        this.slotData = [];
    }

    renderPicker(slotList) {
        this.slotData = _.cloneDeep(slotList);
        this.$pickerContainer.empty();
        const $pickerTable = $('<table id="picker-table"></table>');
        this.$pickerContainer.append($pickerTable);

        // Paint table
        const $firstRow = $('<tr class="firstRow"></tr>').append('<td></td>');
        for (let slot of slotList) {
            $firstRow.append($(`<td>${slot.date}</td>`).attr('data-date', slot.date));
        }
        $firstRow.find('td').addClass('unselectable');
        $pickerTable.append($firstRow);

        for (let i = 16; i < 41; i++) {
            const $row = $('<tr></tr>');
            $row.append(`<td class="unselectable">${(i % 2 === 0 ? parseInt(i / 2) : '')}</td>`);
            for (let slot of slotList) {
                const disabled = i < slot.startTime || i > slot.endTime;
                $row.append($(`<td class="${disabled ? 'disabled' : ''}"></td>`).attr('data-date', slot.date).attr('data-index', i));
            }
            $pickerTable.append($row);
        }

        // Bind events
        let isMouseDown = false;
        let isSelecting = true;
        let startRowIndex = null;
        let startCellIndex = null;
        const self = this;

        function selectTo(cell) {
            let row = cell.parent();
            let cellIndex = cell.index();
            let rowIndex = row.index();

            let rowStart, rowEnd, cellStart, cellEnd;

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

            for (let i = rowStart; i <= rowEnd; i++) {
                let rowCells = $pickerTable.find("tr").eq(i).find("td");
                for (let j = cellStart; j <= cellEnd; j++) {
                    if (isSelecting) rowCells.eq(j).addClass("selected").addClass(`priority-${self.currentPriority}`);
                    else rowCells.eq(j).removeClass("selected").removeClass();
                }
            }
        }

        $pickerTable.find("td").mousedown(function (e) {
            let cell = $(this);
            if (cell.hasClass('unselectable') || cell.hasClass('disabled')) return false;
            isMouseDown = true;


            isSelecting = !cell.hasClass('selected');

            if (e.shiftKey) {
                selectTo(cell);
            } else {
                if (isSelecting) cell.addClass("selected").addClass(`priority-${self.currentPriority}`);
                else cell.removeClass('selected').removeClass();
                startCellIndex = cell.index();
                startRowIndex = cell.parent().index();
            }

            return false; // prevent text selection
        }).mouseover(function () {
                if (!isMouseDown) return;
                const cell = $(this);
                if (cell.hasClass('unselectable') || cell.hasClass('disabled')) return;
                selectTo($(this));
            })
            .bind("selectstart", function () {
                return false;
            });

        $(document).mouseup(function () {
            isMouseDown = false;
        });
    }

    getPickerData() {
        const res = [];
        for (let slot of this.slotData) {
            const colGrid = this.$pickerContainer.find(`td[data-date="${slot.date}"]`);
            const arr = [];
            for (let i = 0; i < 48; i++) arr.push(0);
            for (let i = 16; i < 41; i++) {
                const $ele = $(colGrid[i-16]);
                if ($ele.hasClass('selected')) {
                    if ($ele.hasClass('priority-1')) arr[i] = (3);
                    else if ($ele.hasClass('priority-2')) arr[i] = (2);
                    else if ($ele.hasClass('priority-3')) arr[i] = (1);
                }
            }
            res.push({
                date: slot.date,
                slotScoreList: arr,
            });
        }
        return res;
    }
    
    renderPresenter(data) {
        this.$presenterContainer.empty();
        const $presenterTable = $('<table id="presenter-table"></table>');
        this.$presenterContainer.append($presenterTable);

        // Find maximum value
        let maxV = 0;
        for (let item of data)
            maxV = Math.max(maxV, _.max(item.scoreList));

        // Paint table
        const $firstRow = $('<tr class="firstRow"></tr>').append('<td></td>');
        for (let slot of data) {
            $firstRow.append($(`<td>${slot.date}</td>`));
        }
        $firstRow.find('td').addClass('unselectable');
        $presenterTable.append($firstRow);

        for (let i = 16; i < 41; i++) {
            const $row = $('<tr></tr>');
            $row.append(`<td class="unselectable">${(i % 2 === 0 ? parseInt(i / 2) : '')}</td>`);
            for (let item of data) {
                const clr = item.scoreList[i] / maxV;
                const $td = $(`<td style="background-color: ${d3.interpolateBlues(clr)}"></td>`);
                $row.append($td);
            }
            $presenterTable.append($row);
        }

    }
}

class TimeSlotSelector {
    constructor($container) {
        this.$container = $container;
        this.$container.attr('id', 'widget-container');
        this.$presenterContainer = $('<div id="presenter-container"></div>');
        this.$container.append(this.$presenterContainer);
        this.dateTime = "";
    }

    renderPresenter(data) {
        this.$presenterContainer.empty();
        const $presenterTable = $('<table id="presenter-table"></table>');
        this.$presenterContainer.append($presenterTable);

        // Find maximum value
        let maxV = 0;
        for (let item of data)
            maxV = Math.max(maxV, _.max(item.scoreList));

        // Paint table
        const $firstRow = $('<tr class="firstRow"></tr>').append('<td></td>');
        for (let slot of data) {
            $firstRow.append($(`<td>${slot.date}</td>`));
        }
        $firstRow.find('td').addClass('unselectable');
        $presenterTable.append($firstRow);

        for (let i = 16; i < 41; i++) {
            const $row = $('<tr></tr>');
            $row.append(`<td class="unselectable">${(i % 2 === 0 ? parseInt(i / 2) : '')}</td>`);
            for (let item of data) {
                const clr = item.scoreList[i] / maxV;
                const time = i % 2 === 0 ? `${parseInt(i / 2)}:00` : `${parseInt(i / 2)}:30`;
                const $td = $(`<td style="background-color: ${d3.interpolateBlues(clr)}" data-datetime="${item.date} ${time}"></td>`);
                $td.addClass('tooltipped')
                    .attr('data-position', 'top')
                    .attr('data-tooltip', `${item.date} ${time}`);
                $row.append($td);
                $td.click((e) => {
                    const $ele = $(e.target);
                    this.dateTime = $ele.attr('data-datetime');
                    $('td').removeClass('selected');
                    $ele.addClass('selected');
                })
            }
            $presenterTable.append($row);
        }

        $('.tooltipped').tooltip({
            enterDelay: 50,
            inDuration: 100,
            outDuration: 100,
        });
    }
}