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
            $.each(data, function(key, val) {
                items[key] = val;
                console.log("Item: " + key)
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

    //in case of rounding errors
    if (subtotal < 0) {
        subtotal = 0;
        tax = 0;
        total = 0;
    }

    $("#subtotal").text("$" + subtotal);
    $("#tax").text("$" + tax);
    $("#total").text("$" + total);
}

var quantity1 = "<select id=\"quantity\" class=\"bootstrap-select ";
var quantity2 = "\"><option value=\"1\" selected=\"selected\">1</option><option value=\"2\">2</option><option value=\"3\">3</option><option value=\"4\">4</option></select>";

$(document).ready(
    function()
    {
        //after retrieving data from database, create table elements for each item for customer to add
        for (let key in items) {
            $("#items tr:last").after("<tr><td>" + key + "</td><td>$" + items[key] + "</td><td><button type=\"button\" class=\"btn btn-primary ml-5 bg-primary " + key +"\" data-dismiss=\"modal\" id=\"add\">Add</button></td></tr>");
        }

        //when the user clicks the add button to add items to cart
        $(document).on('click', '#add', function() {

            for (let key in items){
                if ($(this).hasClass(key)) {
                    $("#cart tr:last").after("<tr><td>" + key + "</td><td>" + quantity1 + key + quantity2 + "</td><td>$" + items[key] + "</td><td><button type=\"button\" class=\"btn btn-primary ml-5 bg-danger " + key + "\" id=\"remove\">Remove</button></td></tr>");
                    update_totals(items[key], 1);
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
                        update_totals(difference * items[key], 1);
                    }
                    else {
                        var difference = cart[key] - value;
                        update_totals(difference * items[key], 0);
                    }
                    cart[key] = value;
                }
            }
        });

        //when we remove an item from the cart, update prices and quantities
        $(document).on('click', '#remove', function(){ 

            for (let key in items){
                if ($(this).hasClass(key)) {
                    $("#add." + key).attr("disabled", false);
                    update_totals(cart[key] * items[key], 0);
                    delete cart[key];
                    $(this).parent().parent().remove();
                    break;
                }
                
            }
       });
    }
);

