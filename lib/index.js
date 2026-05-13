/**
 * Created by zhangdianpeng on 2018/11/5.
 */

let Err = require('./err');
let id = require('./id');

let render = require('./render/index.js');

let c = {};
let t = {};

/**
 * Keep the hot-path type guards in plain JavaScript to reduce lodash overhead.
 */
function isNil(value) {
    return value == null;
}

/**
 * Match lodash semantics for boxed primitive values used by older callers.
 */
function isString(value) {
    return typeof value === 'string' || value instanceof String;
}

/**
 * Match lodash semantics for boxed primitive values used by older callers.
 */
function isNumber(value) {
    return typeof value === 'number' || value instanceof Number;
}

/**
 * Match lodash semantics for boxed primitive values used by older callers.
 */
function isBoolean(value) {
    return typeof value === 'boolean' || value instanceof Boolean;
}

/**
 * Keep object checks aligned with the previous Json/Object behavior.
 * Note: lodash's _.isObject returns true for functions.
 */
function isObject(value) {
    let type = typeof value;
    return value !== null && (type === 'object' || type === 'function');
}

/**
 * Copy enumerable own properties without allocating extra intermediate arrays.
 */
function copyOwnProperties(target, source) {
    let keys = Object.keys(source);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        target[key] = source[key];
    }
    return target;
}

/**
 * Build the `show.attribute` structure once during schema creation.
 */
function collectTypeShows(typeMap, keys) {
    let result = {};
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        result[key] = typeMap[key].show;
    }
    return result;
}

/**
 * Merge two plain objects while preserving the existing return semantics.
 */
function mergeObjects(left, right) {
    let result = {};
    copyOwnProperties(result, left);
    copyOwnProperties(result, right);
    return result;
}

let Any = message => id.judge(v => !isNil(v), message || 'is Null');
let Json = message => Any(message || 'is not an Json').judge(isObject, message || 'is not an Json');

let getOrValType = (arr, type, name = 'OrValType') => {
    let values = arr.map(type);
    return c.OrVal.apply(null, values).match(value => type(value)).named(name).attributed({values, type: type.show});
};

t.Null = id.judge(isNil, 'is not Null').named('Null');

t.Any = Any().named('Any');

t.Num = Any('is not a Num').judge(v => (isNumber(v) || isString(v)) && !isNaN(v) && String(v).trim() !== '', 'is not a Num').match(Number).named('Num');

t.Str = Any('is not a Str').match(String).named('Str');

t.Fn = Any('is not a function').judge(v => typeof v === 'function', 'is not a function').named('Fn');

t.Json = Json().named('Json');

t.Obj = Json('is not an Obj').judge(v => !Array.isArray(v), 'is not an Obj').named('TObj');

t.Arr = Json('is not an Arr').judge(Array.isArray, 'is not an Arr').named('TArr');

t.Bool = Any('is not a Bool')
    .match(value => {
        let boolStr = value.toString();
        if (boolStr === 'true') return true;
        if (boolStr === 'false') return false;
    })
    .judge(isBoolean, 'is not a Bool')
    .named('Bool');

t.Date = Any('is not a Date')
    .match(value => new Date(value))
    .judge(v => v.toString() != 'Invalid Date', 'is not a Date')
    .named('Date');

t.Time = Any('is not a Time').match(String)
    .judge(v => {
        v = v.split(':');
        if(v[0].length != 2 && v[0][0] != 0) return false;
        if(v[1].length != 2 && v[1][0] != 0) return false;
        return true;
    }, 'is not a Time')
    .named('Time');


c.Val = value => id
    .judge(real => real == value, 'is not eq to ' + value)
    .named(() => 'Value')
    .attributed(value);

c.Or = function () {
    let Types = Array.prototype.slice.call(arguments);
    let newAttributes = [];
    for (let i = 0; i < Types.length; i++) {
        let T = Types[i];
        let {name, attribute} = T.show;
        if (name === 'Or') {
            for (let j = 0; j < attribute.length; j++) {
                newAttributes.push(attribute[j]);
            }
        } else {
            newAttributes.push(T.show);
        }
    }
    return id
        .match(value => {
            let es = [];
            for (let i = 0; i < Types.length; i++) {
                let Type = Types[i];
                try {
                    return Type(value);
                }
                catch (e) {
                    let messages = e.inspect().messages;
                    for (let j = 0; j < messages.length; j++) {
                        es.push(messages[j]);
                    }
                }
            }
            throw new Err(value, es);
        })
        .named('Or')
        .attributed(newAttributes)
};

c.TagOr = function (Types, tags) {
    if(!Array.isArray(tags)){
        tags = [tags];
    }
    let newAttributes = [];
    let tagToType = {};
    Types.forEach(T => {
        let {name, attribute} = T.show;
        if(name === 'Obj'){
            newAttributes.push(T.show);
            let tagIds = [];
            tags.forEach(tag => {
                if(attribute[tag] && attribute[tag].originType === 'c.Str'){
                    tagIds.push(attribute[tag].attribute.values[0]);
                }else{
                    throw new Err(attribute, `these has a type does not satisfy the tag definition:${tags.join(',')}`)
                }
            });
            if(tagToType[tagIds.join('-')]){
                throw new Err(attribute, `Tag<${tags.join(',')}> repeat defined: ${tagIds.join(',')}`);
            }
            tagToType[tagIds.join('-')] = T;
        }else{
            throw new Err(attribute, `TagOr does not support ${name} type`);
        }
    });
    return id
        .match(value => {
            let tagIds = [];
            tags.forEach(tag => tagIds.push((value && value[tag])));
            let type = tagToType[tagIds.join('-')];
            if(!type){
                throw new Err(value, `Tag definition<${tags.join(',')}> does not satisfy: ${Object.keys(tagToType).join('/')}`);
            }
            return type(value);
        })
        .named('Or')
        .attributed(newAttributes);
};

c.Optional = Type => {
    let optionalType = c.Or(t.Null, Type);
    return id
    .match(value => optionalType(value))
    .named('Optional')
    .attributed(Type.show);
};

c.Default = (Type, defaultValue) => id
    .match(value => {
        if (isNil(value)) return Type(defaultValue);
        return Type(value);
    })
    .named('Default')
    .attributed([Type.show, defaultValue]);

c.Arr = Type => t.Arr
    .match(arr => {
        let result = new Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
            try {
                result[i] = Type(arr[i]);
            }
            catch (e) {
                let newErr = e.index(i);
                newErr.value = arr;
                throw newErr;
            }
        }
        return result;
    })
    .named('Arr')
    .attributed(() => [Type.show]);


c.Obj = TypeMap => {
    let keys = Object.keys(TypeMap);
    let showAttribute = collectTypeShows(TypeMap, keys);
    return t.Obj
        .match(obj => {
            let ret = {};
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                try {
                    let result = TypeMap[key](obj[key]);
                    if (!isNil(result)) {
                        ret[key] = result;
                    }
                }
                catch (e) {
                    let newErr = e.key(key);
                    newErr.value = obj;
                    throw newErr;
                }
            }
            return ret;
        })
        .named('Obj')
        .attributed(showAttribute);
};

c.OrVal = function () {
    let Types = [].slice.apply(arguments);
    return c.Or.apply(null, Types.map(t => c.Val(t))).named('OrVal');
};

c.OrValType = (arr, type) => getOrValType(arr, type);

c.ValType = (value, type) => getOrValType([value], type);

c.Str = (value) => getOrValType([value], t.Str, 'Val').originTyped('c.Str');
c.Num = (value) => getOrValType([value], t.Num, 'Val');
c.OrStr = function(){
    let params = Array.from(arguments);
    return getOrValType(params, t.Str);
};
c.OrNum = function(){
    let params = Array.from(arguments);
    return getOrValType(params, t.Num);
};

c.ValSet = (setValue) => id.match(() => setValue).named('ValSet').attributed([setValue]);

c.ValConvert = (before, after) => id
    .match(value => {
        value = c.Val(before)(value);
        return c.ValSet(after)(value);
    })
    .named('ValConvert')
    .attributed([before, after]);

c.ObjConvert = (objType, beforeKey, afterKey) => {
    let objChecker = c.Obj(objType);
    return id
    .match(obj => {
        let newObj = objChecker(obj);
        newObj[afterKey] = newObj[beforeKey];
        delete newObj[beforeKey];
        return newObj;
    })
    .named('ObjConvert')
    .attributed([objType.show, beforeKey, afterKey]);
};

c.Map = (KeyType, ValueType) => t
    .Obj
    .match(obj => Object.keys(obj).reduce((ret, key) => {
        let newKey, newValue;
        try {
            newKey = KeyType(key);
        } catch (e) {
            throw e.key(`the key<${key}> in Map`);
        }

        try {
            newValue = ValueType(obj[key]);
        } catch (e) {
            throw e.key(`the value<${obj[key]}> of key<${key}> in Map `);
        }
        ret[newKey] = newValue;
        return ret;
    }, {}))
    .named('Map')
    .attributed([KeyType.show, ValueType.show]);

c.Custom = (fn, options = {}) => {
    let attribute, name, realType, params = [];
    try{
        realType = fn.apply(null, params);
        attribute = realType.show.attribute;
        name = realType.show.name;
    }catch(err){
        attribute = options.attribute || {};
        name = 'Custom';
        realType = undefined;
    }
    return id
        .match(value => {
            if(realType){
                return realType(value);
            }else{
                return fn.apply(null, params)(value)
            }
        })
        .named(name)
        .attributed(attribute);
};

c.Fn = ({input = [], output = t.Any}) => {
    return id
        .match(fn => {
            return function(){
                let params = Array.from(arguments);
                let newParams = input.map((type, index) => {
                    let res;
                    try{
                        res = type(params[index]);
                    }catch(err){
                        throw err.key(`The ${index}th parameter of the function`);
                    }
                    return res;
                });
                let ouputResult = fn.apply(null ,newParams);
                try{
                    ouputResult = output(ouputResult);
                }catch(err){
                    throw err.key(`the output of the function`);
                }
                return ouputResult;
            };
        })
        .named('CFn')
        .attributed({
            input: input.map(t => t.show),
            output: output.show
        });
};

c.Extend = function () {
    let Types = Array.prototype.slice.call(arguments);
    let attributes = [];
    let newName = 'Obj';
    Types.forEach(t => {
        let {attribute, name} = t.show;
        if(name === 'Obj'){
            if(attributes.length){
                attributes = attributes.map(a => mergeObjects(a, attribute));
            }else{
                attributes.push(attribute);
            }
        }else if(name === 'Or'){
            newName = 'Or';
            if(attributes.length){
                attributes = attributes.reduce((all, a) => all.concat(attribute.map(b => mergeObjects(a, b.attribute))), []);
            }else{
                attributes = attribute.map(b => b.attribute);
            }
        }else{
            throw new Err(attribute, `Extend does not support ${name} type`);
        }
    });
    let newAttribute = newName === 'Obj' ?
        attributes[0]:
        attributes.map(a => ({name: 'Obj', attribute: a}));

    return id
        .match(value => {
            let result = {};
            for (let i = 0; i < Types.length; i++) {
                copyOwnProperties(result, Types[i](value));
            }
            return result;
        })
        .named(newName)
        .attributed(newAttribute);
};

['Null', 'Any', 'Num', 'Str', 'Fn', 'Json', 'Obj', 'Arr', 'Bool', 'Date', 'Time']
    .forEach(fnName => {
        t['D' + fnName] = (des) => {
            let type = t[fnName];
            return id
                .match(type)
                .named(type.show.name)
                .attributed(type.show.attribute)
                .described(des);
        };
    });

['Val', 'Or', 'Optional', 'Default', 'Arr', 'Obj', 'OrVal', 'OrValType', 'ValType', 'ValSet', 'ValConvert', 'ObjConvert', 'Map', 'Extend', 'Fn', 'Custom', 'TagOr', 'Str', 'Num', 'OrNum', 'OrStr']
    .forEach(fnName => c['D' + fnName] = (des) => function(){
        let args = Array.prototype.slice.call(arguments);
        let type = c[fnName].apply(null, args);
        return id
            .match(type)
            .named(type.show.name)
            .attributed(type.show.attribute)
            .described(des);
    });

module.exports = Object.assign({
    c,
    t
}, render);



