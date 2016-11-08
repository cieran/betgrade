$(document).ready(function () {

    autoRemoveAlert($('.alert'));

    function autoRemoveAlert(alertElement)
    {
        alertElement.fadeTo(2000, 800).slideUp(800, function () {
            alertElement.slideUp(800);
        });
    }
});

window.onload = function(){
    var btn = document.getElementsByClassName("myBtn");
    var span = document.getElementsByClassName("close")[0];
    btn.onclick = function() {
        $("#myModal").modal();
    }
    span.onclick = function() {
        $("#myModal").modal('hide');
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            $("#myModal").modal('hide');
        }
    }
    .onkeydown = function(e){
        if(e.keyCode == 27){
            $("#myModal").modal('hide');
        }
    }
};