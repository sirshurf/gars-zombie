var system = require('system');
var fs = require('fs');
var Browser = require("zombie");
var request = require("request");

var backend = function(metricArray, metric){
	var backend = metricArray.backend;
	var backendConfig = config.backend[backend];

	switch(backendConfig.type) {
		case 'datadog':
			datadog(backendConfig,metricArray, metric);
		break;
		
		default:
		exit(-1);
	} 

}

var datadog = function(backendConfig,metricArray, total){
	// Send Data to DatadogHQ
	var metricName = metricArray.name;
	var metricTags = metricArray.tags;
	var metricHostName = metricArray.hostname;

	var datadogApiKey = backendConfig.api_key;
	var datadogUrl = 'https://app.datadoghq.com/api/v1/series' || backendConfig.url;


	var ts = Math.floor(new Date().getTime()/1000);

	var metric = {
		metric: metricName,
		points:  [ [ ts , +total ] ],
		host: metricHostName,
		tags: metricTags,
		type: 'gauge'
	};

	//console.log(JSON.stringify(metric));
	request(
		{ method: 'POST'
		, uri: datadogUrl+'?api_key='+datadogApiKey
		, json:true
		, body: JSON.stringify({ 'series' : [metric] })
		}
		, function (error, response, body) {
			if(response.statusCode == 202){
				console.log('Accepted: '+ total)
				//console.log(body)
			} else {
				console.log('error: '+ response.statusCode)
				console.log(body)
			}

		}
	)

}

var browserVisit = function (browser, configLine) {
	var report = configLine.report;
	report.forEach(function(reportLine) {
		var analyticsHomeId = reportLine.analytics.home_id;
		var analyticsReportId = reportLine.analytics.report_id;

		browser.visit("https://www.google.com/analytics/realtime/getData?key="+analyticsHomeId+"&ds="+analyticsReportId+"&pageId=RealtimeReport%2Frt-overview&q=t%3A0%7C%3A1%7C%3A0%3A%2Ct%3A10%7C%3A1%7C%3A0%3A10%3D%3D%2Fthank_you%2F%2Ct%3A10%7C%3A1%7C%3A0%3A10%3D%3D%2F", function(e) {
			var StrippedString = browser.html('body').replace(/(<([^>]+)>)/ig,"");
			var JsonParsed = JSON.parse(StrippedString);
			// console.log("The page:", JsonParsed );
			var TotalMEtrics = JsonParsed["t:0|:1|:0:"]["metricTotals"][0];
			var TotalMEtricsSlash = JsonParsed["t:10|:1|:0:10==/"]["metricTotals"][0];
			var TotalMEtricsThankYou = JsonParsed["t:10|:1|:0:10==/thank_you/"]["metricTotals"][0];
			var ratio = parseInt(parseInt(TotalMEtricsThankYou)/parseInt(TotalMEtricsSlash)*100);
			console.log("The page:", ratio );

			backend( reportLine.metric, TotalMEtrics);
			backend( reportLine.ratio, ratio);

			// Infinite loop
			setTimeout(function () {
				browserVisit(browser, configLine);
			    }, 1000);

			});

	});
}

/*
 * Read configuration file
 */
var args = require('system').args;
var configFile = args[2];
var config = require(configFile);

config.scraper.forEach(function(configLine) {

	var googleEmail = configLine.google.email;
	var googlePassword = configLine.google.password;
	// Make Login
	browser = new Browser();
	browser.visit("https://accounts.google.com/ServiceLogin?service=analytics&passive=true&nui=1&hl=en&continue=https%3A%2F%2Fwww.google.com%2Fanalytics%2Fweb%2F%3Fhl%3Den&followup=https%3A%2F%2Fwww.google.com%2Fanalytics%2Fweb%2F%3Fhl%3Den", function () {
		console.log('First Page');
		// Fill email, password and submit form
		browser.
			fill("Email", googleEmail).
			fill("Passwd", googlePassword).
			pressButton("#signIn", function() {
				browserVisit(browser, configLine);

			});
	});

});



























