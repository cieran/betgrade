$(document).ready(function () {

    autoRemoveAlert($('.alert'));

    function autoRemoveAlert(alertElement)
    {
        alertElement.fadeTo(2000, 800).slideUp(800, function () {
            alertElement.slideUp(800);
        });
    }
});
    var modal = document.getElementById('myModal');
    var btn = document.getElementById("myBtn");
    var span = document.getElementsByClassName("close")[0];
    btn.onclick = function() {
        $(modal).modal();
    }
    span.onclick = function() {
        $(modal).modal('hide');
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            $(modal).modal('hide');
        }
    }
    .onkeydown = function(e){
        if(e.keyCode == 27){
            $(modal).modal('hide');
        }
    }
};