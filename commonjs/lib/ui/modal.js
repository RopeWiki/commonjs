function createModal(name, innerHtml) {
    var modal = document.getElementById(name);
    if (!modal) {
        modal = document.createElement('div');
        modal.innerHTML =
            '<div id="' + name + '" class="modal">' +
            '<!-- Modal content -->' +
            '<div class="modal-content">' +
            '<span class="modal-close">&times;</span>' +
            '<span id="modal-innerContent"></span>' +
            '</div>' +
            ' </div>';

        document.body.appendChild(modal);

        //reassign to the inner div
        modal = document.getElementById(name);

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("modal-close")[0];

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        }
    }

    var modalInnerContent = document.getElementById("modal-innerContent");
    modalInnerContent.innerHTML = innerHtml;
}

var openModal = function (name) {
    var modal = document.getElementById(name);
    modal.style.display = "block";
}
