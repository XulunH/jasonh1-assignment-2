from flask import Flask, request, jsonify
import numpy as np
from utils import generate_data, generate_centroids, generate_labels, generate_next_kmeans,generate_final_kmeans
from flask_cors import CORS

app=Flask(__name__)
CORS(app)

@app.route('/initialize-data',methods=['GET'])
def initialize_data():

    data=generate_data()

    return jsonify(data.tolist())

@app.route('/initialize-centroids',methods=['POST'])
def initialize_centroids():
    method = request.json.get('method')
    data = np.array(request.json.get('data'))
    if method == 'Manual':
        centroids = np.array(request.json.get('centroids'))
    else:
        number_of_centroids = request.json.get('number_of_centroids')
        centroids = generate_centroids(method, number_of_centroids, data)
    labels = generate_labels(data, centroids)
    
    return jsonify({"centroids": centroids.tolist(), "labels": labels.tolist()})

@app.route('/step-kmeans', methods=['POST'])
def step_kmeans():
    data=np.array(request.json.get('data'))
    centroids=np.array(request.json.get('centroids'))
    labels=np.array(request.json.get('labels'))
    new_centroids, new_labels=generate_next_kmeans(data, centroids,labels)

    if np.allclose(centroids,new_centroids):
        return jsonify({'converged': True})
    else:
        return jsonify({"centroids": new_centroids.tolist(),"labels":new_labels.tolist(),'converged':False})

@app.route('/jump-to-convergence',methods=['POST'])
def jump_to_convergence():
    data=np.array(request.json.get('data'))
    centroids=np.array(request.json.get('centroids'))
    labels=np.array(request.json.get('labels'))

    new_centroids, new_labels=generate_final_kmeans(data, centroids,labels)
    return jsonify({"centroids": new_centroids.tolist(),"labels":new_labels.tolist(),'converged':True})


if __name__=='__main__':
    app.run(port=5000,debug=True)
