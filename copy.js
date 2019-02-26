
function deepCopy(data) {
    // 1.先进行数据的类型判断
    let typeKey = typeCheck(data);    
    // 2.只有两种情况。 1种是这个数据是值类型，另一种是object.
    let res_data = "",list = [],obj = {};    
    if (typeof data === 'object') { // 会有一个null的问题。  
        if (typeKey === 'object') {
            // 对像
            for(let o in data) {
                obj[o] = deepCopy(data[o])
            }
            return obj;
        } else if (typeKey === 'array') {
            // list;
            data.forEach(item => {
                list.push(deepCopy(item));
            });
            return list;        
        } else {
            // 其它对象类型。eg: function, date, reg 是对象也是以值类型存在。
            return data
        }
    } else {
        // 基础值类型--在这一个基础值类型中只会执行一次。
        return data;
    }
}

function typeCheck(data) {
    let typeObj = {
        "[object String]": 'string',
        "[object Number]": 'number',
        "[object Boolean]": 'boolean',
        "[object Object]": 'object',
        "[object Null]": 'null',
        "[object Undefined]": 'undefined',
        "[object Symbol]": 'symbol',
        // 上面的是7种基本类型。下面的是自带原生类型情况。
        "[object Function]": 'function',   // object
        "[object Date]": 'date',           // object  -- new Date() 出来的值。
        "[object Array]": 'array',         // object
        "[object RegExp]": 'regexp',       // object  正则的简写也同样是object,有test,match这个方法。      
    };
    // 得到一个数据最原始的类型，直接去调用Object.prototype.toString()的方法。
    let strKey = Object.prototype.toString.call(data);  // 直接调用call方法，call为传单个参数的值，apply传入list;
    return typeObj[strKey];
}


let xyz = {
    a: 'asdf',
    b: null,
    c: true,
    d: 54,
    e: {
        asdf: 'asdfasdf',        
    },
    f: function () {
        return 'ffffffff';
    },
    g: [
        {
            key1: 'asdfasdf',
            key2: '44',
            key3: [],
            key4: {}
        }
    ],
    j: new Date()
}

let newData = deepCopy(xyz);
newData.a = 2125412121241;
console.log(`newData`, newData);
console.log(`xyz`, xyz);