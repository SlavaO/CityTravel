///<reference path="jquery-1.7.1-vsdoc.js" />
///<reference path="~/Scripts/PrintVersion.js" />
///<reference path="~/Scripts/Controls.js" />

//Transport types enum
var TransportType = { "Walking": 0, "Bus": 1, "Subway": 2, "Trolleybus": 3, "Tram": 4 };

//var keyWordsForAddress = ["Днепропетровск", "Днепропетровская область", "Украина", "49000"];
//var possibleLocations = ["Днепропетровск"];

//// Переменые для печати 
//var markerArr = new Array(); // массив для хранения координат маркеров

//var numMarker = { "startPoint": 0, "endPoint": 1 }; // enum для определения порядкового номера маркера в массиве маркеров

//var busPolyLinePrint = new Array(); //  помещаем объект "Маршрут" транспорта "Маршрутка" (для распечатки)
//var walkPolyLinePrintStart = new Array(); //  помещаем объект "Пеший маршрут начала пути" (для распечатки)

//var walkPolyLinePrintEnd = new Array(); //  помещаем объект "Пеший маршрут окончания пути" (для распечатки)

//var walkPolyLinePrintStartEnd = new Array(); //  помещаем объект "Пеший маршрут, если не найден в БД подходящий" (для распечатки)

// первая остановка в маршруте
// крайняя остановка в маршруте
// var FirstBusStartStop = new Array(2);

var printLegendBar = []; // тип и линия маршрута в легенде 
var printLegendText = []; // текст в легенде
var flag = false;
var flagMake = false;

//map point constructor
function MapPoint(location) {
    this.location = location;
    this.marker = null;
    this.name = null;
}

var path = new Path();
var viewModel = new MakeRouteViewModel();
//DOM loaded event
$(document).ready(function () {
    //init controls

    controls.init();
    //
    autocomplete.init();
    //
//    textVersion.init();
    //init map
    map.init();

    
    //print function
    $(controls.settings.selectors.printTextVersionButtonSelector).click(function () {
        printBlockRoute();
        map.menu.closeMenu();
    });

    $(legend.settings.selector).hide();

//    $(window).resize(function () {
//        if (viewModel.isPathFined()) {
//            map.fitToBounds(path);
//        }
//    });

    ko.applyBindings(viewModel);
    
});




