from flask import Blueprint, render_template, request, redirect, url_for, jsonify, flash
from init import db
from flask_login import login_required
from models import Item

main = Blueprint('main', __name__)

@main.route('/')
@login_required
def index():
    return render_template('shopping_list.html')

@main.route('/_get_data')
def get_data():
    items = Item.query.all()
    items_dict = {}
    for item in items:
        items_dict[item.name] = item.price
    
    return jsonify(items_dict)

@main.route('/add_item')
@login_required
def add_item():
    return render_template('add_item.html')

@main.route('/_add_item', methods=['POST'])
def add_item_post():
    item_name = request.form.get('name')
    item_price = float(request.form.get('price'))

    if item_name:
        # Check if item is unique
        item = Item.query.filter_by(name=item_name).first()
        if item:
            flash('Item already exists')
            return redirect(url_for('main.add_item'))

        item = Item(name=item_name, price=item_price)
        db.session.add(item)
        db.session.commit()
    
    return redirect(url_for('main.add_item'))



    


