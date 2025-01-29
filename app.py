from flask import Flask, render_template, jsonify, request
import os

app = Flask(__name__)

# Store tasks in a list
tasks = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_task', methods=['POST'])
def add_task():
    task = request.form['task']
    tasks.append(task)
    return jsonify({'task': task})

@app.route('/get_tasks', methods=['GET'])
def get_tasks():
    return jsonify({'tasks': tasks})

@app.route('/delete_task', methods=['POST'])
def delete_task():
    task = request.form['task']
    if task in tasks:
        tasks.remove(task)
    return jsonify({'tasks': tasks})

if __name__ == '__main__':
    app.run(debug=True)
