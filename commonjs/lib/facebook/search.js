function fbusersearch() {
    var user = prompt("Please enter your Facebook name", getCookie("fbuser"));
    if (user) {
        setCookie("fbuser", user);
        document.body.style.cursor = 'wait';
        window.location.href = SITE_BASE_URL + "/Location?onlycuser=" + user.split(" ").join("") + "%40Facebook&sortby=-Has_condition_date";
    }
}
