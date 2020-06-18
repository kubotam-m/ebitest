/*
var y = 0;
document.getElementById( 'ebi' ).onclick = function() {
	y += 32;
	document.getElementById( 'ebi' ).style.top = y + "px";
	}
*/
/*
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
*/
/*
//りこちゃんのオブジェクトを作成
var ebi = new Object();
ebi.x = 0;
ebi.y = 0;
ebi.move=0;

//キーボードのオブジェクトを作成
var key = new Object();
key.up = false;
key.down = false;
key.right = false;
key.left = false;

//メインループ
function main() {
	//キーボードが押された時、keydownfunc関数（かんすう）を呼び出す
	addEventListener("keydown", keydownfunc, false);
	//キーボードが放（はな）された時、keyupfunc関数（かんすう）を呼び出す
	addEventListener("keyup", keyupfunc, false);

	//方向キーが押されている場合（ばあい）は、りこちゃんが移動する
	if ( key.left === true ) ebi.x -= 32;
	if ( key.up === true ) ebi.y -= 32;
	if ( key.right === true ) ebi.x += 32;
	if ( key.down === true ) ebi.y += 32;

	//りこちゃんの位置（いち）を決める
	document.getElementById( 'ebi' ).style.top = ebi.y + "px";
	document.getElementById( 'ebi' ).style.left = ebi.x + "px";

	//main関数（かんすう）、つまり自分自身の関数を呼び出すことでループさせる。
	requestAnimationFrame(main);
}
requestAnimationFrame(main);

//キーボードが押されたときに呼び出される関数（かんすう）
function keydownfunc( event ) {
	var key_code = event.keyCode;
	if( key_code === 37 ) key.left = true;
	if( key_code === 38 ) key.up = true;
	if( key_code === 39 ) key.right = true;
	if( key_code === 40 ) key.down = true;
}

//キーボードが放（はな）されたときに呼び出される関数
function keyupfunc( event ) {
	var key_code = event.keyCode;
	if( key_code === 37 ) key.left = false;
	if( key_code === 38 ) key.up = false;
	if( key_code === 39 ) key.right = false;
	if( key_code === 40 ) key.down = false;
}
*/

//りこちゃんのオブジェクトを作成
var ebi = new Object();
ebi.x = 0;
ebi.y = 0;
ebi.move = 0;

//キーボードのオブジェクトを作成
var key = new Object();
key.up = false;
key.down = false;
key.right = false;
key.left = false;

push_key = '';

//メインループ
function main() {
	//キーボードが押された時、keydownfunc関数（かんすう）を呼び出す
	addEventListener("keydown", keydownfunc, false);
	//キーボードが放（はな）された時、keydownfunc関数（かんすう）を呼び出す
	addEventListener("keyup", keyupfunc, false);

	//方向キーが押されている場合（ばあい）は、りこちゃんが移動する
	if ( ebi.move === 0 ) {
		if ( key.left === true ) {
			ebi.move = 32;
			push_key = 'left';
		}
		if ( key.up === true ) {
			ebi.move = 32;
			push_key = 'up';
		}
		if ( key.right === true ) {
			ebi.move = 32;
			push_key = 'right';
		}
		if ( key.down === true ) {
			ebi.move = 32;
			push_key = 'down';
		}
	}

	//ebi.moveが0より大きい場合は、4pxずつ移動（いどう）を続ける
	if (ebi.move > 0) {
		ebi.move -= 4;
		if ( push_key === 'left' ) ebi.x -= 4;
		if ( push_key === 'up' ) ebi.y -= 4;
		if ( push_key === 'right' ) ebi.x += 4;
		if ( push_key === 'down' ) ebi.y += 4;
	}

	//りこちゃんの位置（いち）を決める
	document.getElementById( 'ebi' ).style.top = ebi.y + "px";
	document.getElementById( 'ebi' ).style.left = ebi.x + "px";

	//main関数（かんすう）、つまり自分自身の関数を呼び出すことでループさせる。
	requestAnimationFrame(main);
}
requestAnimationFrame(main);

//キーボードが押されたときに呼び出される関数（かんすう）
function keydownfunc( event ) {
	var key_code = event.keyCode;
	if( key_code === 37 ) key.left = true;
	if( key_code === 38 ) key.up = true;
	if( key_code === 39 ) key.right = true;
	if( key_code === 40 ) key.down = true;
	event.preventDefault();
}

//キーボードが放（はな）されたときに呼び出される関数
function keyupfunc( event ) {
	var key_code = event.keyCode;
	if( key_code === 37 ) key.left = false;
	if( key_code === 38 ) key.up = false;
	if( key_code === 39 ) key.right = false;
	if( key_code === 40 ) key.down = false;
}
