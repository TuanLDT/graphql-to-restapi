

## Thiết lập npm scope để cài module
```bash
$ npm config set '//npmjs.vietid.net/:_authToken=VC2MSWAd9OoPbtYlZrGWBGyELENW9x51TzitoyBnrS8='
$ npm config set @lib:registry https://npmjs.vietid.net/
```

## Cài module:
```bash
$ npm install --save @lib/graphql-to-restapi
```

## Sử dụng

Chỉ cần sử dụng `graphql-to-restapi` như một route handle

```js
import GraphqlRest from '@lib/graphql-to-restapi';
import express from 'express';
const app = express();

app.use('/api', GraphqlRest({
	schema: GraphQLSchema, 
	routeConfigs: routeConfigs
}));

app.listen(4000);
```

## Options

`graphql-to-restapi` chấp nhận các options dưới đây:

* **`schema(*)`**: Là `GraphQLSchema` instance từ [`GraphQL.js`][].
* **`routeConfigs(*)`**: Là config rest api và graphql resolve tương ứng

```js

let routeConfigs = [
    // Viewer
    {
        method: 'post',
        path: '/login',
        handle: {
            type: 'mutation',
            name: 'login'
        },
        tags: ['Viewer'] 
    },{
        method: 'get',
        path: '/profile',
        handle: {
            type: 'query',
            name: 'profile'
        },
        parameters: [
            {
                in: 'header',
                name: 'x-token-key',
                type: 'string',
                required: true
            }
        ],
        tags: ['Viewer'] 
    }

    /*************************************/
    // ACCOUNT
    {
        method: 'post',
        path: '/account',
        handle: {
            type: 'mutation',
            name: 'createAccount'
        },
        tags: ['Account'] 
    },{
        method: 'get',
        path: '/account',
        handle: {
            type: 'query',
            name: 'accounts'
        },
        tags: ['Account'] 
    }
];

```

* **`swagger`**: Nếu có sẽ gen ra link doc swagger.
```js
swagger = {
    basePath: basePath //base path của api
}

```

* **`graphql`**: Nếu có giá trị `true` thì sẽ gen ra link doc graphql như graphqli của `express-graphql`.
* **`formatContext`**: Là function để format `context` cho `graphql()`. Nếu `formatContext` không có thì `request` sẽ được gán vào context.