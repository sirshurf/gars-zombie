Google Analytics Real Time Scraping (using ZombieJs)
===========

Currently logs in to Google Analytics and scrapes the realtime page for the active visitors number from the overview screen.

Notes: 
- Inspired by: 
 - <https://github.com/jedi4ever/gars> - This project is the reworked version of jedi4ever that I had to remove CasperJs.
 - <https://github.com/adamdunkley/casperjs-google-analytics-realtime-scrape>
 - <http://qzaidi.github.io/2013/06/23/dashboards-with-dashing/>
- Currently only support datadog as a backend, more to come soon
- This project uses zombiejs to scrape the metrics

# Installation

## Using the official npm
`$ npm install -g gars-zombie`

## From this repo
```
$ git clone https://github.com/sirshurf/gars-zombie.git
$ cd gars-zombie
$ npm install
```

# Configuration
```
{
	"scraper":   [{
			"google": {
				"email": "<your email>",
				"password": "<your password>"
			},
			"report": [{
				"analytics": {
					"home_id": "<your google analytics home id>",
					"report_id": "<your google analytics project id>"
				},
				"metric": {
					"backend":"datadog",
					"name": "google.analytics.visitors",
					"tags": [ "tag1", "tag2" ],
					"hostname": "<your hostname>"
				}

			}]
	}],

	"backend": {
		"datadog": {
			"type": "datadog",
			"api_key": "<your datadog api key",
			"url": "https://app.datadoghq.com/api/v1/series"
		}
	}

}
```

# Running it
## From this repo
`$ ./bin/gars-zombie -c <config file>`

## From npm (global)
`$ gars-zombie -c <config file>`

## From npm local
`$ ./node_modules/gars-zombie/bin/gars-zombie -c <config file>`

# Finding the ids
Once logged into the analytics. Note the following ids:

- `google.analytics.home_id` : `https://www.google.com/analytics/web/?hl=en#home/<home_id>/`
- `google.analytics.report_id` : `https://www.google.com/analytics/web/?hl=en#report/visitors-overview/<report_id>/`

