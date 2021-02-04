declare namespace jsChecker {
  namespace t {
    function Null(...param:any[]);
    function Any (...param:any[]);
    function Num (...param:any[]);
    function Str (...param:any[]);
    function Fn (...param:any[]);
    function Json (...param:any[]);
    function Obj (...param:any[]);
    function Arr (...param:any[]);
    function Bool (...param:any[]);
    function Date (...param:any[]);
    function Time (...param:any[]);
    function DNull (...param:any[]);
    function DAny (...param:any[]);
    function DNum (...param:any[]);
    function DStr (...param:any[]);
    function DFn (...param:any[]);
    function DJson (...param:any[]);
    function DObj (...param:any[]);
    function DArr (...param:any[]);
    function DBool (...param:any[]);
    function DDate (...param:any[]);
  }

  namespace c {
    function Val (...param:any[]);
    function Or (...param:any[]);
    function TagOr (...param:any[]);
    function Optional (...param:any[]);
    function Default (...param:any[]);
    function Arr (...param:any[]);
    function Obj (...param:any[]);
    function OrVal (...param:any[]);
    function OrValType (...param:any[]);
    function ValType (...param:any[]);
    function Str (...param:any[]);
    function Num (...param:any[]);
    function OrStr (...param:any[]);
    function OrNum (...param:any[]);
    function ValSet (...param:any[]);
    function ValConvert (...param:any[]);
    function ObjConvert (...param:any[]);
    function Map (...param:any[]);
    function Custom (...param:any[]);
    function Fn (...param:any[]);
    function Extend (...param:any[]);
    function DVal (...param:any[]);
    function DOr (...param:any[]);
    function DOptional (...param:any[]);
    function DDefault (...param:any[]);
    function DArr (...param:any[]);
    function DObj (...param:any[]);
    function DOrVal (...param:any[]);
    function DMap (...param:any[]);
    function DExtend (...param:any[]);
  }
}

export = jsChecker;