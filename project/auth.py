""" Idea for layout of this file is taken from https://www.digitalocean.com/community/tutorials/how-to-add-authentication-to-your-app-with-flask-login"""

from flask import Blueprint, render_template, redirect, url_for, request, flash
from project import db
from werkzeug.security import generate_password_hash, check_password_hash
from project.models import User, Item
from flask_login import login_user

auth = Blueprint('auth', __name__)

@auth.route('/login')
def login():
    return render_template('login.html')

@auth.route('/login', methods=['POST'])
def login_post():
    email = request.form.get('email')
    password = request.form.get('password')

    # Check for the user in the database by email.
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        flash('Please check your login details and try again.')
        return redirect(url_for('auth.login'))

    login_user(user)
    return redirect(url_for('main.index'))

@auth.route('/signup')
def signup():
    return render_template('signup.html')

@auth.route('/signup', methods=['POST'])
def signup_post():
    email = request.form.get('email')
    password = request.form.get('password')

    # Check if a user with this email is already in the database.
    user = User.query.filter_by(email=email).first()

    if user:
        flash('Email address already exists')
        return redirect(url_for('auth.signup'))

    new_user = User(email=email, password=generate_password_hash(password, method='sha256'))

    # Add the new user to the database.
    db.session.add(new_user)
    db.session.commit()

    return redirect(url_for('auth.login'))


