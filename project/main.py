from flask import Blueprint, render_template, request, redirect, url_for, jsonify, flash
from project import db
from flask_login import login_required, current_user
from project.models import Item, User

main = Blueprint('main', __name__)

@main.route('/')
@login_required
def index():
    return render_template('shopping_list.html')

# A route to request the data for database of items and current user cart items.
@main.route('/_get_data')
def get_data():
    data_dict = {}

    # Check if our store user exists.
    # To keep track of the store inventory we use an admin user.
    store = User.query.filter_by(email="store@admin").first()
    if not store:
        store = add_store()

    # Our admin user holds all the items in our store's inventory.
    items = Item.query.filter_by(user_id=store.id)
    items_dict = {}
    for item in items:
        items_dict[item.name] = item.price

    # Query all the items in the current user's cart.
    user_dict = {}
    for item in current_user.items:
        user_dict[item.name] = item.amount

    # Pack up our data and send it over as a json object.
    data_dict["store"] = items_dict
    data_dict["user"] = user_dict
    return jsonify(data_dict)

# A route to update the current user's cart.
@main.route('/_cart_item', methods=['POST'])
@login_required
def cart_item_post():
    resp = jsonify(success=True)
    action = request.json['action']
    item_name = request.json['name']
    item_amount = request.json['amount']
    
    # The add action either adds the item to the cart, or updates the amount.
    if (action == "add"):
        item = current_user.items.filter_by(name=item_name).first()
        # Item already in user's cart, change the amount.
        if item:
            item.amount = item_amount
        # Item is not in user's cart, add it.
        else:
            item = Item(name=item_name, amount=item_amount)
            current_user.items.append(item)
    # The remove action simply removes the item from the user's cart.
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

# A route to add a new item to the shop's inventory.
@main.route('/_add_item', methods=['POST'])
def add_item_post():
    item_name = request.form.get('name')
    item_price = float(request.form.get('price'))

    if item_name:
        # Check if item is unique.
        item = Item.query.filter_by(name=item_name).first()
        if item:
            flash('Item already exists')
            return redirect(url_for('main.add_item'))

        # Check if our store user exists.
        store = User.query.filter_by(email="store@admin").first()
        if not store:
            store = add_store()

        item = Item(name=item_name, price=item_price)
        store.items.append(item)
        db.session.commit()
    
    return redirect(url_for('main.add_item'))

# To keep track of the store inventory we use an admin user.
def add_store():
    store_user = User(email="store@admin", password='sha256$PwSAeOgw$eca76065c02c0cee86a6073f754bb3ac84e73ebece78126e2ae4f91e27c0c53f')
    db.session.add(store_user)
    db.session.commit()
    return store_user



    


