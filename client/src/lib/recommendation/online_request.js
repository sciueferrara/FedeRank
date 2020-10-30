let request = require('request-promise');
let nj = require('numjs')
let utils = require('./utils');
let ls = require('local-storage')

let Client = require("./Client");
let TripletSampler = require('./TripletSampler')
let ClientModel = require('./ClientModel')

module.exports =
    {
        train_and_recommend: function(id){
                request.post('http://127.0.0.1:5000/login', {
                    // If you need it, you can implement some form of secure login
                    json: {
                        id: id
                    }
                }, async (error, res, body) => {
                    if (error) {
                        console.error(error)
                        return
                    }

                    // Server response contains the parameters for training
                    let req_body = body

                    // Extract parameters
                    let item_vecs = nj.array(req_body.item_vecs)
                    let item_bias = nj.array(req_body.item_bias)
                    let lr = req_body.lr
                    let positive_fraction = req_body.positive_fraction
                    let item_size = req_body.item_size
                    let n_factors = req_body.n_factors

                    // Read user dataset and create the sampler
                    let train_user_list = await utils.read_train_user_list(id)
                    train_user_list = utils.get_train_user_list(train_user_list)
                    let triplet_samplers = new TripletSampler(train_user_list, item_size)

                    // Create client object
                    let client = new Client(id, new ClientModel(n_factors), triplet_samplers, train_user_list)

                    // If exists, restore existing client model
                    let client_model = ls.get('client_model')
                    if (client_model) {
                        client.model.user_vec = nj.array(client_model)
                    } else {
                        console.log('New client model created')
                    }

                    // Put received parameters in client model
                    client.model.item_vecs = item_vecs
                    client.model.item_bias = item_bias

                    // Start training
                    let result = client.train(lr, positive_fraction)
                    let resulting_vecs = result[0]
                    let resulting_bias = result[1]

                    // Get all trained vectors and biases
                    let keys_vecs = resulting_vecs.keys()
                    let values_vecs = []
                    for (let i =0; i< keys_vecs.length; i++){
                        values_vecs.push(resulting_vecs.get(keys_vecs[i]).tolist())
                    }
                    let keys_bias = resulting_bias.keys()
                    let values_bias = []
                    for (let i =0; i< keys_bias.length; i++){
                        values_bias.push(resulting_bias.get(keys_bias[i]))
                    }

                    // Send trained vectors and biases to server
                    request.post('http://127.0.0.1:5000/update', {
                        json: {
                            keys_bias: keys_bias,
                            values_bias: values_bias,
                            keys_vecs: keys_vecs,
                            values_vecs : values_vecs
                        }
                    }, (error, res, body) => {
                        if (error) {
                            console.error(error)
                        }
                        let req_body = body

                        // Extract parameters
                        let item_vecs = nj.array(req_body.item_vecs)
                        let item_bias = nj.array(req_body.item_bias)
                        let max_k = req_body.max_k

                        // Put received parameters in client model
                        client.model.item_vecs = item_vecs
                        client.model.item_bias = item_bias

                        // Get and print prediction
                        let prediction = client.predict(max_k)
                        console.log(prediction)
                    })

                    // Save new client vector
                    ls.set('client_model', client.model.user_vec.tolist())

                })
        }
    };

