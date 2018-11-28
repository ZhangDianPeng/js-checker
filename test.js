/**
 * Created by zhangdianpeng on 2018/11/6.
 */

let assert = require('assert');

let {c, t, renderHtml, getHtml} = require('./index.js');

assert.throwError = (fn, params, message) => {
    try{
        fn.apply(null, params);
    }catch(err){
        return assert.deepEqual(err.message, message);
    }
    throw new Error(`it need to throw Error with message<${message}>`);
};

let wrapTest = (obj, typeName) => (fn) => {
    let type = obj[typeName];
    let dType = obj['D' + typeName]('description');
    fn(type);
    fn(dType);
};

describe('t', function(){

    describe('t.Null and t.DNull', function(){
        let wrapType = wrapTest(t, 'Null');
        it('undefined test', function (){
            wrapType(type => {
                let result = type(undefined);
                assert.deepEqual(result, undefined);
            });
        });
        it('null test', function (){
            wrapType(type => {
                let result = type(null);
                assert.deepEqual(result, null);
            });
        });
        it('error test', function (){
            wrapType(type => {
                assert.throwError(type, [0], 'is not Null');
            });
        });
    });

    describe('t.Any and t.DAny', function(){
        let wrapType = wrapTest(t, 'Any');
        it('0 test', function (){
            wrapType(type => {
                let result = type(0);
                assert.deepEqual(result, 0);
            });

        });
        it('object test', function (){
            wrapType(type => {
                let result = type({a: 1});
                assert.deepEqual(result, {a: 1});
            });
        });
        it('error null test', function (){
            wrapType(type => {
                assert.throwError(type, [null], 'is Null');
            });
        });
    });

    describe('t.Num and t.DNum', function(){
        let wrapType = wrapTest(t, 'Num');
        it('0 test', function (){
            wrapType(type => {
                let result = type(0);
                assert.deepEqual(result, 0);
            });

        });
        it('"2" test', function (){
            wrapType(type => {
                let result = type('2');
                assert.deepEqual(result, 2);
            });
        });
        it('string test', function (){
            wrapType(type => {
                assert.throwError(type, ['2xx'], 'is not a Num');
            });
        });
        it('[] test', function (){
            wrapType(type => {
                assert.throwError(type, [[]], 'is not a Num');
            });
        });
        it('{} test', function (){
            wrapType(type => {
                assert.throwError(type, [{}], 'is not a Num');
            });
        });
        it('empty string test', function (){
            wrapType(type => {
                assert.throwError(type, [''], 'is not a Num');
            });
            wrapType(type => {
                assert.throwError(type, ['  '], 'is not a Num');
            });
        });
    });

    describe('t.Str and t.DStr', function(){
        let wrapType = wrapTest(t, 'Str');
        it('0 test', function (){
            wrapType(type => {
                let result = type('0');
                assert.deepEqual(result, '0');
            });
        });
        it('"2" test', function (){
            wrapType(type => {
                let result = type('2');
                assert.deepEqual(result, '2');
            });
        });
        it('string test', function (){
            wrapType(type => {
                assert.throwError(type, [null], 'is not a Str');
            });
        });
    });

    describe('t.Fn and t.DFn', function(){
        let wrapType = wrapTest(t, 'Fn');
        it('fn test', function (){
            wrapType(type => {
                let fn = a => {};
                let result = type(fn);
                assert.deepEqual(result, fn);
            });
        });
        it('string test', function (){
            wrapType(type => {
                assert.throwError(type, ['hello'], 'is not a function');
            });
        });
    });

    describe('t.Json and t.DJson', function(){
        let wrapType = wrapTest(t, 'Json');
        it('Array test', function (){
            wrapType(type => {
                let result = type([1, 2]);
                assert.deepEqual(result, [1, 2]);
            });
        });
        it('Object test', function (){
            wrapType(type => {
                let result = type({a: 1});
                assert.deepEqual(result, {a: 1});
            });
        });
        it('num test', function (){
            wrapType(type => {
                assert.throwError(type, [1], 'is not an Json');
            });
        });
        it('null test', function (){
            wrapType(type => {
                assert.throwError(type, [null], 'is not an Json');
            });
        });
    });

    describe('t.Arr and t.DArr', function(){
        let wrapType = wrapTest(t, 'Arr');
        it('Array test', function (){
            wrapType(type => {
                let result = type([1, 2]);
                assert.deepEqual(result, [1, 2]);
            });
        });
        it('num test', function (){
            wrapType(type => {
                assert.throwError(type, [1], 'is not an Arr');
            });
        });
        it('null test', function (){
            wrapType(type => {
                assert.throwError(type, [null], 'is not an Arr');
            });
        });
    });

    describe('t.Obj and t.DObj', function(){
        let wrapType = wrapTest(t, 'Obj');
        it('Object test', function (){
            wrapType(type => {
                let result = type({a: 1});
                assert.deepEqual(result, {a: 1});
            });
        });
        it('Array test', function (){
            wrapType(type => {
                assert.throwError(type, [[1, 2]], 'is not an Obj');
            });
        });
        it('null test', function (){
            wrapType(type => {
                assert.throwError(type, [null], 'is not an Obj');
            });
        });
    });

    //t.Bool
    describe('t.Bool and t.DBool', function(){
        let wrapType = wrapTest(t, 'Bool');
        it('true test', function (){
            wrapType(type => {
                let result = type(true);
                assert.deepEqual(result, true);
            });
        });
        it('"true" test', function (){
            wrapType(type => {
                let result = type("true");
                assert.deepEqual(result, true);
            });
        });
        it('false test', function (){
            wrapType(type => {
                let result = type(false);
                assert.deepEqual(result, false);
            });
        });
        it('"false" test', function (){
            wrapType(type => {
                let result = type("false");
                assert.deepEqual(result, false);
            });
        });
        it('0 test', function (){
            wrapType(type => {
                assert.throwError(type, [0], 'is not a Bool');
            });
        });
        it('null test', function (){
            wrapType(type => {
                assert.throwError(type, [null], 'is not a Bool');
            });
        });
    });

    describe('t.Date and t.DDate', function(){
        let wrapType = wrapTest(t, 'Date');
        it('new Date test', function (){
            wrapType(type => {
                let date = new Date();
                let result = type(date);
                assert.deepEqual(result, date);
            });
        });
        it('date number test', function (){
            wrapType(type => {
                let result = type(1541477782023);
                assert.deepEqual(result, new Date(1541477782023));
            });
        });
        it('str test', function (){
            wrapType(type => {
                assert.throwError(type, ['xxx'], 'is not a Date');
            });
        });
        it('null test', function (){
            wrapType(type => {
                assert.throwError(type, [null], 'is not a Date');
            });
        });
    });

    describe('t.Time and t.DTime', function(){
        let wrapType = wrapTest(t, 'Time');
        it('01:00', function (){
            wrapType(type => {
                let result = type('01:00');
                assert.deepEqual(result, '01:00');
            });
        });
        it('12:00', function (){
            wrapType(type => {
                let result = type('01:00');
                assert.deepEqual(result, '01:00');
            });
        });
        it('1:22', function (){
            wrapType(type => {
                assert.throwError(type, ['1:22'], 'is not a Time');
            });
        });
        it('01:2:22', function (){
            wrapType(type => {
                assert.throwError(type, ['01:2:22'], 'is not a Time');
            });
        });
        it('str test', function (){
            wrapType(type => {
                assert.throwError(type, ['xxx'], 'is not a Time');
            });
        });
        it('null test', function (){
            wrapType(type => {
                assert.throwError(type, [null], 'is not a Time');
            });
        });
    });
});

describe('c', function(){

    describe('c.Val and c.DVal', function(){
        let wrapType = wrapTest(c, 'Val');
        it('value test', function (){
            wrapType(type => {
                let result = type('helloworld')('helloworld');
                assert.deepEqual(result, 'helloworld');
            });
        });
        it('object test', function (){
            wrapType(type => {
                assert.throwError(type({a: 1}), [{a: 1}], 'is not eq to [object Object]');
            });
        });
        it('error test', function (){
            wrapType(type => {
                assert.throwError(type('helloworld'), ['hello world'], 'is not eq to helloworld');
            });
        });
    });

    describe('c.OrVal and c.DOrVal', function(){
        let wrapType = wrapTest(c, 'OrVal');
        it('one of the values test', function (){
            wrapType(oType => {
                let type = oType('helloworld', 'hello world');
                assert.deepEqual(type('helloworld'), 'helloworld');
                assert.deepEqual(type('hello world'), 'hello world');
                assert.throwError(type, ['hello-world'], 'is not eq to helloworld\nis not eq to hello world');
            });
        });
    });

    describe('c.Obj and c.DObj', function(){
        let wrapType = wrapTest(c, 'Obj');
        it('one of the values test', function (){
            wrapType(oType => {
                let type = oType({
                    age: t.Num,
                    nick: t.Str
                });
                assert.deepEqual(type({age: 13, nick: 'Lucy'}), {age: 13, nick: 'Lucy'});
                assert.deepEqual(type({age: '13', nick: 'Lucy'}), {age: 13, nick: 'Lucy'});
                assert.deepEqual(type({age: '13', nick: 'Lucy', school: 'hangzhou'}), {age: 13, nick: 'Lucy'});
                assert.throwError(type, [{age: 13}], 'nick  is not a Str');
                assert.throwError(type, [null], 'is not an Obj');
            });
        });
    });

    describe('c.Arr and c.DArr', function(){
        let wrapType = wrapTest(c, 'Arr');
        it('one of the values test', function (){
            wrapType(oType => {
                let type = oType(c.Obj({
                    age: t.Num,
                    nick: t.Str
                }));
                assert.deepEqual(
                    type([{age: 13, nick: 'Lucy'}, {age: '14', nick: 'Lilin'}]),
                    [{age: 13, nick: 'Lucy'}, {age: 14, nick: 'Lilin'}]
                );
                assert.throwError(type, [{age: 13}], 'is not an Arr');
                assert.throwError(type, ['age'], 'is not an Arr');
                assert.throwError(type, [null], 'is not an Arr');
                assert.throwError(type, [[{age: 13, nick: 'Lucy'}, {age: '14x', nick: 'Lilin'}]], '[1].age  is not a Num');
            });
        });
    });

    describe('c.Or and c.DOr', function(){
        let wrapType = wrapTest(c, 'Or');
        it('one of the values test', function (){
            wrapType(oType => {
                let type = oType(t.Num, t.Arr);
                assert.deepEqual(type(1), 1);
                assert.deepEqual(type([1, 2]), [1, 2]);
                assert.throwError(type, [{age: 13}], 'is not a Num\nis not an Arr');
                assert.throwError(type, ['age'], 'is not a Num\nis not an Arr');
                assert.throwError(type, [null], 'is not a Num\nis not an Arr');
            });
        });
        it('or includes or', function (){
            wrapType(oType => {
                let type = oType(oType(c.Obj({a: t.Num})), oType(c.Obj({b: t.Num})));
                assert.deepEqual(type({a: 1}), {a: 1});
                assert.deepEqual(type({b: 2}), {b: 2});
                assert.throwError(type, [{age: 13}], 'a  is not a Num\nb  is not a Num');
                assert.throwError(type, ['age'], 'is not an Obj');
                assert.throwError(type, [null], 'is not an Obj');
            });
        });
    });

    describe('c.Optional and c.DOptional', function(){
        let wrapType = wrapTest(c, 'Optional');
        it('Only Optional', function (){
            wrapType(oType => {
                let type = oType(t.Num);
                assert.deepEqual(type(1), 1);
                assert.deepEqual(type('1'), 1);
                assert.deepEqual(type(null), null);
                assert.deepEqual(type(undefined), undefined);
                assert.throwError(type, [{age: 13}], 'is not Null\nis not a Num');
                assert.throwError(type, ['age'], 'is not Null\nis not a Num');
            });
        });

        it('Optional in Obj', function (){
            wrapType(oType => {
                let type = c.Obj({
                    nick: oType(t.Str),
                    age: t.Num
                });
                assert.deepEqual(type({age: 1, nick: 'Lucy'}), {age: 1, nick: 'Lucy'});
                assert.deepEqual(type({age: 1}), {age: 1});
                assert.throwError(type, [null], 'is not an Obj');
            });
        });
    });

    describe('c.Default and c.DDefault', function(){
        let wrapType = wrapTest(c, 'Default');
        it('Only Default', function (){
            wrapType(oType => {
                let type = oType(t.Num, 13);
                assert.deepEqual(type(1), 1);
                assert.deepEqual(type('1'), 1);
                assert.deepEqual(type(undefined), 13);
                assert.deepEqual(type(null), 13);
                assert.throwError(type, ['hello'], 'is not a Num');
            });
        });
    });

    describe('c.Map and c.DMap', function(){
        let wrapType = wrapTest(c, 'Map');
        it('Only Map', function (){
            wrapType(oType => {
                let type = oType(t.Str, t.Num);
                assert.deepEqual(type({
                    a: 1,
                    b: '2'
                }), {
                    a: 1,
                    b: 2
                });
                assert.throwError(type, [{
                    a: 1,
                    b: 'hello'
                }], 'the value<hello> of key<b> in Map   is not a Num');
                assert.throwError(type, [null], 'is not an Obj');
            });

        });
    });

    describe('c.Extend and c.DExtend', function(){
        let wrapType = wrapTest(c, 'Extend');
        it('Only Extend', function (){
            wrapType(oType => {
                let type = oType(
                    c.Obj({
                        age: t.Num
                    }),
                    c.Or(
                        c.Obj({
                            type: c.Val('Student'),
                            school: t.Str
                        }),
                        c.Obj({
                            type: c.Val('Worker'),
                            workplace: t.Str
                        })
                    )
                );
                assert.deepEqual(type({age: 13, type: 'Student', school: 'hangzhou'}), {age: 13, type: 'Student', school: 'hangzhou'});
                assert.deepEqual(type({age: 13, type: 'Worker', workplace: 'hangzhou'}), {age: 13, type: 'Worker', workplace: 'hangzhou'});
                assert.throwError(type, [{age: 13, type: 'Worker', school: 'hangzhou'}], 'type  is not eq to Student\nworkplace  is not a Str');
                assert.throwError(type, [null], 'is not an Obj');
            });
        });
        it('Extend not Obj and Or', function (){
            wrapType(oType => {
                assert.throwError(oType, [
                    t.Num,
                    c.Or(
                        c.Obj({
                            type: c.Val('Student'),
                            school: t.Str
                        }),
                        c.Obj({
                            type: c.Val('Worker'),
                            workplace: t.Str
                        })
                    )
                ], 'Extend does not support Num type');
            });
        });
        it('Only Extend for Or before Obj', function (){
            wrapType(oType => {
                let type = oType(
                    c.Or(
                        c.Obj({
                            type: c.Val('Student'),
                            school: t.Str
                        }),
                        c.Obj({
                            type: c.Val('Worker'),
                            workplace: t.Str
                        })
                    ),
                    c.Obj({
                        age: t.Num
                    })
                );
                assert.deepEqual(type({age: 13, type: 'Student', school: 'hangzhou'}), {age: 13, type: 'Student', school: 'hangzhou'});
                assert.deepEqual(type({age: 13, type: 'Worker', workplace: 'hangzhou'}), {age: 13, type: 'Worker', workplace: 'hangzhou'});
                assert.throwError(type, [{age: 13, type: 'Worker', school: 'hangzhou'}], 'type  is not eq to Student\nworkplace  is not a Str');
                assert.throwError(type, [null], 'is not an Obj');
            });
        });
        it('Extend for only Obj', function (){
            wrapType(oType => {
                let type = oType(
                    c.Obj({
                        age: t.Num
                    })
                );
                assert.deepEqual(type({age: 13}), {age: 13});
                assert.throwError(type, [null], 'is not an Obj');
            });
        });
    });

    describe('c.OrValType and c.DOrValType', function(){
        let wrapType = wrapTest(c, 'OrValType');
        it('OrValType', function (){
            wrapType(oType => {
                let type = oType([1, 2], t.Num);
                assert.deepEqual(type(1), 1);
                assert.deepEqual(type(2), 2);
                assert.deepEqual(type('2'), 2);
                assert.deepEqual(type('1'), 1);
                assert.throwError(type, ['str'], 'is not eq to 1\nis not eq to 2');
                assert.throwError(type, [null], 'is not eq to 1\nis not eq to 2');
            });
        });
    });

    describe('c.ValType and c.DValType', function(){
        let wrapType = wrapTest(c, 'ValType');
        it('ValType', function (){
            wrapType(oType => {
                let type = oType(1, t.Num);
                assert.deepEqual(type(1), 1);
                assert.deepEqual(type('1'), 1);
                assert.throwError(type, ['str'], 'is not eq to 1');
                assert.throwError(type, [null], 'is not eq to 1');
            });
        });
    });

    describe('c.ValSet and c.DValSet', function(){
        let wrapType = wrapTest(c, 'ValSet');
        it('ValType', function (){
            wrapType(oType => {
                let type = oType('helloworld');
                assert.deepEqual(type(1), 'helloworld');
                assert.deepEqual(type(null), 'helloworld');
            });
        });
    });

    describe('c.ValConvert and c.DValConvert', function(){
        let wrapType = wrapTest(c, 'ValConvert');
        it('ValConvert', function (){
            wrapType(oType => {
                let type = oType('helloworld', 'hello-world');
                assert.deepEqual(type('helloworld'), 'hello-world');
                assert.throwError(type, ['hello-world'], 'is not eq to helloworld');
                assert.throwError(type, [null], 'is not eq to helloworld');
            });
        });
    });

    describe('c.ObjConvert and c.DObjConvert', function(){
        let wrapType = wrapTest(c, 'ObjConvert');
        it('ObjConvert', function (){
            wrapType(oType => {
                let type = oType({
                    id: t.Str
                }, 'id', 'tableId');
                assert.deepEqual(type({id: 'hello'}), {tableId: 'hello'});
                assert.throwError(type, ['hello-world'], 'is not an Obj');
                assert.throwError(type, [null], 'is not an Obj');
            });
        });
    });

    describe('c.Fn and c.DFn', function(){
        let wrapType = wrapTest(c, 'Fn');
        it('Fn', function (){
            wrapType(oType => {
                let type = oType({
                    input: [t.Num, t.Str],
                    output: c.Val('ok')
                });
                let fn = type((age, nick) => 'ok');
                assert(fn(12, 'Lucy'));
                assert.throwError(fn, ['Lucy', 'Lucy'], 'The 0th parameter of the function  is not a Num');
                let fn1 = type((age, nick) => 'ok1');
                assert.throwError(fn1, ['12', 'Lucy'], 'the output of the function  is not eq to ok');
            });
        });
    });

    describe('c.Custom', function(){
        it('Custom1', function (){
            let type = c.Custom(
                () => c.Obj({age: t.Num, nick: t.Str})
            );
            assert.deepEqual(type({age: 13, nick: 'zhangsan'}), {age: 13, nick: 'zhangsan'});
        });
        it('Custom2', function (){
            let attribute = c.Obj({
                age: t.Num,
                nick: t.Str,
                next: c.Optional(t.Num)
            }).show.attribute;
            attribute.next.attribute = attribute;

            let type = c.Custom(
                () => {
                    return c.Obj({
                        age: t.Num,
                        nick: t.Str,
                        next: c.Optional(type)
                    })
                },
                {attribute}
            );
            // console.dir(type.show, {depth: 10});
            assert.deepEqual(
                type({age: 13, nick: 'zhangsan', next: {age: 12, nick: 'lisi'}}),
                {age: 13, nick: 'zhangsan', next: {age: 12, nick: 'lisi'}}
            );
        });
    });

    describe('c.Num', function(){
        it('Num', function (){
            let type = c.Num(1);
            assert.deepEqual(type(1), 1);
            type = c.Num(2);
            assert.deepEqual(type(2), 2);
            assert.throwError(type, ['lucy'], 'is not eq to 2');
        });
    });

    describe('c.Str', function(){
        it('Str', function (){
            let type = c.Str(1);
            assert.deepEqual(type(1), '1');
            type = c.Str('2');
            assert.deepEqual(type('2'), '2');
            assert.throwError(type, ['lucy'], 'is not eq to 2');
        });
    });

    describe('c.OrStr', function(){
        it('OrStr', function (){
            let type = c.OrStr('1', '2');
            assert.deepEqual(type(1), '1');
            assert.deepEqual(type('2'), '2');
            assert.throwError(type, ['lucy'], 'is not eq to 1\nis not eq to 2');
        });
    });

    describe('c.OrNum', function(){
        it('OrNum', function (){
            let type = c.OrNum(1, 2);
            assert.deepEqual(type(1), 1);
            assert.deepEqual(type('2'), 2);
            assert.throwError(type, ['lucy'], 'is not eq to 1\nis not eq to 2');
        });
    });

    describe('c.TagOr', function(){
        it('TagOr with two tag', function (){
            let type = c.TagOr(
                [
                    c.Obj({
                        A: c.Str('a1'),
                        B: c.Str('b1'),
                        value: t.Num
                    }),
                    c.Obj({
                        A: c.Str('a2'),
                        B: c.Str('b2'),
                        value: t.Num
                    })
                ],
                ['A', 'B']
            );
            assert.deepEqual(type({A: 'a1', B: 'b1', value: 1}), {A: 'a1', B: 'b1', value: 1});
            assert.throwError(type, ['lucy'], 'Tag definition<A,B> does not satisfy: a1-b1/a2-b2');
            assert.throwError(type, [{A: 'a1', B: 'b1'}], 'value  is not a Num');
        });
        it('TagOr with one tag', function (){
            let type = c.TagOr(
                [
                    c.Obj({
                        A: c.Str('a1'),
                        value: t.Num
                    }),
                    c.Obj({
                        A: c.Str('a2'),
                        value: t.Num
                    })
                ],
                'A'
            );
            assert.deepEqual(type({A: 'a1', value: 1}), {A: 'a1', value: 1});
            assert.throwError(type, ['lucy'], 'Tag definition<A> does not satisfy: a1/a2');
            assert.throwError(type, [{A: 'a1', B: 'b1'}], 'value  is not a Num');
        });
        it('TagOr spec error', function (){
            assert.throwError(c.TagOr, [[
                c.Obj({
                    A: c.Str('a1'),
                    value: t.Num
                }),
                c.Obj({
                    B: c.Str('a2'),
                    value: t.Num
                })
            ], 'A'], 'these has a type does not satisfy the tag definition:A');
            assert.throwError(c.TagOr, [[
                c.Obj({
                    A: c.Str('a1'),
                    value: t.Num
                }),
                c.Obj({
                    A: c.Str('a2'),
                    value: t.Num
                }),
                c.Obj({
                    A: c.Str('a1'),
                    value: t.Num
                })
            ], 'A'], 'Tag<A> repeat defined: a1');
            assert.throwError(c.TagOr, [[
                c.Obj({
                    A: c.Str('a1'),
                    value: t.Num
                }),
                c.Obj({
                    A: c.Str('a2'),
                    value: t.Num
                }),
                t.Num
            ], 'A'], 'TagOr does not support Num type');
        });
    });
});

describe('getHtml and renderHtml', function(){
    it('getHtml and renderHtml', function (){
        let type = c.DObj('type description')({
            arr: t.Arr,
            darr: t.DArr('dArr'),
            num: t.Num,
            dnum: t.DNum('dNum'),
            or: c.Or(t.Arr, t.Num),
            def: c.Default(t.Num, 11),
            value1: c.Val('a'),
            value5: c.Val(1),
            value2: c.Val({a: 1}),
            value3: c.Val(null),
            value4: c.Val(true),
            map: c.Map(t.Str, t.Num),
            dmap: c.DMap('dMap')(t.Str, t.Num),
            orValType: c.OrValType([1, 2], t.Num),
            aorValType: c.DOrValType('DOrValType')([1, 2], t.Num),
            tObj: t.Obj,
            options: c.Optional(c.Arr(t.Num)),
            doptions: c.DOptional('optional')(c.Arr(t.Num)),
            extend: c.Extend(c.Obj({a: t.Num})),
            cFn: c.DFn('this is a function')({
                input: [t.Num, t.Str],
                output: c.Obj({
                    a: t.Num,
                    b: t.Str
                })
            })
        });
        getHtml(type.show);
        renderHtml(type.show);
        getHtml(type.show, './lib/render/describe-test.html');
    });
});

describe('assert.throwError test', function(){
    it('assert.throwError test', function (){
        assert.throws(() => assert.throwError(a => a));
    });
});
