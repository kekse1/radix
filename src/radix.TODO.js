/*
* Copyright (c) Sebastian Kucharczyk <kuchen@kekse.biz>
* https://kekse.biz/ https://github.com/kekse1/radix.js/
* ~v3.0.0
*/

/*
 * THIS NEEDS PREPARATIONS .. actually I'm using it somewhere else,
 * where I've got many extensions. I don't want to use them in here!
 */

//
const DEFAULT_RADIX = 10;
const DEFAULT_EXTENDED = true;
const DEFAULT_BIGINT_SUFFIX = true;
//
const DEFAULT_PREFER = true;//[ `.`, `-`, `+` ] at radix < 256/255/254..! ^_^
//
const DEFAULT_THROW = false;

//
const alphabet = global.alphabet = (_radix) => getAlphabet(_radix);
const radix = global.radix = (... _args) => isRadix(... _args);
alphabet.radix = radix;
radix.alphabet = alphabet;

export default radix;

//
const getAlphabet = alphabet.getAlphabet = (_radix, _throw = DEFAULT_THROW) => {
	if(! radix.isRadix(_radix, true)) return (_throw ? error('Not a valid radix') : null);
	else if(typeof _radix === 'string') {
		if((_radix = _radix.unique().substr(0, 256)).length >= 2) return _radix;
		return (_throw ? error('Not a valid alphabet') : null);  }
	const negative = (_radix < 0); _radix = radix.toPositive(_radix); var result = '';
	if(_radix === 0) result = alphabet.alpha;
	else if(_radix === 1) result = alphabet.lower;
	else if(_radix <= 36) result = alphabet.regular.substr(0, _radix);
	else if(_radix <= 62) result = alphabet.extended.substr(0, _radix);
	else { result = ''; var prefer = 0; loop: for(var i = 0; i < _radix; ++i) {
		if(DEFAULT_PREFER && _radix < 256) switch(i) {
			case 46: ++prefer; continue loop;
			case 45: if(_radix < 255) { ++prefer; continue loop; } break;
			case 43: if(_radix < 254) { ++prefer; continue loop; } break; }
		result += String.fromCharCode(i); }
		for(var i = 0; i < prefer; ++i) result += String.fromCharCode(256 - prefer + i); }
	if(negative) result = result.reverse(); return result; };

//
alphabet.decimal = '0123456789';
alphabet.lower = 'abcdefghijklmnopqrstuvwxyz';
alphabet.upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
alphabet.regular = (alphabet.decimal + alphabet.lower);
alphabet.extended = (alphabet.regular + alphabet.upper);
alphabet.alpha = (alphabet.lower + alphabet.upper);
alphabet.binary = null;

const alphabets = [ // [binary] filtered out..
	'decimal',
	'lower',
	'upper',
	'regular',
	'extended',
	'alpha' ];
Reflect.defineProperty(alphabet, 'alphabets', { get: () => { return [ ... alphabets ]; }});

//
const isRadix = global.isRadix = radix.isRadix = (_value, _extended = DEFAULT_EXTENDED) => {
	if(typeof _value === 'string')
	{
		if(_extended)
		{
			return ((_value = _value.unique()).length >= 2);
		}
		
		return false;
	}
	else if(! Number.isInt(_value))
	{
		return false;
	}
	else if(_value < 0)
	{
		_value = radix.toPositive(_value);
	}

	if(! _extended)
	{
		return (_value >= 2 && _value <= 36);
	}
	else if(typeof _value === 'string')
	{
		return ((_value = _value.unique()).length >= 2);
	}
	else if(_value < -257)
	{
		return false;
	}
	else if(_value > 256)
	{
		return false;
	}

	return true;
};

Object.defineProperty(Number, 'isRadix', { value: (... _args) => isRadix(... _args) });
Object.defineProperty(BigInt, 'isRadix', { value: (... _args) => isRadix(... _args) });

radix.reverse = (_radix) => {
	if(!Number.isInt(_radix))
	{
		return null;
	}
	else if(_radix < -257)
	{
		return null;
	}
	else if(_radix > 256)
	{
		return null;
	}
	
	return (-1 - _radix);
};

radix.toPositive = (_radix) => {
	if(! Number.isInt(_radix))
	{
		return null;
	}
	else if(_radix >= 0)
	{
		return _radix;
	}
	
	return radix.reverse(_radix);
};

radix.toNegative = (_radix) => {
	if(! Number.isInt(_radix))
	{
		return null;
	}
	else if(_radix < 0)
	{
		return _radix;
	}
	
	return radix.reverse(_radix);
};

//
//TODO/1e-20, etc..
//
radix.features = (_radix, _throw = DEFAULT_THROW) => {
	const alpha = alphabet.getAlphabet(_radix, _throw);
	if(!alpha) return null; const result = Object.create(null);
	result.alphabet = alpha;
	result.radix = _radix;
	result.length = result.alphabet.length;
	result.rev = (_radix < 0);
	result.bytes = (radix.toPositive(_radix) === 256);
	result.bigint = (!result.bytes && !alpha.includes('n'));
	result.float = (!result.bytes && !alpha.includes('.'));
	result.negative = (!result.bytes && !alpha.includes('-'));
	result.positive = (!result.bytes && !alpha.includes('+'));
	result.sign = (!result.bytes && (result.negative || result.positive));
	result.lower = alpha.isLowerCase;
	result.upper = (alpha.isUpperCase && !alpha.isLowerCase);
	result.exp = null;
	return result; };

//
radix.checkSigns = (_string, _negative = true, _positive = true) => { var i = 0, negative = false;
	while((_positive && _string[i] === '+') || (_negative && _string[i] === '-')) {
		if(_string[i] === '-') negative = !negative; ++i; }
	if(i > 0) _string = _string.substr(i); return [ negative, _string ]; };

//
radix.parse = (_string, _radix = DEFAULT_RADIX, _bigint = null, _float = true, _throw = DEFAULT_THROW) => {
	if(typeof _string !== 'string') return (numeric(_value) ? _value : (_throw ? error('Invalid % argument', null, '_string') : null));
	const features = radix.features(_radix, _throw); if(!features) return (_throw ? error('Invalid % argument', null, '_radix') : undefined);
	if(!features.float) _float = false; if(features.bigint && _string[_string.length - 1] === 'n') { if(typeof _bigint !== 'boolean') _bigint = true;
		if(_bigint) _string = _string.slice(0, -1); } if(features.lower) _string = _string.toLowerCase(); else if(features.upper) _string = _string.toUpperCase();
	var negative = false; if(features.sign) { negative = radix.checkSigns(_string, features.negative, features.positive); _string = negative.pop();
	negative = negative[0]; } if(_bigint) _float = null; else if(!features.float) _float = false; const split = (!features.float ? [ _string ] : _string.split('.'));
	if(split.length > 2) return (_throw ? error('Too many decimal points') : null); else if(split.length > 1 && !_float) split.length = 1; var rem = 0;
	if(split.length > 1) { while(split[1][split[1].length - 1 - rem] === features.alphabet[0]) ++rem; if(rem > 0) split[1] = split[1].slice(0, -rem);
	if(split[1].length === 0) { split.length = 1; _float = false; }} else if(typeof _bigint !== 'boolean') _bigint = false; var rem = 0;
	while(split[0][rem] === features.alphabet[0]) ++rem; if(rem > 0) split[0] = split[0].substr(rem); if(split.length === 1 && split[0].length === 0)
	return (_bigint ? 0n : 0); else _radix = features.alphabet.length;
	if(_bigint) _radix = BigInt(_radix); var result = (_bigint ? 0n : 0); var mul = (_bigint ? 1n : 1); var idx; for(var i = split[0].length - 1; i >= 0; --i) {
		if(features.bytes) { idx = split[0].charCodeAt(i); if(features.rev) idx = (255 - $idx); }
		else if((idx = features.alphabet.indexOf(split[0][i])) === -1) return (_throw ? error('Alphabet doesn\'t contain `%` character', null, split[0][i]) : null);
		if(_bigint) idx = BigInt(idx); result += (idx * mul); mul *= _radix; }
	if(_float && split.length > 1) { var floats = 0; mul = 1 / _radix; for(var i = 0; i < split[1].length; ++i) {
		if((idx = features.alphabet.indexOf(split[1][i])) === -1) return (_throw ? error('Alphabet doesn\'t contain `%` character', null, split[1][i]) : null);
		else floats += (idx * mul); mul /= _radix; } result += floats; } if(negative) return -result; return result; };

radix.render = (_value, _radix = DEFAULT_RADIX, _bigint_suffix = DEFAULT_BIGINT_SUFFIX, _float = true, _throw = DEFAULT_THROW) => {
	if(typeof _value === 'bigint') { if(typeof _bigint_suffix === 'boolean') _bigint_suffix = (_bigint_suffix ? 'n' : '');
		else if(typeof _bigint_suffix !== 'string') _bigint_suffix = 'n'; }
	if(!numeric(_value)) return (typeof _value === 'string' ? _value : (_throw ? error('Invalid % argument', null, '_value') : null));
	const features = radix.features(_radix, _throw); if(!features) return (_throw ? error('Invalid % argument', null, '_radix') : undefined);
	else if(!features.bigint) _bigint_suffix = ''; const bigint = (typeof _value === 'bigint'); var rest = Math.abs(_value);
	_radix = features.alphabet.length; if(bigint) _radix = BigInt(_radix); if(rest === 0 || rest === 0n) return (features.alphabet[0] + (bigint ? _bigint_suffix : ''));
	var result = ''; var idx, sub; while(rest >= _radix) { sub = Math._floor(Number(rest % _radix)); if(features.bytes) sub = String.fromCharCode(features.rev ? (255 - sub) : sub);
	else sub = features.alphabet[sub]; result = sub + result; rest /= _radix; } if(rest > (bigint ? 0n : 0)) { sub = Math._floor(Number(rest)); if(features.bytes)
	sub = String.fromCharCode(features.rev ? (255 - sub) : sub); else sub = features.alphabet[sub]; result = sub + result; } if(!bigint && _float) {
	rest = (Math.abs(_value) % 1); if(rest > 0) { var zero = 0, started = false; while((rest % 1) !== 0) { rest *= _radix; if(!started && rest < 1) ++zero;
	else started = true; } result += ('.' + String.repeat(zero, features.alphabet[0]) + radix.render(rest, _radix, null, true, _throw)); }}
	return ((_value < 0 ? '-' : '') + result + ((bigint && features.bigint) ? _bigint_suffix : '')); };

//
Reflect.defineProperty(String, 'isNumber', { value: (_item, _radix = DEFAULT_RADIX) => {
	if(typeof _item !== 'string') return null; else if(_item.length === 0) return false; const features = radix.features(_radix, false);
	if(!features) return undefined; else if(features.bytes) return true; else if(features.float && _item.indicesOf('.').length > 1) return false;
	else if(features.lower) _item = _item.toLowerCase(); else if(features.upper) _item = _item.toUpperCase();
	if(features.sign) _item = radix.checkSigns(_item, features.negative, features.positive)[1];
	for(var i = 0; i < _item.length; ++i) if(_item[i] === '.') continue; else if(!features.alphabet.includes(_item[i])) return false; return true; }});

Reflect.defineProperty(String, 'isInt', { value: (_item, _radix = DEFAULT_RADIX) => {
	if(typeof _item !== 'string') return null; else if(_item.length === 0) return false; const features = radix.features(_radix, false);
	if(!features) return undefined; else if(features.bytes) return true; else if(features.float && _item.indexOf('.') > -1) return false;
	else if(features.lower) _item = _item.toLowerCase(); else if(features.upper) _item = _item.toUpperCase();
	if(features.sign) _item = radix.checkSigns(_item, features.negative, features.positive)[1];
	for(var i = 0; i < _item.length; ++i) if(!features.alphabet.includes(_item[i])) return false; return true; }});

Reflect.defineProperty(String, 'isByte', { value: (_item, _radix = DEFAULT_RADIX) => {
	if(typeof _item !== 'string') return null; else if(_item.length === 0) return false; const features = radix.features(_radix, false);
	if(!features) return undefined; else if(features.float && _item.indexOf('.') > -1) return false; else if(features.lower) _item = _item.toLowerCase();
	else if(features.upper) _item = _item.toUpperCase(); var sign; if(features.sign) { sign = radix.checkSigns(_item, features.negative, features.positive);
	_item = sign[1]; sign = sign[0]; } else sign = null; if(sign !== null && sign) return false; return Number.isByte(radix.parse(_item, features.alphabet, false, false, false)); }});

Reflect.defineProperty(String, 'isFloat', { value: (_item, _radix = DEFAULT_RADIX) => {
	if(typeof _item !== 'string') return null; else if(_item.length === 0) return false; const features = radix.features(_radix, false);
	if(!features) return undefined; else if(!features.float) return undefined; else if(_item.indicesOf('.').length !== 1) return false;
	else if(features.lower) _item = _item.toLowerCase(); else if(features.upper) _item = _item.toUpperCase();
	if(features.sign) _item = radix.checkSigns(_item, features.negative, features.positive)[1];
	for(var i = 0; i < _item.length; ++i) if(_item[i] === '.') continue; else if(!features.alphabet.includes(_item[i])) return false; return true; }});

Reflect.defineProperty(String, 'isBigInt', { value: (_item, _radix = DEFAULT_RADIX) => {
	if(typeof _item !== 'string') return null; else if(_item.length === 0) return false; const features = radix.features(_radix, false);
	if(!features) return undefined; else if(features.bytes) return true; else if(features.bigint && _item[_item.length - 1] === 'n') _item = _item.slice(0, -1);
	if(features.float && _item.includes('.')) return false; else if(features.lower) _item = _item.toLowerCase();
	else if(features.upper) _item = _item.toUpperCase(); if(features.sign) _item = radix.checkSigns(
	_item, features.negative, features.positive)[1]; for(var i = 0; i < _item.length; ++i) if(!features.alphabet.includes(_item[i]))
	return false; return true; }});

Reflect.defineProperty(String, 'isNumeric', { value: (_item, _radix = DEFAULT_RADIX) => {
	if(_item[_item.length - 1] === 'n') return String.isBigInt(_item, _radix); return String.isNumber(_item, _radix); }});

//
Reflect.defineProperty(BigInt, 'parse', { value: (_string, _radix = DEFAULT_RADIX, _throw = DEFAULT_THROW) => {
	return radix.parse(_string, _radix, true, null, _throw); }});
Reflect.defineProperty(BigInt.prototype, '_toString', { value: BigInt.prototype.toString });
Reflect.defineProperty(BigInt.prototype, 'toString', { value: function(_radix = DEFAULT_RADIX, _suffix = DEFAULT_BIGINT_SUFFIX, _throw = DEFAULT_THROW) {
	return radix.render(this.valueOf(), _radix, _suffix, null, _throw); }});
Reflect.defineProperty(Number.prototype, '_toString', { value: Number.prototype.toString });
Reflect.defineProperty(Number.prototype, 'toString', { value: function(_radix = DEFAULT_RADIX, _float = true, _throw = DEFAULT_THROW) {
	return radix.render(this.valueOf(), _radix, null, _float, _throw); }});
Reflect.defineProperty(Number, 'parse', { value: (_string, _radix = DEFAULT_RADIX, _float = true, _throw = DEFAULT_THROW) => {
	return radix.parse(_string, _radix, false, _float, _throw); }});
Reflect.defineProperty(global, 'parse', { value: (_string, _radix = DEFAULT_RADIX, _param = null, _throw = DEFAULT_THROW) => {
	return radix.parse(_string, _radix, _param, true, _throw); }});

Reflect.defineProperty(global, 'parseBigInt', { value: BigInt.parse });
Reflect.defineProperty(Number, 'parseInt', { value: (_string, _radix = DEFAULT_RADIX, _throw = DEFAULT_THROW) => {
	return radix.parse(_string, _radix, false, false, _throw); }});
Reflect.defineProperty(Number, 'parseFloat', { value: (_string, _radix = DEFAULT_RADIX, _throw = DEFAULT_THROW) => {
	return radix.parse(_string, _radix, false, true, _throw); }});
Reflect.defineProperty(Number, 'parseNumber', { value: Number.parseFloat });

Reflect.defineProperty(global, 'parseInt', { value: Number.parseInt });
Reflect.defineProperty(global, 'parseFloat', { value: Number.parseFloat });
Reflect.defineProperty(global, 'parseNumber', { value: Number.parseNumber });

//
