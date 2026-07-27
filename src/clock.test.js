#!/usr/bin/env node

/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/ https://github.com/kekse1/asleep/
 */

//
// see the BOTTOM of this file: running test cases?
//
const TESTING = true;

//
//nur hier..
//
Math.time = {};

//
Math.time.clock = (_data, _date) => {
	if(typeof _data !== 'string')
	{
		return null;
	}

	_data = __mathTimeClockPrepareAndCleanClockString(_data);

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

	const checkMeridiem = (_item) => {
		switch(meridiem)
		{
			case 'am':
				if(_item[0] >= 12)
					_item[0] -= 12;
				break;
			case 'pm':
				if(_item[0] < 12)
					_item[0] += 12;
				break;
		}

		return _item;
	};
	
	if(!(_data = __mathTimeClockPrepareAndCleanClockString(_data)))
	{
		return checkMeridiem([ 0, 0, 0, 0 ]);
	}

	if(!_date)
	{
		_date = new Date();
	}

	if(_data.startsWith('**'))
	{
		return checkMeridiem(Math.time.clock.
			getCurrent(null, _date));
	}

	const checkInt = () => {
		if(result[state] === '')
		{
			result[state++] = 0;
			return true;
		}

		if(result[state] === '*')
		{
			result[state] = Math.time.clock.
				getCurrent(state++, _date);
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

			if((value %= __intLimit[state]) < 0)
			{
				value = (__intLimit[state] + value);
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

	const	result = [ '', '', '', '' ];
	var	state = 0, char, byte;

	for(var i = 0; i < _data.length; ++i)
	{
		char = _data[i].toLowerCase();

		if(char === '@')
		{
			continue;
		}

		if(char === ':')
		{
			if(!checkInt())
			{
				return null;
			}

			if(_data[i + 1] === '*' && _data[i + 2] === '*')
			{
				//
				//todo/.. etwas dubios. ...
				//
				if(i > 0 && _data[i - 1] !== ':' && !checkInt())
				{
					return null;
				}
			}
		}
		else if(char === '+' || char === '-')
		{
			if(result[state] !== '')
			{
				return null;
			}

			result[state] = char;
		}
		else if(char === '*')
		{
			if(_data[i + 1] === '*')
			{
				if(result[state] !== '')
				{
					if(!checkInt())
					{
						return null;
					}
				}

				for(; state < 4; ++state)
				{
					result[state] = Math.time.clock.
						getCurrent(state, _date);
				}

				break;
			}
			
			if(result[state] !== '')
			{
				return null;
			}

			result[state] = '*';
		}
		else if((byte = char.charCodeAt()) >= 48 && byte <= 57)
		{
			if(result[state][0] === '*')
			{
				return null;
			}

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

		if(state > 3)
		{
			break;
		}
	}

	while(state < 4)
	{
		if(!checkInt())
		{
			return null;
		}
	}

	return checkMeridiem(result);
};

Math.time.clock.parse = (_data, _date, _raw = false) => {
	if(typeof _data !== 'string')
	{
		if(typeof _data === 'number')
		{
			return _data;
		}

		return null;
	}

	if(!_date)
	{
		_date = new Date();
	}

	const strings = (_data = __mathTimeClockPrepareAndCleanClockString(
		_data)).split('@', 2);

	if(strings.length === 2)
	{
		if(strings[1][0] !== '@')
		{
			strings[1] = '@' + strings[1];
		}
	}
	else
	{
		strings[1] = '';
	}
	
	strings[0] = __mathTimeClockPrepareAndCleanClockString(strings[0]);
	strings[1] = __mathTimeClockPrepareAndCleanClockString(strings[1]);

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

	if(!strings[1])
	{
		return result;
	}

	if((strings[1] = Math.time.clock(strings[1], _date)) === null)
	{
		return null;
	}
		
	var value = _date.getDate();

	if(Math.time.clock.isTomorrow(strings[1], _date))
	{
		++value;
	}

	value = new Date(
		_date.getFullYear(),
		_date.getMonth(),
		value, ... strings[1]);
	result += (value.getTime() -
		_date.getTime());

	return result;
};

Math.time.clock.getCurrent = (_unit, _date) => {
	if(!_date)
	{
		_date = new Date();
	}

	if(typeof _unit === 'number') switch(_unit)
	{
		case 0: return _date.getHours();
		case 1: return _date.getMinutes();
		case 2: return _date.getSeconds();
		case 3: return _date.getMilliseconds();
		default: return null;
	}
	
	const result = new Array(4);
	
	for(var i = 0; i < result.length; ++i)
	{
		result[i] = Math.time.clock.
			getCurrent(i, _date);
	}
	
	return result;
};

Math.time.clock.isToday = (_clock, _date) => {
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

		if(_clock[i] > curr)
		{
			break;
		}
	}

	return true;
};

Math.time.clock.isTomorrow = (... _args) => !Math.
	time.clock.isToday(... _args);

//
Reflect.defineProperty(Math.time.clock, 'LIMIT', { value: {} });

const __intLimit = [ 24, 60, 60, 1000 ];
const __strLimit = [ 3, 3, 3, 4 ];

Reflect.defineProperty(Math.time.clock.LIMIT, 'int', {
	get: () => [ ... __intLimit ] });
Reflect.defineProperty(Math.time.clock.LIMIT, 'str', {
	get: () => [ ... __strLimit ] });

const __mathTimeClockPrepareAndCleanClockString =
	(_data) => _data.trim().toLowerCase();

//
if(TESTING)
{
	//
	const diffTest = '*:*:30:*';

	//
	// some test cases. 2nd (bool) is if it's expected to be successfull.
	//
	const TEST = [

		[ '25',			false	],
		[ '28:45',		false	],
		[ '10::61',		false	],
		[ '*3:',		false	],
		[ ':*4',		false	],

		[ '+4pm',		true	],
		[ '-4pm',		true	],
		[ '*:-10:-80:*::am',	true	],
		[ '17pm',		true	],
		[ '',			true	],
		[ '@@',			true	],
		[ 'am',			true	],
		[ 'pm',			true	],
		[ '@8pm',		true	],
		[ '@@17',		true	],
		[ '6:*::::',		true	],
		[ '6:*:pm',		true	],
		[ '6:*pm',		true	],
		[ '10::59',		true	],
		[ '12:23:42:250',	true	],
		[ '@4:12pm',		true	],
		[ '-1',			true	],
		[ '2::8',		true	],
		[ '2:*:8',		true	],
		[ '2:*::8',		true	],
		[ ':::*',		true	],
		[ '2:*::*pm',		true	],
		[ '+2',			true	],
		[ '-6',			true	],
		[ ':-6',		true	],
		[ '*:-6',		true	],
		[ '4pm',		true	],
		[ '-4',			true	],
		[ '*:-10:-80:*',	true	],
		[ '::::pm',		true	],
		[ ':::::::pm',		true	],
		[ '::30:',		true	],
		[ '*:*:30:*',		true	],
		[ '*',			true	],
		[ '**',			true	],
		[ ':**',		true	],
		[ '::**',		true	],
		[ ':::**',		true	],
		[ '::*',		true	],
		[ '@*:*:30:*',		true	],
		[ ':30**pm',		true	],
		[ ':30:**pm',		true	],
		[ '2pm',		true	],
		[ '2:**pm',		true	],
		[ '2**pm',		true	]

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
	console.dir({ [diffTest]:
		Math.time.clock.parse(
			diffTest, null, true) });

	//
	if(WRONG.length > 0)
	{
		console.dir({ WRONG }, { depth: 777 });
	}
}

