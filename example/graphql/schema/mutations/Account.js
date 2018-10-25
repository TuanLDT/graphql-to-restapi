import {
    GraphQLNonNull,
    GraphQLString,
    GraphQLBoolean
} from 'graphql';

import { AccountType } from '../../types';

import {
    GraphQLEmail
} from 'graphql-custom-types';


export const createAccount = {
    type: AccountType,
    description: 'Tạo tài khoản',
    args: {
        email: {
            type: new GraphQLNonNull(GraphQLString)
        },
        password: {
            type: new GraphQLNonNull(GraphQLString)
        },
        fullname: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    resolve(root, params) {
        return params;
    }
};

export const resetPassword = {
    type: GraphQLBoolean,
    description: 'Reset Password',
    args: {
        email: {
            type: new GraphQLNonNull(GraphQLEmail)
        }
    },
    resolve(root, params, {req}) {
        return true
    }
};