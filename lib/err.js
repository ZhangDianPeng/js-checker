/**
 * Created by zhangdianpeng on 2018/11/5.
 */

/**
 * Convert the constructor input into a stable message array.
 */
function normalizeMessages(message) {
    if (Array.isArray(message)) {
        return uniqueMessages(message);
    }
    return uniqueMessages([message]);
}

/**
 * Remove duplicate messages without pulling lodash into the hot path.
 */
function uniqueMessages(messages) {
    let result = [];
    let seen = Object.create(null);
    for (let i = 0; i < messages.length; i++) {
        let key = String(messages[i]);
        if (!seen[key]) {
            seen[key] = true;
            result.push(key);
        }
    }
    return result;
}

/**
 * Prefix a message with the accumulated object path.
 */
function formatMessage(prefix, message) {
    if (!prefix) {
        return String(message);
    }
    if (message.includes('  ')) {
        return prefix + '.' + message;
    }
    return prefix + '  ' + message;
}

let Err = function (value, message) {
    this.value = value;
    this._baseMessages = normalizeMessages(message);
    this._paths = [];
    this._lastPrefix = '';
    this.messages = this._baseMessages;
    this.message = this.messages.join('\n');
};

Err.prototype = Object.create(Error.prototype);
Err.prototype.constructor = Err;

/**
 * Materialize the current formatted messages only when they are requested.
 */
Err.prototype.inspect = function () {
    let prefix = this._paths.length ? this._paths.slice().reverse().join('.') : '';
    if (prefix === this._lastPrefix) {
        return this;
    }

    if (!prefix) {
        this.messages = this._baseMessages;
    } else {
        let formatted = new Array(this._baseMessages.length);
        for (let i = 0; i < this._baseMessages.length; i++) {
            formatted[i] = formatMessage(prefix, this._baseMessages[i]);
        }
        this.messages = uniqueMessages(formatted);
    }
    this.message = this.messages.join('\n');
    this._lastPrefix = prefix;
    return this;
};

/**
 * Add an object key segment to the current error path.
 */
Err.prototype.key = function (key) {
    this._paths.push(String(key));
    return this.inspect();
};

/**
 * Add an array index segment to the current error path.
 */
Err.prototype.index = function (idx) {
    this._paths.push('[' + idx + ']');
    return this.inspect();
};

module.exports = Err;
