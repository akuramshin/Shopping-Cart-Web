import os
import pytest
from flask import jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from project import create_app, db
from project.models import User, Item

app = create_app()
test_email = "test@test"
test_pass = "test123"
test_item_name = "bacon"
test_item_amount = 3

@pytest.fixture
def client():
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
    app.config['TESTING'] = True

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client

# Function to immitate a login request.
def login(client, username, password):
    return client.post('/login', data=dict(
        email=username,
        password=password
    ), follow_redirects=True)

# Function to immitate a signup request.
def signup(client, username, password):
    return client.post('/signup', data=dict(
        email=username,
        password=password
    ), follow_redirects=True)

def save_cart_item(client, action, name, amount):
    return client.post('/_cart_item', json={
        'action': action, 'name': name, 'amount': amount
    })

def test_login(client):
    """Make sure login works."""
    signup(client, test_email, test_pass)

    # Check that we can login succesfully (redirected to shopping page).
    rv = login(client, test_email, test_pass)
    assert b'Shopping List Calculator' in rv.data

    # Check that we check both email and password correctly.
    rv = login(client, test_email + 'x', test_pass)
    assert b'Please check your login details and try again.' in rv.data

    rv = login(client, test_email, test_pass + 'x')
    assert b'Please check your login details and try again.' in rv.data

def test_signup(client):
    """Make sure signup works."""
    with app.app_context():
        test_user = User.query.filter_by(email=test_email).first()
        if test_user:
            db.session.delete(test_user)
    
    # Check that we can signup succesfully (redirected to login page).
    rv = signup(client, test_email, test_pass)
    assert b'Login' in rv.data

    # Check that we check for unique users correctly.
    rv = signup(client, test_email, test_pass)
    assert b'Email address already exists' in rv.data

def test_saving_cart(client):
    signup(client, test_email, test_pass)
    login(client, test_email, test_pass)

    # Check that we can add/save items to a user's database.
    save_cart_item(client, "add", test_item_name, test_item_amount)
    with app.app_context():
        test_user = User.query.filter_by(email=test_email).first()
        item = test_user.items.filter_by(name=test_item_name).first()
    assert item is not None

    # Check that we can update the amount of an item in a user's database.
    save_cart_item(client, "add", test_item_name, test_item_amount-1)
    with app.app_context():
        test_user = User.query.filter_by(email=test_email).first()
        item = test_user.items.filter_by(name=test_item_name).first()
    assert item.amount == test_item_amount-1

    # Check that we can remove items from a user's database.
    save_cart_item(client, "remove", test_item_name, test_item_amount)
    with app.app_context():
        test_user = User.query.filter_by(email=test_email).first()
        item = test_user.items.filter_by(name=test_item_name).first()
    assert item is None



