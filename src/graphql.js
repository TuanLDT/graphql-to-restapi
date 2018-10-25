import express from 'express';
import graphqlHTTP from 'express-graphql';
import path from 'path';
import ejs from 'ejs';
const router = express.Router();

export default function(schema) {
    if (process.env.NODE_ENV !== 'production') {

        router.use('/query', function(req, res) {
            ejs.renderFile(path.join(__dirname, './voyager.ejs'), { endpointUrl: req.originalUrl.replace(/\/query$/, ''), rootType: 'Query'}, {}, function(err, html) {
                res.send(html);  
            });
        });

        router.use('/mutation', function(req, res) {
            ejs.renderFile(path.join(__dirname, './voyager.ejs'), { endpointUrl: req.originalUrl.replace(/\/query$/, ''), rootType: 'Mutation'}, {}, function(err, html) {
                res.send(html);  
            });
        });
        
        router.use('/', graphqlHTTP({
            schema,
            graphiql: true
        }));
    }

    return router;
}

