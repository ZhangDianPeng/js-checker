/**
 * Created by zhangdianpeng on 2018/11/5.
 */

let _ = require('lodash');

let Err = require('./err');
let id = require('./id');

let render = require('./render/index.js');

let c = {};
let t = {};

let Any = message => id.judge(v => !_.isNil(v), message || 'is Null');
let Json = message => Any(message || 'is not an Json').judge(_.isObject, message || 'is not an Json');

t.Null = id.judge(_.isNil, 'is not Null').named('Null');

t.Any = Any().named('Any');

t.Num = Any('is not a Num').judge(v => !isNaN(v) && v !== '', 'is not a Num').match(Number).named('Num');

t.Str = Any('is not a Str').match(String).named('Str');

t.Fn = Any('is not a function').judge(_.isFunction, 'is not a function').named('Fn');

t.Json = Json().named('Json');

t.Obj = Json('is not an Obj').judge(v => !_.isArray(v), 'is not an Obj').named('TObj');

t.Arr = Json('is not an Arr').judge(_.isArray, 'is not an Arr').named('TArr');

t.Bool = Any('is not a Bool')
    .match(value => {
        let boolStr = value.toString();
        if (boolStr === 'true') return true;
        if (boolStr === 'false') return false;
    })
    .judge(_.isBoolean, 'is not a Bool')
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
    let Types = [].slice.apply(arguments);
    let newAttributes = [];
    Types.forEach(T => {
        let {name, attribute} = T.show;
        if (name === 'Or') {
            newAttributes = newAttributes.concat(attribute);
        } else {
            newAttributes.push(T.show);
        }
    });
    return id
        .match(value => {
            let ret;
            let es = [];
            let matchSome = Types.some(Type => {
                try {
                    ret = Type(value);
                }
                catch (e) {
                    es = es.concat(e.inspect().messages);
                    return false;
                }
                return true;
            });
            if (matchSome) return ret;
            throw new Err(value, es);
        })
        .named('Or')
        .attributed(newAttributes);
};

c.Optional = Type => id
    .match(value => c.Or(t.Null, Type)(value))
    .named('Optional')
    .attributed([Type.show]);

c.Default = (Type, defaultValue) => id
    .match(value => {
        if (_.isNil(value)) return Type(defaultValue);
        return Type(value);
    })
    .named('Default')
    .attributed([Type.show, defaultValue]);

c.Arr = Type => t.Arr
    .match(arr => arr.map((item, i) => {
        let result;
        try {
            result = Type(item);
        }
        catch (e) {
            let newErr = e.index(i);
            newErr.value = arr;
            throw newErr;
        }
        return result;
    }))
    .named('Arr')
    .attributed(() => [Type.show]);


c.Obj = TypeMap => t.Obj
    .match(obj => Object.keys(TypeMap).reduce((ret, key) => {
        try {
            let result = TypeMap[key](obj[key]);
            if (!_.isNil(result))
                ret[key] = result;
        }
        catch (e) {
            let newErr = e.key(key);
            newErr.value = obj;
            throw newErr;
        }
        return ret;
    }, {}))
    .named('Obj')
    .attributed(() => {
        let result = {};
        Object.keys(TypeMap).map(key => result[key] = TypeMap[key].show);
        return result;
    });

c.OrVal = function () {
    let Types = [].slice.apply(arguments);
    return c.Or.apply(null, Types.map(t => c.Val(t))).named('OrVal');
};

c.OrValType = (arr, type) => c.OrVal.apply(null, arr.map(type)).match(value => type(value)).named('OrValType').attributed({values: arr.map(type), type: type.show});

c.ValType = (value, type) => c.Val(type(value)).match(value => type(value)).named('OrValType').attributed({values: [type(value)], type: type.show});

c.ValSet = (setValue) => id.match(() => setValue).named('ValSet').attributed([setValue]);

c.ValConvert = (before, after) => id
    .match(value => {
        value = c.Val(before)(value);
        return c.ValSet(after)(value);
    })
    .named('ValConvert')
    .attributed([before, after]);

c.ObjConvert = (objType, beforeKey, afterKey) => id
    .match(obj => {
        let newObj = c.Obj(objType)(obj);
        newObj[afterKey] = newObj[beforeKey];
        delete newObj[beforeKey];
        return newObj;
    })
    .named('ObjConvert')
    .attributed([objType.show, beforeKey, afterKey]);

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
                attributes = attributes.map(a => Object.assign({}, a, attribute));
            }else{
                attributes.push(attribute);
            }
        }else if(name === 'Or'){
            newName = 'Or';
            if(attributes.length){
                attributes = attributes.reduce((all, a) => all.concat(attribute.map(b => Object.assign({}, a, b.attribute))), []);
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
            let values = Types.map(Type => Type(value));
            return Object.assign.apply(Object, values);
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

['Val', 'Or', 'Optional', 'Default', 'Arr', 'Obj', 'OrVal', 'OrValType', 'ValType', 'ValSet', 'ValConvert', 'ObjConvert', 'Map', 'Extend', 'Fn']
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




