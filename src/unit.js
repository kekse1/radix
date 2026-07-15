/*
 * Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
 * https://kekse.biz/ https://github.com/kekse1/radix/
 */

/* for other example size/time implementations see the url:
 * < https://kekse.biz/?js/lib/globals/math.unit.js > ...
 * .. but this one is pretty.. ok! */

//
const
	DEFAULT_TIME_MILLISEC = true,
	DEFAULT_TIME_LONG = true,
	DEFAULT_UNIT_BASE = 1024,
	DEFAULT_TIME_SEP = ', ',
	DEFAULT_STYLES = false,
	DEFAULT_UNIT_PREC = 2,
	DEFAULT_FIXED = true,
	DEFAULT_BASE = true;

//
Reflect.defineProperty(Math, 'size', { value: (_value, _unit_base = DEFAULT_UNIT_BASE, _prec = DEFAULT_UNIT_PREC, _fixed = DEFAULT_FIXED, _styles = DEFAULT_STYLES, _base = DEFAULT_BASE) => {
	if(object(_unit_base))
	{
		if('base' in _unit_base)
		{
			_base = _unit_base.base;
		}

		if('styles' in _unit_base)
		{
			_styles = _unit_base.styles;
		}

		if('fixed' in _unit_base)
		{
			_fixed = _unit_base.fixed;
		}

		if('precision' in _unit_base)
		{
			_prec = _unit_base.precision;
		}
		else if('prec' in _unit_base)
		{
			_prec = _unit_base.prec;
		}

		if('unit' in _unit_base)
		{
			_unit_base = _unit_base.unit;
		}
		else
		{
			_unit_base = DEFAULT_UNIT_BASE;
		}
	}

	var big, neg, rest;

	if(bigint(_value))
	{
		if(_value <= BigInt(Number.MAX_SAFE_INTEGER))
		{
			if((_value = Number(_value)) < 0)
			{
				neg = true;
				rest = -_value;
			}
			else
			{
				neg = false;
				rest = _value;
			}

			big = false;
		}
		else
		{
			big = true;
		
			if(_value < 0n)
			{
				neg = true;
				rest = -_value;
			}
			else
			{
				neg = false;
				rest = _value;
			}
		}
	}
	else if(number(_value))
	{
		big = false;
		
		if(_value < 0)
		{
			neg = true;
			rest = -_value;
		}
		else
		{
			neg = false;
			rest = _value;
		}
	}
	else
	{
		return '-/-';
	}

	var result;
	var index;
	var base;
	var unit;
	
	if(string(_unit_base, true))
	{
		if(_unit_base.length === 0)
		{
			[ index, base ] = [ 0, 1024 ];
		}
		else
		{
			[ index, base ] = Math.size.getUnit(
				_unit_base, true);
		}
	}
	else
	{
		index = 0;
		
		if(int(_unit_base))
		{
			base = Number(_unit_base);
		}
		else
		{
			base = 1024;
		}
	}
	
	if(big)
	{
		const bigBase = BigInt(base);

		if(rest < bigBase)
		{
			result = rest;

			if(neg)
			{
				result = -result;
			}
			
			result = result.toLocaleString();
			
			if(_styles)
			{
				result = result.bold(true);
			}
			
			if(Math.size.unit[base])
			{
				unit = Math.size.unit[base][0];
				
				if(rest === 1n && unit[unit.length - 1] === 's')
				{
					unit = unit.slice(0, -1);
				}
				
				return (result + ' ' + unit);
			}
			
			if(_base)
			{
				return ('(' + base.toString() + ')' + result);
			}
			
			return result;
		}
		
		if(index > 0) for(var i = 0; i < index; ++i)
		{
			rest /= bigBase;
		}
		else while(rest >= bigBase)
		{
			rest /= bigBase;
			++index;
		}
	}
	else
	{
		if(rest < _unit_base)
		{
			if(neg)
			{
				result = -rest;
			}
			else
			{
				result = rest;
			}
			
			if(_fixed)
			{
				result = result.toLocaleFixed(_prec);
			}
			else
			{
				result = Math.round(result, _prec).toLocaleString();
			}

			if(_styles)
			{
				result = result.bold(true);
			}
			
			if(Math.size.unit[base])
			{
				unit = Math.size.unit[base][0];
				
				if(rest === 1 && unit[unit.length - 1] === 's')
				{
					unit = unit.slice(0, -1);
				}
				
				return (result + ' ' + unit);
			}
			
			if(_base)
			{
				return ('(' + base.toString() + ')' + result);
			}
			
			return result;
		}
		
		if(index > 0) for(var i = 0; i < index; ++i)
		{
			rest /= base;
		}
		else while(rest >= base)
		{
			rest /= base;
			++index;
		}
	}

	if(neg)
	{
		result = -rest;
	}
	else
	{
		result = rest;
	}

	if(Math.size.unit[base] && Math.size.unit[base][index])
	{
		unit = Math.size.unit[base][index];
	}
	else if(_base)
	{
		unit = '';
	}
	
	if(!big)
	{
		if(_fixed)
		{
			result = result.toLocaleFixed(_prec);
		}
		else
		{
			result = Math.round(result, _prec).toLocaleString();
		}
	}
	else
	{
		result = result.toLocaleString();
	}
	
	if(_styles)
	{
		result = result.bold(true);
	}

	if(unit)
	{
		if(index === 0)
		{
			if(big)
			{
				if(Math.abs(rest) === 1n && unit[unit.length - 1] === 's')
				{
					unit = unit.slice(0, -1);
				}
			}
			else
			{
				if(Math.abs(rest) === 1 && unit[unit.length - 1] === 's')
				{
					unit = unit.slice(0, -1);
				}
			}
		}
		
		return (result + ' ' + unit);
	}
	else if(_base)
	{
		return ('(' + base + ')' + result);
	}
	
	return result;
}});

Math.size.parse = (_value) => {
	if(bigint(_value) || number(_value))
	{
		return _value;
	}
	
	if(!string(_value, true))
	{
		return null;
	}
	
	if(_value.length === 0)
	{
		return 0;
	}
	
	var	result = 0;
	var	value = '',
		unit = '',
		UNIT;
	
	const tryValue = () => {
		if(value === '-')
		{
			return true;
		}
		
		if(!(UNIT = Math.size.getUnit(unit, false)))
		{
			return false;
		}

		result += (Number(value) * UNIT[1] ** UNIT[0]);
		unit = value = '';
		return true;
	};
	
	for(var i = 0; i < _value.length; ++i)
	{
		if(_value[i] === '+' || _value[i] === '-' || _value[i] === ',' || _value[i] === ' ' || _value[i] === '\t')
		{
			if(value && !tryValue())
			{
				return null;
			}
			
			if(_value[i] === '-' && value !== '-')
			{
				value = '-';
			}
			else
			{
				value = '';
			}
			
			unit = '';
		}
		else if(isNaN(_value[i]) && _value[i] !== '.')
		{
			unit += _value[i];
		}
		else
		{
			value += _value[i];
		}
	}

	if(value && !tryValue())
	{
		return null;
	}

	return result;
};

Math.size.styled = (_value, _unit_base = DEFAULT_UNIT_BASE, _prec = DEFAULT_UNIT_PREC, _fixed = DEFAULT_FIXED) => Math.size(_value, _unit_base, _prec, _fixed, true);

Math.size.getUnit = (_unit, _fallback = false) => {
	if(!(_unit = _unit.trim()))
	{
		return [ 0, 0 ];
	}
	
	const	lower = _unit.toLowerCase();
	
	if(lower === 'b' || lower === 'byte' || lower === 'bytes')
	{
		return [ 0, 0 ];
	}

	var	base,
		units;

	if(_unit.length === 1)
	{
		units = Math.size.unit[base = (
			_unit[0].isLowerCase ? 1000 : 1024)];

		for(var i = 0; i < units.length; ++i)
		{
			if(units[i][0].toLowerCase() === lower)
			{
				return [ i, base ];
			}
		}

		if(_fallback)
		{
			return [ 0, base ];
		}
		
		return null;
	}
	
	_unit = lower;

	if(_unit.includes('i'))
	{
		units = Math.size.unit[base = 1024];
	}
	else
	{
		units = Math.size.unit[base = 1000];
	}
	
	for(var i = 0; i < units.length; ++i)
	{
		if(units[i].toLowerCase() === _unit)
		{
			return [ i, base ];
		}
	}
	
	if(_fallback)
	{
		return [ 0, base ];
	}
	
	return null;
};

Math.size.unit = {};
Math.size.unit['1000'] = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
Math.size.unit['1024'] = [ 'Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB' ];

//
Reflect.defineProperty(Math, 'time', { value: (_value, _long = DEFAULT_TIME_LONG, _styles = DEFAULT_STYLES, _millisec = DEFAULT_TIME_MILLISEC, _sep = DEFAULT_TIME_SEP) => {
	if(bigint(_value))
	{
		_value = Number(_value / 1000000n);
	}
	else if(!number(_value))
	{
		return '-/-';
	}

	_value = Math.abs(_value);
	const orig = _value;

	const append = (_value, _unit) => { if(_value < 1) return;
		if(_long && (_value = Math.trunc(_value)) === 1 &&
				_unit[_unit.length - 1] === 's')
			_unit = _unit.slice(0, -1);
		if(index === 0 && orig >= 1000 && !_millisec) return;
		var res = Math.trunc(_value).toString();
		if(_styles) res = res.bold(true);
		return (result = (res + _unit + _sep) + result); };

	const unit = Math.time.unit;
	var result = '';
	var index = -1;
	var u, v;

	if(_value < 1)
	{
		return '0';
	}
	else while(_value >= 1)
	{
		if(!(u = unit[++index]))
		{
			break;
		}

		v = _value;
		if(u[0] > 1) v %= u[0];
		append(v, _long ? ' ' + u[1] : u[3]);
		if(u[0] > 0) _value = Math.floor(_value / u[0]);//_value /= u[0];
		else break;
	}

	return result.slice(0, -_sep.length).trim();
}});

Math.time.styled = (_value, _long = DEFAULT_TIME_LONG, _millisec = DEFAULT_TIME_MILLISEC, _sep = DEFAULT_TIME_SEP) => Math.
	time(_value, _long, true, _millisec, _sep);

(() => {
	Math.time.unit = [
		[ 1000, 'milliseconds', 'ms', 'ms' ],
		[ 60, 'seconds', 's', 's' ],
		[ 60, 'minutes', 'm', 'm' ],
		[ 24, 'hours', 'h', 'h' ],
		[ 30, 'days', 'd', 'D' ],
		/*[ 7, 'days', 'd', 'D' ],
		[ 4, 'weeks', 'w', 'W' ],*/
		[ 12, 'months', 'o', 'M' ],
		[ 0, 'years', 'y', 'Y' ]
	];

	Math.time.units = {};
	var _sum = 1;
	
	for(var i = 0; i < Math.time.unit.length; ++i)
	{
		Math.time.units[Math.time.unit[i][2]] = _sum;
		_sum *= Math.time.unit[i][0];
	}
})();

//
//TODO/use for `norbert --timeout [..]`... therefore this one was created!11 ;-)
//
Math.time.parse = (... _args) => {
	if(_args.length === 0)
	{
		return null;
	}

	var str = [];
	var result = 0;
	
	for(var i = 0, j = 0; i < _args.length; ++i)
	{
		if(number(_args[i]))
		{
			result += _args[i];
		}
		else if(string(_args[i], false))
		{
			if(isNaN(_args[i]))
			{
				str[j++] = _args[i];
			}
			else
			{
				result += Number(_args[i]);
			}
		}
	}

	for(var i = 0; i < str.length; ++i)
	{
		if(!(str[i] = str[i].replaceAll(' ', '').trim()))
		{
			str.splice(i--, 1);
		}
	}

	if(str.length === 0)
	{
		return result;
	}
	
	if((str = str.join('').trim()).length === 0)
	{
		return result;
	}
	
	var value = '', unit = '', byte;
	const units = Math.time.units;

	const add = (_value, _unit) => {
		if(!_value)
		{
			return true;
		}
		
		while(_value[_value.length - 1] === '.')
		{
			_value = _value.slice(0, -1);
		}

		if(_value[0] === '.')
		{
			do
			{
				_value = _value.substr(1);
			}
			while(_value[0] === '.');
			
			_value = '0.' + _value;
		}

		if(Number.isNaN(_value = Number(_value)))
		{
			return false;
		}
		
		if(_unit)
		{
			if(_unit in units)
			{
				result += (_value * units[_unit]);
			}
			else
			{
				return false;
			}
		}
		else
		{
			result += _value;
		}
		
		return true;
	};

	for(var i = 0; i < str.length; ++i)
	{
		if((byte = str.charCodeAt(i)) <= 32 || byte === 127)
		{
			continue;
		}

		if(str[i] === '+' || str[i] === ',' || str[i] === ' ' || str[i] === '\t')
		{
			if(!add(value, unit))
			{
				return null;
			}
			
			value = unit = '';
		}
		else if(str[i] === '-')
		{
			if(value)
			{
				if(value === '-')
				{
					value = '';
				}
				else if(add(value, unit))
				{
					unit = '';
					value = '-';
				}
				else
				{
					return null;
				}
			}
			else
			{
				value = '-';
			}
		}
		else if(str[i] === '.')
		{
			if(unit)
			{
				if(!add(value, unit))
				{
					return null;
				}

				unit = '';
				value = '0.';
			}
			else if(!value.includes('.'))
			{
				value += '.';
			}
			else
			{
				return null;
			}
		}
		else if(unit)
		{
			if(isNaN(str[i]))
			{
				unit += str[i];
			}
			else if(add(value, unit))
			{
				value = str[i];
				unit = '';
			}
			else
			{
				return null;
			}
		}
		else if(!isNaN(str[i]))
		{
			value += str[i];
		}
		else
		{
			unit += str[i];
		}
	}
	
	if((value || unit) && !add(value, unit))
	{
		return null;
	}

	return result;
};

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
			if(_data[i + 1] === '*' && _data[i + 2] === '*')
			{
				continue;
			}

			if(result[state].length > __strLimit[state])
			{
				return null;
			}

			if(!checkInt())
			{
				return null;
			}
		}
		else if(char === '+' || char === '-')
		{
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

			if(_data[i + 1] === '*')
			{
				if(!checkInt())
				{
					return null;
				}

				for(var j = state; j < 4; ++j)
				{
					result[j] = Math.time.
						clock.getCurrent(
							j, _date);
				}

				break;
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

		if(state > 3)
		{
			break;
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

	if(strings[0])//&& Math.time.parse)
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

	if(strings[1])//&& Math.time.clock)
	{
		if((char = Math.time.clock(strings[1], _date)) === null)
		{
			return null;
		}

		var value = _date.getDate();

		if(Math.time.clock.isTomorrow(char, _date))
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

		if(_clock[i] !== curr)
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
