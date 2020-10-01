from flask import Blueprint, render_template
from init import db
from flask_login import login_required

main = Blueprint('main', __name__)

@main.route('/')
@login_required
def index():
    return render_template('shopping_list.html')

