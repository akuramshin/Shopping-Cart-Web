var total = 0.00;
var subtotal = 0.00;
var tax = 0.00;
const tax_rate = 0.13;
var cart = {};
var items = {"milk": 9.99, "eggs": 11.99, "butter": 5.99};

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
        for (let key in items) {
            $("#items tr:last").after("<tr><td>" + key + "</td><td>$" + items[key] + "</td><td><button type=\"button\" class=\"btn btn-primary ml-5 bg-primary " + key +"\" data-dismiss=\"modal\" id=\"add\">Add</button></td></tr>");
        }

        $(document).on('click', '#add', function(){

            for (let key in items){
                if ($(this).hasClass(key)){
                    $("#cart tr:last").after("<tr><td>" + key + "</td><td>1</td><td>" + items[key] + "<button type=\"button\" class=\"btn btn-primary ml-5 bg-danger " + key + "\" id=\"remove\">Remove</button></td></tr>");
                    update_totals(items[key], 1);
                    cart[key] = 1;        
                    $(this).attr("disabled", true);
                    break;
                }
            }
        });

        $(document).on('click', '#remove', function(){ 

            for (let key in items){
                if ($(this).hasClass(key)) {
                    $("#add." + key).attr("disabled", false);
                    update_totals(cart[key] * items[key], 0);
                    $(this).parent().parent().remove();
                    break;
                }
                
            }
       });
    }
);

