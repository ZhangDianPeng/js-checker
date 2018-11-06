/**
 * Created by zhangdianpeng on 2018/11/5.
 */

let {c, t, getHtml} = require('./lib/index.js');

let type = c.DObj('测试')({
    id: t.DNum('自增id'),
    name: t.DStr('名称'),
    details: c.DObj('详情')({
        id: t.Str,
        name: t.Num
    })
});

getHtml(type.show,  './test.html');