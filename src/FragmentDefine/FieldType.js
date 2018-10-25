import ObjectType from './ObjectType';
import {html} from 'common-tags';

class FieldType {
    constructor({name, description, args, type, isDeprecated, deprecationReason}, typesByName) {
        this.name = name,
        this.description = description;
        this.args = args;
        this.type = type;
        this.isDeprecated = isDeprecated;
        this.deprecationReason = deprecationReason;
        this.typesByName = typesByName;

        return this;
    }

    valueInfragment() {
        let {type} = this;
        if (type.kind === 'SCALAR') {
            return this.parseScalar();
        } 

        if (type.kind === 'OBJECT') {
            return this.parserObjectType();
        }

        if (type.kind === 'UNION') {
            return this.parserUnionType();
        }

        if (type.kind === 'LIST' || type.kind === 'NON_NULL') {
            return this.parserWrapper();
        }

        return null;
    }

    parseScalar() {
        return this.name;
    }

    parserObjectType() {
        let {name, type, typesByName} = this;
 
        return html`
        ${name} {
            ${ new ObjectType(typesByName[type.name], typesByName).valueInfragment()}
        }`;
    }

    parserUnionType() {
        let {name, type, typesByName} = this;
        
        return html`
        ${name} {
            ${ new ObjectType(typesByName[type.name], typesByName).valueInfragment()}
        }`;
    }

    parserWrapper() {
        let {name, type, typesByName} = this;
        return new FieldType({name, type: type.ofType}, typesByName).valueInfragment();
    }
}

export default FieldType;