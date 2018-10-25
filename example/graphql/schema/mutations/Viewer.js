import {
    GraphQLNonNull,
    GraphQLString,
    GraphQLBoolean
} from 'graphql';

import GraphQLJSON from 'graphql-type-json';

export const login = {
    type: GraphQLJSON,
    description: 'Đăng nhập dựa trên email và password',
    args: {
        email: {
            type: new GraphQLNonNull(GraphQLString)
        },
        password: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    resolve(root, params, {account}) {
        return {
            userid: account,
            token: 't0K3n'
        }
    }
};