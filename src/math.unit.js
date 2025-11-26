/*
* Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
* https://kekse.biz/ https://github.com/kekse1/radix.js/
*/

//
const DEFAULT_BASE = 1024;
var __BASE = DEFAULT_BASE;
const DEFAULT_PREC = 2;

const DEFAULT_THROW = false;

//
Reflect.defineProperty(Math, 'time', { value: function(_value, _int = false, _absolute = true, _relative = true)
{
	var bigint;

	if(typeof _value === 'bigint')
	{
		_value = Math.abs(_value);
		bigint = true;
	}
	else if(Number.isNumber(_value))
	{
		_value = Math.floor(Math.abs(_value));
		bigint = false;
	}
	else
	{
		return error('Expecting % as milliseconds', null, '_value');
	}

	//
	const result = Object.null({ value: _value });
	const units = Math.time.UNIT;

	//
	const relative = (_rest = _value) => {
		const big = (typeof _rest === 'bigint');
		const res = Object.create(null);
		const int = (!big && _int);
		var base = (big ? 1n : 1);
		var value = _rest;
		var name;

		for(var i = 0; i < units.length; i++)
		{
			_rest /= base;
			[ name, base ] = units[i];
			if(big) base = BigInt.from(base);
			value = (base === (big ? 1n : 1) ? _rest : (_rest % base));
			res[name] = result[name] = (int ? Math.int(value) : value);
		}

		return res;
	};

	const absolute = (_rest = _value) => {
		const big = (typeof _rest === 'bigint');
		const res = Object.create(null);
		const int = (!big && _int);
		var value, name, base;

		for(var i = 0, mul = (big ? 1n : 1); i < units.length; i++)
		{
			[ name, base ] = units[i];
			value = (_rest / mul);
			res[name + 's'] = result[name + 's'] = (int ? Math.int(value) : value);
			mul *= (big ? BigInt.from(base) : base);
		}

		return res;
	};

	//
	if(_absolute)
	{
		result.absolute = absolute();
	}

	if(_relative)
	{
		result.relative = relative();
	}

	//
	Reflect.defineProperty(result, 'toObject', { value: (_round = 0) => {
		delete result.value;
		delete result.absolute;
		delete result.relative;

		if(Number.isInt(_round)) for(var idx in result)
		{
			if(! Number.isNumber(result[idx]))
			{
				continue;
			}
			else if(_round === 0)
			{
				result[idx] = Math.int(result[idx]);
			}
			else
			{
				result[idx] = Math.round(result[idx], _round);
			}
		}

		return result;
	}});

	//
	return result;
}});

//
const time = Math.time;

//
const TIME = [ // nanoseconds?? 1.000.000???
	[ 'millisecond', 1000 ],
	[ 'second', 60 ],
	[ 'minute', 60 ],
	[ 'hour', 24 ],
	[ 'day', 7 ],
	[ 'week', 4 ],
	[ 'month', 12 ],
	[ 'year', 1 ] ];

Reflect.defineProperty(Math, 'TIME', { get: () => { const result = new Array(TIME.length);
	for(var i = 0; i < TIME.length; ++i) result[i] = [ ... TIME[i] ]; return result; }});

Reflect.defineProperty(Math.time, 'UNIT', { get: () => Math.TIME });
Reflect.defineProperty(Math.time, 'unit', { get: () => {
	const unit = Math.time.UNIT;
	const result = new Array(unit.length);

	for(var i = 0; i < unit.length; ++i)
	{
		result[i] = unit[i][0];
	}

	return result;
}});

const _short = [ 'ms', 's', 'm', 'h', 'd', 'w', 'M', 'y' ];
Reflect.defineProperty(Math.time, 'SHORT', { get: () => [ ... _short ] });

(function()
{
	var MUL = 1;
	const unit = Math.time.UNIT;

	for(var i = 0; i < unit.length; i++)
	{
		const [ name, base ] = unit[i];
		const mul = unit[i][2] = MUL;

		Reflect.defineProperty(Math.time, (name + 's'), { value: (_value) => {
			if(! Number.isNumber(_value))
			{
				return null;
			}

			return (mul * _value);
		}});

		MUL *= base;
	}
})();

Math.time.absolute = (_value, _int = true) => {
	return Math.time(_value, _int, true, false);
};

Math.time.relative = (_value, _int = true) => {
	return Math.time(_value, _int, false, true);
};

Math.time.from = (_object) => {
	if(! Object.isObject(_object))
	{
		return error('Invalid % argument', null, '_object');
	}

	const keys = Reflect.ownKeys(_object);
	const values = {};

	for(var i = 0; i < keys.length; i++)
	{
		if(keys[i].last() === 's')
		{
			keys[i] = keys[i].pop();
			values[keys[i]] = _object[keys[i] + 's'];
		}
		else
		{
			values[keys[i]] = _object[keys[i]];
		}
	}

	var result = 0;

	for(var i = 0; i < keys.length; i++)
	{
		if(! ((keys[i] + 's') in Math.time))
		{
			continue;
		}

		result += Math.time[keys[i] + 's'](values[keys[i]]);
	}

	return result;
};

Math.time.render = (_value, _sep = ' ', _space = true, _short = false, _none = (_short ? '0' : 'no time'), _html = false, _ms = true) => {
	if(! numeric(_value))
	{
		return error('Invalid _value argument');
	}
	else if(typeof _short !== 'boolean')
	{
		return error('Invalid _short argument');
	}
	else if(_value === 0 || _value === 0n)
	{
		return _none;
	}
	else if(! _short)
	{
		_space = false;
	}

	if(typeof _sep !== 'string')
	{
		_sep = ' ';
	}

	if(typeof _space !== 'boolean')
	{
		_space = _short;
	}

	var negative;

	if(typeof _value === 'bigint')
	{
		negative = (_value < 0n);
	}
	else
	{
		negative = (_value < 0);
	}

	_value = Math.abs(_value);
	const shorts = (_short ? Math.time.SHORT.reverse() : null);
	const units = Math.time.unit.reverse();
	const relative = Math.time(_value, true, false, true);
	var result = '';
	var value;

	for(var i = 0; i < units.length; ++i)
	{
		if(!_ms && units[i] === 'millisecond')
		{
			continue;
		}
		else if(relative[units[i]] < 1)
		{
			continue;
		}
		else
		{
			value = relative[units[i]].toLocaleString();
			if(_html) value = '<b>' + value + '</b>';
			
			if(shorts)
			{
				result += value + (_space ? ' ' : '') + shorts[i];
			}
			else
			{
				result += value + ' ' + units[i] + (Math.int(relative[units[i]]) === 1 ? '' : 's');
			}
		}

		result += _sep;
	}

	return result.slice(0, -_sep.length);
};

Math.time.render.long = (_value, _sep = ' ', _space = true, _none = 'no time', _html = false, _ms = true) => {
	return Math.time.render(_value, _sep, _space, false, _none, _html, _ms);
};

Math.time.render.short = (_value, _sep = ' ', _space = false, _none = '0', _html = false, _ms = true) => {
	return Math.time.render(_value, _sep, _space, true, _none, _html, _ms);
};

Math.time.render.html = (_value, _sep = ' ', _space = true, _short = false, _none = (_short ? '0' : 'no time'), _ms = true) => {
	return Math.time.render(_value, _sep, _space, _short, _none, true, _ms); };

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
		if(Number.isNumber(_args[i]))
		{
			result += _args[i];
		}
		else if(String.isString(_args[i], false))
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
		if(!((str[i] = str[i].removes(' ')).trim()))
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
		if(!_value) _value = 0;
		else _value = Number(_value);
		
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

		if(str[i] === '+' || str[i] === ',')
		{
			if(value && !add(value, unit))
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
				else if(!add(value, unit))
				{
					return null;
				}
				else
				{
					unit = '';
					value = '-';
				}
			}
			else
			{
				value = '-';
			}
		}			
		else if(isNaN(str[i]))
		{
			unit += str[i];
		}
		else if(!unit)
		{
			value += str[i];
		}
		else if(!add(value, unit))
		{
			return null;
		}
		else
		{
			value += str[i];
		}
	}
	
	if(value && !add(value, unit))
	{
		return null;
	}

	return result;
};

Math.time.parse.timeout = (... _args) => {
	const result = Math.time.parse(... _args);

	if(result === null)
	{
		return null;
	}

	if(result > MAX_TIMEOUT)
	{
		return null;
	}

	return result;
};

Math.time.units = {
	'ms': 1,
	's': 1000,
	'm': 60000,
	'h': 3600000,
	'd': 86400000,
	'w': 604800000,
	'M': 2419200000,
	'y': 29030400000
};

//
const SIZE = Object.create(null);
SIZE['1000'] = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
SIZE['1024'] = [ 'B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB' ];
SIZE[''] = [ 'B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y' ];

const SIZE_RELATIVE_REST = false;
const SIZE_ABSOLUTE_REST = true;

Reflect.defineProperty(Math, 'SIZE', { get: () => { const result = Object.create(null);
	for(const idx in SIZE) result[idx] = [ ... SIZE[idx] ]; return result; }});

Reflect.defineProperty(Math, 'size', { value: (_size, _int = false, _base, _absolute = true, _relative = true, _relative_float = true) => {
	if(typeof _size === 'string')
	{
		if(_size.length === 0)
		{
			return 0;
		}
		else if(! Number.isInt(_size = Math.size.parse(_size)))
		{
			return error('Invalid _size argument');
		}
	}
	else if(! (Number.isInt(_size) || typeof _size === 'bigint'))
	{
		return error('Expecting %/% _size argument', null, 'numeric', 'string');
	}
	else if(_size < 0)
	{
		return error('Negative sizes are not possible here');
	}

	if(Number.isNumber(_base))
	{
		_base = [ _base ];
	}
	else if(Array.isArray(_base, false))
	{
		for(var i = 0; i < _base.length; i++)
		{
			if(! Number.isNumber(_base[i]))
			{
				_base.splice(i--, 1);
			}
		}

		if(_base.length === 0)
		{
			_base = [ Math.size.base ];
		}
	}
	else
	{
		_base = [ Math.size.base ];
	}

	const rendered = Math.size.render(_size);
	const rendered1000 = Math.size.render(_size, null, null, 1000);

	const result = Object.null({
		base: [ ... _base ],
		length: _size,
		'1024': rendered.toString(),
		'1000': rendered1000.toString(),
		findUnit: Math.size.findUnit
	});

	if(_absolute)
	{
		result.absolute = Object.create(null);
	}

	if(_relative)
	{
		result.relative = Object.create(null);
	}

	const unit = Math.size.unit;
	const getKey = (_base, _index) => {
		if((_base in unit) && (_index < unit[_base].length))
		{
			return unit[_base][_index];
		}

		return _base;
	};
	const keys = (_base) => {
		if(_base in unit)
		{
			return unit[_base].length;
		}

		return 0;
	};

	const relative = (_rest = _size, _base) => {
		const big = (typeof _rest === 'bigint');
		const base = (big ? BigInt.from(_base) : _base);
		const res = Object.create(null);
		const int = ((!big && _int) || !!big);
		var key, had = false;
		var value, index = 0;

		do
		{
			value = (_base === 1 ? _rest : (_rest % base));
			if(typeof (key = getKey(_base, index)) === 'string')
			{
				had = true;
			}
			res[key] = (int ? Math.round(value) : value);
			index++;
			_rest /= base;
		}
		while(_rest >= (big ? 1n : 1));

		if(SIZE_RELATIVE_REST && had && _relative_float && !int)
		{
			const len = keys(_base);

			for(; index < len; index++)
			{
				value = (_base === 1 ? _rest : (_rest % base));
				res[getKey(_base, index)] = (int ? Math.round(value) : value);
				_rest /= base;
			}
		}

		return result.relative[_base] = res;
	};

	const absolute = (_rest = _size, _base) => {
		const big = (typeof _rest === 'bigint');
		const base = (big ? BigInt.from(_base) : _base);
		const res = Object.create(null);
		const int = ((!big && _int) || !!big);
		var mul = (big ? 1n : 1);
		var key, had = false;
		var value = _rest;
		var index = 0;

		do
		{
			if(typeof (key = getKey(_base, index)) === 'string')
			{
				had = true;
			}
			res[key] = (int ? Math.int(value) : value);
			index++;
			mul *= base;
			value = (_rest / mul);
		}
		while(value >= (big ? 1n : 1));

		if(SIZE_ABSOLUTE_REST && had && !int)
		{
			const len = keys(_base);

			for(index, mul *= base; index < len; index++)
			{
				res[getKey(_base, index)] = (int ? Math.int(value) : value);
				value = (_rest / mul);
				mul *= base;
			}
		}

		return result.absolute[_base] = res;
	};

	if(_absolute) for(var i = 0; i < _base.length; i++)
	{
		absolute(_size, _base[i]);
	}

	if(_relative) for(var i = 0; i < _base.length; i++)
	{
		relative(_size, _base[i]);
	}

	if(_relative && !_absolute)
	{
		Object.prototype.assign.call(result, result.relative);

		for(const b in result.relative)
		{
			for(const i in result.relative[b])
			{
				result[i] = result.relative[b][i];
			}
		}
	}
	else if(_absolute && !_relative)
	{
		Object.prototype.assign.call(result, result.absolute);

		for(const b in result.absolute)
		{
			for(const i in result.absolute[b])
			{
				result[i] = result.absolute[b][i];
			}
		}
	}

	return result;
}});

//
Reflect.defineProperty(Math.size, 'base', {
	get: function()
	{
		var result; if(BROWSER && document.hasVariable('unit-base')) { if(isNaN(result = document.parseVariable('unit-base'))) result = __BASE; }
		else result = __BASE; return result;
	},
	set: function(_value)
	{
		var result; if(Number.isInt(_value) && _value > 1) result = _value;
		else if(BROWSER && document.hasVariable('unit-base')) { if(isNaN(result = document.parseVariable('unit-base'))) result = __BASE; }
		else result = DEFAULT_BASE; if(BROWSER) document.setVariable('unit-base', result); return (__BASE = result);
	}
});

//
const size = Math.size;

//
Math.size.absolute = (_size, _int = true, _base) => Math.size(_size, _int, _base, true, false);
Math.size.relative = (_size, _int = true, _base, _relative_float = false) => Math.size(_size, _int, _base, false, true, _relative_float);

//
const DEFAULT_BASES = [ 1024, 1000 ];
var BASES = [ 1024, 1000 ];

Reflect.defineProperty(Math.size, 'base', {
	get: function()
	{
		return [ ... BASES ];
	},
	set: function(_value)
	{
		if(Array.isArray(_value, true))
		{
			const value = [];

			for(var i = 0, j = 0; i < _value.length; i++)
			{
				if(Number.isNumber(_value[i]))
				{
					value[j++] = _value[i];
				}
			}

			if(value.length > 0)
			{
				return BASES = value;
			}

			return BASES = [ ... DEFAULT_BASES ];
		}
		else if(Number.isNumber(_value))
		{
			return BASES = [ _value ];
		}

		return BASES = DEFAULT_BASES;
	}
});

Reflect.defineProperty(Math.size, 'unit', { get: () => {
	const result = Object.create(null);

	for(var idx in SIZE)
	{
		result[idx] = new Array(SIZE[idx].length);

		for(var i = 0; i < SIZE[idx].length; i++)
		{
			result[idx][i] = SIZE[idx][i];
		}
	}

	return result;
}});

const getSizes = (_unit, _base_default = Math.size.base) => {
	//
	var unit = Math.size.findUnit(_unit);
	var base = null;
	var index = null;

	//
	if(unit === 'B')
	{
		base = (Number.isNumber(_base_default) ? _base_default : Math.size.base);
		index = 0;
	}
	else
	{
		var stop = false;

		for(var b in Math.size.unit)
		{
			for(var i = 1; i < Math.size.unit[b].length; i++)
			{
				if(Math.size.unit[b][i] === unit)
				{
					if(b === '')
					{
						base = null;
					}
					else
					{
						base = Number(b);
					}

					index = i;
					stop = true;
					break;
				}
			}

			if(stop)
			{
				break;
			}
		}
	}

	//
	return [ unit, base, index ];
};

Reflect.defineProperty(Math.size, 'parse', { value: (_value, _unit = null, _base = Math.size.base, _bigint = false, _throw = DEFAULT_THROW) => {
	if(Object.isObject(_value))
	{
		if(typeof _value.unit === 'string')
		{
			_unit = _value.unit;
		}

		if(typeof _value.base === 'number')
		{
			_base = _value.base;
		}

		if(typeof _value.bigint === 'boolean')
		{
			_bigint = _value.bigint;
		}

		if(typeof _value.throw === 'boolean')
		{
			_throw = _value.throw;
		}

		_value = _value.value;
	}

	var hasValue;
	
	if(Number.isNumber(_value))
	{
		if(_value === 0) return (_bigint ? 0n : 0);
		hasValue = _value;
	}
	else if(typeof _value === 'bigint')
	{
		if(_value === 0n) return (_bigint ? 0n : 0);
		hasValue  = _value;
	}
	else if(typeof _value === 'string')
	{
		if(_value.length === 0)
		{
			hasValue = (_bigint ? 0n : 0);
		}
		else
		{
			hasValue = null;
		}
	}
	else if(_throw)
	{
		return error('Invalid % argument', null, '_value');
	}
	else
	{
		return (_bigint ? 0n : 0);
	}
	
	if(String.isString(_unit, false))
	{
		_unit = Math.size.findUnit(_unit);
	}
	else
	{
		_unit = '';
	}

	if(typeof _base !== 'number')
	{
		_base = Math.size.base;
	}

	if(typeof _bigint !== 'boolean')
	{
		_bigint = false;
	}

	if(typeof _throw !== 'boolean')
	{
		_throw = true;
	}

	//
	var value = '';
	var unit = _unit;
	var unitStarted = false;
	var negative = false;
	var hadPoint = false;
	
	var c; for(var i = 0; i < _value.length; i++)
	{
		if(_value[i] === '\\')
		{
			if(i < (_value.length - 1)) { c = _value[++i];
				if(unitStarted)
				{
					unit += c;
				}
				else
				{
					value += c;
				}
			}
		}
		else if(_value[i].isEmpty)
		{
			continue;
		}
		else if(unitStarted)
		{
			if(_value[i].isLetter) unit += _value[i];
		}
		else if(_value[i].isLetter)
		{
			if(_unit) break;
			unit += _value[i];
			unitStarted = true;
		}
		else if(hasValue !== null || hadPoint === null)
		{
			continue;
		}
		else if(_value[i] === '.')
		{
			if(hadPoint)
			{
				return (_throw ? error('Too many decimal points') : null);
			}
			else if(_bigint)
			{
				if(_throw)
				{
					return error('Floating point value recognized, but you wanted a BigInt result');
				}

				hadPoint = null;
			}
			else
			{
				hadPoint = true;
				value += '.';
			}
		}
		else if(_value[i] === '-')
		{
			negative = !negative;
		}
		else if(_value[i].isDecimal)
		{
			value += _value[i];
		}
	}

	if(hasValue === null)
	{
		if(value.length === 0)
		{
			return (_bigint ? 0n : 0);
		}
		else if(_bigint)
		{
			value = BigInt(value);
		}
		else
		{
			value = Number(value);
		}
	}
	else if(_bigint)
	{
		value = BigInt(_value);
	}
	else
	{
		value = _value;
	}
	
	var base, index;
	[ unit, base, index ] = getSizes(unit, _base);

	if(negative)
	{
		value = -value;
	}

	if(index === 0)
	{
		return value;
	}

	//
	var result = value;

	if(_bigint)
	{
		base = BigInt.from(base);
		result = BigInt.from(result);
	}

	for(var i = 0; i < index; i++)
	{
		result *= base;
	}

	return result;
}});

Reflect.defineProperty(Math.size, 'render', { value: (_value, _unit = null, _precision = DEFAULT_PREC, _base = Math.size.base, _long = true, _throw = DEFAULT_THROW) => {
	//
	if(Object.isObject(_value))
	{
		if('precision' in _value)
		{
			_precision = _value.precision;
		}

		if(Number.isNumber(_value.base))
		{
			_base = _value.base;
		}

		if(typeof _value.long === 'boolean')
		{
			_long = _value.long;
		}

		if(typeof _value.throw === 'boolean')
		{
			_throw = _value.throw;
		}

		_unit = _value.unit;
		_value = _value.value;
	}

	//
	const withUnit = (typeof _unit === 'string' && _unit.length > 0);

	//
	if(Object.isObject(_precision))
	{
		if(!(Number.isInt(_precision.min) && _precision.min >= 0))
		{
			_precision.min = null;
		}

		if(!(Number.isInt(_precision.max) && _precision.max >= 0))
		{
			_precision.max = null;
		}

		if(_precision.min === null && _precision.max === null)
		{
			_precision = null;
		}
	}
	else if(!(Number.isInt(_precision) && _precision >= 0))
	{
		_precision = null;
	}

	if(! Number.isNumber(_base))
	{
		_base = Math.size.base;
	}

	if(typeof _long !== 'boolean')
	{
		_long = true;
	}

	if(typeof _throw !== 'boolean')
	{
		_throw = true;
	}

	if(typeof _value === 'string')
	{
		_value = Math.size.parse(_value, _unit, _base, null, _throw);
	}
	else if(typeof _value === 'bigint')
	{
		_value = Number(_value);
	}
	else if(typeof _value !== 'number')
	{
		return error('Invalid _value argument');
	}
	else
	{
		_unit = Math.size.findUnit(_unit, _throw);
	}

	//
	const negative = (_value < 0);
	var value = Math.abs(_value);

	if(typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'bigint')
	{
		if(_throw)
		{
			return error('Invalid _value argument');
		}

		return null;
	}
	else if(typeof _value === 'string' && _value.length === 0)
	{
		return (0 + (withUnit ? 0 : (_long ? ' Bytes' : ' B')));
	}

	if(withUnit)
	{
		const [ unit, base, index ] = getSizes(_unit, _base);

		for(var i = 0; i < index; i++)
		{
			value /= base;
		}

		//
		if(Number.isInt(_precision))
		{
			value = Math.round(value, _precision);
		}
		else if(Object.isObject(_precision))
		{
			if(_precision.max !== null)
			{
				value = Math.round(value, _precision.max);
			}
			else if(_precision.min !== null)
			{
				value = Math.round(value, _precision.min);
			}
		}

		//
		return value;
	}

	const units = ((_base in Math.size.unit) ? Math.size.unit[_base] : Math.size.unit['']);
	var index = 0;

	if(value >= _base)
	{
		while(index < (units.length - 1) && (value /= _base) >= _base)
		{
			index++;
		}

		if(index < (units.length - 1))
		{
			index++;
		}
	}

	//
	const result = [ value, units[index] ];

	if(Number.isInt(_precision))
	{
		result[0] = Math.round(result[0], _precision);
	}
	else if(Object.isObject(_precision))
	{
		if(_precision.max !== null)
		{
			result[0] = Math.round(result[0], _precision.max);
		}
		else if(_precision.min !== null)
		{
			result[0] = Math.round(result[0], _precision.min);
		}
	}

	if(_long && index === 0)
	{
		result[1] += 'yte';

		if(result[0] !== 1)
		{
			result[1] += 's';
		}
	}

	result[2] = _value;
	result[3] = index;

	if(negative)
	{
		result[0] = -result[0];
	}

	//
	Reflect.defineProperty(result, 'toString', { value: (_opts) => {
		const opts = {};

		if(Object.isObject(_opts))
		{
			Object.assign(opts, _opts);
		}
		else if(typeof _opts === 'object' || (Number.isInt(_opts) && _opts >= 0))
		{
			opts.precision = _opts;
		}
		else if(String.isString(_opts, false))
		{
			opts.language = _opts;
		}
		else if(typeof _opts === 'boolean')
		{
			opts.html = _opts;
		}

		if(typeof opts.fixed !== 'boolean')
		{
			opts.fixed = false;
		}

		if(typeof opts.locale !== 'boolean')
		{
			opts.locale = true;
		}

		if(typeof opts.html !== 'boolean')
		{
			opts.html = false;
		}

		if(opts.precision !== null && !(Number.isInt(opts.precision) && opts.precision >= 0))
		{
			opts.precision = _precision;
		}

		if(typeof opts.round !== 'boolean')
		{
			opts.round = true;
		}

		if(Number.isInt(opts.space))
		{
			opts.space = String.repeat(opts.space, ' ');
		}
		else if(typeof opts.space !== 'string')
		{
			opts.space = ' ';
		}

		if(! String.isString(opts.language, false))
		{
			if(String.isString(opts.lang, false))
			{
				opts.language = opts.lang;
				delete opts.lang;
			}
			else if(BROWSER)
			{
				opts.language = navigator.language;
			}
		}
		
		if(! String.isString(opts.language, false))
		{
			opts.language = undefined;
		}

		var value = result[0];
		var unit = result[1];

		if(Object.isObject(opts.precision))
		{
			if(opts.precision.max !== null)
			{
				value = Math.round(value, opts.precision.max);
			}
			else if(opts.precision.min !== null)
			{
				value = Math.round(value, opts.precision.min);
			}

			if(opts.fixed)
			{
				value = value.toFixed(opts.precision.min);
			}
		}
		else if(opts.precision !== null)
		{
			value = Math.round(value, opts.precision);

			if(opts.fixed)
			{
				value = value.toFixed(opts.precision);
			}
		}
		else if(opts.locale)
		{
			value = value.toLocaleString(opts.language, opts.locale);
		}
		else if(opts.locale)
		{
			const opts = {};

			if(opts.precision !== null)
			{
				if(Number.isInt(opts.precision))
				{
					opts.minimumFractionDigits = opts.precision;
					opts.maximumFractionDigits = opts.precision;
				}
				else
				{
					Object.assign(opts, opts.precision);
				}
			}

			value = value.toLocaleString(opts.language, opts);
		}
		else
		{
			value = value.toString();
		}
		
		if(opts.html) value = '<b>' + value + '</b>';
		return (value + opts.space + unit);
	}});

	//
	return result;
}});

Reflect.defineProperty(Math.size, 'findUnit', { value: (_unit, _throw = DEFAULT_THROW) => {
	var result;

	if(typeof _unit === 'string')
	{
		switch(_unit = _unit.toLowerCase())
		{
			case '':
			case 'b':
			case 'byte':
			case 'bytes':
				result = 'B';
				break;
			case 'k':
			case 'kb':
				result = 'KB';
				break;
			case 'ki':
			case 'kib':
				result = 'KiB';
				break;
			case 'm':
			case 'mb':
				result = 'MB';
				break;
			case 'mi':
			case 'mib':
				result = 'MiB';
				break;
			case 'g':
			case 'gb':
				result = 'GB';
				break;
			case 'gi':
			case 'gib':
				result = 'GiB';
				break;
			case 't':
			case 'tb':
				result = 'TB';
				break;
			case 'ti':
			case 'tib':
				result = 'TiB';
				break;
			case 'p':
			case 'pb':
				result = 'PB';
				break;
			case 'pi':
			case 'pib':
				result = 'PiB';
				break;
			case 'e':
			case 'eb':
				result = 'EB';
				break;
			case 'ei':
			case 'eib':
				result = 'EiB';
				break;
			case 'z':
			case 'zb':
				result = 'ZB';
				break;
			case 'zi':
			case 'zib':
				result = 'ZiB';
				break;
			case 'y':
			case 'yb':
				result = 'YB';
				break;
			case 'yi':
			case 'yib':
				result = 'YiB';
				break;
			default:
				if(_throw)
				{
					return error('Invalid % ~[ %, %, %, %, %, %, %, %, % ]', null, '_unit', 'b', 'k', 'm', 'g', 't', 'p', 'e', 'z', 'y');
				}

				result = 'B';
				break;
		}
	}
	else
	{
		result = 'B';
	}

	return result;
}});

//

