var total = 0.00;
var subtotal = 0.00;
var tax = 0.00;
const tax_rate = 0.13;
var cart = [];
var items = [];
function update_totals(price_change, inc) {
    if (inc == 0) {
        subtotal = subtotal - price_change;
    }
    else {
        subtotal = subtotal + price_change;
    }
    tax = subtotal * tax_rate;
    total = subtotal + tax;

    $("#subtotal").text("$" + subtotal);
    $("#tax").text("$" + tax);
    $("#total").text("$" + total);
}

$(document).ready(
    
    function()
    {

        $("#add").click(function(){
            $("#cart tr:last").after("<tr><td>Item</td><td>1</td><td>$10<button type=\"button\" class=\"btn btn-primary ml-5 bg-danger\" id=\"remove\">Remove</button></td></tr>");
            update_totals(10, 1);
        });

        $(document).on('click', '#remove', function(){ 
            $(this).parent().parent().remove();
       });
    }
);

