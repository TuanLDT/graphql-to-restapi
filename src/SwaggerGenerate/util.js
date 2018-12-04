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
            data.type = 'string';
        }

        if (data.type === 'Float' || data.type === 'Int') {
            data.type = 'integer';
        }

        if (data.type === 'JSON') {
            data.type = 'object';
        }

        if (data.type === 'ObjectID') {
            data.type = 'string';
        }

        data.type = data.type.toLowerCase();
    }

    if (kind === 'LIST') {
        data.type = 'array';
        data.items = formatType(ofType);
        return data;
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

        let typeFormat = formatType(type);
        properties = properties.set(name, new Map({}));
        properties = properties.setIn([name, 'type'], typeFormat.type);
        properties = properties.setIn([name, 'description'], description);

        if (typeFormat.items) {
            properties = properties.setIn([name, 'items'], typeFormat.items);
        }
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