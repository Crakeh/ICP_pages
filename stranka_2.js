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

function loadMortgage(mortgage) {
    var template = $('<div class="col-md-12 hypoteka"></div>').load('hypoteka.html');
    template.attr('id', mortgage.id);
    template.find('.splatka').find('.hodnota').text(addSpaces(mortgage.splatka));
    template.find('.urok').find('.hodnota').text(mortgage.urok.toString().replace(".", ","));
    template.find('.fixacia').find('.hodnota').text(addSpaces(mortgage.fixacia));
    template.find('.preplatenie').find('.hodnota').text(addSpaces(mortgage.preplatenie));
    template.find('.banka').text(mortgage.banka);
    template.find('.hodnotenie-cislo').text(mortgage.hodnotenie.toString().replace(".", ",") + "/10")
    template.find('img').attr('src', mortgage.imgSrc);
    return template;
}

function addSpaces(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ' ' + '$2');
    }
    return x1 + x2;
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

//mortgages = [
//    {
//        id: 'hypoteka1',
//        splatka: 150,
//        fixacia: 3,
//        urok: 4.5,
//        preplatenie: 15000,
//        hodnotenie: 8,
//        imgSrc: 'zuno_logo.jpg'
//    },
//    {
//        id: 'hypoteka2',
//        splatka: 160,
//        fixacia: 2,
//        urok: 4.55,
//        preplatenie: 15100,
//        hodnotenie: 7.7,
//        imgSrc: 'tatra_banka_logo.png'
//    },
//    {
//        id: 'hypoteka3',
//        splatka: 170,
//        fixacia: 2,
//        urok: 4.56,
//        preplatenie: 15600,
//        hodnotenie: 7.2,
//        imgSrc: 'vub_banka_logo.jpg'
//    }
//];

$(document).ready(function () {

    //$('#navbar').load('navbar.html');

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

    //$('#dalej').on('click', function (e) {
    //    var suma = $('#sumaInput').val();
    //    if (suma > 100000) {
    //        window.location = 'prva_stranka.html#adsfasd'
    //    }
    //});

    //_.forEach(mortgages, function (m) {
    //    $('.hypoteky').append(loadMortgage(m));
    //});

    //for (var i = 0, len = mortgages.length; i < len; i++) {
    //    $('.hypoteky').append(loadMortgage(mortgages[i]));
    //}

    //$(mortgages).each(function (m) {
    //    $('.hypoteky').append(loadMortgage(m));
    //});
    //var variant = window.location.href.split('#')[1];
    //window.location = 'jtvoja_stranka.html#prva_vanrinta'

    //if (variant == 'prva_varianta') {
    //    loadMortgage();
    //
    //}

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
});