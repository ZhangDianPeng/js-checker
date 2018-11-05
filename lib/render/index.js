/**
 * Created by zhangdianpeng on 2018/11/5.
 */

let ejs = require('ejs');
let fs = require('fs');
let path = require('path');

function innerHTML(s) {
    let start = s.indexOf('>');
    let end = s.lastIndexOf('<');
    return s.substring(start+1, end);
}

function FoldedMark(message) {
    return `<span class="foldedMark">${message}</span>`;
}

function Mark(mark) {
    return `<span class="mark">${mark}</span>`;
}


let FOLDID = 0;

let createTree = function (name, data) {
    let { name: type, attribute = [], description = '' } = data;
    let res;
    // logContext 过滤不显示
    if (name == 'logContext') {
        return {};
    }
    if (['Obj', 'Or', 'Default', 'Value', 'Optional', 'Arr', 'OrVal', 'Map', 'Extend', 'OrValType'].includes(type)) {
        let keys, defaultVal, valType, valAttribute;
        switch(type) {
            case 'Obj':
                keys = Object.keys(attribute);
                res = keys.reduce((res, key) => {
                    return res.concat([createTree(key, attribute[key])]);
                }, []);
                if (res.length == 0) {
                    return { name, type, attribute: [] };
                }
                return { name, type, description,
                    attribute: res
                };
            case 'Default':
                [valType, defaultVal] = attribute;
                attribute = createTree('', valType);
                return { name, type, description,
                    attribute: [attribute, defaultVal]
                };
            case 'Value':
                type = '';
                switch (Object.prototype.toString.call(attribute)) {
                    case '[object Number]':
                        type = 'Num';
                        break;
                    case '[object String]':
                        type = 'Str';
                        break;
                    case '[object Boolean]':
                        type = 'Bool';
                        break;
                    case '[object Null]':
                        type = 'Null';
                        break;
                }
                return {
                    name,
                    type,
                    attribute
                };
            case 'Map':
                attribute = [{
                    key: createTree('', attribute[0]),
                    value: createTree('', attribute[1])
                }];
                return {
                    name,
                    type,
                    description,
                    attribute
                };
            case 'Extend':
            case 'Or':
            case 'OrVal':
            case 'Arr':
            case 'Optional':
                attribute = attribute.reduce((res, attr) => {
                    let tree = createTree(void 0, attr);
                    return res.concat([tree]);
                }, []);
                return {
                    name, type, description,
                    attribute
                };
            case 'OrValType':
                valType = attribute.type;
                valAttribute = attribute.values;
                attribute = valAttribute.reduce((res, attr) => {
                    return res.concat([{
                        type: valType.name,
                        description: valType.description,
                        attribute: [attr]
                    }]);
                }, []);
                return {
                    name, type, description,
                    attribute
                };
        }
    } else {
        return { name, type, attribute, description };
    }
};

let getRenderData = function (type, name, description, attribute, isRoot = true) {
    let template, hasComplex, attributeTemplate;
    if (isRoot) FOLDID = 0;
    let complexTypes = ['Obj', 'Extend', 'Or', 'OrVal', 'OrValType', 'Map'];
    switch (type) {
        case 'Obj':
        case 'Extend':
            template = `
                <div class="obj ${ isRoot ? 'unfold':'fold' }" fold-id=${FOLDID++}>
                    ${ name ? `<span class="field-name">${name}:</span>`: '' }
                    ${ type == 'Extend' ? `${ type ? `<span class="C-type">${type}</span>`:'' }`: `<span style="display: none;">${type}</span>` }
                    ${ description ? `<span class="description">${description}</span>`: '' }
                    ${Mark`{`}
                    ${ attribute.length > 0 ? `
                    <div class="attribute">
                        ${attribute.map(a => getRenderData(a.type, a.name, a.description, a.attribute, false) ).join('\n')}
                    </div>
                    ` : '' }
                    ${Mark`}`}
                    ${FoldedMark`{ ... }`}
                </div>
            `;
            return template;
        case 'Map':
            if (attribute.length > 0) attribute = attribute[0];
            let mapAttributeTemplate = '';
            let mapKey = attribute.key;
            let mapValue = attribute.value;
            if (attribute) {
                let keyTemp = render(mapKey.type, mapKey.name, mapKey.description, mapKey.attribute, false);
                let valueTemp = render(mapValue.type, mapValue.name, mapValue.description, mapValue.attribute, false);
                keyHasComplex = complexTypes.includes(mapKey.type) || complexTypes.some(type => (keyTemp.indexOf(type) > -1));
                valueHasComplex = complexTypes.includes(mapValue.type) || complexTypes.some(type => (valueTemp.indexOf(type) > -1));
                mapAttributeTemplate = `
                    <div class="attribute">
                        <div class="basic ${keyHasComplex ? 'fold':''}" fold-id=${FOLDID++}>
                            key: ${innerHTML(keyTemp)}
                        </div>
                        <div class="basic ${valueHasComplex ? 'fold':''}" fold-id=${FOLDID++}>
                            value: ${innerHTML(valueTemp)}
                        </div>
                    </div>
                `;
            } else {
                mapAttributeTemplate = '';
            }

            template = `
                <div class="map fold" fold-id=${FOLDID++}>
                    ${ name ? `<span class="field-name">${name}:</span>`:'' }
                    <span class="C-type">${type}</span>
                    ${ description ? `<span class="description">${description}</span>`:'' }
                    ${Mark`{`}
                    ${ mapAttributeTemplate }
                    ${Mark`}`}
                    ${FoldedMark`{ ... }`}
                </div>
            `;
            return template;
        case 'Default':
            attributeTemplate = '';
            if (attribute[0]) {
                attributeTemplate = innerHTML(getRenderData(attribute[0].type, attribute[0].name, attribute[0].description, attribute[0].attribute, false));
            } else {
                attributeTemplate = '';
            }
            hasComplex = complexTypes.some(type => (attributeTemplate.indexOf(type) > -1));
            template = `
                <div class="default ${hasComplex ? 'fold':''}" fold-id=${FOLDID++}>
                    ${ name ? `<span class="field-name">${name}</span>` : '' }
                    默认值: ${attribute[1]}
                    ${ attributeTemplate }
                    ${ description ? `<span class="description">${description}</span>`:'' }
                </div>
            `;
            return template;
        case 'Or':
        case 'OrVal':
        case 'OrValType':
            if (type == 'OrValType') type = 'OrVal';
            template = `
                <div class="or ${isRoot ? 'unfold': 'fold'}" fold-id=${FOLDID++}>
                    ${ name ? `<span class="field-name">${name}:</span>` : '' }
                    <span class="C-type">${type}</span>
                    ${ description ? `<span class="description">${description}</span>`:'' }
                    ${Mark`[`}
                    ${ attribute ? `
                    <div class="attribute">
                    ${ attribute.map((a, idx) => {
                    hasComplex = complexTypes.includes(a.type);
                    return `
                            <div class="basic ${hasComplex ? 'fold':''}" fold-id=${FOLDID++}>
                                ${idx}: ${ innerHTML(render(a.type, a.name, a.description, a.attribute, false)) }
                            </div>
                        `;
                }).join('\n') }
                    </div>
                    `: `${attribute}` }
                    ${Mark`]`}
                    ${FoldedMark`[ ... ]`}
                </div>
            `;
            return template;
        case 'Arr':
        case 'Optional':
            attributeTemplate = attribute.map(a => {
                return innerHTML(getRenderData(a.type, '', a.description, a.attribute, false));
            }).join('\n');
            hasComplex = complexTypes.some(type => (attributeTemplate.indexOf(type) > -1));
            template = `
                <div class="optional ${hasComplex ? 'fold':''}" fold-id=${FOLDID++}>
                    ${ name ? `<span class="field-name">${name}:</span>`: '' }
                    <span class="C-type">${type}</span>
                    ${ description ? `<span class="description">${description}</span>` : '' }
                    ${attributeTemplate}
                </div>
            `;
            return template;
        case 'Null':
        case 'Any':
        case 'Bool':
        case 'Num':
        case 'Str':
        case 'Date':
        case 'TObj':
        case 'TArr':
            if (typeof attribute != 'undefined') {
                if (type == 'Str') {
                    Array.isArray(attribute) && (attribute = attribute.join());
                    attribute = attribute ? `<span>"${attribute}"</span>` : '';
                } else if (type == 'TObj') {
                    attribute = `<span>{ }</span>`;
                } else if (type == 'TArr'){
                    attribute = `<span>[ ]</span>`;
                } else {
                    attribute = `<span>${attribute}</span>`;
                }
            } else {
                attribute = '';
            }
            template = `
                <div class="basic">
                    ${ name ? `<span class="field-name">${name}:</span>`:'' }
                    <span class="T-type">${type}</span>
                    ${ description ? `<span class="description">${description}</span>` : ''}
                    ${ attribute }
                </div>
            `;
            return template;
    }
};

let renderHtml = function (showData, title = 'test') {
    let { type, attribute, description } = createTree(title, showData);
    let renderData = getRenderData(type, title, description, attribute);
    return ejs.render(fs.readFileSync(path.join(__dirname, './type.ejs')).toString(), {renderData, title: 'test'});
};


let getHtml = (showData, htmlPath = path.resolve(__dirname, './test.html')) => {
    let renderStr = renderHtml(showData);
    fs.writeFileSync(htmlPath, renderStr);
};

module.exports = {
    createTree,
    getHtml,
    renderHtml
};