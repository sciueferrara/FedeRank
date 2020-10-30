var nj = require('numjs')
const numbers = require('numbers')
var utils = require('./utils');

module.exports = class ClientModel {
    constructor(n_factors, client_model) {
        this.item_vecs = 'None';
        this.item_bias = 'None';
        this.user_vec = nj.array(numbers.random.distribution.normal(n_factors, 0, 1)).divide(10)

    }

    predict_one(i){
        var item_vecs_i = utils.get_item_vecs_i(i, this.item_vecs.shape[1], this.item_vecs)
        return nj.dot(item_vecs_i, this.user_vec).add(this.item_bias.get(i))
    }

    predict(){
        return nj.dot(this.item_vecs, this.user_vec).add(this.item_bias)
    }
};