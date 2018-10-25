import {Map, fromJS} from 'immutable';

const formatParam = (queryType,param)=> {
    let {name, description, type} = param;

    let type_ = formatType(type);
    return {
        in: queryType === 'mutation' ? 'body' : 'query',
        name,
        description,
        ...type_
    };
};

const formatType = (type) =>{
    let {kind, name, ofType} = type;

    let data = {};
    if (kind === 'NON_NULL') {
        data.required = true;
    }

    if (kind === 'SCALAR') {
        data.type = name;

        if (data.type === 'Email') {
            data.type = 'String';
        }

        if (data.type === 'Float' || data.type === 'Int') {
            data.type = 'integer';
        }

        if (data.type === 'JSON') {
            data.type = 'object';
        }

        data.type = data.type.toLowerCase();
    }

    if (ofType) {
        let data_ = formatType(ofType);
        data = {
            ...data,
            ...data_
        };
    }

    return data;
};

const formatProperties = (args) => {
    let properties = fromJS({});
    args.map(function (param) {
        let {name, description, type} = param;

        properties = properties.set(name, new Map({}));
        properties = properties.setIn([name, 'type'], formatType(type).type);
        properties = properties.setIn([name, 'description'], description);
    });

    return properties;
};

const urlParser = (path) => {
    var regex = /\/:(\w*)/g,
        url = path,
        match = regex.exec(url);
    let params =[];
    while(match) {
        params.push(match[1]);
        match = regex.exec(url);
    }

    return {params};
};

export {
    formatParam,
    formatProperties,
    urlParser
};