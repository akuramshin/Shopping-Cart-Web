var total = 0.00;
var subtotal = 0.00;
var tax = 0.00;
const tax_rate = 0.13;
var cart = {};
var items = {};

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
                console.log("Cart: " + name)
            });
        }
    });
}); 

function update_totals(price_change, inc) {
    if (inc == 0) {
        subtotal = subtotal - price_change;
    }
    else {
        subtotal = subtotal + price_change;
    }
    tax = subtotal * tax_rate;
    total = subtotal + tax;

    subtotal = Math.round(subtotal * 100) / 100;
    tax = Math.round(tax * 100) / 100;
    total = Math.round(total * 100) / 100;

    $("#subtotal").text("$" + subtotal);
    $("#tax").text("$" + tax);
    $("#total").text("$" + total);
}



$(document).ready(
    
    function()
    {
        for (let key in cart) {
            $("#cart tr:last").after("<tr><td>" + key + "</td><td>1</td><td>" + items[key] + "<button type=\"button\" class=\"btn btn-primary ml-5 bg-danger " + key + "\" id=\"remove\">Remove</button></td></tr>");
            update_totals(items[key], 1);
        }

        for (let key in items) {
            if (!(key in cart)){
                $("#items tr:last").after("<tr><td>" + key + "</td><td>$" + items[key] + "</td><td><button type=\"button\" class=\"btn btn-primary ml-5 bg-primary " + key +"\" data-dismiss=\"modal\" id=\"add\">Add</button></td></tr>");
            }
        }

        $(document).on('click', '#add', function(){

            for (let key in items){
                if ($(this).hasClass(key)){
                    $("#cart tr:last").after("<tr><td>" + key + "</td><td>1</td><td>" + items[key] + "<button type=\"button\" class=\"btn btn-primary ml-5 bg-danger " + key + "\" id=\"remove\">Remove</button></td></tr>");
                    update_totals(items[key], 1);
                    $.ajax({
                        type: "POST", 
                        url: $SCRIPT_ROOT + '/_cart_item',
                        data : JSON.stringify({action: "add", name: key, amount: 1}),
                        contentType: "application/json",
                    });
                    console.log("added " + key);
                    cart[key] = 1;        
                    $(this).attr("disabled", true);
                    break;
                }
            }
        });

        $(document).on('click', '#remove', function(){ 

            for (let key in cart){
                if ($(this).hasClass(key)) {
                    $("#add." + key).attr("disabled", false);
                    update_totals(cart[key] * items[key], 0);
                    $.ajax({
                        type: "POST", 
                        url: $SCRIPT_ROOT + '/_cart_item',
                        data : JSON.stringify({action: "remove", name: key, amount: 1}),
                        contentType: "application/json",
                    });
                    delete cart[key]
                    console.log("removed " + key);
                    $(this).parent().parent().remove();
                    break;
                }
                
            }
       });
    }
);

