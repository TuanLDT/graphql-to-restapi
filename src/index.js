import express from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import routeHandleDefine from './RouteHandleDefine';
import expressGraphql from './graphql';

export default function(options) {
	if (!options) {
	    throw new Error('GraphQL RestAPI middleware requires options.');
	}

	const router = express.Router();
	let {schema, routeConfigs, graphql, swagger, formatContext} = options;

	router.use(bodyParser.urlencoded({
	    extended: true
	}));
	router.use(bodyParser.json());


	routeHandleDefine(options).then(query => {
		while (routeConfigs.length) {
		    let routeConfig = routeConfigs.shift();
		    let {method, path, handle, fields} = routeConfig;
		    let {type, name} = handle;
		    router[method](path, function(req, res) {
		        query[type][name](req, res, fields, formatContext);
		    });
		}

		if (graphql) {
			router.use('/graphql', expressGraphql(schema));
		}

		if (swagger) {
			router.use('/doc', swaggerUi.serveFiles(query.doc), swaggerUi.setup(query.doc));
		}


		return router;
	});

	return router;
}
