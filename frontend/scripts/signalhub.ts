import gui_shared = require("./gui_shared");
import * as _ from "lodash";
export var signalHub: any = {};
export var hubConnector : any = {};

interface ISignalHub extends SignalR { SignalHub : any; }

$(document).ready(function () {

	// SignalR Hub:
	$.connection.hub.url = "/signalr";
    const con = <ISignalHub>$.connection;
	signalHub = con.SignalHub; // Hub class
	const connection = !signalHub?$.hubConnection():$.connection.hub;
	if (!signalHub) {
	   console.log("hub not found");
	}

    // Cound be returned from server as separate call of this client function,
	// or just data from searchCompanies done-call:
	// signalHub.client.listCompanies = function (data) {
    //     const act = signalHub.server.buyStocks;
	// 	gui_shared.renderAvailableCompanies(data, act);
	// };

	signalHub.client.notifyDeal = function (data) {
		alert(data);
	};

	connection.error(function (error) {
		console.log('SignalR error: ' + error);
	});

	connection.logging = true;
	hubConnector = connection.start({ transport: ['webSockets', 'longPolling'] }).fail(function(xhr, textStatus, errorThrown){
                        console.log('Could not Connect!');
                        console.log('Response: ' + textStatus);});
	hubConnector.done(function () {
        // more functions could be here...
        // signalHub.server.doThings(...);
    });

    $(document).foundation();
    gui_shared.renderNavBar("");
});
export function mapOptionType(p) {
	const fieldValue = $('#'+p.toLowerCase()).val();
	if(p==="CompanyName") { return fieldValue; }
	if(p==="FoundedAfter" || p==="FoundedBefore") {
		if(fieldValue.indexOf(".") > -1){
            const parts = fieldValue.split('.');
            const parsed = new Date(parts[2], parts[1]-1, parts[0]);
            return parsed;
        } else if (fieldValue.indexOf("/") > -1){
            const parts = fieldValue.split('/');
            const parsed = new Date(parts[2], parts[1]-1, parts[0]);
            return parsed;
        } else {
            const parsed = new Date(Date.parse(fieldValue));
            return parsed;
        }
	}
	return {Case: "Some", Fields: [fieldValue]};
	// Option Union-types would be: {Case: "Some", Fields: [{Case: fieldValue}]};
}

export function refreshResultList() {
	const ms = new Date().getTime() + 86400000;
	const tomorrow = new Date(ms);
	const searchObject = {
		FoundedAfter : new Date(0), // "1970-01-01T00:00:00.0000000+03:00"
		FoundedBefore : tomorrow, // "2015-07-12T15:26:13.7884528+03:00"
		CompanyName : "",
		CEOName: null // {"Case":"Nadela"}
	};

	const keys = Object.keys(searchObject);
	const params = _.filter(keys, function(c){return ($('#'+c.toLowerCase()).val()!=="");});
	_.each(params, function(p){ searchObject[p] = mapOptionType(p);});

	signalHub.server.searchCompanies(searchObject).done(function (data) {
			const act = signalHub.server.buyStocks;
			gui_shared.renderAvailableCompanies(data, act);
		}).fail(function(xhr, textStatus, errorThrown) {
                console.log('Response: ' + textStatus);
		});
}
