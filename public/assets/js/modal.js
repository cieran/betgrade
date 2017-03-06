$(document).ready(function () {
    autoRemoveAlert($('.alert'));
    function autoRemoveAlert(alertElement)
    {
        alertElement.fadeTo(2000, 1000).slideUp(1000, function () {
            alertElement.slideUp(1000);
        });
    }

    $('.close').click(function(){
        $('#myModal, .modal-content').modal('hide');
    });

    $('.modal-content').click(function(e){
        e.stopPropagation();
    });
});
$(document).keypress(function(e) { 
    if (e.keyCode == 27) { 
        $('#myModal, .modal-content').modal('hide');
    } 
});

$('.clickable').nextUntil('tr.clickable').slideToggle(0);

$('.clickable').click(function(){
    $(this).nextUntil('tr.clickable').slideToggle(0);
});
$(document).on("click", ".addmarket", function(){
    var marketname = $(this).data('market');
    var student = $(this).data('student');
    var odds = $(this).data('odds');
    var side = $(this).data('side');
    $(".modal-content #marketname").val(marketname);
    $(".modal-content #student").val(student);
    $(".modal-content #odds").val(odds);
    $(".modal-content #side").val(side);
});
