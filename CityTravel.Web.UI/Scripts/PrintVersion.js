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
		ColorBus: "0x000000",

		WalkLineFull: {},
		BusLine: {},
		WalkLineStart: {},
		WalkLineEnd: {}
	},

	Url: null, // url для запроса 

	initMap: function () {

		var _this = this;
		settings = _this.settings;

		// Если объект карта Google Maps готов, то считать  её  текущие параметры 
		if (map.mapObject != null && map.mapObject != undefined) {

			_this.Url = 'http://maps.googleapis.com/maps/api/staticmap?center=' +
			map.mapObject.getCenter().Pa + ',' +
			map.mapObject.getCenter().Qa +
			'&zoom=' + map.mapObject.getZoom() +
			'&format=png&size=640x600&maptype=roadmap';

			settings.mapCenterPa = map.mapObject.getCenter().Pa;
			settings.mapCenterQa = map.mapObject.getCenter().Qa;
			settings.mapZoom = map.mapObject.getZoom();
		}
		else
			return;

		if (path.startPoint.location != null && path.startPoint.location != undefined) {

			if (path.startPoint.location.Oa != undefined && path.startPoint.location.Pa != undefined) {
				settings.Marker1Pa = path.startPoint.location.Oa;
				settings.Marker1Qa = path.startPoint.location.Pa;
			}
			else if (path.startPoint.location.Qa != undefined && path.startPoint.location.Ra != undefined)			{
				settings.Marker1Pa = path.startPoint.location.Qa;
				settings.Marker1Qa = path.startPoint.location.Ra;
			}
			else if (path.startPoint.location.Sa != undefined && path.startPoint.location.Ta != undefined)			{
				settings.Marker1Pa = path.startPoint.location.Sa;
				settings.Marker1Qa = path.startPoint.location.Ta;
			}			
			else {
				settings.Marker1Pa = path.startPoint.location.Pa;
				settings.Marker1Qa = path.startPoint.location.Qa;
			}

			_this.Url += '&markers=label:A%7C' + settings.Marker1Pa + ',' + settings.Marker1Qa;

		}

		if (path.endPoint.location != null && path.endPoint.location != undefined) {

			if (path.endPoint.location.Oa != undefined && path.endPoint.location.Pa != undefined) {
				settings.Marker2Pa = path.endPoint.location.Oa;
				settings.Marker2Qa = path.endPoint.location.Pa;
			}
			else if (path.endPoint.location.Qa != undefined && path.endPoint.location.Ra != undefined) {
				settings.Marker2Pa = path.endPoint.location.Qa;
				settings.Marker2Qa = path.endPoint.location.Ra;
			}
			else if (path.endPoint.location.Sa != undefined && path.endPoint.location.Ta != undefined) {
				settings.Marker2Pa = path.endPoint.location.Sa;
				settings.Marker2Qa = path.endPoint.location.Ta;
			}
			else {
				settings.Marker2Pa = path.endPoint.location.Pa;
				settings.Marker2Qa = path.endPoint.location.Qa;
			}

			_this.Url += '&markers=label:B%7C' + settings.Marker2Pa + ',' + settings.Marker2Qa;

		}


		// Первая остановка 
		if (path.stopsMarkers[0] != null && path.stopsMarkers[0] != undefined) {

			if (path.stopsMarkers[0].position.Oa != undefined && path.stopsMarkers[0].position.Pa != undefined) {
				settings.markerFirstBS_Pa = path.stopsMarkers[0].position.Oa;
				settings.markerFirstBS_Qa = path.stopsMarkers[0].position.Pa;
			}
			else if (path.stopsMarkers[0].position.Qa != undefined && path.stopsMarkers[0].position.Ra != undefined) {
				settings.markerFirstBS_Pa = path.stopsMarkers[0].position.Qa;
				settings.markerFirstBS_Qa = path.stopsMarkers[0].position.Ra;
			}
			else if (path.stopsMarkers[0].position.Sa != undefined && path.stopsMarkers[0].position.Ta != undefined) 
			{
				settings.markerFirstBS_Pa = path.stopsMarkers[0].position.Sa;
				settings.markerFirstBS_Qa = path.stopsMarkers[0].position.Ta;
			}
			else {
				settings.markerFirstBS_Pa = path.stopsMarkers[0].position.Pa;
				settings.markerFirstBS_Qa = path.stopsMarkers[0].position.Qa;
			}

			//            _this.Url += '&markers=label:F%7C' + settings.markerFirstBS_Pa + ',' + settings.markerFirstBS_Qa;
		}

		// Крайняя остановка 
		if (path.stopsMarkers[path.stopsMarkers.length - 1] != null && path.stopsMarkers[path.stopsMarkers.length - 1] != undefined) {

			var posStop = path.stopsMarkers.length - 1;


			if (path.stopsMarkers[posStop].position.Oa != undefined && path.stopsMarkers[posStop].position.Pa != undefined) {

				settings.markerFirstBS_Pa = path.stopsMarkers[posStop].position.Oa;
				settings.markerFirstBS_Qa = path.stopsMarkers[posStop].position.Pa;
			}
			else if (path.stopsMarkers[posStop].position.Qa != undefined && path.stopsMarkers[posStop].position.Ra != undefined) {
				settings.markerFirstBS_Pa = path.stopsMarkers[posStop].position.Qa;
				settings.markerFirstBS_Qa = path.stopsMarkers[posStop].position.Ra;
			}
			else if (path.stopsMarkers[posStop].position.Sa != undefined && path.stopsMarkers[posStop].position.Ta != undefined) {
				settings.markerFirstBS_Pa = path.stopsMarkers[posStop].position.Sa;
				settings.markerFirstBS_Qa = path.stopsMarkers[posStop].position.Ta;
			}
			else {
				settings.markerFirstBS_Pa = path.stopsMarkers[posStop].position.Pa;
				settings.markerFirstBS_Qa = path.stopsMarkers[posStop].position.Qa;
			}

			//            _this.Url += '&markers=label:L%7C' + settings.markerFirstBS_Pa + ',' + settings.markerFirstBS_Qa;
		}

		if ( path.walkPolyline.latLngs.b[0].length != 0 ) {
			settings.WalkLineFull = google.maps.geometry.encoding.encodePath(path.walkPolyline.latLngs.b[0].b);

			_this.Url += '&path=color:' + settings.ColorWalk + '|weight:3|enc:' + settings.WalkLineFull;
		}
		else {
			if ( path.busPolyLine.latLngs.b[0].length != 0 ) {
				settings.BusLine = google.maps.geometry.encoding.encodePath(path.busPolyLine.latLngs.b[0].b);

				_this.Url += '&path=color:' + settings.ColorBus + '|weight:3|enc:' + settings.BusLine;
			}

			if ( path.startWalkPolyLine.latLngs.b[0].length != 0 ) {
				settings.WalkLineStart = google.maps.geometry.encoding.encodePath(path.startWalkPolyLine.latLngs.b[0].b);

				_this.Url += '&path=color:' + settings.ColorWalk + '|weight:3|enc:' + settings.WalkLineStart;
			}

			if ( path.endWalkPolyline.latLngs.b[0].length != 0 ) {
				settings.WalkLineEnd = google.maps.geometry.encoding.encodePath(path.endWalkPolyline.latLngs.b[0].b);

				_this.Url += '&path=color:' + settings.ColorWalk + '|weight:3|enc:' + settings.WalkLineEnd;
			}
		}

		_this.Url += '&sensor=false';
	},

	reset: function () {
		$(PrintVersion.settings.selector).empty(); // очистить область для печати
	},

	render: function () {

		var _this = this;
		var settings = _this.settings;

		var w = window.open(); // создать новое окно для распечатки 
		w.document.write("<link rel='stylesheet' type='text/css' href=" + helpers.GetPath('Content/Site.css') + ">"); // загрузить css для печатной версии 

		var print = $('<div>');
		var header = $('<h3>');
		header.addClass(settings.printTxtHeader.replace(".", ""));
		header.append(settings.HeaderText);
		$(print).append(header);

		// Место отправления 
		var startplace = $('<p>');
		startplace.addClass(settings.PrintTxtDest.replace(".", ""));
		startplace.append(settings.StartPlace);

		var textSP = $('<text>');
		textSP.addClass(settings.PrintTxtAddr.replace(".", ""));
		textSP.append($(controls.settings.selectors.startAddressSelector).val());
		startplace.append(textSP);
		print.append(startplace);

		// Место назначения 
		var endplace = $('<p>');
		endplace.addClass(settings.PrintTxtDest.replace(".", ""));
		endplace.append(settings.EndPlace);

		var textEP = $('<text>');
		textEP.addClass(settings.PrintTxtAddr.replace(".", ""));
		textEP.append($(controls.settings.selectors.endAddressSelector).val());
		endplace.append(textEP);
		print.append(endplace);
		print.append($('<br />'));

		// Вывод легенды на печать 
		var legendPrint = $('<div>');
		legendPrint.attr('id', 'PrintLegend');

		var legendBar = null;
		var legendTxt = "";


		for (var i = 0; i < printLegendBar.length; i++) {

			legendBar = $('<div>');
			legendTxt = $('<div>');

			legendBar.addClass(legend.settings.legendEntityBarSelector.replace(".", ""));
			legendTxt.addClass(legend.settings.legendEntityTextSelector.replace(".", ""));

			switch (printLegendBar[i]) {
				case TransportType.Walking: // "Walking"
					{
						legendBar.addClass(legend.settings.transportTypeWalkingSelector.replace(".", ""));
						legendTxt.append(legend.settings.transportTypeWalkingDefaultText);

					} break;

				case TransportType.Bus: // "Bus"
					{
						legendBar.addClass(legend.settings.transportTypeBusSelector.replace(".", ""));
						legendTxt.append(printLegendText[i]);

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

				default: console.log('Не выбран ни один вид транспорта!'); // "Walking"
			}

			legendPrint.append(legendBar);
			legendPrint.append(legendTxt);
			legendPrint.append('<br />');

		}

		$(print).append(legendPrint); // переносим легенду в div для распечатки 

		// Отображаем карту 
		var StaticMap = $('<div>');
		$(StaticMap).attr('id', settings.MapSelector.replace("#", ""));
		var img = $('<img>');
		StaticMap.append(img);
		print.append(StaticMap); // подключаем рисунок расположения карты 

		PrintVersion.initMap(); // инициализировать переменные для запроса статической карты Google

		// Запрос карты для печати 
		img.attr('src', PrintVersion.Url); // считать карту 
		$(StaticMap).append(img); // добавить карту в документ 

		// Текстовая версия маршрута 
		var TextVersion = $('<div>');

		if (textVersion.string != "" && textVersion.string != null && textVersion.string != undefined) {
			TextVersion.append('<h3>' + 'Описание движения по маршруту следования' + '</h3>');
			TextVersion.children('h3').addClass(settings.TextVersionHeader.replace(".", "")); // добавить класс заголовка 

			TextVersion.append(textVersion.removeBadSigns(textVersion.string, "��")); // текст
		}
		else // иначе - предупреждающая надпись "Не выбран маршрут следования!"
		{
			TextVersion.append('<h3>' + 'Не выбран маршрут следования!' + '</h3>');
			TextVersion.children('h3').addClass(settings.TextVersionHeader.replace(".", "")); // добавить класс заголовка 
			TextVersion.children('h3').css('color', 'red');
		}

		$(print).append(TextVersion);
		w.document.write($(print).html());

		w.setTimeout(function () { w.print(), w.close() }, 2000); // дожидаемся пока прорисуется рисунок карты и выводим на печать документ 

	}
}

function printBlockRoute() // распечатка блока "Маршрут, легенда и текстовая версия маршрута"
{

//	QueryLoader.selectorPreload = "#googleMap";
//	QueryLoader.init();


    PrintVersion.reset(); // Reset Print Version
    PrintVersion.render();

    return false;
}