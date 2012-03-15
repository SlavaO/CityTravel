var textVersion = {
	string: "",

    settings: {
        divSelector: "#text-version-wrapper",
        buttonSelector: controls.settings.selectors.textVersionButtonSelector
    },

	init: function () {
		var settings = this.settings;

        $(settings.buttonSelector).click(function () {
            map.menu.closeMenu();
            var offset = $(settings.buttonSelector).offset();
            offset.top += $(settings.buttonSelector).height() * 2;
            $(settings.divSelector).empty();
            $(settings.divSelector).append(textVersion.removeBadSigns(textVersion.string, "��"));
        });
    },

		});
	},

	removeBadSigns: function (str, filter) {

		console.log(textVersion.string.search(filter));

		console.log(textVersion.string.search(filter));

		var strArr = str.split(filter);

		if (strArr.length != 0) {
			str = "";
			for (var i = 0; i < strArr.length; i++) {
				str += strArr[i];
			}
		}

		return str;
	},

	showWalkingSteps: function (route) {
		var steps = route.Steps;
		this.string = "";
		this.string = "<ol>";
		for (var i = 0; i < steps.length; i++) {
			this.string += " " + '<li>' + steps[i].Instruction + ' (<span class="text-time">' + steps[i].Time + '</span>, <span class="text-length">' + steps[i].Length + '</span>)' + '<br/>' + " " + '</li>';
		}
		this.string += "</ol>";

		this.totalParams(route); // отобразить суммарные значения параметров

	},

	showStepsToLand: function (route) {

		try {

			var steps = route.WalkingRoutes[0].Steps;
			var firstStop = route.Stops[0].Name;
			this.string = "<ol>";

			for (var i = 0; i < steps.length; i++) {
				this.string += " " + '<li>' + " " + steps[i].Instruction + ' (<span class="text-time">' + steps[i].Time + '</span>, <span class="text-length">' + steps[i].Length + '</span>)' + '<br/>' + " " + '</li>';
			}
			this.string += " " + '<li>' + localizedMessages["Sit"] + " " + '<b><span class="text-transport">' + route.Name.replace(route.Name.slice(0, route.Name.lastIndexOf('а') + 1), "маршрутку") + " " +
                '</span></b>' + localizedMessages["OnStop"] + " " + '<b>' + firstStop + '</b>'
                + ' (<span class="text-time">' + route.WaitingTime + ' мин</span>' + '</span>, <span class="text-price">' + route.Price + 'грн' + '</span>)' + '<br/>' + '</li>';

		}
		catch (e) {
			console.log("Остановки отсутствуют!");
		}

	},

	showStepsFromLand: function (route) {

		try {

			var steps = route.WalkingRoutes[1].Steps;

			// ???
			if (route.Stops[route.Stops.length - 1] == undefined || route.Stops[route.Stops.length - 1] == '') {
				route.Stops[route.Stops.length - 1] = '';
				route.Stops[route.Stops.length - 1].Name = '<strong>Какая то остановка</strong>';
			}

			var lastStop = route.Stops[route.Stops.length - 1].Name;
			this.string += " " + '<li>' + localizedMessages["RideUntil"] + " " + '<b>' + lastStop + '</b>' + " " + ' (<span class="text-time">'
                + route.RouteTime + '</span>, <span class="text-length">' + route.BusLength + '</span>)' + "<br>" + '</li>';

			for (var i = 0; i < steps.length; i++) {
				this.string += " " + '<li>' + ' ' + steps[i].Instruction + ' (<span class="text-time">' + steps[i].Time + '</span>, <span class="text-length">' + steps[i].Length + '</span>)' + '</li>';
			}

			this.string += " " + '</ol>';

			this.totalParams(route); // отобразить суммарные значения параметров 

		}
		catch (e) {
			console.log("Остановки отсутствуют!");
		}

	},

	totalParams: function (route) {

		if (route.Price == null || route.Price == 0)
			route.Price = "0грн";

		if (route.Length == null || route.Length == 0)
			route.Length = "0м";

		if (route.SummaryWalkingLength == null || route.SummaryWalkingLength == 0)
			route.SummaryWalkingLength = "0м";

		// В случае, когда выбираем из списка маршрутов - Только пеший - то
		//  в поле расстояние для маршрутки вписывается пешее расстояние, а в поле для 
		// пешего маршрута - расстояние = нулю (какого то всё наоборот)
		if (route.Length != null && route.SummaryWalkingLength == "0м") {
			route.SummaryWalkingLength = route.Length;
			route.Length = "0м";
		}

		textVersion.string += '<span class="text-summary"><b>Итого</b>: <span class="text-time">' + route.Time + '</span>, <span class="text-price">' + route.Price
            + '</span>, <span class="text-length">' + route.AllLength + '</span> (транспортом: <span class="text-length">'
                + route.BusLength + '</span>, пешком: <span class="text-length">' + route.SummaryWalkingLength + '</span>)</span>';

	},

	// расчёт суммарной дистанции пути 
	totalDistance: function (distance) {
		var dist = 0.0;
		for (var i = 0; i < distance.length; i++) {

			if (distance[i] == null || distance[i] == undefined)
				continue;

			if (distance[i].search("км") != -1) {

				dist += parseFloat(distance[i].replace("км", "").replace(",", ".")) * 1000.0;
			}
			else if (distance[i].search("м") != -1) {
				dist += parseInt(distance[i].replace("м", ""));
			}
		}

		if (dist >= 1000)
			return (dist / 1000) + ' км';
		else
			return (dist + ' м');
	}
};