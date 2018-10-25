import _ from 'lodash';
import {graphql} from 'graphql';
import { introspectionQuery} from 'graphql/utilities';
import fragmentDefine from '../FragmentDefine';
import swaggerGenerate from '../SwaggerGenerate';


class RouteHandleDefine {
    constructor(options) {
        let {schema, routeConfigs} = options;
        this.options_ = options;
        this.schema = schema;
        this.routeConfigs = routeConfigs;
        this.mutation = {};
        this.query = {};

        this.defineMutation = this.defineMutation.bind(this);
        this.defineQuery = this.defineQuery.bind(this);
        return this;
    }

    async init() {
        let schemaJson = await (graphql(this.schema, introspectionQuery));
        let schema =  schemaJson.data.__schema;
        this.fragment_ = await (fragmentDefine(this.schema));
        this.doc = swaggerGenerate({...this.options_, schema, fragment: this.fragment_});

        let mutation = _.find(schema.types, function(type) {
            return type.name === 'Mutation';
        });

        let query = _.find(schema.types, function(type) {
            return type.name === 'Query';
        });

        _.map(mutation.fields, this.defineMutation);
        _.map(query.fields, this.defineQuery);
        return this;
    }

    defineMutation({name, args, type}) {
        let self = this;
        let response = this._formatResponse(type);
        let fragment = this._formatFragment(type);
        this.mutation[name] = function (req, res, fields, formatContext) {
            let {query, params, body} = req;
            let params_ = {...body, ...params, ...query};
            fields = query.fields ? `{${query.fields}}` : fields;
            response = fields || response;
            fragment = fields ? '' : fragment;

            let queryStr =  `mutation ${self._genQuery({name, args, params: params_, response, fragment})}`;

            let context = typeof formatContext === 'function' ? formatContext(req) : req;
            return self._excuteGraphql(queryStr, {}, params_, context)
                .then(result => {
                    return self._formatResult(result);
                }).then((data = {}) => {
                    let resData = {
                        code: 200,
                        message: 'SUCCESS',
                        data
                    };

                    res.set('Content-Type', 'application/json').send(JSON.stringify(resData, null, 2));
                }).catch(err => {
                    let result = {
                        code: 400,
                        message: err.message
                    };

                    if (!/production/.test(process.env.NODE_ENV)) {
                        result.stack = err.stack;
                    }

                    res.status(400).set('Content-Type', 'application/json').send(JSON.stringify(result, null, 2));
                });
        };
    }

    defineQuery({name, args, type}) {
        let self = this;
        let response = this._formatResponse(type);
        let fragment = this._formatFragment(type);
        this.query[name] = function (req, res, fields, formatContext) {
            let {query, params, body} = req;
            let params_ = {...body, ...params, ...query};
            fields = query.fields ? `{${query.fields}}` : fields;
            response = fields || response;
            fragment = fields ? '' : fragment;
            let queryStr =  `query ${self._genQuery({name, args, params: params_, response, fragment})}`;

            let context = typeof formatContext === 'function' ? formatContext(req) : req;
            return self._excuteGraphql(queryStr, {}, params_, context)
                .then(result => {
                    return self._formatResult(result);
                }).then((data = {}) => {
                    let resData = {
                        code: 200,
                        message: 'SUCCESS',
                        data
                    };

                    res.set('Content-Type', 'application/json').send(JSON.stringify(resData, null, 2));
                }).catch(err => {
                    let result = {
                        code: 400,
                        message: err.message
                    };

                    if (!/production/.test(process.env.NODE_ENV)) {
                        result.stack = err.stack;
                    }

                    res.status(400).set('Content-Type', 'application/json').send(JSON.stringify(result, null, 2));
                });
        };
    }

    _excuteGraphql (query, rootValue, params, context) {
        let schema = this.schema;
        return graphql(schema, query, rootValue, context, params, null);
    }

    _formatResult({errors, data}) {
        return new Promise((resolve, reject) => {
            if (errors && errors.length) {
                let error = errors[0];

                if (error instanceof Error) {
                    reject(error);
                    return;
                } else if (error.originalError instanceof Error) {
                    reject(error.originalError);
                    return;
                } else {
                    reject(error);
                }
                
                return;
            }

            let raw_data = JSON.stringify(data.response).replace(/null/gi, '""'); 
            resolve(JSON.parse(raw_data));
        });
    }

    _formatResponse(type) {
        if (type.kind === 'SCALAR') {
            return;
        } 

        if (type.kind === 'OBJECT') {
            return `{
                ...${type.name}
            }`;
        }

        if (type.kind === 'UNION') {
            return `{
                ...${type.name}
            }`;
        }

        if (type.kind === 'LIST' || type.kind === 'NON_NULL') {
            return this._formatResponse(type.ofType);
        }

        return null;
    }

    _formatFragment(type) {
        if (type.kind === 'SCALAR') {
            return;
        } 

        if (type.kind === 'OBJECT' || type.kind === 'UNION') {
            return /*customFragment[type.name] ||*/ this.fragment_[type.name];
        }

        if (type.kind === 'LIST' || type.kind === 'NON_NULL') {
            return this._formatFragment(type.ofType);
        }

        return null;
    }

    _genQuery({name, args, params, response, fragment , response_name = 'response'}) {
        let self = this;
        response = response ?  response : '';

        let _vars = [];
        let _kinds = [];

        _.map(args, function(arg) {
            let {name, type} = arg;
            
            if (params && name in params) {

                if ((type.name === 'Boolean' && type.kind === 'SCALAR') || (type.kind === 'NON_NULL' && type.ofType.name === 'Boolean')) {
                    params[name] = params[name] === false || params[name] === 'false' ||  params[name] === 0 || params[name] === '0' ? false : true;
                }

                if ((type.name === 'Int' && type.kind === 'SCALAR')) {
                    params[name] = parseInt(params[name]);
                }

                _vars.push(`${name}: $${name}`);
                _kinds.push(`$${name}: ${self._genType(type)}`);


            }
        });

        let stringVars = _vars.length ? `(${_vars.join(', ')})` : '';
        let stringKinds = _kinds.length ? `(${_kinds.join(', ')})` : '';
        fragment = fragment || '';
        const query = `
            ${stringKinds}{${response_name}: ${name}${stringVars}${response}}
            ${fragment}
        `;

        return query;
    }

    _genType(type) {
        switch (type.kind) {
        case 'INPUT_OBJECT':
        case 'ENUM':
        case 'SCALAR':
            return type.name;
        case 'LIST':
            return '[%!]'.replace('%', this._genType(type.ofType));
        case 'NON_NULL':
            return '%!'.replace('%',  this._genType(type.ofType));
        }
    }
}

export default function(options) {
    return new RouteHandleDefine(options).init();
};