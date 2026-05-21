/**
 * Created by zhangdianpeng on 2018/11/5.
 */

let Err = require('./err');

let convert = a => typeof a === 'function' ? a() : a;

/**
 * Reuse existing Err instances to avoid repeated wrapping on hot paths.
 */
function toErr(value, error) {
    if (error instanceof Err) {
        if (typeof error.value === 'undefined') {
            error.value = value;
        }
        return error;
    }
    return new Err(value, error && (error.messages || error.message));
}

function match(fn) {
    return extend(value => {
        try {
            return fn(this(value));
        }
        catch (e) {
            throw toErr(value, e);
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

function originTyped(originType) {
    this.show.originType = originType;
    return this;
}

/**
 * Attach the chainable helpers directly to the type function.
 */
function extend(type) {
    type.match = match;
    type.judge = judge;
    type.named = named;
    type.attributed = attributed;
    type.described = described;
    type.originTyped = originTyped;
    type.show = {};
    return type;
}

module.exports = extend(v => v);

