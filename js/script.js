//canvasの設定（せってい）
const grid_size = 32;
var canvas = document.getElementById('canvas');
//グリッドの数は奇数
canvas.width = grid_size * 11;//canvasの横幅（よこはば）
canvas.height = grid_size * 11;	//canvasの縦幅（たてはば）
//コンテキストを取得（しゅとく）
var ctx = canvas.getContext('2d');
var retry_button_shown = false;

class Ebi {
	constructor(x = 0, y = 0, move = 0, stepsize = 1) {
		this.img = new Image();
		this.img.src = 'img/ebi.png';
		this.x = x;
		this.y = y;
		this.move = move;
		this.stepsize = stepsize;
	}
}

class Bird {
	constructor(x = (canvas.width - grid_size) / 2,
		y = (canvas.width - grid_size) / 2,
		move = 0, speed = 2, stepsize_l = [1, 2]) {
		this.img = new Image();
		this.img.src = 'img/bird.png';
		this.x = x;
		this.y = y;
		this.move = move;
		this.speed = speed;
		this.stepsize_l = stepsize_l;
		this.dir;
	}
}

var ebi = new Ebi();

const max_bird_n = 9;
const first_bird_n = 3;
var bird_l = [];
for (var i = 0; i < first_bird_n; i++) {
	bird_l.push(new Bird());
}
var iter = 1;

const dir = ["right", "left", "up", "down"]
//キーボードのオブジェクトを作成
var key = new Object();
key.up = false;
key.down = false;
key.right = false;
key.left = false;
key.push = '';

//鳥が1ます動くまでgrid_size/bird.speedだけのイテレーションが必要

//メインループ
function main() {
	//塗（ぬ）りつぶす色を指定（してい）
	ctx.fillStyle = "rgb( 0, 0, 0 )";
	//塗（ぬ）りつぶす
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	//画像を表示
	ctx.drawImage(ebi.img, ebi.x, ebi.y);
	for (var i = 0; i < bird_l.length; i++) {
		ctx.drawImage(bird_l[i].img, bird_l[i].x, bird_l[i].y);
	}
	addEventListener("keydown", keydownfunc, false);
	addEventListener("keyup", keyupfunc, false);

	//方向キーが押されている場合（ばあい）は、りこちゃんが移動する
	if (ebi.move === 0) {
		if (key.left === true & ebi.x > 0) {
			ebi.move = grid_size * ebi.stepsize;
			key.push = 'left';
		}
		if (key.up === true & ebi.y > 0) {
			ebi.move = grid_size * ebi.stepsize;
			key.push = 'up';
		}
		if (key.right === true & ebi.x < canvas.width - grid_size * ebi.stepsize) {
			ebi.move = grid_size * ebi.stepsize;
			key.push = 'right';
		}
		if (key.down === true & ebi.y < canvas.height - grid_size * ebi.stepsize) {
			ebi.move = grid_size * ebi.stepsize;
			key.push = 'down';
		}
	}
	//ebi.moveが0より大きい場合は、4pxずつ移動（いどう）を続ける
	if (ebi.move > 0) {
		ebi.move -= 4;
		if (key.push === 'left') ebi.x -= 4;
		if (key.push === 'up') ebi.y -= 4;
		if (key.push === 'right') ebi.x += 4;
		if (key.push === 'down') ebi.y += 4;
	}

	var moved_grid = iter / (grid_size / bird_l[0].speed);
	if ((moved_grid % 30) == 0) {
		if (bird_l.length < max_bird_n) {
			var last_bird = bird_l[bird_l.length - 1];
			bird_l.push(new Bird(x = last_bird.x, y = last_bird.y));
		}
	}

	var collided = false;
	for (var i = 0; i < bird_l.length; i++) {
		bird_l[i].stepsize =
			bird_l[i].stepsize_l
			[Math.floor(Math.random() * bird_l[i].stepsize_l.length)];
		if (bird_l[i].move === 0) {
			//鳥の動く方向を決める
			var bird_dir_candidate = dir;
			if (bird_l[i].x < grid_size * bird_l[i].stepsize) {
				bird_dir_candidate =
					bird_dir_candidate.filter(n => n !== "left");
			}
			if (bird_l[i].x > canvas.width - grid_size * (bird_l[i].stepsize + 1)) {
				bird_dir_candidate =
					bird_dir_candidate.filter(n => n !== "right");
			}
			if (bird_l[i].y < grid_size * bird_l[i].stepsize) {
				bird_dir_candidate =
					bird_dir_candidate.filter(n => n !== "up");
			}
			if (bird_l[i].y > canvas.height - grid_size * (bird_l[i].stepsize + 1)) {
				bird_dir_candidate =
					bird_dir_candidate.filter(n => n !== "down");
			}
			bird_l[i].dir = bird_dir_candidate[Math.floor(Math.random() * bird_dir_candidate.length)];

			bird_l[i].move = grid_size * bird_l[i].stepsize;
		}

		//bird_l[i].moveが0より大きい場合は、4pxずつ移動（いどう）を続ける
		if (bird_l[i].move > 0) {
			bird_l[i].move -= bird_l[i].speed;
			if (bird_l[i].dir === 'left') bird_l[i].x -= bird_l[i].speed;
			if (bird_l[i].dir === 'up') bird_l[i].y -= bird_l[i].speed;
			if (bird_l[i].dir === 'right') bird_l[i].x += bird_l[i].speed;
			if (bird_l[i].dir === 'down') bird_l[i].y += bird_l[i].speed;
		}

		if (collision_happen(ebi.x, ebi.y, bird_l[i].x, bird_l[i].y)) {
			collided = true;
			ctx.fillStyle = "red";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.font = "bold 60px Arial";
			ctx.fillText("GameOver", canvas.width / 2, canvas.height / 2);
			add_retry_button();
			break;
		}

	}
	if (collided === false) {
		iter++;
		requestAnimationFrame(main);
	}
}
//ページと依存（いぞん）している全てのデータが読み込まれたら、メインループ開始
addEventListener('load', main(), false);

//キーボードが押されたときに呼び出される関数（かんすう）
function keydownfunc(event) {
	var key_code = event.keyCode;
	if (key_code === 37) key.left = true;
	if (key_code === 38) key.up = true;
	if (key_code === 39) key.right = true;
	if (key_code === 40) key.down = true;
	event.preventDefault();
}

//キーボードが放（はな）されたときに呼び出される関数
function keyupfunc(event) {
	var key_code = event.keyCode;
	if (key_code === 37) key.left = false;
	if (key_code === 38) key.up = false;
	if (key_code === 39) key.right = false;
	if (key_code === 40) key.down = false;
}

function collision_happen(ebi_x, ebi_y, bird_x, bird_y) {
	var ebi_x_overlap = false;
	if (ebi_x > bird_x - grid_size & bird_x + grid_size > ebi_x) {
		ebi_x_overlap = true;
	}

	var ebi_y_overlap = false;
	if (ebi_y > bird_y - grid_size & bird_y + grid_size > ebi_y) {
		ebi_y_overlap = true;
	}
	return ebi_x_overlap & ebi_y_overlap
}

//Function to get the mouse position
function getMousePos(canvas, event) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}
var rect = { x: canvas.width * 0.3, y: canvas.height * 0.6, width: canvas.width * 0.4, height: canvas.height * 0.2 };
function add_retry_button() {
	retry_button_shown = true;
	ctx.fillStyle = "white";
	ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
	ctx.strokeStyle = "lightblue";
	ctx.lineWidth = 10;
	ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
	ctx.fillStyle = "lightblue";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "bold 20px Arial";
	ctx.fillText("Retry?", rect.x + rect.width / 2, rect.y + rect.height / 2);
}

function retry() {
	retry_button_shown = false;
	bird_l = [];
	for (var i = 0; i < first_bird_n; i++) {
		bird_l.push(new Bird());
	}
	iter = 1;
	ebi = new Ebi();
	main();
}
function isInside(pos, rect) {
	return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y
}
canvas.addEventListener('click', function (evt) {
	var mousePos = getMousePos(canvas, evt);
	if (retry_button_shown && isInside(mousePos, rect)) {
		retry();
	}
}, false);