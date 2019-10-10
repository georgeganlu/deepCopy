const PENDING = "PENDING";
const FULFLLED = "FULFILLED";
const REJECTED = "REJECTED";
const isFunction = (temp) => typeof temp === "function";
class MyPromise {
    constructor(handle) {
        // 记录带回来的值，记录promise的状态。 还有就是成功注册函数要执行的队列。   -- 知道了源码可以分析出各种情况。promise就是一个例证，vue的源码很重要。
        this.value = null;
        this.status = PENDING;
        this.succList = [];
        this.rejectList = [];
        try {
            handle(this._resolve.bind(this), this._reject.bind(this));
        } catch (err) {
            throw new Error("请传入handle函数");
        }        
    }
    // 两者都是调动触发器
    _resolve(res) {
        // 保持resolve函数执行的时候是异步的 -- 这里是完成后执行的入口。
        const run = () => {
            if (this.status !== PENDING) {
                return;
            }
            this.status = FULFLLED;
            let cb = null;
            while(cb = this.succList.shift()) {
                cb(res);
            }
        };
        setTimeout(run, 0);
    }

    _reject(res) {
        const run = () => {
            if (this.status !== PENDING) {
                return;
            }
            this.status = REJECTED;
            let cb = null;
            while(cb = this.rejectList.shift()) {  // 倒序队列的形式。
                cb(res);
            }
        };
        setTimeout(run, 0);
    }

    then(succ, fail) {
        return new MyPromise((succNext, failNext) => {
            const succRun = (value) => {
                if (!isFunction(succ)) {
                    succNext(value);
                } else {
                    let res = succ(value);
                    if (res instanceof MyPromise) {
                        res.then(succNext, failNext);  // 如果返回的是promise的话，应该是一个新的执行函数。
                    } else {
                        succNext(res);
                    }
                }
            };

            const failRun = (value) => {
                if (!isFunction(fail)) {
                    failNext(value); // 第一个catch没有 or then里面没有对应的注册。 直接响应第二个回调。
                } else {
                    let res = fail(value);
                    if (res instanceof MyPromise) {
                        res.then(succNext, failNext);
                    } else {
                        failNext(res);
                    }
                } 
            };

            if (this.status === PENDING) {
                this.succList.push(succRun);
                this.rejectList.push(failRun);
            } else if (this.status === FULFLLED) {
                succRun(this.value);
            } else if (this.status === REJECTED) {
                failRun(this.value);
            }
        });
    }

    catch(fail) {
        return this.then(undefined, fail);
    }

    finally(fn) {
        return this.then(value => {
            MyPromise.resolve(fn()).then(() => value);
        }, err => {
            MyPromise.reject(fn()).then(() => {
                throw err;
            })
        });
    } 

    static resolve(res) {
        if (res instanceof MyPromise) {
            return res;
        }
        return new MyPromise(resolve => resolve(res));
    }

    static reject(res) {
        return new MyPromise((succ, fail) => fail(res));
    }

    static all(list) {
        // 里面就是一个迭代器 当所有的promise全都响应之后马上就通知到外面。
        let reslist = [];
        let len = list.length;
        return new MyPromise((succ, fail) => {
            for(let [i, v] of list.entries()) {
                v.then(value => {
                    reslist[i] = value;  // 一一对应的关系。
                    if (i === len -1) {
                        succ(reslist);
                    }
                }, err => {
                    fail(err);
                });
            }
        });
    }

    static race(list) {
        return new MyPromise((succ, fail) => {
            for(let [i, v] of list.entries()) {
                v.then(value => {
                    succ(value);
                }, err => {
                    fail(err);
                });
            }
        })
    }
}


let p1 = new MyPromise((succ, fail) => {
    setTimeout(() => {
        // succ("测试的内容");
        fail("测试的内容");
    }, 500);
});

p1.then(res => {
    console.log(res);
});
p1.catch(err => {
    console.log(err);
});