function createModal() {
    var modal = document.getElementById("myModal");
    if (!modal) {

        modal = document.createElement('div');
        modal.innerHTML =
            '<div id="myModal" class="modal">' +
            '<!-- Modal content -->' +
            '<div class="modal-content">' +
            '<span class="close">&times;</span>' +
            '<p>Some text in the Modal..</p>' +
            '</div>' +
            ' </div>';

        document.body.appendChild(modal);

        // Get the modal
        var modal = document.getElementById("myModal");


        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks on <span> (x), close the modal
        span.onclick = function () {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
}

var openModal = function () {
    document.getElementById("myModal").style.display = "block";
}
