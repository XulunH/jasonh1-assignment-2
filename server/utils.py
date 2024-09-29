import numpy as np

def generate_data():
    data=np.random.uniform(low=-10,high=10,size=(100,2))

    return data

def generate_centroids(method,k,data):
    if method=='Random':
        centroids=data[np.random.choice(data.shape[0],k,replace=False)]
    if method=='Farthest First':
        centroids = [data[np.random.choice(data.shape[0], 1)][0]]

        for i in range(1,k):
            d=np.array([min(np.linalg.norm(x-c) for c in centroids) for x in data])
            centroids.append(data[np.argmax(d)])
        centroids=np.array(centroids)
    if method=='KMeans++':
        centroids = [data[np.random.choice(data.shape[0], 1)][0]]

        for i in range(1,k):
            d=np.array([min(np.linalg.norm(x-c)**2 for c in centroids) for x in data])
            probablities=d/d.sum()
            centroids.append(data[np.random.choice(data.shape[0], 1,p=probablities)][0])
        centroids=np.array(centroids)
    return centroids

def generate_labels(data,centroids):
    labels=[]
    for x in data:
        d=np.array([np.linalg.norm(x-c) for c in centroids])
        labels.append(np.argmin(d))
    labels=np.array(labels)
    return labels
    
def generate_next_kmeans(data, centroids, labels):
    k=centroids.shape[0]
    new_centroids = np.array([data[labels == i].mean(axis=0) if np.sum(labels == i) > 0 else np.zeros_like(centroids[0]) for i in range(k)])
    new_labels = generate_labels(data, new_centroids)
    return new_centroids, new_labels
  

def generate_final_kmeans(data,centroids,labels):
    convergence=False
    while not convergence:
        old_centroids=centroids.copy()
        centroids, labels=generate_next_kmeans(data, centroids, labels)
        if np.allclose(old_centroids,centroids):
            convergence=True
    return centroids,labels

