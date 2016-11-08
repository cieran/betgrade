$(document).ready(function () {

    autoRemoveAlert($('.alert'));

    function autoRemoveAlert(alertElement)
    {
        alertElement.fadeTo(2000, 800).slideUp(800, function () {
            alertElement.slideUp(800);
        });
    }
    $("#myBtn").click(function(){
        $("#myModal").modal('show');
    });
	$('.close').click(function(){
		$('#myModal').modal('hide');
	}); 
});