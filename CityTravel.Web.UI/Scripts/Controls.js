/// <reference path="bootstrap-typeahead.js" />
//object that incapsulates all controls work
var controls = {
    //controls settings
    settings: {
        selectors: {
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
    		AddressPointA: $(controls.settings.selectors.startAddressSelector).val(),
    		AddressPointB: $(controls.settings.selectors.endAddressSelector).val(),
    		StartPointLongitude: path.startPoint.location.lat(),
    		StartPointLatitude: path.startPoint.location.lng(),
    		EndPointLongitude: path.endPoint.location.lat(),
    		EndPointLatitude: path.endPoint.location.lng()
    	};

    	var jData = JSON.stringify(postData);
    	$.ajax({
    		url: helpers.GetPath("makeroute/index"),
    		type: "POST",
    		dataType: 'json',
    		data: jData,
    		contentType: 'application/json; charset=utf-8',
    		success: function (returnedData) {
    			// Если от сервера нет валидной информации, то высветить соответствующую ошибку соответствующего Textbox - а 
    			if (returnedData.AddressPointA != undefined && returnedData.AddressPointB != undefined) {
    				if (returnedData.AddressPointA == "")
    					$(controls.settings.selectors.startAddressErrorSelector).show();

    				if (returnedData.AddressPointB == "")
    					$(controls.settings.selectors.endAddressErrorSelector).show();

    				return 0;
    			}
    			else
    				routeList.load(returnedData);
    		}
    	});
    },

    //init function
    init: function () {
        var settings = this.settings, selectors = settings.selectors, labels = settings.labels;

        //style buttons
        $('.btn').button();

        //make route button click
        $(selectors.makeRouteButtonSelector).click(function () {
            if (flagMake == false) {

                controls.makeRoute(); // произвести поиск маршрута 
                path.startMakerRouteBloker = path.startPoint.name;
                path.endMakerRouteBloker = path.endPoint.name;
                map.menu.closeMenu();
                flagMake = true;

            } else {
                console.log("Вы уже построили маршрут!!!");
            }
        });
        //add "address" class to text-boxes
        $(selectors.startAddressSelector).addClass("address");
        $(selectors.endAddressSelector).addClass("address");
        $(selectors.startAddressSelector).tooltip({
            placement: 'right',
            title: "Ошибка ввода адреса",
            trigger: 'manual'
        });
        $(selectors.endAddressSelector).tooltip({
            placement: 'right',
            title: "Ошибка ввода адреса",
            trigger: 'manual'
        });


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
            $(".address").val(localizedMessages["EnterLocation"]);
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

        //close context menu
        $(selectors.startAddressSelector).focusin(function () {
            map.menu.closeMenu();
        });

        $(selectors.endAddressSelector).focusin(function () {
            map.menu.closeMenu();
        });


        //geocoding
        $(selectors.startAddressSelector).blur(function () {
            if (($(selectors.startAddressSelector).val() == "") || ($(selectors.startAddressSelector).val() == "Введите адрес")) {
                helpers.ResetControls();
                map.menu.setMarker(null, map.settings.MarkerA);
            } else {
                //$(selectors.startAddressSelector).typeahead("select");
            }
            map.resolveAddress($(this).val(), path, "startPoint", function () {
                $(selectors.startAddressSelector).val(path.startPoint.name);
                if ((path.previousStartPosition != path.startPoint.name) && (path.previousStartPosition != "")) {
                    helpers.ResetControls();
                    flagMake = false;
                }
                controls.checkAndToogleButtons();
                path.previousStartPosition = path.startPoint.name;
            });
        });

        $(selectors.startAddressSelector).keypress(function (event) {
            if (event.which == 13) {
                map.resolveAddress($(this).val(), path, "startPoint", function () {
                    $(selectors.startAddressSelector).val(path.startPoint.name);
                    if ((path.previousStartPosition != path.startPoint.name) || (path.previousStartPosition == "")) {
                        $(selectors.startAddressErrorSelector).hide();
                        helpers.ResetControls();
                    }
                    controls.checkAndToogleButtons();
                });
                event.preventDefault();
                $(selectors.endAddressSelector).focus();
                flagMake = false;
            }
        });

        $(selectors.endAddressSelector).blur(function () {
            if (($(controls.settings.selectors.endAddressSelector).val() == "") || ($(controls.settings.selectors.endAddressSelector).val() == "Введите адрес")) {
                helpers.ResetControls();
                map.menu.setMarker(null, map.settings.MarkerB);
            }
            else {
                //$(selectors.endAddressSelector).typeahead("select");
            }


            map.resolveAddress($(this).val(), path, "endPoint", function () {
                $(selectors.endAddressSelector).val(path.endPoint.name);
                if ((path.previousEndPosition != path.endPoint.name) && (path.previousEndPosition != "")) {
                    helpers.ResetControls();
                    path.previousEndPosition = path.endPoint.name;
                    flagMake = false;
                }
                controls.checkAndToogleButtons();

            });
        });

        $(selectors.endAddressSelector).keypress(function (event) {
            if (event.which == 13) {
                map.resolveAddress($(this).val(), path, "endPoint", function () {
                    if ((path.previousStartPosition != path.startPoint.name) || (path.previousStartPosition == "")) {
                        helpers.ResetControls();
                    }
                    controls.checkAndToogleButtons();
                });
                event.preventDefault();
                $(selectors.makeRouteButtonSelector).focus();

                flagMake = false;
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