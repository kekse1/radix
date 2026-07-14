#!/usr/bin/env node

/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/ https://github.com/kekse1/asleep/
 */

/*
 * SEE < https://github.com/kekse1/asleep/ >
 * ... that's also the place for the _latest version_!
 * here's only a reference - for an upcoming feature..
 */

// see the BOTTOM of this file.
const	RUN_TESTS = true;

//
// @ `asleep`
//
// diese datei gilt der initialen implementation.
// spaeter muss alles (aufbereitet!) into `asleep.js`!!
//
// dient dazu, dass bspw. mit `asleep =6pm` eine uhrzeit
// angegeben werden kann, wo zusaetzlich auch die regulaeren
// relativen zeit-diffs weiter zusaetzlich mit gelten..
// 
// ... ist hier aber noch nicht ganz vollstaendig alles!
// ps: erlaubt auch '+', '-' sowie '*'! ^_^
//
// TEST CASES on the BOTTOM of this (temporary) file.
//
// basis, ungefaehr: `=(0)7[:38[:26[:999]]](am/pm)`
//
// for fixed time o'clock! ...
// possibly additionally to regular
// time differences (+/- vs. =); ..
//
// bedenke "wechselspiel"(!): es ist
// moeglich, diese neuen '=' mit den
// alten '+' etc. in einem string zu
// mischen!! hier muss umgeschaltet
// werden, mit teil-strings und/oder
// .split(); oder so in der art..!!
//
// bestenfalls eine hoehere, globale
// basis-funktion, die alles passend
// aufteilt..?!!1 ;-D
//

//
//todo/bedenke, dass '=' nur *einmal* sein darf!1
//
//todo/'parseClock()' result muss noch umgewandelt werden!1
//
//todo/wenn zeit >= aktuelle, dann fuer heute. sonst morgen! ;-)
//
const parseTime = (_data, _date) => {
	//
};

const parseClock = (_data, _date) => {
	if(typeof _data !== 'string')
	{
		return null;
	}

	_data = _data.trim().toLowerCase();

	var meridiem;
	
	if(_data.endsWith('am'))
	{
		meridiem = 'am';
	}
	else if(_data.endsWith('pm'))
	{
		meridiem = 'pm';
	}
	else
	{
		meridiem = '';
	}

	if(meridiem)
	{
		_data = _data.slice(0, -2).trim();
	}

	while(_data[0] === '=')
	{
		_data = _data.substr(1);
	}

	if(!_data)
	{
		return null;
	}

	if(!_date)
	{
		_date = new Date();
	}

	const	strLimit = parseClock.strLimit,
		intLimit = parseClock.intLimit;
	const	result = [ '', '', '', '' ];
	var	state = 0, char;

	const getCurrent = (_state = state) => {
		switch(_state)
		{
			case 0: return _date.getHours();
			case 1: return _date.getMinutes();
			case 2: return _date.getSeconds();
			case 3: return _date.getMilliseconds();
			case 4: return (_date.getHours() < 12 ?
						'am' : 'pm');
			default: return null; }};

	const checkInt = () => {
		if(state >= 4)
		{
			return true;
		}

		if(typeof result[state] === 'number')
		{
			++state;
			return true;
		}

		if(result[state].length === 0)
		{
			result[state++] = 0;
			return true;
		}

		var relative = (result[state][0] === '+' ||
				result[state][0] === '-');

		if(relative)
		{
			relative = result[state][0];
			result[state] = Number(
				result[state].substr(1));
		}
		else
		{
			result[state] = Number(
				result[state]);
		}

		if(relative)
		{
			if(state === 0 && meridiem)
			{
				return false;
			}

			var value = getCurrent();

			switch(relative)
			{
				case '+':
					value += result[state];
					break;
				case '-':
					value -= result[state];
					break;
			}

			if((value % intLimit[state]) < 0)
			{
				value = ((intLimit[state] + value) %
						intLimit[state]);
			}

			result[state] = value;
		}
		else if(result[state] >= intLimit[state])
		{
			return false;
		}

		++state;
		return true;
	};

	parseLoop: for(var i = 0; i < _data.length; ++i)
	{
		char = _data[i].toLowerCase();

		if(char === ':')
		{
			if(state < 4)
			{
				if(result[state].length > strLimit[state])
				{
					return null;
				}

				if(!checkInt())
				{
					return null;
				}
			}
			else
			{
				break parseLoop;
			}
		}
		else if(char === '+' || char === '-')
		{
			if(state > 3)
			{
				return null;
			}

			if(result[state].length > 0)
			{
				return null;
			}

			result[state] = char;
		}
		else if(char === '*')
		{
			if(state === 0 && meridiem)
			{
				return null;
			}

			if(result[state])
			{
				return null;
			}

			result[state] = getCurrent();
		}
		else if(!isNaN(char))
		{
			result[state] += char;

			if(result[state].length > strLimit[state])
			{
				return null;
			}
		}
		else
		{
			return null;
		}
	}

	if(!checkInt())
	{
		return null;
	}

	if(meridiem === 'pm')
	{
		if((result[0] += 12) > intLimit[0])
		{
			return null;
		}
	}

	for(var i = 0; i < result.length; ++i)
	{
		if(result[i] === '')
		{
			result[i] = 0;
		}
	}

	return result;
};

parseClock.intLimit =
	[ 24, 60, 60, 1000 ];
parseClock.strLimit = new Array(
	parseClock.intLimit.length);

(() => { for(var i = 0; i < parseClock.strLimit.length; ++i)
		parseClock.strLimit[i] = (((parseClock.
			intLimit[i] - 1).toString().
			length) + 1); })();

//
if(RUN_TESTS)
{
	//
	// some test cases. 2nd (bool) is if it's expected to be successfull.
	//
	const test = [
		[ '8pm',		true	],
		[ '17',			true	],
		[ '6:*::::',		true	],
		[ '6:*:pm',		true	],
		[ '25',			false	],
		[ '28:45',		false	],
		[ '10::59',		true	],
		[ '10::61',		false	],
		[ '12:23:42:250',	true	],
		[ '=4:12pm',		true	],
		[ '=',			false	],
		[ '-1',			true	],
		[ '2::8',		true	],
		[ '2:*::8',		true	],
		[ '2:*::*pm',		true	],
		[ '+2',			true	],
		[ '-6',			true	],
		[ '+4pm',		false	],
		[ '-4pm',		false	],
		[ '4pm',		true	],
		[ '-4',			true	],
		[ '*:-10:-80:*',	true	],
		[ '::::pm',		true	],
		[ ':::::::pm',		true	],
		[ '*:-10:-80:*::am',	false	]
	];

	//
	for(var i = 0; i < test.length; ++i)
	{
		test[i] = [ ... test[i], parseClock(test[i][0]) ];
	}
	
	console.dir(test, { depth: 666 });
}

//
