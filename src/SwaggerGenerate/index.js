import _ from 'lodash';
import {Map, fromJS} from 'immutable';

import {formatParam, formatProperties, urlParser} from './util';

let defaultRoute = [
    {
        method: 'post',
        path: '/login',
        handle: {
            type: 'mutation',
            name: 'login'
        },
        tags: ['viewer']
        
    }
];

class SwaggerGenerate {
    constructor(options) {
        let {schema, fragment, routeConfigs, swagger} = options;
        this.doc = fromJS({
            swagger: '2.0',
            basePath: swagger.basePath,
            paths: {},
            definitions: {}
        });
        this.schema = schema;
        this.fragment_ = fragment;
        this.mutation = {};
        this.query = {};
        this.routes = routeConfigs;

        this.defineMutation = this.defineMutation.bind(this);
        this.defineQuery = this.defineQuery.bind(this);
        this.defineRoute = this.defineRoute.bind(this);
        return this;
    }

    init() {
        let schema = this.schema;

        let mutation = _.find(schema.types, function(type) {
            return type.name === 'Mutation';
        });

        let query = _.find(schema.types, function(type) {
            return type.name === 'Query';
        });

        _.map(mutation.fields, this.defineMutation);
        _.map(query.fields, this.defineQuery);
        _.map(this.routes, this.defineRoute);

        return this.define();
    }

    defineMutation({name, description,args, type}) {
        this.mutation[name] = {
            summary: description,
            produces: [
                'application/json'
            ],
            parameters: [{
                in: 'body',
                name: 'body',
                required: true,
                schema: {
                    $ref: `#/definitions/${name}Input`
                }
            }],
            responses: {
                type
            }
        };

        let definition = fromJS({
            type: 'object',
            properties: formatProperties(args)
        });

        this.doc = this.doc.setIn(['definitions', `${name}Input`], definition);
    }

    defineQuery({name, description, args, type}) {
        this.query[name] = {
            summary: description,
            produces: [
                'application/json'
            ],
            parameters: args.map(formatParam.bind(null, 'query')),
            responses: {
                type
            }
        };
    }

    defineRoute(route) {
        let {method, path, handle, tags, parameters = []} = route;
        let {type, name} = handle;
        let doc = this[type][name];

        if (!doc) {
            return;
        }
        
        if (!this.doc.getIn(['paths', path])) {
            this.doc = this.doc.setIn(['paths', path], new Map({}));
        }

        let {params} = urlParser(path);


        let parametersInPath = [];
        if (params.length) {
            parametersInPath = params.map(param => {
                path = path.replace(`:${param}`, `{${param}}`);
                return {
                    name: param,
                    in: 'path',
                    type: 'string',
                    required: true
                };
            });
        }

        doc.parameters = [...parametersInPath, ...parameters, ...doc.parameters];
        doc.parameters = _.uniqBy(doc.parameters, 'name');


        this.doc = this.doc.setIn(['paths', path, method], {tags,...doc});
    }

    define() {
        return this.doc.toJS();
    }
}

export default function(options) {
    return new SwaggerGenerate(options).init();
};