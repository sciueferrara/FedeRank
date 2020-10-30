let collections = require('pycollections')
let utils = require('./utils');
let nj = require('numjs')

module.exports = class Client {
    constructor(client_id, model, train, train_user_list) {
        this.id = client_id;
        this.model = model;
        this.train_set = train;
        this.train_user_list = train_user_list;
    }

    predict(max_k){
        let result = this.model.predict()
        result = utils.set_inf(result, this.train_user_list)
        let item = utils.argsort(result, this.train_user_list)
        let top_k = utils.get_max_k(item, max_k)
        let top_k_score = utils.sort_score(result, max_k)
        return utils.create_prediction(top_k, top_k_score)
    }

    train(lr, positive_fraction){
        function operation(i, j, model){
            let x_i = model.predict_one(i)
            let x_j = model.predict_one(j)
            let x_ij = x_i.subtract(x_j)
            let d_loss = nj.array([1]).divide((nj.exp(x_ij).add(1))).get(0,0)
            let wu = model.user_vec.clone()
            let item_vecs_i = nj.array(utils.get_item_vecs_i(i, model.item_vecs.shape[1], model.item_vecs))
            let item_vecs_j = nj.array(utils.get_item_vecs_i(j, model.item_vecs.shape[1], model.item_vecs))

            model.user_vec = model.user_vec.add(item_vecs_i.subtract(item_vecs_j).
            multiply(d_loss).subtract((wu.multiply(user_reg))).multiply(lr))

            resulting_dic.set(j, nj.add(resulting_dic.get(j), wu.multiply(-1).multiply(d_loss).
            subtract((item_vecs_j.multiply(negative_item_reg)))))
            resulting_bias.set(j, resulting_bias.get(j) - d_loss - bias_reg * model.item_bias.get(j))

            if (positive_fraction){
                if(Math.random() >= 1 - positive_fraction){
                    resulting_dic.set(i, nj.add(resulting_dic.get(i), wu.multiply(d_loss).subtract((nj.array(utils.
                    get_item_vecs_i(i,model.item_vecs.shape[1], model.item_vecs))).multiply(positive_item_reg))))
                    resulting_bias.set(i, resulting_bias.get(i) + d_loss - bias_reg * model.item_bias.get(i))
                }
            }
        }

        let bias_reg = 0
        let user_reg = lr / 20
        let positive_item_reg = lr / 20
        let negative_item_reg = lr / 200
        let m = this.model.user_vec.shape
        let resulting_dic = new collections.DefaultDict(function(){return nj.zeros(m)})
        let resulting_bias = new collections.DefaultDict(function(){return 0})
        let sample = this.train_set.sample_user_triples()
        for (let i_j of sample) {
            let i = i_j[0]
            let j = i_j[1]
            operation(i, j, this.model)
        }

        return [resulting_dic, resulting_bias]
    }
};