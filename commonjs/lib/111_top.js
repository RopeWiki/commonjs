// Maintenance banner. Change false->true to display banner.
if (false) {
    $(function() {
        var div = document.createElement('div');
        maintmsg = "🪢 <b>Ropewiki is currently read-only!</b> 🪢<br>We're doing a database upgrade " + 
        "which requires multiple hours to complete. You should still be able to browse the site in the meantime!";
        div.innerHTML = maintmsg;
        div.style = "background: #ffeb3b; color: black; text-align: center; padding: 20px";
        document.getElementById('content').prepend(div);
    });
}