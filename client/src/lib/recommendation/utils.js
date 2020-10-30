module.exports =
    {
        get_item_vecs_i: function(i, dim, item_vecs) {
            let item_vecs_i = []
            for(let count=0; count<dim; count++){
                item_vecs_i.push(item_vecs.get(i, count))
            }

            return item_vecs_i
        },

        set_inf: function (result, train_user_list) {
            for(let i=0; i< train_user_list.length; i++){
                result.set(train_user_list[i], -Infinity)
            }
            return result
        },

        argsort: function (result) {
            const dsu = (arr1, arr2) => arr1
                .map((item, index) => [arr2[index], item]) // add the args to sort by
                .sort(([arg1], [arg2]) => arg2 - arg1) // sort by the args
                .map(([, item]) => item); // extract the sorted items

            let list = []
            for(let i=0; i<result.tolist().length; i++){
                list.push(i)
            }

            return dsu(list, result.tolist());
        },

        create_prediction: function(top_k, top_k_score){
            let dict = [];

            for(let i=0; i<top_k.length; i++){
                dict.push({
                    item:   top_k[i],
                    value: top_k_score[i]
                });
            }
            return dict
        },

        get_max_k: function (result, max_k) {
            let top_k = []
            for(let i=0; i<max_k; i++){
                //console.log(i + "ciao " +result[i])
                top_k.push(result[i])
            }
            //console.log(result) //Debug
            //console.log(top_k)  //Debug
            return top_k
        },

        sort_score: function (result, max_k) {

            let sort = result.tolist().sort(function(a, b){return b-a})

            let top_k_score = []

            for(let i = 0; i<max_k; i++){
                top_k_score.push(sort[i])
            }
            return top_k_score
        },

        read_train_user_list: function (id) {
            return fetch('datasets_user/user_' + id + '.tsv').then(response => response.text())
        },

        get_train_user_list: function (train_user_list) {
            let x = train_user_list.split('\n');

            for (let i = 0; i < x.length - 1; i++) {
                x[i] = x[i].split('\t');
            }

            let user_list = []
            for (let i = 0; i < x.length - 1; i++) {
               user_list.push(parseInt(x[i][0]))
            }
            return user_list
        }
    };
