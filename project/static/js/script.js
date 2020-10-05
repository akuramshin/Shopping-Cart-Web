var total = 0.00;
var subtotal = 0.00;
var discounted_subtotal = 0.00;
var tax = 0.00;
const tax_rate = 0.13;
var cart = {};
var items = {};
var discount = 100;

//function that retrieves data on items from the database
$(function() {
    $.ajax({
        url: $SCRIPT_ROOT + '/_get_data',
        async: false,
        dataType: 'json',
        success: function(data) {
            $.each(data.store, function(name, price){
                items[name] = price;
                console.log("Item: " + name + " Price: " + price)
            });
            $.each(data.user, function(name, amount){
                cart[name] = amount;
                console.log("Cart: " + name + " Amount: " + amount)
            });
        }
    });
}); 

//Function to update the displayed totals after adding/removing items from cart
function update_totals(price_change, inc, discount) {
    if (inc == 0) {
        subtotal = (subtotal - price_change);
    }
    else {
        subtotal = (subtotal + price_change);
    }
    discounted_subtotal = subtotal * (discount / 100);
    tax = discounted_subtotal * tax_rate;
    total = discounted_subtotal + tax;

    discounted_subtotal = Math.round(discounted_subtotal * 100) / 100;
    tax = Math.round(tax * 100) / 100;
    total = Math.round(total * 100) / 100;

    //in case of rounding errors
    if (discounted_subtotal < 0 || subtotal < 0) {
        subtotal = 0;
        discounted_subtotal = 0;
        tax = 0;
        total = 0;
    }

    $("#subtotal").text("$" + discounted_subtotal);
    $("#tax").text("$" + tax);
    $("#total").text("$" + total);
}

var quantity1 = "<select id=\"quantity\" class=\"bootstrap-select ";
var quantity2 = "\"><option value=\"1\" selected=\"selected\" id=\"option1\">1</option><option value=\"2\" id=\"option2\">2</option><option value=\"3\" id=\"option3\">3</option><option value=\"4\" id=\"option4\">4</option></select>";

//wait until the html fully loads, then run scripts
$(document).ready(
    function()
    {
        //initializer, after retrieving data from database create table elements for each item
        for (let key in cart) {
            $("#cart tr:last").after("<tr id=\"tr" + key + "\"><td>" + key + "</td><td>" + quantity1 + key + quantity2 + "</td><td>$" + items[key] + "</td><td><button type=\"button\" class=\"btn btn-primary ml-5 bg-danger " + key + "\" id=\"remove\">Remove</button></td></tr>");
            update_totals(items[key]*cart[key], 1, discount);
            
            if (cart[key] != 1) {
                $("#tr" + key +" #option1").removeProp("selected");
                $("#tr" + key + " #option" + cart[key]).prop("selected", "selected");
            }
        }

        for (let key in items) {
            if (!(key in cart)){
                $("#items tr:last").after("<tr><td>" + key + "</td><td>$" + items[key] + "</td><td><button type=\"button\" class=\"btn btn-primary ml-5 bg-primary " + key +"\" data-dismiss=\"modal\" id=\"add\">Add</button></td></tr>");
            }
        }

        //when the user clicks the add button to add items to cart
        $(document).on('click', '#add', function() {
            for (let key in items){
                if ($(this).hasClass(key)) {
                    $("#cart tr:last").after("<tr><td>" + key + "</td><td>" + quantity1 + key + quantity2 + "</td><td>$" + items[key] + "</td><td><button type=\"button\" class=\"btn btn-primary ml-5 bg-danger " + key + "\" id=\"remove\">Remove</button></td></tr>");
                    update_totals(items[key], 1, discount);
                    $.ajax({
                        type: "POST", 
                        url: $SCRIPT_ROOT + '/_cart_item',
                        data : JSON.stringify({action: "add", name: key, amount: 1}),
                        contentType: "application/json",
                    });
                    cart[key] = 1;        
                    $(this).attr("disabled", true);
                    break;
                }
            }
        });

        //when we change an item quantity, update prices and quantities
        $(document).on('change', "#quantity", function(){
            for (let key in items) {
                if ($(this).hasClass(key)) {
                    var value = parseInt($(this).val());

                    if (value > cart[key]) {
                        var difference = value - cart[key];
                        update_totals(difference * items[key], 1, discount);
                    }
                    else {
                        var difference = cart[key] - value;
                        update_totals(difference * items[key], 0, discount);
                    }
                    $.ajax({
                        type: "POST", 
                        url: $SCRIPT_ROOT + '/_cart_item',
                        data : JSON.stringify({action: "add", name: key, amount: value}),
                        contentType: "application/json",
                    });
                    cart[key] = value;
                }
            }
        });

        //when we remove an item from the cart, update prices and quantities
        $(document).on('click', '#remove', function(){ 
            for (let key in items){
                if ($(this).hasClass(key)) {
                    $("#add." + key).attr("disabled", false);
                    update_totals(cart[key] * items[key], 0, discount);
                    $.ajax({
                        type: "POST", 
                        url: $SCRIPT_ROOT + '/_cart_item',
                        data : JSON.stringify({action: "remove", name: key, amount: 1}),
                        contentType: "application/json",
                    });
                    delete cart[key];
                    $(this).parent().parent().remove();
                    location.reload()
                    return false
                }
                
            }
       });

        //when user clicks on the coupon apply button, process the code and make appropriate changes to totals
        $(document).on('click', "#coupon-apply", function(){
            var code = $("#coupon-code").val();

            //if the coupon has not been applied yet
            if ($(this).hasClass("not-applied")) {
                
                if (isNaN(parseInt(code)) || !(/^\d+$/.test(code))) {
                    $("#coupon-success").text("Invalid coupon code");
                    $("#coupon-success").addClass("text-danger");
                }
                else {
                    if (parseInt(code) > 100 || parseInt(code) < 1) {
                        $("#coupon-success").text("Invalid coupon code");
                        $("#coupon-success").addClass("text-danger");
                    }
                    else {
                        $("#coupon-success").text("Coupon code applied: " + (parseInt(code) + "% off"));
                        $("#coupon-success").removeClass("text-danger");
                        $("#coupon-success").addClass("text-success");
                        $("#coupon-code").attr("disabled", true);
                        discount = 100 - parseInt(code);
                        update_totals(0, 0, discount);
                        $(this).text("Remove");
                        $(this).removeClass("bg-primary not-applied");
                        $(this).addClass("bg-danger applied");
                    }
                }
            }
            //the coupon has already been applied, another press will remove the coupon
            else {
                $("#coupon-success").text("");
                $("#coupon-code").attr("disabled", false);
                $(this).text("Apply");
                $(this).removeClass("bg-danger applied");
                $(this).addClass("bg-primary not-applied");
                discount = 100;
                update_totals(0, 0, discount);
            }
        });
    }
);

