
var KEY_WORDS_FOR_ADDRESS = ["Днепропетровск", "Днепропетровская область", "Украина", "49000"];
var KEY_WORD_FOR_REGION = "район";
var POSSIBLE_LOCATIONS = ["Днепропетровск"];
var CITY_STRING = "Днепропетровск, Днепропетровская область, Украина, 49000";
var ICON_START_POINT = "Content/images/pin-A-drag.png";
var ICON_END_POINT = "Content/images/pin-B.png";
var numMarker = { "startPoint": 0, "endPoint": 1 };

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

        // right clicking mouse button handler
        this.menu.init();

//        $("#swap").click(function () {


//            var tempText = $(controls.settings.selectors.startAddressSelector).val();
//            $(controls.settings.selectors.startAddressSelector).val($(controls.settings.selectors.endAddressSelector).val());
//            $(controls.settings.selectors.endAddressSelector).val(tempText);
//            console.log($(controls.settings.selectors.startAddressSelector).val());


//            if ($(controls.settings.selectors.endAddressSelector).val() == "") {
//                path["startPoint"] = new MapPoint(path["endPoint"].location);
//                path["startPoint"].marker = new google.maps.Marker({
//                    map: map.mapObject,
//                    position: path["endPoint"].location,
//                    icon: helpers.GetPath(ICON_START_POINT),
//                    draggable: true
//                });
//                map.menu.setEventMarker(path["startPoint"].marker, map.settings.NumMarkerRev[numMarker["startPoint"]]);
//                path["endPoint"].marker.setMap(null);
//            } else {
//                if ($(controls.settings.selectors.startAddressSelector).val() == "") {
//                    path["endPoint"] = new MapPoint(path["startPoint"].location);
//                    path["endPoint"].marker = new google.maps.Marker({
//                        map: map.mapObject,
//                        position: path["startPoint"].location,
//                        icon: helpers.GetPath(ICON_END_POINT),
//                        draggable: true
//                    });
//                    map.menu.setEventMarker(path["endPoint"].marker, map.settings.NumMarkerRev[numMarker["endPoint"]]);
//                    path["startPoint"].marker.setMap(null);
//                } else {
//                    var tempLoc = path["startPoint"].location;
//                    path["startPoint"].location = path["endPoint"].location;
//                    path["startPoint"].marker.setPosition(path["startPoint"].location);
//                    path["startPoint"].marker.setMap(map.mapObject);

//                    path["endPoint"].location = tempLoc;
//                    path["endPoint"].marker.setPosition(tempLoc);
//                    path["endPoint"].marker.setMap(map.mapObject);
//                }
//            }
//            helpers.ResetControls();
//            flagMake = false;

//        });
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

    //return only with name of street, number of building, name of region 
    delFromAddressUnwantedValues: function (address) {
        for (var i = 0; i < KEY_WORDS_FOR_ADDRESS.length; i++) {
            address = address.replace(", " + KEY_WORDS_FOR_ADDRESS[i], "");
        }
        return address;
    },

    //return specified address to Dnepropetrosk(it works like a filter for Dnepropetrosk) 
    addToAddressKeyWords: function (address) {
        for (var i = 0; i < KEY_WORDS_FOR_ADDRESS.length; i++) {
            if (address.toString().search(KEY_WORDS_FOR_ADDRESS[i]) == -1) {
                address = address + " " + KEY_WORDS_FOR_ADDRESS[i];
            }
        }
        return address;
    },

    //check if address is located in Dnepropetrovsk(if yes => return true)
    IsAddressValid: function (resultString) {
        if (resultString == CITY_STRING) {
            return false;
        }
        for (var i = 0; i < POSSIBLE_LOCATIONS.length; i++) {
            if (resultString.search(POSSIBLE_LOCATIONS[i] + ",") == -1) return false;
        }
        return true;
    },

    //return region of street/building/address
    RegionOfStreet: function (addressComponents) {
        for (var i = 0; i < addressComponents.length; i++) {
            if (addressComponents[i].long_name.search("район") != -1) return ', ' + addressComponents[i].long_name;
        }
        return "";
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
	        var pointA = $('<span>');
	        var pointB = $('<span>');
	        points.append(pointA, pointB);
	        pointA.addClass(map.settings.mapPointMenuClass.replace(".", ""));
	        pointA.append($("#imagePointA"));
	        pointB.addClass(map.settings.mapPointMenuClass.replace(".", ""));
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
	            helpers.ResetControls();
	            map.menu.setMarker(map.menu.mapMarkerX, map.settings.MarkerA);
	            window.A = map.menu.mapMarkerX;
	            flagMake = false;
	        });

	        $(pointB).click(function () {
	            helpers.ResetControls();
	            map.menu.setMarker(map.menu.mapMarkerX, map.settings.MarkerB);
	            window.B = map.menu.mapMarkerX;
	            flagMake = false;
	        });
	    },

	    setMarker: function (pos, n) {
	        map.geocoder.geocode({ 'latLng': pos }, function (results, status) {
	            if (status == google.maps.GeocoderStatus.OK) {
	                var curAddress = results[0].formatted_address + ', ' + results[1].address_components[0].long_name;
	                switch (map.settings.NumMarker[n]) {
	                    case 0:
	                        map.resolveAddress((curAddress), path, "startPoint", function () {
	                            $(controls.settings.selectors.startAddressSelector).val(map.delFromAddressUnwantedValues(path["startPoint"].name));
	                            $(controls.settings.selectors.startAddressSelector).css("color", '#000');
	                            controls.checkAndToogleButtons();
	                        });
	                        break;
	                    case 1:
	                        map.resolveAddress(curAddress, path, "endPoint", function () {
	                            $(controls.settings.selectors.endAddressSelector).val(map.delFromAddressUnwantedValues(path["endPoint"].name));
	                            $(controls.settings.selectors.endAddressSelector).css("color", '#000');
	                            controls.checkAndToogleButtons();
	                        });
	                        break;
	                }
	            }
	        });
	        map.menu.closeMenu();
	    },

	    //set event marker(for drag-and-drop). This function calls after drag the marker
	    setEventMarker: function (marker, n) {
	        google.maps.event.addListener(

            marker,
	            "dragend",
	            function () {
	                map.menu.setMarker(marker.position, n);
	                helpers.ResetControls();
	                flagMake = false;
	            }
	        );
	    }
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
                    $(controls.settings.selectors.startAddressSelector).tooltip('show');
                    break;
                case "endPoint":
                    $(controls.settings.selectors.endAddressSelector).tooltip('show');
                    break;
                default:
                    console.log("Error in switching property in geocoder function!");
                    break;
            }
            return;
        }

        //variable that stores the previous location of marker
        if (destination[property] != null) {
            var oldLocation = destination[property].location;
        }
        //if no city specified add it
        address = map.addToAddressKeyWords(address);
        var curAddress;
        //send request to google maps geocoder and return MapPoint object
        map.geocoder.geocode({ 'address': address }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                curAddress = results[0].formatted_address + map.RegionOfStreet(results[0].address_components);
                //check if address is not valid, show errot and exit
                if (!map.IsAddressValid(curAddress)) {
                    console.log("Address do not exist!.");
                    if (oldLocation != null) {
                        //return marker to the last place if address do not exist 
                        path[property].location = oldLocation;
                        path[property].marker.setPosition(oldLocation);
                        path[property].marker.setMap(map.mapObject);
                    }
                    switch (property) {
                        case "startPoint":
                            $(controls.settings.selectors.startAddressSelector).tooltip('show');
                            helpers.ResetControls();
                            //path["startPoint"].marker.setMap(oldLocation);
                            flagMake = true;
                            break;
                        case "endPoint":
                            $(controls.settings.selectors.endAddressSelector).tooltip('show');
                            helpers.ResetControls();
                            //path["endPoint"].marker.setMap(oldLocation);
                            flagMake = true;
                            break;
                        default:
                            console.log("Error in switching property in geocoder function!");
                            break;
                    }
                    return;
                }
                //check if address ok
                else {
                    var loc = results[0].geometry.location;

                    //save result to path property (start or end point)
                    if (destination[property] == null) {
                        destination[property] = new MapPoint(loc);
                        destination[property].marker = new google.maps.Marker({
                            map: map.mapObject,
                            position: loc,
                            draggable: true
                        });
                        switch (property) {
                            case "startPoint":
                                destination[property].marker.icon = helpers.GetPath(ICON_START_POINT);
                                break;
                            case "endPoint":
                                destination[property].marker.icon = helpers.GetPath(ICON_END_POINT);
                                break;
                        }
                    } else {
                        destination[property].location = loc;
                        destination[property].marker.setPosition(loc);
                        destination[property].marker.setMap(map.mapObject);
                    }

                    //set event for markers(for drag-and-drop)
                    map.menu.setEventMarker(destination[property].marker, map.settings.NumMarkerRev[numMarker[property]]);

                    switch (property) {
                        case "startPoint":
                            $(controls.settings.selectors.startAddressSelector).tooltip('hide');
                            break;
                        case "endPoint":
                            $(controls.settings.selectors.endAddressSelector).tooltip('hide');
                            break;
                        default:
                            console.log("Error in switching property in geocoder function!");
                            break;
                    }

                    destination[property].name = map.delFromAddressUnwantedValues(curAddress);
                }

                //scale with respect to markers
                if (destination["startPoint"] && destination["endPoint"] != null) {
                    map.fitToBounds(destination);
                } 

                //call success function
                success();
            }
            //if address geocoding error
            else {
                //return marker to the last place if address geocoding error
                path[property].location = oldLocation;
                path[property].marker.setPosition(oldLocation);
                path[property].marker.setMap(map.mapObject);
                console.log("Address do not exist!.");
                console.log("Geocoder error!");
            }
        });

    }
};