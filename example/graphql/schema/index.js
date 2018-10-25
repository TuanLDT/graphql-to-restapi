import {
    GraphQLObjectType,
    GraphQLSchema
} from 'graphql';

import Mutations from './mutations';
import Queries from './queries';

let RootQuery = new GraphQLObjectType({
    name: 'Query',      //Return this type of object
    fields: Queries
});

let RootMutation = new GraphQLObjectType({
    name: 'Mutation',      //Return this type of object
    fields: Mutations
});

let schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});

export default schema;