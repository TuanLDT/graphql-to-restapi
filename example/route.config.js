

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
        wapper: 'test',
        parameters: [
            {
                in: 'header',
                name: 'x-token-key',
                type: 'string',
                required: true
            }
        ],
        tags: ['Viewer'] 
    },{
        method: 'put',
        path: '/profile',
        handle: {
            type: 'mutation',
            name: 'updateProfile'
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
    },

    // Account
    {
        method: 'post',
        path: '/accounts',
        handle: {
            type: 'mutation',
            name: 'createMultiAccount'
        },
        tags: ['Account'] 
    }
];

export default routeConfigs;