var autocomplete = {
    GetPredictions: function (controller, textbox, pointAddress, response) {
        var dataString = pointAddress + "=" + $(textbox).val();
        $.ajax({
            type: "GET",
            url: helpers.GetPath(controller),
            data: dataString,
            dataType: "json",
            success: function (jsonResponse) {
                var data = jsonResponse;
                try {
                    response($.map(data.Predictions, function (item) {
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
                }
                catch (e) {
                    console.log("Autocomplete error!");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
    },
    init: function () {
        var selectors = controls.settings.selectors;
        $(selectors.startAddressSelector).autocomplete({
            delay: 0,
            source: function (request, response) {
                autocomplete.GetPredictions("Autocomplete/GetPredictionsForStart/", selectors.startAddressSelector, "startPointAddress", response)
            },
            minLength: 1
        });
        $(selectors.endAddressSelector).autocomplete({
            delay: 0,
            source: function (request, response) {
                autocomplete.GetPredictions("Autocomplete/GetPredictionsForEnd/", selectors.endAddressSelector, "endPointAddress", response)
            },
            minLength: 1
        });
    }
};