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
    var modal = document.getElementById('myModal');
    var btn = document.getElementsByClassName("myBtn");
    var span = document.getElementsByClassName("close")[0];
    btn.onclick = function() {
        modal.style.display = "block";
    }
    span.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
    .onkeydown = function(e){
        if(e.keyCode == 27){
            modal.style.display = "none";
        }
    }
};