import flask 
from flask import render_template
from flask import request
from flask.json import jsonify

app = flask.Flask(__name__)
app.config["DEBUG"] = True

import json
import pandas as pd
import time
import numpy as np
import itertools
import matplotlib.pyplot as plt 
from sklearn.metrics import confusion_matrix
from sklearn.feature_extraction.text import CountVectorizer
from sklearn import metrics
import flask
tweets_data = []
x = []
y = []
vectorizer = CountVectorizer(stop_words='english')

def retrieveTweet(data_url):

    tweets_data_path = data_url
    tweets_file = open(tweets_data_path, "r")
    for line in tweets_file:
        try:
            tweet = json.loads(line)
            tweets_data.append(tweet)
        except:
            continue            
def retrieveProcessedData(Pdata_url):
    sent = pd.read_excel(Pdata_url)
    for i in range(len(tweets_data)):
        if tweets_data[i]['id']==sent['id'][i]:
            x.append(tweets_data[i]['text'])
            y.append(sent['sentiment'][i])

def plot_confusion_matrix(cm, classes,
                          normalize=False,
                          title='Confusion matrix',
                          cmap=plt.cm.Blues):
    plt.imshow(cm, interpolation='nearest', cmap=cmap)
    plt.title(title)
    plt.colorbar()
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes, rotation=45)
    plt.yticks(tick_marks, classes)

    fmt = '.2f' if normalize else 'd'
    thresh = cm.max() / 2.
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        plt.text(j, i, format(cm[i, j], fmt),
                 horizontalalignment="center",
                 color="white" if cm[i, j] > thresh else "black")

    plt.tight_layout()
    plt.ylabel('True label')
    plt.xlabel('Predicted label')                     

def datree(string, k):
    from sklearn import tree
    start_timedt = time.time()
    train_featurestree = vectorizer.fit_transform(x)
    actual1 = y
    test_features1 = vectorizer.transform(x)
    dtree = tree.DecisionTreeClassifier()
    
    dtree = dtree.fit(train_featurestree, [int(r) for r in y])
    

def runall():     
    retrieveTweet('C:/Users/dhuma/OneDrive/Documents/Python/Depression/data/tweetdata.txt')  
    retrieveProcessedData('C:/Users/dhuma/OneDrive/Documents/Python/Depression/processed_data/output.xlsx')
    datree('hey',0)
    
def datreeINPUT(inputtweet):
    from sklearn import tree
    train_featurestree = vectorizer.fit_transform(x)
    dtree = tree.DecisionTreeClassifier()
    dtree = dtree.fit(train_featurestree, [int(r) for r in y])
    inputdtree= vectorizer.transform([inputtweet])
    predictt = dtree.predict(inputdtree)
    return predictt
runall()

@app.route('/')
def home():
    print("We have a visitor!")
    return render_template('index.html')

@app.route('/depression', methods=['GET' , 'POST'])
def depression():
    if request.method=='POST':
        print("post req received")
        print(request.json)
        answer=datreeINPUT(request.json)
        answer=str(answer[0])
        print(answer)
        return jsonify(answer)
    elif request.method=='GET':
        print("get req received")
        print(request)
        return "Hello"

app.run(debug=True)
