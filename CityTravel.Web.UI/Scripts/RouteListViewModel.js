/// <reference path="knockout-2.0.0.debug.js" />

// Class to represent a route
function Route(data) {
    var self = this;
    self.route = data;
    self.name = data.Name;
    self.selected = function () {
        return viewModel.isCurrentRoute(self.name);
    };
}
 
// Overall viewmodel for this screen, along with initial state
function MakeRouteViewModel() {
    var self = this;
    self.viewModel = ko.observableArray([]);
    self.currentRoute = ko.observable();
    self.priority = ko.observable("Time");
    
    self.routeListShown = ko.observable(false);
    
    // Load initial state from server, convert it to Route instances, then populate self.routeList
    self.load = function (allRoutes) {

        var routes = [];
        var length = allRoutes.length;

        for (var i = 0; i < length; i++) {
            var route = allRoutes[i];
            route.Number = route.Name.substring(route.Name.indexOf('№'));
            routes.push(route);
        }

        self.viewModel($.map(routes, function (item) { return new Route(item); }));

        switch (self.priority()) {
            case "Time":
                self.sortByTime();
                break;
            case "Money":
                self.sortByMoney();
                break;
        }

        self.routeListShown(true);
        self.setCurrentRoute(self.viewModel()[0]);
    };

    self.isCurrentRoute = function(routeName) {
        if (self.currentRoute() == undefined) return false;
        return routeName == self.currentRoute().name;
    };

    self.setCurrentRoute = function (route) {
        path.render(route);
        self.currentRoute(route);
    };

    self.routeType = ko.computed(function() {
        if (self.currentRoute() != undefined) {
            return self.currentRoute().route.Type.Type;
        } else {
            return '';
        }
    });

    self.clear = function() {
        self.viewModel.splice(0, self.viewModel().length);
    };

    self.priority.subscribe(function (newValue) {
        self.priority(newValue);
        switch (newValue) {
            case "Time":
                self.sortByTime();
                break;
            case "Money":
                self.sortByMoney();
                break;
        }

        if (self.viewModel().length > 0) {
            self.setCurrentRoute(self.viewModel()[0]);
        }
    });

    self.sortByMoney = function () {
        self.viewModel.sort(function (a, b) {
            return a.route.Cost < b.route.Cost ? -1 : 1;
        });
    };

    self.sortByTime = function () {
        self.viewModel.sort(function (a, b) {
            return a.route.TotalMinutes < b.route.TotalMinutes ? -1 : 1;
        });
    };

    self.getWalkingRouteLength = function (route, index) {
        if (route.WalkingRoutes != null) {
            return route.WalkingRoutes[index].Length;
        } else {
            return "0";
        }
    };

    //ViewModel for Controls
    self.startPoint = {
        name: ko.observable(""),
        location: ko.observable(false),
        isSelected: ko.observable(false),
        isValid: ko.observable(false)
    };

    self.endPoint = {
        name: ko.observable(""),
        location: ko.observable(false),
        isSelected: ko.observable(false),
        isValid: ko.observable(false)
    };


    self.isPathFined = ko.observable(false);

    self.findAddress = function (address, property) {
        self[property].isValid(false);
        self.isPathFined(false);
        map.resolveAddress(address, path, property, function () {
            helpers.ResetControls();
            self[property].isValid(true);
            self[property].name(path[property].name);
            self[property].location(path[property].location);
        });
        console.log(self[property].isValid());
    };

    self.isPathPossible = ko.computed(function () {
        return self["startPoint"].isValid() && self["endPoint"].isValid()
            && (self["startPoint"].name() != "") && (self["endPoint"].name() != "")
            &&(!self.isPathFined());
    });
    
    self["startPoint"].isSelected.subscribe(function (newValue) {
        if (newValue == false) {
            self.findAddress(self["startPoint"].name(), "startPoint");
        }
    });

    self["endPoint"].isSelected.subscribe(function (newValue) {
        if (newValue == false) {
            self.findAddress(self["endPoint"].name(), "endPoint");
        }
    });

    self.getRoutes = function () {
        var postData = {
            AddressPointA: path.startPoint.name,
            AddressPointB : path.endPoint.name,
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
                viewModel.load(returnedData);
            }
        });
        
        self.isPathFined(true);
    };
    
    self.swap = function () {
        var temp = self.startPoint.name();
        self.startPoint.name(self.endPoint.name());
        self.endPoint.name(temp);
        self.findAddress(self["startPoint"].name(), "startPoint");
        self.findAddress(self["endPoint"].name(), "endPoint");
    };



    self.textVersion = {
        string: ''

        , shown: ko.observable(false)
        
        , show: function () {
            self.textVersion.shown() ? self.textVersion.shown(false) : self.textVersion.shown(true);
            self.routeListShown() ? self.routeListShown(false) : self.routeListShown(true);
        }

        , removeBadSigns: function (str, filter) {
            var strArr = str.split(filter);

            if (strArr.length != 0) {

                str = "";
                for (var i = 0; i < strArr.length; i++) {
                    str += strArr[i];
                }
            }

            return str;
        }

        , walkingSteps: ko.computed(function () {
            if (self.currentRoute() != undefined && self.routeType() == "Walking") {
                return self.currentRoute().route.Steps;
            } else {
                return '';
            }
        })

        , stepsToLanding: ko.computed(function () {
            if (self.currentRoute() != undefined && self.routeType() == "Bus") {
                return self.currentRoute().route.WalkingRoutes[0].Steps;
            } else {
                return '';
            }
        })

        , stepsFromLanding: ko.computed(function () {
            if (self.currentRoute() != undefined && self.routeType() == "Bus") {
                return self.currentRoute().route.WalkingRoutes[1].Steps;
            } else {
                return '';
            }
        })

        , landOnInstruction: ko.computed(function () {
            if (self.currentRoute() != undefined && self.routeType() == "Bus") {
                return 'Сядьте на маршрутку' + self.currentRoute().route.Number;
            } else {
                return '';
            }
        })

        , landOffInstruction: ko.computed(function () {
            if (self.currentRoute() != undefined && self.routeType() == "Bus") {
                return 'Едьте до остановки ' + self.currentRoute().route.Stops[self.currentRoute().route.Stops.length - 1].Name;
            } else {
                return '';
            }
        })

        , waitingTime: ko.computed(function () {
            if (self.currentRoute() != undefined) {
                return self.currentRoute().route.WaitingTime;
            } else {
                return '';
            }
        })

        , price: ko.computed(function () {
            if (self.currentRoute() != undefined) {
                return self.currentRoute().route.Price;
            } else {
                return '';
            }
        })

        , rideTime: ko.computed(function () {
            if (self.currentRoute() != undefined) {
                return self.currentRoute().route.RouteTime;
            } else {
                return '';
            }
        })

        , rideLength: ko.computed(function () {
            if (self.currentRoute() != undefined) {
                return self.currentRoute().route.BusLength;
            } else {
                return '';
            }
        })

        , summaryTime: ko.computed(function () {
            if (self.currentRoute() != undefined) {
                return self.currentRoute().route.Time;
            } else {
                return '';
            }
        })

        , summaryPrice: ko.computed(function () {
            if (self.currentRoute() != undefined) {
                var route = self.currentRoute().route;
                if (route.Price == null || route.Price == 0) {
                    route.Price = "0 грн";
                }
                return route.Price;
            } else {
                return '';
            }
        })

        , summaryLength: ko.computed(function () {
            if (self.currentRoute() != undefined) {
                return self.currentRoute().route.AllLength;
            } else {
                return '';
            }
        })

        , busLength: ko.computed(function () {
            if (self.currentRoute() != undefined) {
                return self.currentRoute().route.BusLength;
            } else {
                return '';
            }
        })

        , walkingLength: ko.computed(function () {
            if (self.currentRoute() != undefined) {
                return self.currentRoute().route.SummaryWalkingLength;
            } else {
                return '';
            }
        })
    };
}

ko.bindingHandlers.slideVisibleLeft = {
    update: function (element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor(), allBindings = allBindingsAccessor();
        var valueUnwrapped = ko.utils.unwrapObservable(value);

        var duration = allBindings.slideDuration || 400;

        if (valueUnwrapped == true) {
            $(element).show();
            $(element).animate({ left: '+=400' }, duration);
        } else {
            $(element).animate({ left: '-=400' }, duration, function() { $(element).hide(); });
        }
    }
};

ko.bindingHandlers.slideVisibleRight = {
    update: function (element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor(), allBindings = allBindingsAccessor();
        var valueUnwrapped = ko.utils.unwrapObservable(value);

        var duration = allBindings.slideDuration || 400;

        if (valueUnwrapped == true) {
            $(element).show();
            $(element).animate({ left: '-=400' }, duration);
        } else {
            $(element).animate({ left: '+=400' }, duration, function() { $(element).hide(); });
        }
    }
};