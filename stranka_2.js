/**
 * Created by Slaaavo on 30.10.2015.
 */
function parseMortgages() {
    var crudes = $('.hypoteka');
    var mortgages = [];
    for (var i = 0, len = crudes.length; i < len; i++) {
        var mortgage = {}, crude = $(crudes[i]);
        mortgage.id = crude.attr('id');
        mortgage.splatka = parseInt(crude.find('.splatka').find('.hodnota').text().replace(" ", ""));
        mortgage.urok = parseFloat(crude.find('.urok').find('.hodnota').text().replace(",", "."));
        mortgage.fixacia = parseInt(crude.find('.fixacia').find('.hodnota').text().replace(" ", ""));
        mortgage.preplatenie = parseInt(crude.find('.preplatenie').find('.hodnota').text().replace(" ", ""));
        mortgage.banka = crude.find('.banka').text();
        var hodnotenie = crude.find('.hodnotenie-cislo').text();
        hodnotenie = parseFloat(hodnotenie.substring(0, hodnotenie.indexOf('/')).replace(",", "."));
        mortgage.hodnotenie = hodnotenie;
        mortgages.push(mortgage);
    }
    return mortgages;
}

function sortMortgages(mortgages, criterium, asc) {
    if (asc) {
        return mortgages.sort(function (b, a) {
            return parseFloat(a[criterium]) - parseFloat(b[criterium]);
        });
    } else {
        return mortgages.sort(function (a, b) {
            return parseFloat(a[criterium]) - parseFloat(b[criterium]);
        });
    }
}

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function buildComparisonRow(mortgages, rowName, propertyName, bestMax) {
    var row = $('<tr><td>' + rowName + '</td></tr>');
    var i = 0, min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY;
    _.forEach(mortgages, function (m) {
        row.append($('<td id='+propertyName+i+'>' + m[propertyName] + '</td>'));
        if (m[propertyName] < min) {
            min = i;
        }
        if (m[propertyName] > max) {
            max = i;
        }
        i++;
    });
    if (bestMax) {
        row.find('#' + propertyName + max).addClass('best');
        row.find('#' + propertyName + min).addClass('worst');
    } else {
        row.find('#' + propertyName + max).addClass('worst');
        row.find('#' + propertyName + min).addClass('best');
    }

    return row;
}

function buildComparisonTable(mortgages) {
    var table;
    if (mortgages.length > 1) {
        table = $('<table class="table"></table>');
        var banks = $('<tr><th></th></tr>');
        _.forEach(mortgages, function (m) {
            banks.append($('<th>' + m.banka + '</th>'));
        });
        table.append(banks);
        table.append(buildComparisonRow(mortgages, 'Splatky', 'splatka', false));
        table.append(buildComparisonRow(mortgages, 'Fixacie', 'fixacia', true));
        table.append(buildComparisonRow(mortgages, 'Uroky', 'urok', false));
        table.append(buildComparisonRow(mortgages, 'Preplatenia', 'preplatenie', false));
    } else {
        table = $('<h3>Vyberte si aspon dve hypoteky</h3>');
    }
    return table;
}

function filterCheckedMortgages(mortgages) {
    var checked = [];
    _.forEach(mortgages, function (m) {
        if ($('#' + m.id + ' [type=\'checkbox\']').prop('checked')) {
            checked.push(m);
        }
    });
    return checked;
}

$(document).ready(function () {

    $('#navbar').load('navbar.html');

    mortgages = parseMortgages();

    $('.zoradenie').on('click', 'button', function (e) {
        e.preventDefault();
        var that = $(this), asc;
        that.addClass('active');
        if (that.hasClass('dropup')) asc = true;
        asc ? that.removeClass('dropup') : that.addClass('dropup');
        that.siblings('.btn').removeClass('dropup active');

        var sortedMortgages = sortMortgages(mortgages, that.data('sort'), asc);
        for (var i = 0, len = sortedMortgages.length; i < len; i++) {
            $('.hypoteky').append($('#' + sortedMortgages[i].id));
        }

    });

    $(document).on('click', '.porovnaj-btn', function (e) {
        var dialog = $('#porovnajDialog');
        dialog.empty();
        dialog.html(buildComparisonTable(filterCheckedMortgages(mortgages)));
        dialog.dialog('open');
    });

    var porovnajBtn = $('#porovnajBtn');
    var movePorovnajBtn = debounce(function (e) {
        if ($(this).scrollTop() > 150) {
            porovnajBtn.addClass('fixed');
        } else {
            porovnajBtn.removeClass('fixed');
        }
    }, 10);

    $(document).on('scroll', movePorovnajBtn);

    $('#porovnajDialog').dialog({
        draggable: false,
        resizable: false,
        width: 700,
        modal: true,
        autoOpen: false,
        buttons: {
            "Zatvorit": function () {
                $(this).dialog('close');
            }
        }
    });
});