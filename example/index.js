import express from 'express';
import GraphqlRest from '../src';
import schema from './graphql/schema';
import routeConfigs from './route.config';
const app = express();

app.use('/api', GraphqlRest({
	schema, 
	routeConfigs, 
	swagger: {
		basePath: '/api'
	}, 
	graphql: true,
	formatContext: function(req) {
		return {
			account: 3
		}
	}
}));

let port = process.env.PORT || 8080;
app.listen(port);
console.log(`example is running in port ${port}`);