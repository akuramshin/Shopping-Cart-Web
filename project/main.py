from flask import Blueprint, render_template, request, redirect, url_for, jsonify, flash
from project import db
from flask_login import login_required, current_user
from project.models import Item, User

main = Blueprint('main', __name__)

@main.route('/')
@login_required
def index():
    return render_template('shopping_list.html')

@main.route('/_get_data')
def get_data():
    data_dict = {}

     # Check if our store user exists
    store = User.query.filter_by(email="store@admin").first()
    if not store:
        store = add_store()

    items = Item.query.filter_by(user_id=store.id)
    items_dict = {}
    for item in items:
        items_dict[item.name] = item.price

    user_dict = {}
    for item in current_user.items:
        user_dict[item.name] = item.amount

    data_dict["store"] = items_dict
    data_dict["user"] = user_dict
    return jsonify(data_dict)

@main.route('/_cart_item', methods=['POST'])
@login_required
def cart_item_post():
    resp = jsonify(success=True)
    print(request.json)
    action = request.json['action']
    item_name = request.json['name']
    item_amount = request.json['amount']
    
    if (action == "add"):
        item = current_user.items.filter_by(name=item_name).first()
        if item:
            item.amount = item_amount
        else:
            item = Item(name=item_name, amount=item_amount)
            current_user.items.append(item)
    else:
        item = current_user.items.filter_by(name=item_name).first()
        if item:
            current_user.items.remove(item)
        db.session.delete(item)
    db.session.commit()
    return resp


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

        # Check if our store user exists
        store = User.query.filter_by(email="store@admin").first()
        if not store:
            store = add_store()

        item = Item(name=item_name, price=item_price)
        store.items.append(item)
        db.session.commit()
    
    return redirect(url_for('main.add_item'))

def add_store():
    store_user = User(email="store@admin", password='sha256$PwSAeOgw$eca76065c02c0cee86a6073f754bb3ac84e73ebece78126e2ae4f91e27c0c53f')
    db.session.add(store_user)
    db.session.commit()
    return store_user



    


