interface AnyFunction {
  (...params: any) : any;
}

interface T {
   Null: AnyFunction;
   Any: AnyFunction;
   Num: AnyFunction;
   Str: AnyFunction;
   Fn: AnyFunction;
   Json: AnyFunction;
   Obj: AnyFunction;
   Arr: AnyFunction;
   Bool: AnyFunction;
   Date: AnyFunction;
   Time: AnyFunction;
   DNull: AnyFunction;
   DAny: AnyFunction;
   DNum: AnyFunction;
   DStr: AnyFunction;
   DFn: AnyFunction;
   DJson: AnyFunction;
   DObj: AnyFunction;
   DArr: AnyFunction;
   DBool: AnyFunction;
   DDate: AnyFunction;
  [key: string]: AnyFunction;
};

interface C {
   Val: AnyFunction;
   Or: AnyFunction;
   TagOr: AnyFunction;
   Optional: AnyFunction;
   Default: AnyFunction;
   Arr: AnyFunction;
   Obj: AnyFunction;
   OrVal: AnyFunction;
   OrValType: AnyFunction;
   ValType: AnyFunction;
   Str: AnyFunction;
   Num: AnyFunction;
   OrStr: AnyFunction;
   OrNum: AnyFunction;
   ValSet: AnyFunction;
   ValConvert: AnyFunction;
   ObjConvert: AnyFunction;
   Map: AnyFunction;
   Custom: AnyFunction;
   Fn: AnyFunction;
   Extend: AnyFunction;
   DVal: AnyFunction;
   DOr: AnyFunction;
   DOptional: AnyFunction;
   DDefault: AnyFunction;
   DArr: AnyFunction;
   DObj: AnyFunction;
   DOrVal: AnyFunction;
   DMap: AnyFunction;
   DExtend: AnyFunction;
 [key: string]: AnyFunction;
};

declare namespace JsChecker {
  export let t: T = {
   Null: AnyFunction,
   Any: AnyFunction,
   Num: AnyFunction,
   Str: AnyFunction,
   Fn: AnyFunction,
   Json: AnyFunction,
   Obj: AnyFunction,
   Arr: AnyFunction,
   Bool: AnyFunction,
   Date: AnyFunction,
   Time: AnyFunction,
   DNull: AnyFunction,
   DAny: AnyFunction,
   DNum: AnyFunction,
   DStr: AnyFunction,
   DFn: AnyFunction,
   DJson: AnyFunction,
   DObj: AnyFunction,
   DArr: AnyFunction,
   DBool: AnyFunction,
   DDate: AnyFunction
 };

 export let c: C = {
   Val: AnyFunction,
   Or: AnyFunction,
   TagOr: AnyFunction,
   Optional: AnyFunction,
   Default: AnyFunction,
   Arr: AnyFunction,
   Obj: AnyFunction,
   OrVal: AnyFunction,
   OrValType: AnyFunction,
   ValType: AnyFunction,
   Str: AnyFunction,
   Num: AnyFunction,
   OrStr: AnyFunction,
   OrNum: AnyFunction,
   ValSet: AnyFunction,
   ValConvert: AnyFunction,
   ObjConvert: AnyFunction,
   Map: AnyFunction,
   Custom: AnyFunction,
   Fn: AnyFunction,
   Extend: AnyFunction,
   DVal: AnyFunction,
   DOr: AnyFunction,
   DOptional: AnyFunction,
   DDefault: AnyFunction,
   DArr: AnyFunction,
   DObj: AnyFunction,
   DOrVal: AnyFunction,
   DMap: AnyFunction,
   DExtend: AnyFunction,
 }
}

export = JsChecker;