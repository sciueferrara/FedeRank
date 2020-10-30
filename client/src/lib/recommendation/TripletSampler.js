module.exports=class TripletSampler{
    constructor(train_user_list, item_size){
        this.train_user_list = train_user_list
        this.item_size = item_size
        this.sampler_size = train_user_list.length
    }
    *sample_user_triples(){
        for(var x=0; x<this.sampler_size; x++){
            var i = this.train_user_list[Math.floor(Math.random() * this.train_user_list.length)];
            var j = Math.floor(Math.random() * this.item_size)
            while (j in this.train_user_list){
                j = Math.floor(Math.random() * this.item_size)
            }
            yield [i,j]
        }
    }
};