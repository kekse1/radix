#!/usr/bin/env node

/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/ https://github.com/kekse1/asleep/
 */

//
// see the BOTTOM of this file: running test cases?
//
const TESTING = true;

/*
 *
 * TODO * fehlt nur noch syntax "@30s", etc...!!1 ;-D
 *
 *
 * WICHTIG! wenn in einem '=' *clock*-string auch '-' bzw. '+' vorkommen,
 * so muss dieser string am ende mit einem weiteren '=' terminiert werden!
 * .. sonst muss man davon ausgehen, dass '+' bzw. '-' als time-diff sind..
 *
 *	... e.g. `+36h-24h=+2,48h`
 *
 * TODO!??!????? verbessern!?
 */

//
//nur hier..
//
Math.time = {};

Math.time.clock = (_data, _date) => {
	if(typeof _data !== 'string')
	{
		return null;
	}

	if((_data = __mathTimeClockPrepareAndCleanClockString(_data)) === null)
	{
		return null;
	}

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
		_data = _data.slice(
			0, -2).trim();
	}

	if((_data = __mathTimeClockPrepareAndCleanClockString(_data)) === null)
	{
		return null;
	}

	if(!_date)
	{
		_date = new Date();
	}

	const	result = [ '', '', '', '' ];

	if(_data === '**')
	{
		for(var i = 0; i < 4; ++i)
		{
			result[i] = Math.time.clock.
				getCurrent(i, _date);
		}

		return result;
	}

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
		
		if(result[state] === '*')
		{
			result[state] = Math.time.clock.
				getCurrent(state, _date);
			++state; return true;
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

			var value = Math.time.clock.
				getCurrent(state, _date);

			switch(relative)
			{
				case '+':
					value += result[state];
					break;
				case '-':
					value -= result[state];
					break;
			}

			if((value % __intLimit[state]) < 0)
			{
				value = ((__intLimit[state] + value) %
						__intLimit[state]);
			}

			result[state] = value;
		}
		else if(result[state] >= __intLimit[state])
		{
			return false;
		}

		++state;
		return true;
	};

	var	state = 0,
		char;

	parseLoop: for(var i = 0; i < _data.length; ++i)
	{
		char = _data[i].toLowerCase();

		if(char === ':')
		{
			if(state < 4)
			{
				if(result[state].length > __strLimit[state])
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

			result[state] = '*';
		}
		else if(!isNaN(char))
		{
			result[state] += char;

			if(result[state].length > __strLimit[state])
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

	if(meridiem === 'pm' && (result[0] += 12) > __intLimit[0])
	{
		return null;
	}

	for(var i = 0; i < result.length; ++i)
	{
		if(result[i] === '')
		{
			result[i] = 0;
		}
		else if(result[i] === '*')
		{
			result[i] = Math.time.clock.
				getCurrent(i, _date);
		}
	}

	return result;
};

//
Math.time.clock.parse = (_data, _date, _raw = false) => {
	if(typeof _data !== 'string')
	{
		if(typeof _data === 'number')
		{
			return _data;
		}

		return null;
	}
	
	const endsWith = ((_data = _data.trim()
		)[_data.length - 1] === '=');

	if((_data = __mathTimeClockPrepareAndCleanClockString(_data)) === null)
	{
		return null;
	}

	if(endsWith) _data += '=';

	if(!_date)
	{
		_date = new Date();
	}

	const	strings = [ '', '' ], index = [];
	var	count = 0, state = 0,
		char, rest, min;

	for(var i = 0; i < _data.length; ++i)
	{
		char = _data[i].toLowerCase();

		switch(char)
		{
			case '=':
				/*
				 * WICHTIG! wenn in einem '=' *clock*-string auch '-' bzw. '+' vorkommen,
				 * so muss dieser string am ende mit einem weiteren '=' terminiert werden!
				 * .. sonst muss man davon ausgehen, dass '+' bzw. '-' als time-diff sind..
				 *
				 *	... e.g. `+36h-24h=+2,48h`
				 *
				 * TODO!??!????? verbessern!?
				 */
				if(state === 1)
				{
					state = 0;
				}
				else if(++count > 1)
				{
					min = true;
					
					for(var j = i + 1; j < _data.length; ++j)
					{
						if(_data[j] !== '=')
						{
							min = false;
							break;
						}
					}
					
					if(min)
					{
						break;
					}
					
					return null;
				}
				state = 1;
				break;
			case ':':
			case '*':
			case 'a':
			case 'p':
			case 'm':
				state = 1;
				break;
			case ',':
			case ' ':
			case '\t':
				state = 0;
				break;
			case '+':
			case '-':
				/*
				 * WICHTIG! wenn in einem '=' *clock*-string auch '-' bzw. '+' vorkommen,
				 * so muss dieser string am ende mit einem weiteren '=' terminiert werden!
				 * .. sonst muss man davon ausgehen, dass '+' bzw. '-' als time-diff sind..
				 *
				 *	... e.g. `+36h-24h=+2,48h`
				 *
				 * TODO!??!????? verbessern!?
				 */
				if(state !== 0)
				{
					rest = _data.substr(1).indexOf('=');

					if(rest === -1)
					{
						state = 0;
					}

					index[0] = _data.substr(1).indexOf(',');
					index[1] = _data.substr(1).indexOf(' ');
					index[2] = _data.substr(1).indexOf('\t');
					
					for(var j = index.length - 1; j >= 0; --j)
					{
						if(index[j] === -1)
						{
							index.splice(j, 1);
						}
					}
					
					if(index.length > 0 && (min = Math.min(... index)) < rest)
					{
						state = 0;
					}
				}

				break;
		}

		strings[state] += char;
	}

	var result;

	if(strings[0] && Math.time.parse)
	{
		if((result = Math.time.parse(strings[0])) === null)
		{
			return null;
		}
	}
	else
	{
		result = 0;
	}

	if(strings[1] && Math.time.clock)
	{
		if((char = Math.time.clock(strings[1], _date)) === null)
		{
			return null;
		}

		var value = _date.getDate();

		if(Math.time.clock.onNextDay(char, _date))
		{
			++value;
		}

		value = new Date(
			_date.getFullYear(),
			_date.getMonth(),
			value, ... char);
		result += (value.getTime() -
			_date.getTime());
	}

	if(_raw)
	{
		return { result, strings, clock: char,
			 DATE: Math.time.clock('**', _date),
			 date: _date, now: _date.getTime() };
	}

	return result;
};

Math.time.clock.getCurrent = (_unit, _date) => {
	if(!_date)
	{
		_date = new Date();
	}

	switch(_unit)
	{
		case 0: return _date.getHours();
		case 1: return _date.getMinutes();
		case 2: return _date.getSeconds();
		case 3: return _date.getMilliseconds();
		case 4: throw new Error('debug');
	}
	
	if(typeof _unit === 'number')
	{
		return null;
	}
	
	const result = new Array(4);
	
	for(var i = 0; i < result.length; ++i)
	{
		result[i] = Math.time.clock.
			getCurrent(i, _date);
	}
	
	return result;
};

Math.time.clock.onCurrentDay = (_clock, _date) => {
	if(!_date)
	{
		_date = new Date();
	}
	
	var curr; for(var i = 0; i < _clock.length; ++i)
	{
		curr = Math.time.clock.
			getCurrent(i, _date);

		if(_clock[i] < curr)
		{
			return false;
		}

		if(_clock[i] !== curr)
		{
			break;
		}
	}

	return true;
};

Math.time.clock.onNextDay = (... _args) => !Math.
	time.clock.onCurrentDay(... _args);

//
Reflect.defineProperty(Math.time.clock, 'LIMIT', { value: {} });

const __intLimit = [ 24, 60, 60, 1000 ];
const __strLimit = new Array(__intLimit.length);

(() => { for(var i = 0; i < __strLimit.length; ++i)
		__strLimit[i] = (((__intLimit[i] - 1).
			toString().length) + 1); })();

Reflect.defineProperty(Math.time.clock.LIMIT, 'int', {
	get: () => [ ... __intLimit ] });
Reflect.defineProperty(Math.time.clock.LIMIT, 'str', {
	get: () => [ ... __strLimit ] });

const __mathTimeClockPrepareAndCleanClockString = (_data) => {
	if(!(_data = _data.trim().toLowerCase()))
		return null;
	var c = 0; while(_data[_data.length - ++c] === '=');
	if(--c) _data = _data.slice(0, -c).trim();
	c = 0; while(_data[c++] === '=');
	if(--c) _data = _data.substr(c).trim();
	if(!(_data = _data.replace(/={2,}/g, '=').trim()))
		return null;
	return _data;
};

//
if(TESTING)
{
	//
	const diffTest = '=*:*:30:*';

	//
	// some test cases. 2nd (bool) is if it's expected to be successfull.
	//
	const TEST = [

		[ '25',			false	],
		[ '28:45',		false	],
		[ '10::61',		false	],
		[ '=',			false	],
		[ '+4pm',		false	],
		[ '-4pm',		false	],
		[ '*:-10:-80:*::am',	false	],

		[ '=8pm',		true	],
		[ '==17',		true	],
		[ '6:*::::',		true	],
		[ '6:*:pm',		true	],
		[ '10::59',		true	],
		[ '12:23:42:250',	true	],
		[ '=4:12pm',		true	],
		[ '-1',			true	],
		[ '2::8',		true	],
		[ '2:*::8',		true	],
		[ ':::*',		true	],	//TODO/testen!!1 nur millisekunden...
		[ '2:*::*pm',		true	],
		[ '+2',			true	],
		[ '-6',			true	],
		[ '4pm',		true	],
		[ '-4',			true	],
		[ '*:-10:-80:*',	true	],
		[ '::::pm',		true	],
		[ ':::::::pm',		true	],
		[ '::30:',		true	],
		[ '*:*:30:*',		true	],
		[ '*',			true	],
		[ '**',			true	],
		[ '=*:*:30:*',		true	]

	];
	
	TEST.push([ diffTest, true ]);
	
	//
	const WRONG = [];

	//
	const RESULT = new Array(TEST.length);

	for(var i = 0; i < TEST.length; ++i)
	{
		RESULT[i] = [ ... TEST[i], Math.time.
			clock(TEST[i][0]) ];
		
		if(TEST[i][1])
		{
			if(RESULT[i][2] === null)
			{
				WRONG.push(RESULT[i]);
			}
		}
		else if(RESULT[i][2] !== null)
		{
			WRONG.push(RESULT[i]);
		}
	}
	
	console.dir(RESULT, { depth: 666 });

	//
	for(var i = 0; i < TEST.length; ++i)
	{
		TEST[i][0] = '+36h-24h=' +
			TEST[i][0] + ',48h==';
		RESULT[i] = [ ... TEST[i], Math.time.
			clock.parse(TEST[i][0]) ];
		
		if(TEST[i][1])
		{
			if(RESULT[i][2] === null)
			{
				WRONG.push(RESULT[i]);
			}
		}
		else if(RESULT[i][2] !== null)
		{
			WRONG.push(RESULT[i]);
		}
	}

	console.dir(RESULT, { depth: 777 });

	//
	console.dir({ [diffTest]:
		Math.time.clock.parse(
			diffTest, null, true) });

	//
	if(WRONG.length > 0)
	{
		console.dir({ WRONG }, { depth: 888 });
	}
}

