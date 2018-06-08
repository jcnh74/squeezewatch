const fetch = require('node-fetch')
const { 
    GraphQLSchema, 
    GraphQLObjectType, 
    GraphQLint,
    GraphQLString
 } = require('graphql')

// const coins = fetch('https://min-api.cryptocompare.com/data/all/coinlist').then(response => response.json()).then(response => {
//     console.log(response)
// })

const Name = new GraphQLObjectType({
    name: 'Coin',
    description: '...',
    fields: () => ({
        name: {
            type: GraphQLString
        }
    })
})

module.export = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        description: '...',
        fields: () => ({
            coin: {
                name: Name,
                args: {
                    id: { type: GraphQLint }
                },
                resolve: (root, args) => {
                    return 'Thomas Reggi'
                }
            }
        })
    })
})
