/**Handle Merge Anonymous Users */
async function onTrack(event, settings) {
	//Initialize Variables
	const instance_url = 'rest.iad-06.braze.com';
	const endpoint = `https://${instance_url}/users/merge`;
	let response;

	//Build Request Body
	let reqBody;
	reqBody = await buildRequestBody(event);
	console.log(reqBody);

	//Post Request Body
	try {
		response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${settings.apiKey}`,
				'Content-Type': 'application/json'
			},
			body: reqBody
		});
	} catch (error) {
		// Retry on connection error
		throw new RetryError(error.message);
	}

	if (response.status >= 500 || response.status === 429) {
		// Retry on 5xx (server errors) and 429s (rate limits)
		throw new RetryError(`Failed with ${response.status}`);
	}
		console.log(response.status + ' ' + response.statusText)
		return response.status;
}

//UTIL Functions

async function buildRequestBody(event) {
	let mergeAURequestBody = {
		merge_updates: [
			{
				identifier_to_merge: {
					user_alias: {
						alias_name: event.properties.BRAZE_USER_ID_VALUE,
						alias_label: event.properties.BRAZE_USER_ID_KEY
					}
				},
				identifier_to_keep: {
					user_alias: {
						alias_name: event.properties.REAL_TIME_USER_ID_VALUE,
						alias_label: event.properties.REAL_TIME_USER_ID_KEY
					}
				}
			}
		]
	};
	return JSON.stringify(mergeAURequestBody);
}

/**Handle Unsupported Event Types */
/**
 * Handle identify event
 */
async function onIdentify(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/identify/
	throw new EventNotSupported('identify is not supported');
}

/**
 * Handle group event
 */
async function onGroup(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/group/
	throw new EventNotSupported('group is not supported');
}

/**
 * Handle page event
 */
async function onPage(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/page/
	throw new EventNotSupported('page is not supported');
}

/**
 * Handle screen event
 */
async function onScreen(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/screen/
	throw new EventNotSupported('screen is not supported');
}

/**
 * Handle alias event
 */
async function onAlias(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/alias/
	throw new EventNotSupported('alias is not supported');
}

/**
 * Handle delete event
 */
async function onDelete(event, settings) {
	// Learn more at https://segment.com/docs/partners/spec/#delete
	throw new EventNotSupported('delete is not supported');
}
