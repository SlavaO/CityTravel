///<reference path="jquery-1.7.1-vsdoc.js" />
var map; // указатель на переменную экземпляра карты

var id_start_win = "#StartPointAddress"; // id контрола (textbox для ввода начала пути)
var id_end_win = "#EndPointAddress"; // id контрола (textbox для ввода окончания пути)

var dirDisplay; // ??? отобразить маршрут на карте
var StartDirectionsDirDisplay;
var EndDirectionsDirDisplay;
var rendererOptions1;
var rendererOptions2;
var busPath;

var geocoder = new google.maps.Geocoder(); // создаём экземпляр объекта Geocoder

var marksArr = new Array(); // создаём массив для хранения меток в нём
var countMarkers = 0; // счётчик добавленных маркеров
var coordMarkers = new Array(); // создаём массив координат маркеров

var infwin; // ссылка на объект информационного окна
var autocomplete; // ссылка на объект Autocomplete

var textVersionString;

var beachMarker=[];
function initialize() 
{

    dirDisplay = new google.maps.DirectionsRenderer();

    rendererOptions1 = {
        preserveViewport: true,
        routeIndex: 0,
        polylineOptions: {
            style: "dashed",
            strokeColor: "#00FF00"
        }
    };
    rendererOptions2 = {
        preserveViewport: true,
        routeIndex: 1,
        polylineOptions: {
            style: "dashed",
            strokeColor: "#00FF00"
        }
    };
    StartDirectionsDirDisplay = new google.maps.DirectionsRenderer(rendererOptions1);
    EndDirectionsDirDisplay = new google.maps.DirectionsRenderer(rendererOptions2);
    StartDirectionsDirDisplay.suppressMarkers = true;
    EndDirectionsDirDisplay.suppressMarkers = true;
    busPath = new google.maps.Polyline();

    var startLatlng = new google.maps.LatLng(48.46306197546078, 35.04905941284187); // отобразить центр Днепропетровска
    var mapOptions =
        {
            zoom: 14,
            center: startLatlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

    map = new google.maps.Map(document.getElementById("googleMap"), mapOptions);
    google.maps.event.addListener(map, "rightclick", function (event) { showContextMenu(event.latLng); });
    $("#tabs").tabs();
    $("#makeRouteBtn").button({ disabled: true });
    $("#textVersionBtn").button({ disabled: true });
    $("#StartPointAddress").attr("placeholder", "Enter the location");
    $("#EndPointAddress").attr("placeholder", "Enter the location");
    if ($.browser.msie) {
        $("#StartPointAddress").val("Enter the location");
        $("#StartPointAddress").css("color", '#ccc');
        
        $("#StartPointAddress").focus(function () {
            if ($("#StartPointAddress").val() == "Enter the location") {
                $("#StartPointAddress").val('');
                $("#StartPointAddress").css("color", '#000');
            }
        });

        $("#StartPointAddress").blur(function () {
            if ($("#StartPointAddress").val() == '') {
                $("#StartPointAddress").val("Enter the location");
                $("#StartPointAddress").css("color", '#ccc');
            };
        });

        $("#EndPointAddress").val("Enter the location");
        $("#EndPointAddress").css("color", '#ccc');

        $("#EndPointAddress").focus(function () {
            if ($("#EndPointAddress").val() == "Enter the location") {
                $("#EndPointAddress").val('');
                $("#EndPointAddress").css("color", '#000');
            }
        });

        $("#EndPointAddress").blur(function () {
            if ($("#EndPointAddress").val() == '') {
                $("#EndPointAddress").val("Enter the location");
                $("#EndPointAddress").css("color", '#ccc');
            };
        }); 
    };


//    SetStylePolyRoute(); // ??? 

};

function FindPath(data) {

//    StartDirectionsDirDisplay.setMap(null);
//    EndDirectionsDirDisplay.setMap(null);
//    busPath.setMap(null);

    ResetLegend(); // обнулить легенду 

    var json_data = $.parseJSON(data.responseText);
    var startPoint = $("#StartPointAddress").val();
    var endPoint = $("#EndPointAddress").val();
    var dirService = new google.maps.DirectionsService();

    /*
    // Если в строке адреса 'startPoint' нет слова 'Днепроперовск', то добавляем его 
    if (startPoint.toString().search('Днепропетровск') == -1) {

    startPoint = startPoint + ', Днепропетровск, Украина';
    }

    // Если в строке адреса 'endPoint' нет слова 'Днепроперовск', то добавляем его 
    if (endPoint.toString().search('Днепропетровск') == -1) {

    endPoint = endPoint + ', Днепропетровск, Украина';
    }

    */


    if (json_data.Found) {
        var busRoute = new Array(json_data.BusRoute.length);
        for (var i = 0; i < busRoute.length; i++) {
            busRoute[i] = new google.maps.LatLng(json_data.BusRoute[i].Longitude, json_data.BusRoute[i].Latitude);
        };

        var reqDirect =
                {
                    origin: startPoint,
                    destination: busRoute[0],
                    //style:'dashed',
                    travelMode: google.maps.TravelMode.WALKING
                };
        dirService.route
                (
                    reqDirect,
                    function (result, status) {
                        if (google.maps.DirectionsStatus.OK) {
                            StartDirectionsDirDisplay.setDirections(result);
                        }
                        showStepsToLand(result, routeName, json_data.NameOfStops[0]);
                    }
                );
        var reqDirect2 =
                {
                    origin: busRoute[busRoute.length - 1],
                    destination: endPoint,
                   // style: 'dashed',
                    travelMode: google.maps.TravelMode.WALKING
                };
        dirService.route
                (
                    reqDirect2,
                    function (result, status) {
                        if (google.maps.DirectionsStatus.OK) {
                            EndDirectionsDirDisplay.setDirections(result);
                        }
                        showStepsFromLand(result, json_data.NameOfStops[json_data.NameOfStops.length - 1]);
                    }
                );

        StartDirectionsDirDisplay.setMap(map);
        EndDirectionsDirDisplay.setMap(map);

        var busPathOptions = {
            path: busRoute,
            style:"dashed",
            strokeColor: "#0000AB",
            strokeOpacity: 1.0,
            strokeWeight: 3

        };

        busPath.setOptions(busPathOptions);
        busPath.setMap(map);
        ShowStops(json_data.Stops, json_data.NameOfStops);
        //    ResetLegend(); // удалить легенду 

        // marksArr[0].setMap(null); // убрать первый маркер
        // marksArr[1].setMap(null); // убрать второй маркер 

        //Route name
        var routeName = json_data.RouteName;
        DefineLegendTransp(1, "");
        DefineLegendTransp(2, routeName);
        $("#legend").css('height', '50px');
    }
    else {
        var reqDirect =
                {
                    origin: startPoint,
                    destination: endPoint,
                    travelMode: google.maps.TravelMode.WALKING
                };
                dirService.route
                (
                    reqDirect,
                    function (result, status) {
                        if (google.maps.DirectionsStatus.OK) {
                            StartDirectionsDirDisplay.setDirections(result);
                            ShowWalkingSteps(result);
                        }
                    }
                );
        StartDirectionsDirDisplay.setMap(map);
        DefineLegendTransp(1, "");
        $("#legend").css('height', '30px');
    }
}


function ShowStops(stops, name) {

    if (beachMarker!=null) {
        for (i in beachMarker) {
            beachMarker[i].setMap(null);
     }
    }

    var image = document.createElement('img');
    image.src = 'demo/Content/images/stops/busstop.png';
    for (var i = 0; i < stops.length; i++) 
    {
        var myLatLng = new google.maps.LatLng(stops[i].Longitude, stops[i].Latitude);
       
        beachMarker[i] = new google.maps.Marker
        (
            {
                position: myLatLng,
                map: map,
                icon: image.src,
                title: name[i]

            }

      );
        beachMarker[i].setMap(map);
    }


}

function ShowWalkingSteps(directionResult) 
{
var myRoute = directionResult.routes[0].legs[0];
textVersionString="<ol>";

    for (var i = 0; i < myRoute.steps.length; i++) {
        textVersionString += " " + '<li>' + myRoute.steps[i].instructions + '<br/>' + " " + '</li>';

    }
    textVersionString += "</ol>";
}

function showStepsToLand(directionResult, routeName, firstStop) {

    var myRoute = directionResult.routes[0].legs[0];
    textVersionString = "<ol>";
    for (var i = 0; i < myRoute.steps.length; i++) {
        textVersionString += " " + '<li>' + myRoute.steps[i].instructions + '<br/>' + " " + '</li>';

    }
    textVersionString += " " + '<li>' + "Sit on  " + " " + '<b>' + routeName + " " + '</b>' + " at the stop called " + " " + '<b>' + firstStop + '</b>' + " " + '<br/>' + '</li>';
}


function showStepsFromLand(directionResult, lastStop) {
    var myRoute = directionResult.routes[0].legs[0];
    textVersionString += " " + '<li>' + "Ride on the shuttle until bus stop called " + " " + '<b>' + lastStop + '</b>' + " " + "and exit the bus " + "<br>" + '</li>';
    for (var i = 0; i < myRoute.steps.length; i++) {
        textVersionString += " " + '<li>' + myRoute.steps[i].instructions + " " + '</li>';
    }
    textVersionString += " " + '</ol>';
}

// Запрос координат от Google Maps по названию улицы
function showAddr(address, id)
{
	if (!address || address === "") // проверяем на наличие данных в полях ввода 
	{
		// Обнулить легенду, маршрут, остановки ???, маркеры ???
		ResetLegend();

		if (id == (id_start_win)) // окно начала пути
		{
			if(coordMarkers[0] != null)
			{
				marksArr[0].setMap(null); // убрать маркер с карты 
				coordMarkers[0] = null;
			}
		}
		else if(id == (id_end_win)) // окно окончания пути 
		{
			if( coordMarkers[1] != null )
			{
				marksArr[1].setMap(null); // убрать маркер с карты 
				coordMarkers[1] = null;
			}
		}
		return; // если поле(поля) ввода не заполнены, то выйти из фугкции 
	}

    var addr = address; // сохраняем адрес в переменную для дальнейшего вычисления типа переданного адреса (Число или String)

    // Если в строке адреса нет слова 'Днепроперовск' и 'Dnepropetrovsk', то добавляем его 
    if (address.toString().search('Днепропетровск') == -1 && address.toString().search('Dnepropetrovsk') == -1) {
        address = address + ', Днепропетровск, Украина';
    }
    else {
        // Если в строке адреса нет слова 'Dnepropetrovsk', то добавляем его 
        if (address.toString().search('Dnepropetrovsk') != -1) {

        }
    }

    geocoder.geocode // функция получения координат по названию улицы 
            (
                { 'address': address }, // искомый адрес 
                function (results, status)  // посылка HTTP запроса на сервер поставщика карт 
                {

                    var p = addr / 1; // проверка - введено ли число в поле ввода 

                    if (status == google.maps.GeocoderStatus.OK) // если статус = OK
                    {
                        // Проверка на существующий адрес, если адрес не существует, то вывести под  окном ввода предупреждающую надпись 
                        if (

                        ((results[0].types[0] == 'locality' || results[0].types[1] == 'political') 
                            && address != 'ЦУМ, Днепропетровск, Днепропетровская область, Украина' && address != 'ЦУМ ТЦ, Dnepropetrovsk, Ukraine')
                        ||
                        (results[0].formatted_address.toString().search("49000") == -1)|| !isNaN(p)) // фильтр для поиска в Днепропетровске (если в полученном от Geocodera адресе отсутствует почтовый индекс, то это не Днепропетровск)
                        {                                                                                // isNaN(p) - проверка введено ли только число, если да, то отбраковать адрес для запроса в Geocoder
                            if (id == (id_start_win)) // окно начала пути 
                            {
                                $('#errAddr1').css('visibility', 'visible');
                                $('#errAddr1').css('color', 'red'); // отобразить надпись об ошибке под TextBox

                                if (marksArr[0] != undefined)
								{ // если маркер уже стоит на карте 
                                    marksArr[0].setMap(null); // убрать маркер с карты 
                                    coordMarkers[0] = null;

                                    // Проверяем на наличие установленных двух маркеров 
                                    AreTwoMarkersExist();

								}
                            }
							else if (marksArr[1] != undefined) {  // иначе, окно окончания пути 
                                $('#errAddr2').css('visibility', 'visible');
                                $('#errAddr2').css('color', 'red'); // отобразить надпись об ошибке под TextBox
                                if (marksArr[1] != undefined) { // если маркер уже стоит на карте 
                                    marksArr[1].setMap(null); // убрать маркер с карты 
                                    coordMarkers[1] = null;

                                    // Проверяем на наличие установленных двух маркеров 
                                    AreTwoMarkersExist();

								}
                            }
                        }
                        else {
                            var marker = new google.maps.Marker // создать объект "маркер"
                            ({
                                map: map,
                                position: results[0].geometry.location // координаты точки расположения адреса (маркера)
                            });

                            if (id == (id_start_win)) // окно начала пути 
                            {
                                if (marksArr[0] != null) // если маркер записан, удалить маркер из элемента массива 
                                {
                                    marksArr[0].setMap(null); // убрать маркер с карты 
                                    coordMarkers[0] = null;
                                }

                                marksArr[0] = marker;
                                coordMarkers[0] = results[0].geometry.location; // помещаем координату маркера 
                                $("#StartPoint_Latitude").val(coordMarkers[0].lat());
                                $("#StartPoint_Longitude").val(coordMarkers[0].lng());

                                $(id_start_win).val(results[0].formatted_address.toString()); // поместить адрес из Geocoder в окно ввода адреса 
//                                $(id_start_win).val(([(results[0].address_components[1] &&
//                                                        results[0].address_components[1].short_name || ''),
//                                                       (results[0].address_components[0] &&
//                                                        results[0].address_components[0].short_name || '')
//                                                      ].join(' '))
//                                                      .replace("Днепропетровск ", "")
//													 );
                                $('#errAddr1').css('visibility', 'hidden');
                            }

                            if (id == (id_end_win)) // окно окнчания пути 
                            {
                                if (marksArr[1] != null) // если маркер записан, удалить маркер из элемента массива 
                                {
                                    marksArr[1].setMap(null); // убрать маркер с карты 
                                    coordMarkers[1] = null;
                                }

                                marksArr[1] = marker;
                                coordMarkers[1] = results[0].geometry.location; // помещаем координату маркера 
                                $("#EndPoint_Latitude").val(coordMarkers[1].lat());
                                $("#EndPoint_Longitude").val(coordMarkers[1].lng());

                                $(id_end_win).val(results[0].formatted_address.toString()); // поместить адрес из Geocoder в окно ввода адреса
//                                $(id_end_win).val(([(results[0].address_components[1] &&
//                                                        results[0].address_components[1].short_name || ''),
//                                                       (results[0].address_components[0] &&
//                                                        results[0].address_components[0].short_name || '')
//                                                      ].join(' '))
//                                                      .replace("Днепропетровск ", "")
//                                                      );
                                $('#errAddr2').css('visibility', 'hidden');

                                //                                alert(results[0].geometry.location);



                            }


//                            alert(results[0].geometry.location);

                            // Если не выбраны обе точки маршрута, то центрируем их по одной из введёных 
                            if (coordMarkers[0] == null || coordMarkers[1] == null) {
                                if (coordMarkers[0] == null) // если первый маркер не установлен, то показываем "устанновленный" второй маркер 
                                    map.panTo(coordMarkers[1]);
                                else if (coordMarkers[1] == null) // иначе, 
                                    map.panTo(coordMarkers[0]); // показываем первый маркер 

                                map.setZoom(14); // установить масштаб                                

                                $("#makeRouteBtn").button("option", "disabled", true);
                                $("#textVersionBtn").button("option", "disabled", true);
                            }
                            else {
                                $("#makeRouteBtn").button("option", "disabled", false);
                                $("#textVersionBtn").button("option", "disabled", false);
                            }

                            // если были выбраны обе точки, то позиционируем их на карте так, чтобы они обе поместились 
                            var latlngbounds = new google.maps.LatLngBounds(); // создаём экземпляр объекта для определения границ заданного участка карты 

                            for (var i = 0; i < coordMarkers.length; i++) {
                                latlngbounds.extend(coordMarkers[i]); // вычитываем координаты маркеров в объект google.maps.LatLngBounds()
                            }

                            map.setZoom(14); // установить масштаб 

                            map.setCenter(latlngbounds.getCenter()); // спозиционировать центр от точек (маркер)
                            map.fitBounds(latlngbounds); // показать границы карты с видимыми маркерами
                        }

                    }
                    else {
                        alert(address.toString() + " не найден! Причина: " + status);
                    }
                }
            );
}

//-------------
// Выбор контрола для ввода текста поиска по его id
function setContrInpTxt(id) {
    $('#' + id).attr("placeholder", "");
    // !!!!!!!!!!!!  Дописать обработку управлением цвета текста при вводе новых (корректных) данных 
    // слать постоянные запросы геокодеру??? 

    // Обесцветить соответствующую надпись
    if ((('#' + id) == id_start_win) && $('#' + id).val() == "")
        $('#errAddr1').css('visibility', 'hidden'); // обесцветить надпись об ошибке под TextBox

    // Обесцветить соответствующую надпись 
    if ((('#' + id) == id_end_win) && $('#' + id).val() == "")
        $('#errAddr2').css('visibility', 'hidden'); // обесцветить надпись об ошибке под TextBox

//    var inputstr = document.getElementById(id); // окно для ввода текста адреса

//    // Реализация автозапонения. Сначала создаются ограничения для автозаполнения(которые не работают)
//    var cityBounds = new google.maps.LatLngBounds(
//				new google.maps.LatLng(48.375238410929384, 34.88),
//    //new google.maps.LatLng(48.6, 35.2));
//                new google.maps.LatLng(48.6735637223062, 35.376875791015664));
//    var options = {
//        bounds: cityBounds
//    };


    //    $('#indDnepr').appendTo( ('#' + id) );


    // Реализация автозапонения при поиске адреса 
//    autocomplete = new google.maps.places.Autocomplete(inputstr, options); // экземпляр объекта для автозаполнения
    //    autocomplete.setTypes('[]');
    //    autocomplete.bindTo('bounds', map); //связываются объект для автокомплита, и ограничения
    //    autocomplete.setBounds(cityBounds);

    //new version of Autocomlete
//    $('#' + id).live('focus', function () {
//        $('#' + id).autocomplete({
//            source: function (request, response) {
//                var correctionTerm = "Днепропетровск 49000";
//                geocoder.geocode({ 'address': request.term + correctionTerm }, function (results, status) {
//                    //$("#map_location").attr("value","");
//                    response($.map(results, function (item) {
//                        value = item.address_components[0].long_name;
//                        address = [(item.address_components[1] &&
//                        item.address_components[1].short_name || ''),
//                       (item.address_components[0] &&
//                        item.address_components[0].short_name || '')
//                      ].join(', ');
//                        return {
//                            label: address.replace("Днепропетровск, ", ""),
//                            value: address.replace("Днепропетровск, ", ""),
//                            location: item.geometry.location,
//                            addr: item.address_components[0]
//                        }
//                    }));
//                })
//            },
//            //minLength: 2,
//            select: function (event, ui) {
//                //$("#map_location").html("Latitude: " + ui.item.location.lat() + " Longitude: "+ ui.item.location.lng());
//                $('#' + id).val(ui.item.value.toString()); // если надо показать реальный адрес, то раскомментировать эту строку кода
////                showAddr(ui.item.value, ('#' + id)); // показать адрес на карте 
//            }
////        });
//    });

//    // Событие которое возникает при выборе из списка варианта рез. поиска для "Начала пути/Окончания пути"
//    google.maps.event.addListener
//        (
//            autocomplete,
//            'place_changed',
//            function () {

//                var place = autocomplete.getPlace(); // получить название адреса 

//                if (place != undefined) // если место определено (объект создан), то
//                {

//                    var addrTextBox = $('#' + id).val(); // сохраняем адрес, который введён в TextBox

//                    // Формируем адрес для поиска понему координат 
//                    var addr = [
//                            (place.address_components[0] &&
//                            place.address_components[0].short_name || ''),
//                            (place.address_components[1] &&
//                            place.address_components[1].short_name || ''),
//                            (place.address_components[2] &&
//                            place.address_components[2].short_name || ''),
//                            (place.address_components[3] &&
//                            place.address_components[3].short_name || '')
//                            ].join(' ');

//                    $('#' + id).val(addr); // если надо показать реальный адрес, то раскомментировать эту строку кода 
//                    showAddr(addr, ('#' + id)); // показать адрес на карте
//                    //                    $('#' + id).val(addrTextBox); // возвращаем обратно введённый адрес в TextBox
//                    //                    $('#' + id).val() = $('#' + id).val() + ' ' + addr; // добавляем территориальный адрес к адресу места, вводимому в TextBox

//                }
//                else // иначе помещаем в функцию поиска содержимое TextBox а 
//                {
//                    showAddr($('#' + id).val(), ('#' + id)); // показать адрес на карте
//                }

//            }
//        );
    
}

// Расчитать путь 
function calcRoute(start, end) {
    if ((start != "") && (end != "")) // если оба поля заполнены, 
    {                                 // то начать пролажевание пути 
        var dirService = new google.maps.DirectionsService(); // ??? создаём экземпляр объекта для сервиса прокладывания пути от точки к точке 

        var reqDirect = // создаём объект для запроса на сервиса "Расчитать маршрут"
            {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.DRIVING
        };

        dirService.route
            (
                reqDirect,
                function (result, status) {
                    if (google.maps.DirectionsStatus.OK) // если ответ от сервера Google Maps положительный 
                    {
                        dirDisplay.setDirections(result);  // то проложить на карте маршрут от начальной точки до конечной точки 
                    }
                }
            );

        dirDisplay.setMap(map);
    }
}


//Подготоавливаем карту и объекты, необходимые для прокладки пути мышью
function prepAddRoute() {

    var rendererOptions = {
        draggable: true //делаем маркеры доступными для перетаскивания
    };
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    directionsService = new google.maps.DirectionsService();
    initialize();
    google.maps.event.addListener(map, 'rightclick', function (event) { //обработчик события нажатия правой кнопки мыши
        makeroute(event.latLng);
    });
    google.maps.event.addListener(directionsDisplay, 'directions_changed', function () { //обработчик собыитя изменения маршрута
        computeTotalDistance(directionsDisplay.directions);
    });
    geocoder = new google.maps.Geocoder();
    directionsDisplay.setMap(map);
    start = "";
    end = "";
    way = [];
}


//Функция для прокладки и отображения маршрута
function makeroute(location) {
    //        var marker = new google.maps.Marker({
    //                position: location,
    //                map: map
    //            });
    if (start == "" && end == "") {
        start = location; //устанавливаем начальное значение, если не заданно еще
    }
    else {
        if (end == "" && start != "") { //устанавливаем конечное значение, если оно еще не установлено и прокладываем путь.
            end = location;
            var request = {
                origin: start,
                waypoints: way,
                destination: end,
                travelMode: google.maps.TravelMode.WALKING
            };
            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
            });
        } else {
            if (start != null && end != null) { //устанавливаем промежуточные значения и прокладываем путь.
                way.push({
                    location: end,
                    stopover: false
                });
                end = location;
                var request = {
                    origin: start,
                    waypoints: way,
                    destination: end,
                    travelMode: google.maps.TravelMode.WALKING
                };
                directionsService.route(request, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) { //отрисовываем всю эту ерунду на карте
                        directionsDisplay.setDirections(response);
                    }
                });
            }
        }
    }
}

//функция для подсчета растояния, которое покрывает маршрут
//а так же для парсинга объекта пути, полученного от гугла
function computeTotalDistance(res) {
    steps = res.routes[0].legs[0].steps; //массив объектов шагов нашего маршрута
    var total = 0;
    var myroute = res.routes[0];
    for (i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].distance.value;
    }
    total = total / 1000;
    $("#DistanceText").val(total + " км");
    text = "";
    //берем все части каждого шага и записываем их в строку, которую поймет SQLGeography
    for (var i = 0; i < steps.length; i++) {
        for (var j = 0; j < steps[i].path.length; j++) {
            text = text + steps[i].path[j].lng() + " " + steps[i].path[j].lat() + ", ";
        }

    }
    text = text.substring(0, text.lastIndexOf(', '));
    $("#RouteGeography").val(text);
}

// Функция определения вида транспорта и прорисовки соответствующего трека в виде легенды 
function DefineLegendTransp(idTransp, additionalText) {
    var style; // строка css для выбора цвета легенды 
    var displayInLine; // строка css для выбора расположения линии и текста легенды 
    var text; // текстовое содержание легенды
    //alert("Строиться легенда");

    // Выбираем согласно ID транспорта легенду, и прорисовываем её в документе 
    switch (idTransp) {
        case 1: // пеший ход к транспорту 
            {
                style = "border-top: 3px solid #00FF00";
               
                displayInLine = "display: inline-block";

                text = "walking"

            } break;

        case 2:
            {
                style = "border-top: 3px solid #0000FF";
               
                displayInLine = "display: inline-block";
                text = "bus №" + additionalText;

            } break;

        default: alert("Could'n found any transport!");

    }

    // Создаём динамически генерируемый HTML-код для вывода легенды - линия + текст

    $("#legend").append("<div style='" + style + "; width: 30px; " + displayInLine + "; margin-left: 10px; vertical-align: middle; ' ></div><div id='textlegend' style='" + displayInLine + "; margin-left: 5px; font-weight:900; font-size: 13px; vertical-align: middle ;' >" + text + "</div>" + "<br>");

}

// Обнулить легенду, маршрут, остановки ???, маркеры ???
function ResetLegend() {
    // Удаляем динамически генерируемый HTML-код для вывода легенды - линия + текст
    $("#legend").empty();

    StartDirectionsDirDisplay.setMap(null);
    EndDirectionsDirDisplay.setMap(null);
    busPath.setMap(null);

}

// При загрузке документа начать обработку функций
$(document).ready(function () {

	$("#StartPointAddress").focusout(function () { // Функция,которая вызыватся при потере фокуса из окна ввода начального адреса 

		showAddr($("#StartPointAddress").val(), "#StartPointAddress")

		if ($("#StartPointAddress").val() === "") {
			$("#StartPointAddress").attr("placeholder", "Enter the location");
		}

		// Обесцветить соответствующую надпись 
		if ($("#StartPointAddress").val() == "") {
			$('#errAddr1').css('visibility', 'hidden'); // обесцветить надпись об ошибке под TextBox
		}
	})
	// Обработчик нажатия кнопки Enter
	$("#StartPointAddress").keypress(function (event) {
		if (event.which == 13) 
		{
			showAddr($("#StartPointAddress").val(), "#StartPointAddress")
			event.preventDefault();
		}
	});

	//-------------
	$("#EndPointAddress").blur(function () { // Функция,которая вызыватся при потере фокуса из окна ввода конечного адреса 

		showAddr($("#EndPointAddress").val(), "#EndPointAddress")
		if ($("#EndPointAddress").val() === "") {
			$("#EndPointAddress").attr("placeholder", "Enter the location");
		}

		// Обесцветить соответствующую надпись 
		if ($("#EndPointAddress").val() == "")
			$('#errAddr2').css('visibility', 'hidden'); // обесцветить надпись об ошибке под TextBox
	})

	// Обработчик нажатия кнопки Enter
	$("#EndPointAddress").keypress(function (event) {
		if (event.which == 13) 
		{
			showAddr($("#EndPointAddress").val(), "#EndPointAddress")
			event.preventDefault();
		}
	});

	//-------------------

	// Обработка кнопки отображения подсказки Step-By-step
	$("#textVersionBtn").click(function () {

		var x_winOpen = $("#textVersionBtn").offset(); // определить координату расположения элемента 
		x_winOpen.top += $("#textVersionBtn").height() * 2;
		$("#stepByStepHelper").text($("#stepByStepHelper").append(textVersionString));

		$("#stepByStepHelper").dialog(
            { position: [x_winOpen.left, x_winOpen.top] },
            { height: 300, width: 577 },
		//            { hide: 'slide' },
            {close: function () { $(this).text("") } }
        );

	});

	// При нажатии на кнопку "Make Route", проверяем на наличие двух поставленных маркеров. Если установленны оба маркера, то продолжаем прорисовку маршрута, иначе (если хотя бы один из них null) запрещаем работу кнопки 
	$("#makeRouteBtn").click(
		function () {
			// Проверяем на наличие установленных двух маркеров 
			AreTwoMarkersExist();
		}
		);


});


// Проверяем на наличие установленных двух маркеров 
function AreTwoMarkersExist()
{
	if ((coordMarkers[0] == null) || (coordMarkers[1] == null)) {
		$("#makeRouteBtn").button({ disabled: true });

		// Обнулить легенду, маршрут, остановки ???, маркеры ???
		ResetLegend();
	}
}
var glob_routes;
//Готовим все для добавления остановок
function prepAddStop() {
    initialize();
//Самая важная часть - использование рисовалки от гугла:
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.CIRCLE, google.maps.drawing.OverlayType.RECTANGLE] //резрешаем круг и ректангл
        },
        circleOptions: {
            fillColor: '#FC1E56',
            fillOpacity: 0.40,
            strokeWeight: 1,
            clickable: true,
            zIndex: 1,
            editable: true
        }
    });
//после заверешния отрисовки устанавливаем обработчики, и выделяем последнюю обрисованную фигуру.
//обработчики фактически следят, что бы фиксировалось исменение центра координат фигуры.
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
        if (e.type != google.maps.drawing.OverlayType.MARKER) {
            drawingManager.setDrawingMode(null);
            var shape = e.overlay;
            shape.type = e.type;
            google.maps.event.addListener(shape, 'click', function () {
                setSelection(shape);
            });
            google.maps.event.addListener(shape, 'center_changed', function () {
                setSelection(shape);
            });
            
            setSelection(shape);
        }
    });
    drawingManager.setMap(map);
//отрисовываем все остановки из бд
    $.getJSON('\GetAllStops', function (data) {
        FillMapWithStops(data);
        $.getJSON('\GetAllRoutes', function (data) {
            rts = data;
            FillMapWithRoutes(data);
        });
    });
    
}
var rts;




//Заполняем карту полученными остановками
function FillMapWithStops(data) {
    for (var i = 0; i < data.length; i++) {
        var myLatlng = new google.maps.LatLng(parseFloat(data[i].lat), parseFloat(data[i].lng));
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: data[i].name
        });
    }
}


function FillMapWithRoutes(data) {
    var marker;
    this.addStopToolTip = function (shape, name) {
        google.maps.event.addListener(shape, 'mouseover', function (Event) {
            marker = new google.maps.Marker({
                position: Event.latLng,
                map: map,
                title: name,
                icon: 'https://chart.googleapis.com/chart?chst=d_fnote&chld=arrow_d|1|000000|h|'+name
            });
        });

        google.maps.event.addListener(shape, 'mouseout', function (Event) {
            marker.setMap(null);
        });
    };
    
    for (var i = 0; i < data.length; i++) {
        var name = null;
        name=data[i].name;
        var routeCoords = new Array();
        
        var coords = null;
        coords = data[i].coord;
        for (var j = 0; j < coords.length ; j++) {
            var latlng = null;
             latlng = new google.maps.LatLng(parseFloat(coords[j].lat), parseFloat(coords[j].lng));
            routeCoords.push(latlng);
        }
        var route = new google.maps.Polyline({
                strokeColor: '#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1, 6), // Цвет
                strokeOpacity: 1.0, // Прозрачность
                strokeWeight: 3 // Ширина
            });
        route.setPath(routeCoords);
        route.setMap(map);
        this.addStopToolTip(route, name);
    }

    
}


// Test маршрута в стиле "пунктирная линия"

var dirDisplayStyleLine; // отобразить маршрут на карте с стилем пунктирной линии

var dirServiceStyleLine = new google.maps.DirectionsService();


function SetStylePolyRoute() 
{

    var start = "Днепропетровск  пр.Пушкина 55" ;
    var end = "Днепропетровск пр.Кирова" ;

    // Настраиваем Polyline Options
    var PolyStyleDashed; // ссылка на объект Polyline
    var PolylineOptions; // объект опции Polyline
    

    var routeOption = {

        preserveViewport: true,
        routeIndex: 0,
        polylineOptions: {
            strokeColor: '#0000FF'
        }
    }

    dirDisplayStyleLine = new google.maps.DirectionsRenderer( routeOption ); // объект для отображения полилинии между двумя координатами

    var reqDirect =
        {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.WALKING
        };

        dirServiceStyleLine.route
        (
            reqDirect, function (result, status) {
            	if (google.maps.DirectionsStatus.OK) {
            		dirDisplayStyleLine.setDirections(result);

            		//                    dirDisplayStyleLine.setMap(map);


            		// Ставим маркеры на краних точках маршрута 

            		var marker1 = new google.maps.Marker({

            			map: map,
            			position: result.routes[0].legs[0].steps[0].start_location // координаты точки расположения адреса (маркера)

            		});

            		marker1.setMap(map); // поставить маркер в начало маршрута 

            		var marker2 = new google.maps.Marker({

            			map: map,
            			position: result.routes[0].legs[0].steps[1].end_location // координаты точки расположения адреса (маркера)

            		});

            		marker2.setMap(map); // поставить маркер в конец маршрута 

            		// Прорисовка Polyline в стиле "Штриховая линия"

            		PolylineOptions = {

            			strokeColor: '#00FF00',
            			strokeOpacity: 1.0,
            			strokeWeight: 3

            			//                        path: arrayODD

            		}

            		var arrayRenderer = new Array(); // сохраняем координаты Polyline в массив (координаты Google Maps сервиса построения маршрута) 
            		arrayRenderer = result.routes[0].overview_path;


            		// ???


            		/*


            		var arrayODD = new Array(); // 

            		for (var i = 0; i < result.routes[0].overview_path.length; i++) {

            		if (((i + 1) % 3) == 0) {


            		PolyStyleDashed = new google.maps.Polyline(PolylineOptions);
            		PolyStyleDashed.setPath(arrayODD);
            		PolyStyleDashed.setMap(map);

            		for (var n = 0; n < 2; n++) // освободить массив 
            		{
            		arrayODD.pop();
            		}
            		}
            		else {
            		arrayODD.push(result.routes[0].overview_path[i]);
            		}



            		}
            		*/

            		PolylineOptions2 = {

            			strokeColor: '#00FF00',
            			strokeOpacity: 1.0,
            			strokeWeight: 3,
            			strokeStyle: "dashed"

            			//                        path: arrayODD

            		}

            		var arr = new Array();

            		var coord = result.routes[0].legs[0].start_location;
            		arr.push(coord);

            		coord = result.routes[0].legs[0].end_location;
            		arr.push(coord);


					var PolyStyleDashed2 = new google.maps.Polyline(PolylineOptions2);
            		PolyStyleDashed2.setPath(arr);
            		PolyStyleDashed2.setMap(map);


            	}
            }
        );
            
            


}


function PolyStyled() 
{

	PolylineOptions = {

		strokeColor: '#00FF00',
		strokeOpacity: 1.0,
		strokeWeight: 3,
		Style: "dashed"

		//                        path: arrayODD

	}







}

var polyline;
var polylineCoords = [];
function predAddRoute_NonRoaded() {
    initialize();
    polyline = new google.maps.Polyline({
        strokeColor: "#FF0000", // Цвет
        strokeOpacity: 1.0, // Прозрачность
        strokeWeight: 1 // Ширина
    });
    
    google.maps.event.addListener(map, 'rightclick', function (event) {
        add_coords_to_Polyline(event.latLng);
    });
    google.maps.event.addListener(polyline, 'click', function (event) { 
        setSelection_NonRoaded(polyline);
    });

    function add_coords_to_Polyline(location) {
        var latlng = new google.maps.LatLng(location.lat(), location.lng());
        polylineCoords.push(latlng);
        polyline.setPath(polylineCoords);
        polyline.setMap(map);
        setSelection_NonRoaded(polyline);
    }

    function setSelection_NonRoaded(shape) {
        shape.setEditable(true);
        var coords = shape.getPath().b;
        var coord_text = "";
        for (var i = 0; i < coords.length; i++) {
            coord_text += coords[i].lng() + " " + coords[i].lat() + ", ";
        }
        coord_text = coord_text.substring(0, coord_text.lastIndexOf(', '));
        $("#RouteGeography").val(coord_text);
    }
}

