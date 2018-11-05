/**
 * Created by zhangdianpeng on 2018/11/5.
 */

let Err = require('./err');

let convert = a => typeof a === 'function' ? a() : a;

function match(fn) {
    return extend(value => {
        try {
            return fn(this(value));
        }
        catch (e) {
            throw new Err(value, e.messages || e.message);
        }
    });
}

function judge(fn, message) {
    return this.match(value => {
        if (fn(value)) return value;
        throw new Err(value, message);
    });
}

function named(name) {
    this.show.name = convert(name);
    return this;
}

function attributed(attribute) {
    this.show.attribute = convert(attribute);
    return this;
}

function described(description) {
    this.show.description = convert(description);
    return this;
}

function extend(type) {
    return Object.assign(type, {
        match,
        judge,
        named,
        attributed,
        described,
        show: {}
    });
}

module.exports = extend(v => v);


