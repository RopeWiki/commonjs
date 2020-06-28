function addUACAStyle() {
    var sheet = document.createElement('style')
    sheet.id = 'french';
    sheet.innerHTML = french ? " .uaca0 { display: none ; }" : " .uaca1 { display: none ; }";
    if (document.body) document.body.appendChild(sheet);
}
