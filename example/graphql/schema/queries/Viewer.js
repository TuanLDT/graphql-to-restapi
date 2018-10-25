import {
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLFloat
} from 'graphql';

export const profile = {
    type: GraphQLBoolean,
    description: 'Viewer Profile',
    args: {
       
    },
    resolve(root, params) {
        return true
    }
};