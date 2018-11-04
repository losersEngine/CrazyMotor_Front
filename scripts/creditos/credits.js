window.onload=  function(){

    var height = screen.height - (screen.height/10);
    var aspect = 5/3;
    var width = height * aspect;

    $('#table').width(width);
    $('#table').height(height);

}
