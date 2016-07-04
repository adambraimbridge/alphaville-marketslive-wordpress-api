"use strict";

const fetch = require('node-fetch');

function WpApi (uuid) {
	const apiUrl = `${this.baseUrl}/marketslive/${uuid}`;
	const apiVersion = 2;


	function getUrlWithQueryParams(queryParams) {
		let separator = '?';
		let url = apiUrl;

		if (apiUrl.indexOf('?') !== -1) {
			separator = '&';
		}

		url += `${separator}v=${apiVersion}`;
		separator = '&';

		if (queryParams) {
			Object.keys(queryParams).forEach((key) => {
				url += `${separator}${key}=${queryParams[key]}`;
				separator = '&';
			});
		}

		url += `${separator}_=${new Date().getTime()}`;

		return url;
	}


	function fetchApi (url) {
		return fetch(url).then((response) => {
			if (response.status < 200 || response.status >= 400) {
				throw {
					status: response.status,
					error: response.status === 404 ? new Error("Not found") : null
				};
			}

			let json;
			try {
				json = response.json();
			} catch (e) {
				json = null;
			}

			if (json) {
				return json;
			} else {
				throw {
					status: 503,
					error: new Error("Unexpected response.")
				};
			}
		}).catch((err) => {
			console.log(err);
			throw {
				status: err.status || 503,
				error: err instanceof Error ? err : (err.error ? err.error : new Error("Unexpected response"))
			};
		});
	}

	this.catchup = function () {
		return fetchApi(getUrlWithQueryParams({
			action: 'catchup'
		}));
	};

	this.catchupJson = function () {
		return fetchApi(getUrlWithQueryParams({
			action: 'catchup',
			format: 'json'
		}));
	};

	this.status = function () {
		return fetchApi(getUrlWithQueryParams({
			action: 'getmeta'
		}));
	};

	this.init = function () {
		return fetchApi(getUrlWithQueryParams({
			action: 'init'
		}));
	};
}

WpApi.setBaseUrl = function (baseUrl) {
	WpApi.prototype.baseUrl = baseUrl;
};
module.exports = WpApi;
