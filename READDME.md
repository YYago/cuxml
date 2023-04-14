# cuxml

CU: `'Can Use'` or `'customUI'`, whatever……

## What is it?

1. 可以将 costomUI XML 设置的回调函数转成 JavaScript 函数，以便于在 WPS Office JS插件中使用，当然只是些简单的模版，复杂的还是需要自己写。
    > Can convert the callback functions of costomUI XML settings to JavaScript functions, so that they can be used in WPS Office JS plug-ins. Of course, it is just some simple templates, and complex ones need to be written by yourself.

3. 根据 CustomUI Ribbon 元素的布局规则和标准，帮助你快速粗略地检查 XML 文件是否符合规范。[simple types](https://learn.microsoft.com/en-us/openspecs/office_standards/ms-customui/869c8c9a-45f8-4119-b068-f61e76d04322)
    > According to the layout rules and standards of CustomUI Ribbon elements, help you quickly and roughly check whether the XML file conforms to the specification.

>Only the namespace of Simple types  in the http://schemas.microsoft.com/office/2006/01/customui  are supported. It's may be support for customUI 2007/2010…… also.

## 示例 Example

XML file:

```xml
 <group id="test1" label="test1" getVisible="onthing"></group>
```

输出到 JS 文件：

> Out callback function to JS file:

```bash
cuxml callback test.xml test.js -w
```

不出意外的话，你会得到这样的结果：
> normally, you will get the result:

```js
/**
* @param {RibbonUI} ctrl 你不需要关心这个参数，它代表一个菜单控件元素对象。比如 button、group 等。
* @note 
*  - 这是控件的回调函数，你不应该调用这个函数。
*  - 通用模版而已，你可以根据需要自行修改。
*  - 这里的回调函数都是异步的，你不应该在这里写长耗时同步的代码，否则可能会导致 UI 卡死。(AI 说的)
*  
*  Time: Fri Apr 14 2023 01:43:09 GMT+0800 (China Standard Time)
*/
function onthing(ctrl){

    // 以下代码只是通用模版，你可以根据需要自行修改
    // 通过 ctrl.Id 来判断当前元素
    // use ctrl.Id to judge the current element

    switch(ctrl.Id){
        // xmlPath: customUI[0]>ribbon[0]>tabs[0]>tab[0]>group[2]
        case "test1":
            break;
        default:
            break;
    };

    // 避免 UI 报错，总是返回 true
    // Need return true

    return true;
}

```

# Command

1. Run in Your WPS Office JS Plugin Project directory.

    ```bash
    npx cuxml # if support npx
    ```
    or
    ```bash
    cuxml # if install cuxml global
    ```
    or
    ```bash
    node ./node_modules/cuxml/index.js # last choice……
    ``` 
> 更多命令行参数请查看 --help 选项.
> More command line parameters, please check the --help option.

## 注意

**输出结果到文件时，保险起见，最好输出到临时文件，避免覆盖你已经写好的文件。**

## Issues

UBW， 😄

1. [cuxml issues]()

## Bug

1. 可预见的： 如果 XML 中的回调函数名称带有" `.` "连接符，生成的 JS 代码会有语法错误。
    > Predictable: If the callback function name in XML contains a "`.`" connection symbol, the generated JS code will have a syntax error.
    
    这种情况，cuxml 可能不适合用来批量生成 JS 回调函数。
    > In this case, cuxml may not be suitable for generating JS callback functions in batches.

    example:
    ```xml
    <group id="test1" label="test1" getVisible="on.thing"></group>
    ```
    > output:
    ```js
    function on.thing(ctrl){
        // ...
    }
    ```

    是的， 我们能解决这个问题，但是，JS 函数的调用和声明方式是多变的，比如：

    ```xml
    <group id="test1" label="test1" getVisible="onthing"></group>
    ```

    ```js
    // cuxml 能将其转换为 function nothing(ctrl){};
    // 实际上也许你偏向于这种写法： let nothing = function(ctrl){};
    // 又或者它实际可能是：sync function nothing(ctrl){};
    ```
    
    类似以下的写法，cuxml 可能无法准确的转换

    ```xml
    <group id="test1" getVisible="myRibbon.nothing"></group>
    <group id="test1" getVisible="a.b.c.nothing"></group>
    <group id="test1" getVisible="new nothing"></group>
    ```

    ```js
    myRibbon.nothing(ctrl); // myRibbon={nothing:function(ctrl){}};
    a.b.c.nothing(ctrl); // a.b.c={nothing:function(ctrl){}};
    new nothing(ctrl); // class nothing{constructor(ctrl){}};
    ```

    所以……如果你需要将 XML 中的诸如以上的回调函数转换为 JS 函数，也许你得自己写一些代码了。