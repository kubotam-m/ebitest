/*
var y = 0;
document.getElementById( 'ebi' ).onclick = function() {
	y += 32;
	document.getElementById( 'ebi' ).style.top = y + "px";
	}
*/
var y = 0;
var x = 0;
addEventListener("keydown", keydownfunc, false);

function keydownfunc( event ) {
	var key_code = event.keyCode;
	if( key_code === 37 ) x -= 32;
	if( key_code === 38 ) y -= 32;
	if( key_code === 39 ) x += 32;
	if( key_code === 40 ) y += 32;
	document.getElementById( 'ebi' ).style.top = y + "px";
	document.getElementById( 'ebi' ).style.left = x + "px";
}


