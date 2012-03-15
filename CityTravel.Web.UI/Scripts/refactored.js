///<reference path="jquery-1.7.1-vsdoc.js" />


//resolves full path for url's. Url must be without first slash: GetPath("makeroute/index").
function GetPath(url) {
    var loc = location.href;
    if (loc.charAt(loc.length - 1) != '/')
        loc += '/';
    return loc + url;
}

function IsAddressValid(resultString) {
    if (resultString == "Днепропетровск, Днепропетровская область, Украина, 49000") {
        return false;
    }
    for (var i = 0; i < possibleLocations.length; i++) {
        if (resultString.search(possibleLocations[i] + ",") != -1) return true;
    }
    return false;
}

//Transport types enum
var TransportType = { "Walking": 0, "Bus": 1, "Subway": 2, "Trolleybus": 3, "Tram": 4 };

var keyWordsForAddress = ["Днепропетровск", "Днепропетровская область", "Украина", "49000"];
var possibleLocations = ["Днепропетровск"];

// Переменые для печати 
var markerArr = new Array(); // массив для хранения координат маркеров

var numMarker = { "startPoint": 0, "endPoint": 1 }; // enum для определения порядкового номера маркера в массиве маркеров

var busPolyLinePrint = new Array(); //  помещаем объект "Маршрут" транспорта "Маршрутка" (для распечатки)
var walkPolyLinePrintStart = new Array(); //  помещаем объект "Пеший маршрут начала пути" (для распечатки)

var walkPolyLinePrintEnd = new Array(); //  помещаем объект "Пеший маршрут окончания пути" (для распечатки)

var walkPolyLinePrintStartEnd = new Array(); //  помещаем объект "Пеший маршрут, если не найден в БД подходящий" (для распечатки)

var printLegendBar = []; // тип и линия маршрута в легенде 
var printLegendText = []; // текст в легенде
var flag = false;
var flagMake = false;
// первая остановка в маршруте
// крайняя остановка в маршруте
var FirstBusStartStop = new Array(2);

//map point constructor
function MapPoint(location) {
    this.location = location;
    this.marker = null;
    this.name = null;
}

//object that incapsulates map logic
var map = {
    mapObject: null,
    directionsRenderer: null,
    geocoder: null,

    //map settings
    settings: {
        //center defaults to city center
        mapCenter: {
            Lat: 48.46306197546078,
            Lng: 35.04905941284187
        },
        mapDisplayOptions: {
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            streetViewControl: false
        },
        //map element selector
        mapCanvasSelector: "#googleMap",
        mapContextMenuSelector: "#contextMenu",
        mapContextMenuClass: ".ContextMenuGoogle",
        mapPointMenuClass: ".ContextMenuPointGoogle",
        mapImgMenuClass: ".ContextMenuMarkerImg",

        mapMarkerX: {},
        NumMarker: { "A": 0, "B": 1 },
        MarkerA: "A",
        MarkerB: "B",
        NumMarkerRev: { 0: "A", 1: "B" }

    },

    //init function
    init: function () {
        var settings = this.settings;

        settings.mapDisplayOptions.center = new google.maps.LatLng(settings.mapCenter.Lat, settings.mapCenter.Lng);
        map.mapObject = new google.maps.Map($(settings.mapCanvasSelector)[0], settings.mapDisplayOptions);
        map.directionsRenderer = new google.maps.DirectionsRenderer();
        map.geocoder = new google.maps.Geocoder();

        // Обработчик нажатия правой кнопки мыши 
        this.menu.init();

        $("#swap").click(function () {
            if (flag == false) {
                var tempText = $(controls.settings.selectors.startAddressSelector).val();
                $(controls.settings.selectors.startAddressSelector).val($(controls.settings.selectors.endAddressSelector).val());
                $(controls.settings.selectors.endAddressSelector).val(tempText);
                map.menu.setMarker(A, map.settings.MarkerB);
                map.menu.setMarker(B, map.settings.MarkerA);
                path.clear();
                routeList.clear();
                $(legend.settings.selector).hide();
                flag = true;
                flagMake = false;
            }
            else {
                $(controls.settings.selectors.startAddressErrorSelector).text("вы уже поменяли местами маркеры");
                $(controls.settings.selectors.startAddressErrorSelector).show();
            }
        });


    },

    //fit map to start and end point
    fitToBounds: function (path) {
        var bounds = new google.maps.LatLngBounds();
        if (path.startPoint != null)
            bounds.extend(path.startPoint.location);
        if (path.endPoint != null)
            bounds.extend(path.endPoint.location);
        map.mapObject.setCenter(bounds.getCenter());
        map.mapObject.fitBounds(bounds);

    },

    menu:
	{
	    openMenu: function (pos) {
	        $(map.settings.mapContextMenuSelector).css("left", pos.x);
	        $(map.settings.mapContextMenuSelector).css("top", pos.y);
	        $(map.settings.mapContextMenuSelector).show();
	    },

	    closeMenu: function () {
	        $(map.settings.mapContextMenuSelector).hide();
	    },

	    init: function () {

	        $(map.settings.mapContextMenuSelector).addClass(map.settings.mapContextMenuClass.replace(".", ""));

	        var points = $("<ul>");
	        var pointA = $("<li>");
	        var pointB = $("<li>");
	        points.append(pointA, pointB);
	        pointA.addClass(map.settings.mapPointMenuClass.replace(".", ""));
	        pointA.append("Указать");
	        pointA.append($("#imagePointA"));
	        pointB.addClass(map.settings.mapPointMenuClass.replace(".", ""));
	        pointB.append("Указать");
	        pointB.append($("#imagePointB"));

	        $(map.settings.mapContextMenuSelector).append(pointA);
	        $(map.settings.mapContextMenuSelector).append(pointB);

	        google.maps.event.addListener(
				map.mapObject,
				"rightclick",
				function (event) {
				    var s = event.pixel;
				    map.menu.openMenu(event.pixel);
				    map.menu.mapMarkerX = event.latLng;

				});

	        google.maps.event.addListener(
				map.mapObject,
				"click",
				function () {

				    map.menu.closeMenu();
				});

	        $(pointA).click(function () {
	            path.clear();
	            //legend.reset();
	            routeList.clear();
	            map.menu.setMarker(map.menu.mapMarkerX, map.settings.MarkerA);
	            window.A = map.menu.mapMarkerX;
	        });

	        $(pointB).click(function () {
	            path.clear();
	            //legend.reset();
	            routeList.clear();
	            //  $("#routes-list").empty();

	            map.menu.setMarker(map.menu.mapMarkerX, map.settings.MarkerB);
	            window.B = map.menu.mapMarkerX;
	        });
	    },



	    // Установить маркер 
	    setMarker: function (pos, n) {

	        if (map.settings.NumMarker[n] == 0) {
	            map.geocoder.geocode({ 'latLng': pos }, function (results, status) {
	                if (status == google.maps.GeocoderStatus.OK) {

	                    map.resolveAddress(results[0].formatted_address, path, "startPoint", function () {

	                        // Удалить все слова из строки, кроме названия улицы 
	                        for (var i = 0; i < keyWordsForAddress.length; i++) {
	                            results[0].formatted_address = results[0].formatted_address.replace(", " + keyWordsForAddress[i], "");
	                        }
	                        $(controls.settings.selectors.startAddressSelector).val(results[0].formatted_address);
	                        $(controls.settings.selectors.startAddressSelector).css("color", '#000');
	                        controls.checkAndToogleButtons();

	                    });
	                }
	            });
	        }
	        else if (map.settings.NumMarker[n] == 1) {
	            map.geocoder.geocode({ 'latLng': pos }, function (results, status) {
	                if (status == google.maps.GeocoderStatus.OK) {

	                    map.resolveAddress(results[0].formatted_address, path, "endPoint", function () {

	                        // Удалить все слова из строки, кроме названия улицы 
	                        for (var i = 0; i < keyWordsForAddress.length; i++) {
	                            results[0].formatted_address = results[0].formatted_address.replace(", " + keyWordsForAddress[i], "");
	                        }

	                        $(controls.settings.selectors.endAddressSelector).val(results[0].formatted_address);
	                        $(controls.settings.selectors.endAddressSelector).css("color", '#000');
	                        controls.checkAndToogleButtons();

	                    });
	                }
	            });
	        }

	        map.menu.closeMenu(); // закрыть контекстное меню 
	    },

	    // установить событие для маркеров (вызвать функцию после перетаскивания маркера)
	    setEventMarker: function (marker, n) {

	        // Настраиваем событие по перетаскиванию маркера 
	        google.maps.event.addListener(
				marker,
				"dragend",
				function () {
				    map.menu.setMarker(marker.position, n);
				    //				    controls.makeRoute(); // произвести поиск маршрута

				    path.clear();
				    routeList.clear();
				    $(legend.settings.selector).hide();
				    flag = false;
				    flagMake = false;


				});
	    }
	},

    //fit map to star end point
    fitToBounds: function (path) {
        var bounds = new google.maps.LatLngBounds();
        if (path.startPoint != null)
            bounds.extend(path.startPoint.location);
        if (path.endPoint != null)
            bounds.extend(path.endPoint.location);
        map.mapObject.setCenter(bounds.getCenter());
        map.mapObject.fitBounds(bounds);
    },

    //resolve address
    resolveAddress: function (address, destination, property, success) {

        //if no address specified simply exit
        if (!address || address === "") {
            if (destination[property] != null) {
                destination[property].name = "";
                destination[property].marker.setMap(null);
            }
            return;
        }

        //check entered address value type
        var numberCheck = address / 1;
        if (!isNaN(numberCheck)) {
            console.log("Address consists only of numbers!");
            switch (property) {
                case "startPoint":
                    $(controls.settings.selectors.startAddressErrorSelector).show();
                    break;
                case "endPoint":
                    $(controls.settings.selectors.endAddressErrorSelector).show();
                    break;
                default:
                    console.log("Error in switching property in geocoder function!");
                    break;
            }
            return;
        }


        //if no city specified add it
        for (var i = 0; i < keyWordsForAddress.length; i++) {
            if (address.toString().search(keyWordsForAddress[i]) == -1) {
                address = address + " " + keyWordsForAddress[i];
            }
        }

        //send request to google maps geocoder and return MapPoint object
        map.geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

                //check if address is ok
                if (!IsAddressValid(results[0].formatted_address.toString())) {
                    console.log("Address do not exist!.");
                    switch (property) {
                        case "startPoint":
                            $(controls.settings.selectors.startAddressErrorSelector).show();
                            break;
                        case "endPoint":
                            $(controls.settings.selectors.endAddressErrorSelector).show();
                            break;
                        default:
                            console.log("Error in switching property in geocoder function!");
                            break;
                    }
                    return;
                } else {
                    switch (property) {
                        case "startPoint":
                            $(controls.settings.selectors.startAddressErrorSelector).hide();
                            break;
                        case "endPoint":
                            $(controls.settings.selectors.endAddressErrorSelector).hide();
                            break;
                        default:
                            console.log("Error in switching property in geocoder function!");
                            break;
                    }
                }

                //if all is ok retrieve location of the most relevant result
                var loc = results[0].geometry.location;

                //save result to path property (start or end point)
                if (destination[property] == null) {
                    destination[property] = new MapPoint(loc);

                    destination[property].marker = new google.maps.Marker({
                        map: map.mapObject,
                        position: loc,
                        // icon:image,
                        draggable: true

                    });


                    markerArr[numMarker[property]] = destination[property].marker; // поместить маркер в маасив
                    if (property == "startPoint")
                        markerArr[numMarker[property]].icon = GetPath("Content/images/pin-A-drag.png"); // поместить рисунок маркера 
                    else
                        markerArr[numMarker[property]].icon = GetPath("Content/images/pin-B.png");

                    map.menu.setEventMarker(markerArr[numMarker[property]], map.settings.NumMarkerRev[numMarker[property]]); // установить событие для маркера (перетаскивание маркера)

                } else {
                    destination[property].location = loc;
                    destination[property].marker.setPosition(loc);
                    destination[property].marker.setMap(map.mapObject);
                }

                //set point name
                var temp = results[0].formatted_address.toString().replace(", " + keyWordsForAddress[1], "");
                for (var i = 0; i < keyWordsForAddress.length; i++) {
                    if (i == 1) continue;
                    temp = temp.replace(", " + keyWordsForAddress[i], "");
                }
                destination[property].name = temp;

                if (markerArr.length == 2) { // если установлены оба маркера, то центровать их 
                    //zoom map
                    map.fitToBounds(destination);
                }
                else { // иначе - центруем карту относительно одного маркера 
                    map.mapObject.panTo(loc);
                }

                //call success function
                success();
            }
            //if address geocoding error
            else {
                console.log("Geocoder error!");
            }
        });

    }
};


//object that incapsulates all controls work
var controls = {
    //controls settings

    settings: {
        selectors: {
            controlsTabsSelector: "#tabs",
            startAddressSelector: "#StartPointAddress",
            startAddressErrorSelector: "#startAddressError",
            endAddressSelector: "#EndPointAddress",
            endAddressErrorSelector: "#endAddressError",
            makeRouteButtonSelector: "#makeRouteBtn",
            textVersionButtonSelector: "#textVersionBtn",
            printTextVersionButtonSelector: "#printBtn"
        },
        labels: {
            addressPlaceholderText: ""
        }
    },

    makeRoute: function () {

        var postData = {
            StartPointLongitude: path.startPoint.location.lat(),
            StartPointLatitude: path.startPoint.location.lng(),
            EndPointLongitude: path.endPoint.location.lat(),
            EndPointLatitude: path.endPoint.location.lng()
        };

        var jData = JSON.stringify(postData);
        $.ajax({
            url: GetPath("makeroute/index"),
            type: "POST",
            dataType: 'json',
            data: jData,
            contentType: 'application/json; charset=utf-8',
            success: function (returnedData) {
                routeList.load(returnedData);
                //path.render(returnedData);
            }
        });

        flagMake = true;
    },

    //init function
    init: function () {
        var settings = this.settings, selectors = settings.selectors, labels = settings.labels;

        //style tabs
        $(selectors.controlsTabsSelector).tabs();

        //style buttons
        $(selectors.makeRouteButtonSelector).button({ disabled: true });
        $(selectors.textVersionButtonSelector).button({ disabled: true });
        $(selectors.printTextVersionButtonSelector).button({ disabled: true });

        //make route button click
        $(selectors.makeRouteButtonSelector).click(function () {
            if (flagMake == false) {
                controls.makeRoute(); // произвести поиск маршрута 
            } else {
                //console.log("Вы уже построили маршрут!!!");
            }

            /*


            var postData = {
            StartPointLongitude: path.startPoint.location.lat(),
            StartPointLatitude: path.startPoint.location.lng(),
            EndPointLongitude: path.endPoint.location.lat(),
            EndPointLatitude: path.endPoint.location.lng()
            };

            var jData = JSON.stringify(postData);
            $.ajax({
            url: GetPath("makeroute/index"),
            type: "POST",
            dataType: 'json',
            data: jData,
            contentType: 'application/json; charset=utf-8',
            success: function (returnedData) {
            routeList.load(returnedData);
            //path.render(returnedData);
            }
            });

            */

        });

        //add "address" class to text-boxes
        $(selectors.startAddressSelector).addClass("address");
        $(selectors.endAddressSelector).addClass("address");

        //hide error messages
        $(selectors.startAddressErrorSelector).hide();
        $(selectors.endAddressErrorSelector).hide();

        //set text-box placeholders for non-ie browsers
        if (!$.browser.msie) {
            //placeholder label
            $(".address").attr("placeholder", localizedMessages["EnterLocation"]);

            //on focus remove it
            $(".address").focus(function () {
                $(this).attr("placeholder", "");
            });

            //on blur restore it if needed
            $(".address").blur(function () {
                if ($(this).val() == '') {
                    $(this).attr("placeholder", localizedMessages["EnterLocation"]);
                };
            });
        }
        //placeholders for IE
        else {
            //placeholder label
            $(".address").val(Globalize.localize("EnterLocation"));
            $(".address").css("color", '#ccc');

            //on focus remove it
            $(".address").focus(function () {
                if ($(this).val() == localizedMessages["EnterLocation"]) {
                    $(this).val('');
                    $(this).css("color", '#000');
                }
            });

            //on blur restore it if needed
            $(".address").blur(function () {
                if ($(this).val() == '') {

                    $(this).val(localizedMessages["EnterLocation"]);
                    $(this).css("color", '#ccc');
                };
            });
        }

        //geocoding
        $(selectors.startAddressSelector).blur(function () {
            map.resolveAddress($(this).val(), path, "startPoint", function () {
                if (path.startPoint.name != "" && path.previousStartPosition != path.startPoint.name) {
                    path.clear();
                    routeList.clear();
                    $(legend.settings.selector).hide();
                    $(settings.dialogSelector).dialog("close");
                    $(selectors.startAddressSelector).val(path.startPoint.name);
                    path.previousStartPosition = path.startPoint.name;
                }
                controls.checkAndToogleButtons();
            });
        });

        $(selectors.startAddressSelector).keypress(function (event) {
            if (event.which == 13) {
                map.resolveAddress($(this).val(), path, "startPoint", function () {
                    if (path.startPoint.name != "") {
                        $(selectors.startAddressSelector).val(path.startPoint.name);
                        $(legend.settings.selector).hide();
                    }
                    controls.checkAndToogleButtons();
                });
                event.preventDefault();
                $(selectors.startAddressSelector).autocomplete("close");
                $(selectors.endAddressSelector).focus();
            }
        });

        $(selectors.endAddressSelector).blur(function () {
            map.resolveAddress($(this).val(), path, "endPoint", function () {
                if (path.endPoint.name != "" && path.previousEndPosition != path.endPoint.name) {
                    path.clear();
                    $(legend.settings.selector).hide();
                    $(settings.dialogSelector).dialog("close");
                    routeList.clear();
                    $(selectors.endAddressSelector).val(path.endPoint.name);
                    path.previousEndPosition = path.endPoint.name;
                }
                controls.checkAndToogleButtons();
            });
        });

        $(selectors.endAddressSelector).keypress(function (event) {
            if (event.which == 13) {
                map.resolveAddress($(this).val(), path, "endPoint", function () {

                    if (path.endPoint.name != "") {
                        $(selectors.endAddressSelector).val(path.endPoint.name);
                        $(legend.settings.selector).hide();
                    }
                    controls.checkAndToogleButtons();
                    $(selectors.endAddressSelector).autocomplete("close");
                });
                event.preventDefault();
                $(selectors.makeRouteButtonSelector).focus();
            }
        });
    },

    checkBothAddressesExists: function () {
        var selectors = this.settings.selectors;
        return ($(selectors.startAddressSelector).val() != "" &&
                $(selectors.endAddressSelector).val() != "");
    },

    toogleRouteButtons: function (value) {
        var settings = this.settings, selectors = settings.selectors;
        $(selectors.makeRouteButtonSelector).button("option", "disabled", value);
        $(selectors.textVersionButtonSelector).button("option", "disabled", value);
        $(selectors.printTextVersionButtonSelector).button("option", "disabled", value);
    },

    checkAndToogleButtons: function () {
        if (controls.checkBothAddressesExists()) {
            controls.toogleRouteButtons(false);
        } else {
            controls.toogleRouteButtons(true);
        }
    }
};


//function GetPredictions(controller, textbox, pointAddress, response) {
//    var dataString = pointAddress + "=" + $(textbox).val();
//    $.ajax({
//        type: "GET",
//        url: GetPath(controller),
//        data: dataString,
//        dataType: "json",
//        success: function (jsonResponse) {
//            var data = $.parseJSON(jsonResponse);
//            response($.map(data.predictions, function (item) {
//                if ((item.description.replace(" ", "") != "") &&
//                            (item.description.indexOf("??") == -1) &&
//                            (item.description.indexOf("��") == -1))
//                    return {
//                        label: item.description.replace(",", ""),
//                        value: item.description.replace(",", "")
//                    };
//                else {
//                    return null;
//                }
//            }));
//        },
//        error: function (jqXHR, textStatus, errorThrown) {
//            console.log(textStatus);
//        }
//    });
//}

var autocomplete = {
    init: function () {
        var selectors = controls.settings.selectors;
        $(selectors.startAddressSelector).autocomplete({
            delay: 0,
            source: function (request, response) {
                GetPredictions("Autocomplete/GetPredictionsForStart/", selectors.startAddressSelector, "startPointAddress", response)
            },
            minLength: 1
        });
        $(selectors.endAddressSelector).autocomplete({
            delay: 0,
            source: function (request, response) {
                GetPredictions("Autocomplete/GetPredictionsForEnd/", selectors.endAddressSelector, "endPointAddress", response)
            },
            minLength: 1
        });
    }
};

var legend = {
    settings: {
        selector: "#legend",
        legendEntityBarSelector: ".legendEntityBar",
        legendEntityTextSelector: ".legendEntityText",
        transportTypeWalkingSelector: ".transportTypeWalking",
        transportTypeWalkingDefaultText: "Пеший маршрут",
        transportTypeBusSelector: ".transportTypeBus",
        transportTypeBusDefaultText: "bus №"
    },

    reset: function () {
        $(this.settings.selector).empty();
        printLegendBar.length = 0; // обнулить массивы для рачпечатки легенды 
        printLegendText.length = 0;

        $(legend.settings.selector).show();


    },

    render: function (transportType, additionalText) {
        var settings = this.settings;

        var legendEntityBar = $("<div>");
        legendEntityBar.addClass(settings.legendEntityBarSelector.replace(".", ""));

        var legendEntityText = $("<div>");
        legendEntityText.addClass(settings.legendEntityTextSelector.replace(".", ""));

        switch (transportType) {
            case TransportType.Walking:
                {
                    legendEntityBar.addClass(settings.transportTypeWalkingSelector.replace(".", ""));
                    legendEntityText.append("<text>" + settings.transportTypeWalkingDefaultText + additionalText + "</text>");

                    // Сохраняем легенды в массив для распечатки 
                    printLegendBar.push(transportType); // тип тарнспорта для маршрута в легенде 
                    printLegendText.push(settings.transportTypeWalkingDefaultText); // текст в легенде

                }
                break;
            case TransportType.Bus:
                {
                    legendEntityBar.addClass(settings.transportTypeBusSelector.replace(".", ""));
                    legendEntityText.append("<text>" + additionalText + "</text>"); // + settings.transportTypeBusDefaultText

                    // Сохраняем легенды в массив для распечатки 
                    printLegendBar.push(transportType); // тип тарнспорта для распечатки 
                    printLegendText.push(additionalText); // текст в легенде 
                }
                break;

            case TransportType.Subway:
                {

                } break;

            case TransportType.Trolleybus:
                {

                } break;

            case TransportType.Tram:
                {

                } break;

            default:
                console.log("Undefined transport type in legend render!");
                break;
        }

        $(settings.selector).append(legendEntityBar);
        $(settings.selector).append(legendEntityText);
    }
};

var textVersion = {
    string: "",

    settings: {
        dialogSelector: "#stepByStepHelper",
        buttonSelector: controls.settings.selectors.textVersionButtonSelector
    },

    init: function () {
        var settings = this.settings;

        $(settings.buttonSelector).click(function () {
            var offset = $(settings.buttonSelector).offset();
            offset.top += $(settings.buttonSelector).height() * 2;
            $(settings.dialogSelector).empty();
            $(settings.dialogSelector).append(textVersion.string);

            $(settings.dialogSelector).dialog({
                position: [offset.left, offset.top],
                height: 300,
                width: 577,
                close: function () { $(this).text(""); }
            });
        });
    },

    showWalkingSteps: function (data) {
      /*  this.string = "";
        var myRoute = directionResult.routes[0].legs[0];
        this.string = "<ol>";
        for (var i = 0; i < myRoute.steps.length; i++) {
            this.string += " " + '<li>' + myRoute.steps[i].instructions+"&#8776 " + (myRoute.steps[i].distance.value / ((walkingSpeed / 60) * 1000)).toFixed(1) + "мин" + '<br/>' + " " + '</li>';
        }
        //this.string += "</ol>";*/
        return data.steps;
       

    },

    showStepsToLand: function (directionResult, routeName, firstStop, waitingTime, walkingSpeed) {
        var myRoute = directionResult.routes[0].legs[0];
        this.string = "<ol>";

        for (var i = 0; i < myRoute.steps.length; i++) {
            this.string += " " + '<li>' + " " + myRoute.steps[i].instructions + " &#8776 " + (myRoute.steps[i].distance.value / ((walkingSpeed / 60) * 1000)).toFixed(1) + "мин" + '<br/>' + " " + '</li>';
        }
        this.string += " " + '<li>' + localizedMessages["Sit"] + " " + '<b>' + routeName + " " + '</b>' + localizedMessages["OnStop"] + " " + '<b>' + firstStop + '</b>' + " Время ожидания " + " &#8776 " + waitingTime + "мин" + '<br/>' + '</li>';
        // this.string+= " " + '</ol>';

    },

    showStepsFromLand: function (directionResult, lastStop, time, walkingSpeed) {
        var myRoute = directionResult.routes[0].legs[0];
        this.string += " " + '<li>' + localizedMessages["RideUntil"] + " " + '<b>' + lastStop + '</b>' + " " + " &#8776 " + time.toFixed(1) + "мин" + "<br>" + '</li>';
        for (var i = 0; i < myRoute.steps.length; i++) {
            this.string += " " + '<li>' + ' ' + myRoute.steps[i].instructions + " &#8776 " + (myRoute.steps[i].distance.value / ((walkingSpeed / 60) * 1000)).toFixed(1) + "мин" + '</li>';
        }
        this.string += " " + '</ol>';

    }
};

//object that incapsulates path finding logic
function Path() {
    this.startPoint = null;
    this.endPoint = null;
    this.previousStartPosition = null;
    this.previousEndPosition = null;


    this.stopsMarkers = [];
   
    this.directionsService = new google.maps.DirectionsService();

    this.startLandingDirectionsRenderer = new google.maps.DirectionsRenderer({
        preserveViewport: true,
        routeIndex: 0,
        polylineOptions: {
            style: "dashed",
            strokeColor: "#00FF00"
        }
    });
    this.startLandingDirectionsRenderer.suppressMarkers = true;

    this.endLandingDirectionsRenderer = new google.maps.DirectionsRenderer({
        preserveViewport: true,
        routeIndex: 0,
        polylineOptions: {
            style: "dashed",
            strokeColor: "#00FF00"
        }
    });
    this.endLandingDirectionsRenderer.suppressMarkers = true;

    this.busPolyLineOptions = {
        style: "dashed",
        strokeColor: "#0000AB",
        strokeOpacity: 1.0,
        strokeWeight: 3
    };
    this.walkPolyLineOptions = {
        style: "dashed",
        strokeColor: "#00FF00",
        strokeOpacity: 1.0,
        strokeWeight: 3
    };

    this.busPolyLine = new google.maps.Polyline(this.busPolyLineOptions);
    this.walkPolyLine = new google.maps.Polyline(this.walkPolyLineOptions);

    this.render = function (data) {
        var startLandingDirectionsRenderer = this.startLandingDirectionsRenderer;
        var endLandingDirectionsRenderer = this.endLandingDirectionsRenderer;

        this.clear();
        legend.reset();




        var busRoute = new Array(data.track.length);
        debugger;
        var busRouteBounds = new google.maps.LatLngBounds();
        for (var i = 0; i < busRoute.length; i++) {
            busRoute[i] = new google.maps.LatLng(data.track[i].Longitude, data.track[i].Latitude);
            busRouteBounds.extend(busRoute[i]);

            busPolyLinePrint = busRoute; //  сохраняем объект "Маршрут" транспорта (для распечатки)

        }
        ;

        busRouteBounds.extend(this.startPoint.location);
        busRouteBounds.extend(this.endPoint.location);
        map.mapObject.setCenter(busRouteBounds.getCenter());
        map.mapObject.fitBounds(busRouteBounds);


        if (data.type !== "Walking") {

            this.busPolyLine.setPath(busRoute);
            this.busPolyLine.setMap(map.mapObject);
            this.renderStops(data.stops, data.nameOfStops);
            var startLandingRequest =
                    {
                        origin: this.startPoint.location,
                        destination: busRoute[0],
                        travelMode: google.maps.TravelMode.WALKING
                    };

            this.directionsService.route(
                    startLandingRequest,
                    function (result, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            startLandingDirectionsRenderer.setDirections(result);
                            textVersion.showStepsToLand(result, data.name, data.nameOfStops[0], data.waitingTime, data.walkingSpeed);

                            walkPolyLinePrintStart = result.routes[0].overview_path; //  помещаем объект "Пеший маршрут начала пути" (для распечатки)

                        }
                    }
                );
            var endLandingRequest =
                    {
                        origin: busRoute[busRoute.length - 1],
                        destination: this.endPoint.location,
                        travelMode: google.maps.TravelMode.WALKING
                    };
            this.directionsService.route(
                    endLandingRequest,
                    function (result, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            endLandingDirectionsRenderer.setDirections(result);
                            textVersion.showStepsFromLand(result, data.nameOfStops[data.nameOfStops.length - 1], data.time, data.walkingSpeed);

                            walkPolyLinePrintEnd = result.routes[0].overview_path; //  помещаем объект "Пеший маршрут окончания пути" (для распечатки)

                        }

                    }
                );
            startLandingDirectionsRenderer.setMap(map.mapObject);
            endLandingDirectionsRenderer.setMap(map.mapObject);

            legend.render(TransportType.Walking, "");
            $(legend.settings.selector).append("<br/>");
            legend.render(TransportType.Bus, data.name);
        } else {


            this.walkPolyLine.setPath(busRoute);
            this.walkPolyLine.setMap(map.mapObject);
            legend.render(TransportType.Walking, "");
            textVersion.string = data.steps.toString();
        }



    };


    this.renderStops = function (stops, stopsNames) {
        var markers = this.stopsMarkers;
        if (markers != null) {
            for (i in markers) {
                markers[i].setMap(null);
            }
        }

        var markerIcon = GetPath("Content/images/stops/busstop.png");

        for (var i = 0; i < stops.length; i++) {
            var location = new google.maps.LatLng(stops[i].Longitude, stops[i].Latitude);

            var marker = new google.maps.Marker({
                position: location,
                map: map.mapObject,
                icon: markerIcon

            });
            this.addInfoWindow(marker, stopsNames[i]);
            markers.push(marker);


        }

        FirstBusStartStop[0] = markers[0]; // первая остановка в маршруте 
        FirstBusStartStop[1] = markers[stops.length - 1]; // крайняя остановка в маршруте
    };

    this.addInfoWindow = function (marker, stopName) {

        google.maps.event.addListener(marker, 'mouseover', function (mEvent) {
            var point = convertToPoint(mEvent.latLng, this.map);
            var map = $("#googleMap").offset();
            $("#tooltip").show().css({ left: map.left + point.x + 20, top: map.top + point.y - 60 }).html(stopName);

        });
        google.maps.event.addListener(marker, 'mouseout', function (mEvent) {
            $("#tooltip").hide();
        });



        var convertToPoint = function (latLng, map) {
            var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
            var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
            var scale = Math.pow(2, map.getZoom());
            var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
            return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
        };

    };

    this.clear = function () {
        var markers = this.stopsMarkers;
        if (markers != null) {
            for (i in markers) {
                markers[i].setMap(null);
            }
        }
        this.busPolyLine.setMap(null);
        this.walkPolyLine.setMap(null);
        this.startLandingDirectionsRenderer.setMap(null);
        this.endLandingDirectionsRenderer.setMap(null);

        // Обнуляем переменые для печати 
        busPolyLinePrint.length = 0; //  помещаем объект "Маршрут" транспорта "Маршрутка" (для распечатки)
        walkPolyLinePrintStart.length = 0; //  помещаем объект "Пеший маршрут начала пути" (для распечатки)

        walkPolyLinePrintEnd.length = 0; //  помещаем объект "Пеший маршрут окончания пути" (для распечатки)

        walkPolyLinePrintStartEnd.length = 0; //  помещаем объект "Пеший маршрут, если не найден в БД подходящий" (для распечатки)

        printLegendBar.length = 0; // тип и линия маршрута в легенде 
        printLegendText.length = 0; // текст в легенде

        // первая остановка в маршруте
        // крайняя остановка в маршруте
        FirstBusStartStop.length = 0;

        textVersion.string = null; // обнулить текстовую версию 
    };
};

var path = new Path();

//DOM loaded event
$(document).ready(function () {
    //init controls
    controls.init();
    //
    autocomplete.init();
    //
    textVersion.init();
    //init map

    map.init();

    //print function
    $(controls.settings.selectors.printTextVersionButtonSelector).click(function () {
        printBlockRoute();
    });

    $(legend.settings.selector).hide(); // скрыть легенду 

});

var PrintVersion = {
    settings: {
        selector: "#PrintWin",
        printTxtHeader: ".PrintTxtHeader",
        PrintTxtDest: ".PrintTxtDest",
        PrintTxtAddr: ".PrintTxtAddr",
        HeaderText: "Маршрут по которому нужно следовать",
        StartPlace: "Место отправления: ",
        EndPlace: "Место назначения: ",
        TextVersionHeader: ".TextVerHeader",

        MapSelector: "#printMap",

        mapCenterPa: {},
        mapCenterQa: {},
        mapZoom: {},

        Marker1Pa: {},
        Marker1Qa: {},

        Marker2Pa: {},
        Marker2Qa: {},

        markerFirstBS_Pa: {},
        markerFirstBS_Qa: {},

        markerLastBS_Pa: {},
        markerLastBS_Qa: {},

        ColorWalk: "0x006400",
        ColorBus: "0x0000FF",

        WalkLineFull: {},
        BusLine: {},
        WalkLineStart: {},
        WalkLineEnd: {}
    },

    Url: null, // url для запроса 

    initMap: function () {

        settings = this.settings;

        // Если объект карта Google Maps готов, то считать  её  текущие параметры 
        if (map.mapObject != null && map.mapObject != undefined) {

            this.Url = "http://maps.googleapis.com/maps/api/staticmap?center=" +
			map.mapObject.getCenter().Oa + "," +
			map.mapObject.getCenter().Pa +
			"&zoom=" + map.mapObject.getZoom() +
			"&format=png&size=640x600&maptype=roadmap";

            settings.mapCenterPa = map.mapObject.getCenter().Pa;
            settings.mapCenterQa = map.mapObject.getCenter().Qa;
            settings.mapZoom = map.mapObject.getZoom();
        }
        else
            return;

        if (markerArr[0] != null && markerArr[0] != undefined) {
            settings.Marker1Pa = markerArr[0].position.Oa;
            settings.Marker1Qa = markerArr[0].position.Pa;

            this.Url += "&markers=label:A%7C" + settings.Marker1Pa + "," + settings.Marker1Qa;

        }

        if (markerArr[1] != null && markerArr[1] != undefined) {
            settings.Marker2Pa = markerArr[1].position.Oa;
            settings.Marker2Qa = markerArr[1].position.Pa;

            this.Url += "&markers=label:B%7C" + settings.Marker2Pa + "," + settings.Marker2Qa;

        }

        if (FirstBusStartStop[0] != null && FirstBusStartStop[0] != undefined) {
            settings.markerFirstBS_Pa = FirstBusStartStop[0].position.Oa;
            settings.markerFirstBS_Qa = FirstBusStartStop[0].position.Pa;

            //			this.Url += "&markers=label:F%7C" + settings.markerFirstBS_Pa + "," + settings.markerFirstBS_Qa;
        }

        if (FirstBusStartStop[1] != null && FirstBusStartStop[1] != undefined) {
            settings.markerLastBS_Pa = FirstBusStartStop[1].position.Oa;
            settings.markerLastBS_Qa = FirstBusStartStop[1].position.Pa;

            //			this.Url += "&markers=label:L%7C" + settings.markerLastBS_Pa + "," + settings.markerLastBS_Qa;
        }

        if (walkPolyLinePrintStartEnd.length != 0) {
            settings.WalkLineFull = google.maps.geometry.encoding.encodePath(walkPolyLinePrintStartEnd);

            this.Url += "&path=color:" + settings.ColorWalk + "|weight:3|enc:" + settings.WalkLineFull;
        }

        if (busPolyLinePrint.length != 0) {
            settings.BusLine = google.maps.geometry.encoding.encodePath(busPolyLinePrint);

            this.Url += "&path=color:" + settings.ColorBus + "|weight:3|enc:" + settings.BusLine;
        }

        if (walkPolyLinePrintStart.length != 0) {
            settings.WalkLineStart = google.maps.geometry.encoding.encodePath(walkPolyLinePrintStart);

            this.Url += "&path=color:" + settings.ColorWalk + "|weight:3|enc:" + settings.WalkLineStart;
        }

        if (walkPolyLinePrintEnd.length != 0) {
            settings.WalkLineEnd = google.maps.geometry.encoding.encodePath(walkPolyLinePrintEnd);

            this.Url += "&path=color:" + settings.ColorWalk + "|weight:3|enc:" + settings.WalkLineEnd;
        }

        this.Url += "&sensor=false";
    },

    reset: function () {
        $(PrintVersion.settings.selector).empty(); // очистить область для печати
    },

    render: function () {
        var settings = this.settings;

        var w = window.open(); // создать новое окно для распечатки 
        w.document.write("<link rel='stylesheet' type='text/css' href=" + GetPath('Content/Site.css') + ">");

        var print = $("<div>");
        var header = $("<h3>");
        header.addClass(settings.printTxtHeader.replace(".", ""));
        header.append(settings.HeaderText);
        $(print).append(header);

        // Место отправления 
        var startplace = $("<p>");
        startplace.addClass(settings.PrintTxtDest.replace(".", ""));
        startplace.append(settings.StartPlace);

        var textSP = $("<text>");
        textSP.addClass(settings.PrintTxtAddr.replace(".", ""));
        textSP.append($(controls.settings.selectors.startAddressSelector).val());
        startplace.append(textSP);
        print.append(startplace);

        // Место назначения 
        var endplace = $("<p>");
        endplace.addClass(settings.PrintTxtDest.replace(".", ""));
        endplace.append(settings.EndPlace);

        var textEP = $("<text>");
        textEP.addClass(settings.PrintTxtAddr.replace(".", ""));
        textEP.append($(controls.settings.selectors.endAddressSelector).val());
        endplace.append(textEP);
        print.append(endplace);
        print.append($('<br />'));

        // Вывод легенды для печати 
        var legendPrint = $("<div>");
        legendPrint.attr("id", "PrintLegend");

        for (var i = 0; i < printLegendBar.length; i++) {

            switch (printLegendBar[i]) {
                case TransportType.Walking: // "Walking"
                    {
                        var legendBar = $("<div>");
                        var legendTxt = $("<div>");

                        legendBar.addClass(legend.settings.legendEntityBarSelector.replace(".", ""));
                        legendTxt.addClass(legend.settings.legendEntityTextSelector.replace(".", ""));

                        legendBar.addClass(legend.settings.transportTypeWalkingSelector.replace(".", ""));
                        legendTxt.append(legend.settings.transportTypeWalkingDefaultText);

                        legendPrint.append(legendBar);
                        legendPrint.append(legendTxt);
                        legendPrint.append("<br />");

                    } break;

                case TransportType.Bus: // "Bus"
                    {
                        var legendBar = $("<div>");
                        var legendTxt = $("<div>");

                        legendBar.addClass(legend.settings.legendEntityBarSelector.replace(".", ""));
                        legendTxt.addClass(legend.settings.legendEntityTextSelector.replace(".", ""));

                        legendBar.addClass(legend.settings.transportTypeBusSelector.replace(".", ""));
                        legendTxt.append(printLegendText[i]);

                        legendPrint.append(legendBar);
                        legendPrint.append(legendTxt);
                        legendPrint.append("<br />");

                    } break;
                case TransportType.Subway: // "Subway"
                    {


                    } break;

                case TransportType.Trolleybus: // "Trolleybus"
                    {


                    } break;

                case TransportType.Tram: // "Tram"
                    {


                    } break;

                default: console.log("Не выбран ни один вид транспорта!"); // "Walking"
            }
        }

        $(print).append(legendPrint); // переносим легенду в div для распечатки 

        // Отображаем карту 
        var StaticMap = $("<div>");
        $(StaticMap).attr("id", settings.MapSelector.replace("#", ""));
        var img = $("<img>");
        StaticMap.append(img);
        print.append(StaticMap); // подключаем рисунок расположения карты 

        PrintVersion.initMap(); // инициализировать переменные для запроса статической карты Google

        // Запрос карты для печати 
        img.attr("src", PrintVersion.Url); // считать карту 
        $(StaticMap).append(img); // добавить карту в документ 

        // Текстовая версия маршрута 
        var TextVersion = $("<div>");

        if (textVersion.string != "" && textVersion.string != null && textVersion.string != undefined) {
            TextVersion.append("<h3>" + "Описание движения по маршруту следования" + "</h3>");
            TextVersion.children("h3").addClass(settings.TextVersionHeader.replace(".", "")); // добавить класс заголовка 

            TextVersion.append(textVersion.string); // текст
        }
        else // иначе - предупреждающая надпись "Маршрут не определён!"
        {
            TextVersion.append("<h3>" + "Не выбран маршрут следования!" + "</h3>");
            TextVersion.children("h3").addClass(settings.TextVersionHeader.replace(".", "")); // добавить класс заголовка 
            TextVersion.children("h3").css("color", "red");
        }

        $(print).append(TextVersion);
        w.document.write($(print).html());

        w.setTimeout(function () { w.print(), w.close() }, 1400);
    }
}

function printBlockRoute() // распечатка блока "Маршрут, легенда и текстовая версия маршрута"
{
    PrintVersion.reset(); // Reset Print Version
    PrintVersion.render();

    return false;
}



function GetPredictions(controller, textbox, pointAddress, response) {
    var dataString = pointAddress + "=" + $(textbox).val();
    $.ajax({
        type: "GET",
        url: GetPath(controller),
        data: dataString,
        dataType: "json",
        success: function(jsonResponse) {
            var data = jsonResponse;
            //			var data = $.parseJSON(jsonResponse);
            response($.map(data.predictions, function(item) {
                if ((item.description.replace(" ", "") != "") &&
                    (item.description.indexOf("??") == -1) &&
                        (item.description.indexOf("��") == -1))
                    return {
                        label: item.description.replace(",", ""),
                        value: item.description.replace(",", "")
                    };
                else {
                    return null;
                }
            }));
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        }
    });
}