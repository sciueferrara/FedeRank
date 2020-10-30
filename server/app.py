from flask import Flask, request
import json
from modules import Server, ServerModel
import numpy as np
import sys
import argparse

np.set_printoptions(threshold=sys.maxsize)

app = Flask(__name__)


@app.route('/')
def index():
    return 'Flask Server!'


@app.route('/login', methods=['POST'])
def login():
    data = request.get_data()
    data = json.loads(data)
    model_json = server.get_model_for_training(data["id"])
    return json.dumps(model_json)


@app.route('/update', methods=['POST'])
def training_data():
    req = request.get_data()
    req = json.loads(req)
    resulting_vecs = {}
    resulting_bias = {}
    # Estraiamo chiavi e valori del training eseguito dal client
    keys_bias = req['keys_bias']
    values_bias = req['values_bias']
    keys_vecs = req['keys_vecs']
    values_vecs = req['values_vecs']
    # Inseriamo gli update ottenuti in appositi dizionari
    for j in range(len(keys_bias)):
        resulting_bias[keys_bias[j]] = values_bias[j]
    for j in range(len(keys_vecs)):
        resulting_vecs[keys_vecs[j]] = np.array(values_vecs[j])
    # Aggiorniamo il modello globale
    server.update_model(resulting_vecs, resulting_bias)
    return server.get_model_for_prediction(max_k=100)


@app.route('/prediction', methods=['POST'])
def prediction_data():
    return server.get_model_for_prediction(max_k=100)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-I', '--items', help='Set the number of items', type=int, required=True)
    parser.add_argument('-F', '--factors', help='Set the latent factors you want', type=int, required=True)
    parser.add_argument('-pi', '--positive_fraction', type=float,
                        help='Set the fraction of positive item users should send (default 0)')
    parser.add_argument('-lr', '--lr', help='Set the learning rates', type=float, required=True)
    parsed_args = parser.parse_args()

    # Creiamo l'oggetto server_model e server
    server_model = ServerModel(parsed_args.items, parsed_args.factors)
    server = Server(server_model, parsed_args.lr, parsed_args.positive_fraction)

    app.run(threaded=True)
