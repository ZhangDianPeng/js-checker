## type-checker

- type-checker is a javascript type checker.
- It can automatically generate interface documentation.


### Installation

```
npm install type-checker
```

### Example

```javascript
let {c, t, renderHtml, getHtml} = require('type-checker');

let personType = c.Obj({
    age: t.Num,
    nick: t.Num,
    favourites: c.Arr(t.Str),
    details: c.Optional(t.Any)
});

//generate interface documentation
getHtml(personType.show, './test.html');


//return {age: 16, nick: 'zhangsan', favourites: ['game', 'running']}.
personType({
    age: 16,
    nick: 'zhangsan',
    favourites: ['game', 'running']
});

//return a Error, because favourites is not an Array.
personType({
    age: 16,
    nick: 'zhangsan',
    favourites: 'game'
});

//return a Error, because favourites is not in the object.
personType({
    age: 16,
    nick: 'zhangsan',
    details: 'anything'
});


```

### API


```javascript
let {c, t, renderHtml, getHtml} = require('type-checker');
```


#### t

t defined some basic data types, each data type is a function to check and convert the input data. If the input data meets the defined data type, it will return a converted data, else it will throw a Error with description message.

- **t.Null:** the input data is null or undefined

- **t.Any:**   the input data is not null and not undefined
- **t.Num:**  the input data is a Number or can be converted to a Number
- **t.Str:**   the input data is a String or can be converted to a String
- **t.Fn:**    the input data is a function
- **t.Json:**  the input data is an Array or an Object
- **t.Arr:**   the input data is an Array
- **t.Obj:**   the input data is an Object
- **t.Bool:**  the input data is true/false/"true"/"false"
- **t.Date:**  the input data can be converted to a Date by using new Date()

#### c

c defined some combined data type generators，it can generate a new type like "t" from the basic data types and combined data types.

- **c.Val(value):**  the input data must be equal to the given value.

```javascript
let type = c.Val('hello world');
// return 'hello world';
type('hello world');

// return an Error("helloworld is not eq to hello world")
type('helloworld')
```


- **c.OrVal(valueArr):** the input data must be one of the given values in valueArr.


```javascript

let type = c.OrVal('hello world', 'helloworld');
// return 'hello world';
type('hello world');

// return helloworld
type('helloworld')

// return an Error("hello-world is not eq to hello world and hello-world is not eq to helloworld")
type('hello-world')
```

- **c.Obj({key1: type1, key2: type2...}}):** the input data must be a Object and the value of each key must meet the type.


```javascript

let type = c.Obj({
    age: t.Num,
    nick: t.Str
});

// return {age: 13, nick: "Lucy"};
type({age: 13, nick: 'Lucy'});

// return {age: 13, nick: "Lucy"}, home is ignored;
type({age: "13", nick: 'Lucy', home: 'hangzhou'});

// return an Error(age is not a Number)
type({age: "Lucy", nick: 'Lucy'});

// return an Error(age is undefined)
type({nick: 'Lucy'});

```

- **c.Arr(type):** the input data must be an Array and every value of the Array must meet the type.

```javascript

let type = c.Arr(c.Obj({
    age: t.Num,
    nick: t.Str
}));

// return [{age: 13, nick: 'Lucy'}, {age: 14, nick: 'Linlin'}]
type([{age: 13, nick: 'Lucy'}, {age: 14, nick: 'Linlin'}]);

// return an Error(1 -> age -> is not a Number)
type([{age: 13, nick: 'Lucy'}, {age: "13x", nick: 'Linlin'}]);

```

- **c.Or(type1, type2...):** the input data must meet one of the types(type1, type2...)


```javascript
let type = c.Or(
    t.Num, 
    c.Obj({age: t.Num})
)

// return 13
type(13);

// return {age: 13}
type({age: 13})

// return an Error(is not a Number and is not an Object)
type('hello')
```

- **c.Optional(type):** the input data is Optional, generally used in c.Obj


```javascript

let type = c.Obj({
    age: t.Num,
    nick: c.Optional(t.Str)
});

// it will return {age: 13}
type({age: 13})

```

- **c.Default(type, defaultValue):** if the input data is undefined, it will give a defaultValue, generally used in c.Obj


```javascript
let type = c.Obj({
    age: t.Num,
    nick: c.Default(t.Str, 'zhangsan')
});

// it will return {age: 13, nick: 'zhangsan'}
type({age: 13})

// it will return {age: 13, nick: 'lisi'}
type({age: 13, nick: 'lisi'})

```

- **c.Map(keyType, valueType):** if the input data is a Object, the key of the Object must meet the keyType and the value of the Object must meet the valueType.

```javascript
let type = c.Map(t.Str, t.Obj);

// return an Error("the value of a is not a Object")
type({'a': 1, 'b': {'c': 2})
```

- **c.Extend(type1, type2...):** the type1, type2... must return a Object, it will return a new c.Obj like Object.assign(type1, type2...)


```javascript

let type = c.Extend(
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

// return {age: 13, type: 'Student', school: 'hangzhou'}
type({age: 13, type: 'Student', school: 'hangzhou'});

// return {age: 13, type: 'Student', workplace: 'hospital'}
type({age: 13, type: 'Worker', workplace: 'hospital'});

// return an Error(type is not eq to "Student" and workplace is Null)
type({age: 13, type: 'Worker', school: 'hangzhou'})
```

#### add comment/description for the type

You can add "D" to the beginning of the above defined basic data types and combined data types function name, then you can add the comment for the type definition. The comment can help produce a more detailed documentation description.

- t.DNull, t.DAny, t.DNum, t.DStr, r.DFn, t.DJson, t.DObj, t.DArr, t.DBool, t.DDate
- c.DVal, c.DOr, c.DOptional, c.DDefault, c.DArr, c.DObj, c.DOrVal,  c.DMap, c.DExtend


```javascript
let type = c.DObj('student information')({
    age: c.DDefault('age of the student, default 13')(t.Num, 13),
    nick: t.DStr('nick of the student')
});

```

#### type.show

Each data type defined above will have a "show" attribute, you can get a more detailed description of the data type and use it generate a data type document description.


```javascript
let type = c.DObj('student information')({
    age: c.DDefault('age of the student, default 13')(t.Num, 13),
    nick: t.DStr('nick of the student')
});

console.log(type.show);
```
=>
```json

{
  "name": "Obj",
  "attribute": {
    "age": {
      "name": "Default",
      "attribute": [
        {
          "name": "Num"
        },
        13
      ],
      "description": "age of the student, default 13"
    },
    "nick": {
      "name": "Str",
      "description": "nick of the student"
    }
  },
  "description": "student information"
}

```

#### renderHtml

you can use renderHtml function to get a html string about the detailed description of the type from type.show.


```javascript

renderHtml(type.show);

```


#### getHtml

you can also use getHtml function to get a ".html" file about the detailed description of the type from type.show.

```javascript

let type = c.DObj('测试')({
    id: t.DNum('自增id'),
    name: t.DStr('名称'),
    details: c.DObj('详情')({
        id: t.Str,
        name: t.Num
    })
});
getHtml(type.show, './test.html');

```
=>

![detailed document](https://github.com/ZhangDianPeng/type-checker/blob/master/image/image.png)










