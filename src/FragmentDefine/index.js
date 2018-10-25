import {graphql} from 'graphql';
import { introspectionQuery} from 'graphql/utilities';
import Fragment from './Fragment';

class FragmentDefine {
    constructor(schema) {
        this.schema = schema;
        return this;
    }

    async init() {
        let schemaJson = await (graphql(this.schema, introspectionQuery));
        let schema = schemaJson.data.__schema;
        const types = schema.types.filter(({ kind, name }) => {
            // Lọc các kind là OBJECT (các type định nghĩa để trả data về cho client là object)
            return (kind === 'OBJECT' || kind === 'UNION') && !name.startsWith('__') && name !== schema.queryType.name && name !== schema.mutationType.name; 
        });

        let typesByName = {};
        types.forEach(type => {
            typesByName[type['name']] = type;
        });

        this.typesByName = typesByName;
        this.types = types;

        return this.define();
    }

    define() {
        let {types, typesByName} = this;
        let definitions = {};
        types.map(type => {
            const { name} = type;
            return definitions[name] = new Fragment(type, typesByName).valueInfragment();
        });

        return definitions;
    }
}

export default function(schema) {
    return new FragmentDefine(schema).init();
};