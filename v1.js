/**HANDLE MERGE ANONYMOUS USERS**/

/*Function Notation
This function passes two alias's, each corresponding to a separate alias only profile within Braze, and merges the two unknown users into a single anonymous user profile.

Case 1: This function receives a track event that contains the following four values in the event properties to merge a real time event user and an anonymous user: BRAZE_USER_ID_KEY, BRAZE_USER_ID_VALUE, REAL_TIME_USER_ID_KEY, REAL_TIME_USER_ID_VALUE
BRAZE_USER_ID_KEY: the braze alias label
BRAZE_USER_ID_KEY: the braze alias name
REAL_TIME_USER_ID_KEY: the braze alias label sent in a real time event
REAL_TIME_USER_ID_VALUE: the braze alias name sent in a real time event

Case 2: This function receives a track event that contains the following four values in the event properties to merge two anonymous user: BRAZE_USER_ID_KEY_1, BRAZE_USER_ID_VALUE_1, BRAZE_USER_ID_KEY_2, BRAZE_USER_ID_VALUE_2
BRAZE_USER_ID_KEY_1: the braze alias label for profile 1
BRAZE_USER_ID_VALUE_1: the braze alias name for profile 1
BRAZE_USER_ID_KEY_2: the braze alias label for profile 2
BRAZE_USER_ID_VALUE_2: the braze alias name for profile 2
*/

//Initialize Global Variables
const instance_url = 'rest.iad-06.braze.com';
const endpoint = `https://${instance_url}/users/merge`;
let response;

//Main Function to Handle Track Events
async function onTrack(event, settings) {
	//Validate and Handle Track Event
	let validatedEvent;
	validatedEvent = await validateEvent(event);

	//Build Request Body
	let reqBody;
	reqBody = await buildRequestBody(validatedEvent);
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
	console.log(response.status + ' ' + response.statusText);
	return response.status;
}

//UTIL Functions

//Handle Event Validation Errors
class MissingPropertyError extends Error {
	constructor(propertyPath) {
		super(`Missing property: ${propertyPath}`);
		this.name = 'MissingPropertyError';
	}
}

//Handle Event Validation
async function validateEvent(event) {
	let profile_one_key;
	let profile_one_value;
	let profile_two_key;
	let profile_two_value;

	switch (event.event) {
		case 'merge_anonymous_users_with_realtime_users':
			const expectedPropertyPaths2 = [
				'properties.BRAZE_USER_ID_KEY',
				'properties.BRAZE_USER_ID_VALUE',
				'properties.REAL_TIME_USER_ID_KEY',
				'properties.REAL_TIME_USER_ID_VALUE'
			];

			expectedPropertyPaths2.forEach(propertyPath => {
				if (!checkPropertyPath(event, propertyPath)) {
					throw new MissingPropertyError(propertyPath);
				}
			});

			profile_one_key = event.properties.BRAZE_USER_ID_KEY;
			profile_one_value = event.properties.BRAZE_USER_ID_VALUE;
			profile_two_key = event.properties.REAL_TIME_USER_ID_KEY;
			profile_two_value = event.properties.REAL_TIME_USER_ID_VALUE;
			console.log(
				'Event Criteria Met for Merging Anonymous and Real-time Users'
			);
			break;

		case 'merge_anonymous_users':
			const expectedPropertyPaths1 = [
				'properties.BRAZE_USER_ID_KEY_1',
				'properties.BRAZE_USER_ID_VALUE_1',
				'properties.BRAZE_USER_ID_KEY_2',
				'properties.BRAZE_USER_ID_VALUE_2'
			];

			expectedPropertyPaths1.forEach(propertyPath => {
				if (!checkPropertyPath(event, propertyPath)) {
					throw new MissingPropertyError(propertyPath);
				}
			});

			profile_one_key = event.properties.BRAZE_USER_ID_KEY_1;
			profile_one_value = event.properties.BRAZE_USER_ID_VALUE_1;
			profile_two_key = event.properties.BRAZE_USER_ID_KEY_2;
			profile_two_value = event.properties.BRAZE_USER_ID_VALUE_2;

			console.log('Event Criteria Met for Merging Anonymous Users');
			break;

		default:
			console.log('Neither of the predefined event cases were met.');
			throw new EventNotSupported(
				'Neither of the predefined event cases were met.'
			);
			break;
	}
	return {
		profile_one_key,
		profile_one_value,
		profile_two_key,
		profile_two_value
	};
}

//Handle Validation of Each Property
function checkPropertyPath(obj, propertyPath) {
  const properties = propertyPath.split('.');
  let currentObject = obj;

  for (const property of properties) {
    if (
      currentObject &&
      currentObject.hasOwnProperty(property) &&
      currentObject[property] !== null &&
      currentObject[property] !== undefined
    ) {
      currentObject = currentObject[property];
    } else {
      return false;
    }
  }

  return true;
}


//Build Merge Request Body
async function buildRequestBody(validatedEvent) {
	let mergeAURequestBody = {
		merge_updates: [
			{
				identifier_to_merge: {
					user_alias: {
						alias_name: validatedEvent.profile_one_value,
						alias_label: validatedEvent.profile_one_key
					}
				},
				identifier_to_keep: {
					user_alias: {
						alias_name: validatedEvent.profile_two_value,
						alias_label: validatedEvent.profile_two_key
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