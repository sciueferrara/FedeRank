import random

random.seed(43)


class Server:
    def __init__(self, model, lr, positive_fraction):
        self.model = model
        self.lr = lr
        self.positive_fraction = positive_fraction

    def update_model(self, resulting_vecs, resulting_bias):
        # Aggiorno item_vecs e item_bias
        for k, v in resulting_vecs.items():
            self.model.item_vecs[k] += self.lr * v
        for k, v in resulting_bias.items():
            self.model.item_bias[k] += self.lr * v

    def get_model_for_training(self, id):
        model = ({"item_vecs": self.model.item_vecs.tolist(),
                      'item_bias': self.model.item_bias.tolist(),
                      'lr': self.lr,
                      'positive_fraction': self.positive_fraction,
                      'item_size': self.model.item_size,
                      'n_factors': self.model.n_factors})
        return model

    def get_model_for_prediction(self, max_k):
        model = ({"item_vecs": self.model.item_vecs.tolist(),
                 'item_bias': self.model.item_bias.tolist(),
                 'max_k': max_k})
        return model
