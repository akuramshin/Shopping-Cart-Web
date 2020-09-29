from flask import Flask, render_template, abort
app = Flask(__name__)

@app.route('/')
@app.route('/index')
def index():
    user = {'username': 'Artur'}
    return render_template('index.html', title='Home', user=user)

app.run()