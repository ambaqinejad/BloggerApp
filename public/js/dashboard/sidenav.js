$(document).ready(function() {

    $('#avatar-selection').change(function(e) {
        $('#no-avatar-error').text('');
        if (this.files[0].name.length < 10) {
            $('#avatar-name').text(this.files[0].name);
        } else {
            $('#avatar-name').
            text(this.files[0].name.substring(0, 4) +
                '...' +
                this.files[0].name.substring(this.files[0].name.length - 5, this.files[0].name.length));
        }
    });

    $('#avatarForm').submit(function(e) {
        if (!$('#avatar-selection').val()) {
            $('#no-avatar-error').html('Please choose<br>an avatar.');
            return false;
        }
        return true;
    });
});

function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}