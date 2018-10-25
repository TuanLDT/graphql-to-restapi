import FieldType from './FieldType';
import ObjectType from './ObjectType';
import {html} from 'common-tags';

class Fragment {
    constructor(fragment, typesByName) {
        this.fragment = fragment;
        this.typesByName = typesByName;

        return this;
    }

    valueInfragment() {
        let {fragment, typesByName} = this;
        let {name, fields, possibleTypes} = fragment;

        let str_fields;
        if (possibleTypes) {
            str_fields =  possibleTypes.map(field=> {
                return html`
                ... on ${field.name} {
                    ${new ObjectType(typesByName[field.name], typesByName).valueInfragment()}
                }`;
            });
        } else {
            str_fields = fields.map(field => {
                return new FieldType(field, typesByName).valueInfragment();
            }).filter(field => field != null);
        }

        return html`
        fragment ${name} on ${name} {
            ${str_fields.join(',\n')}
        }`;
    }
}

export default Fragment;