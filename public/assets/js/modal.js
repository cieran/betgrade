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
    var btn = document.getElementById("myBtn");
    var span = document.getElementById("close")[0];
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
    window.onkeydown = function(e){
        if(e.keyCode == 27){
            moda.style.display = "none";
        }
    }
};