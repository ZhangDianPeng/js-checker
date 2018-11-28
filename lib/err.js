/**
 * Created by zhangdianpeng on 2018/11/5.
 */

let format = require('util').format;
let _ = require('lodash');

let Err = function (value, message) {
    this.value = value;
    this.messages = _.uniq(Array.isArray(message) ? message : [message]);
    this.message = this.messages.join('\n');
};

Err.prototype = Object.create(Error);

Err.prototype.inspect = function () {
    if (this.path){
        this.messages = _.uniq(this.messages.map(m => {
            if(m.includes('  ')){
                return format('%s.%s', this.path, m);
            }else{
                return format('%s  %s', this.path, m);
            }
        }));
    }
    else
        this.messages = _.uniq(this.messages.map(m => format('%s', m)));
    this.message = this.messages.join('\n');
    return this;
};

Err.prototype.key = function (key) {
    this.path = format('%s', key);
    return this.inspect();
};

Err.prototype.index = function (idx) {
    this.path = format('[%s]', idx);
    return this.inspect();
};
module.exports = Err;