var bird_collision_judge = true

//canvasの設定（せってい）
const grid_size = 32;
var canvas = document.getElementById('canvas');
//グリッドの数は奇数
const grid_num = 11
canvas.width = grid_size * grid_num;//canvasの横幅（よこはば）
canvas.height = grid_size * grid_num;	//canvasの縦幅（たてはば）
//コンテキストを取得（しゅとく）
var ctx = canvas.getContext('2d');

var retry_button_shown = false;
var start_button_shown = false;

//スコアのcanvasの設定
var score_canvas = document.getElementById("score_canvas")
score_canvas.width = canvas.width;
score_canvas.height = canvas.width / 8;
score_ctx = score_canvas.getContext("2d");

//スコアのcanvasの設定
var info_canvas = document.getElementById("info_canvas")
info_canvas.width = canvas.width;
info_canvas.height = 30;
info_ctx = info_canvas.getContext("2d");
info_canvas.basecolor = "rgb( 248, 248, 256)";

var controller_upper_canvas = document.getElementById("controller_cover");
controller_upper_canvas.width = canvas.width;
controller_upper_canvas.height = 150;
var controller_upper_img = new Image();
controller_upper_img.src = "img/parts_black.png"
var controller_upper_ctx = controller_upper_canvas.getContext("2d");

controller_upper_img.onload = function () {
	controller_upper_ctx.drawImage(controller_upper_img, 0, 0);
}


var controller_canvas = document.getElementById("controller_color")
controller_canvas.width = canvas.width;
controller_canvas.height = 150;
var controller_color_img = new Image();
controller_color_img.src = "working_folder/parts_colored.png"
var controller_ctx = controller_canvas.getContext("2d");

controller_color_img.onload = function () {
	controller_ctx.drawImage(controller_color_img, 0, 0);
}


var rect_pos = {
	x: canvas.width * 0.3,
	y: canvas.height * 0.6,
	width: canvas.width * 0.4,
	height: canvas.height * 0.2
};

ctx.fillStyle = "rgb( 0, 0, 0 )";
//塗（ぬ）りつぶす
ctx.fillRect(0, 0, canvas.width, canvas.height);

score_ctx.fillStyle = "rgb( 0, 0, 0)";
score_ctx.fillRect(0, 0, score_canvas.width, score_canvas.height);

info_ctx.fillStyle = "rgb( 0, 0, 0)";
info_ctx.fillRect(0, 0, info_canvas.width, info_canvas.height);

class Ebi {
	constructor(x = 0, y = 0, move = 0, stepsize = 1, speed = 4) {
		this.img = new Image();
		this.img.src = 'img/ebi.png';
		this.x = x;
		this.y = y;
		this.move = move;
		this.stepsize = stepsize;
		this.speed = speed
	}
}
var ebi = new Ebi();

const refactory_iters_after_collision = grid_size / ebi.speed * 8;
class Bird {
	constructor(x = (canvas.width - grid_size) / 2,
		y = (canvas.width - grid_size) / 2,
		move = 0, speed = 2, stepsize_l = [1, 2]) {
		this.img = new Image();
		this.img.src = 'img/bird.png';
		this.clearimg = new Image();
		this.clearimg.src = 'img/bird_0.4alpha.png'
		this.x = x;
		this.y = y;
		this.move = move;
		this.speed = speed;
		this.stepsize_l = stepsize_l;
		this.dir;
		this.last_collision_iter = -refactory_iters_after_collision;
	}
}


class FoodMap {
	constructor(tmp_iter, initial_food_n = 10, min_food_n_to_keep = 7, max_food_n = 15) {
		this.map = []
		for (var i = 0; i < grid_num; i++) this.map.push(Array(grid_num).fill(0));
		this.food_l = []
		for (var i = 0; i < initial_food_n; i++) this.add_food(tmp_iter, true)
		this.min_food_n_to_keep = min_food_n_to_keep
		this.max_food_n = max_food_n
	}

	_select_grid(initial_state = false) {
		var x_cand, y_cand;
		do {
			x_cand = Math.floor(Math.random() * grid_num);
			y_cand = Math.floor(Math.random() * grid_num);
			while (initial_state === true && x_cand === 0 && y_cand === 0) {
				x_cand = Math.floor(Math.random() * grid_num);
				y_cand = Math.floor(Math.random() * grid_num);
			}
		} while (this.map[x_cand][y_cand] == 1)
		return [x_cand, y_cand]
	}

	get_food_n() {
		return this.food_l.length
	}

	add_food(tmp_iter = iter, initial_state = false) {
		if (this.get_food_n() >= this.max_food_n) return;
		var grid_coordinate = this._select_grid(initial_state = initial_state)
		var x = grid_coordinate[0]
		var y = grid_coordinate[1]
		this.map[x][y] = 1
		this.food_l.push(new Food(x, y, tmp_iter))
	}

	_search_food_l_index_from_map_grid(x_grid, y_grid) {
		for (var i = 0; i < this.food_l.length; i++) {
			if (this.food_l[i].x_grid === x_grid && this.food_l[i].y_grid === y_grid) {
				return i
			}
		}
		console.log("not found")
		return -1
	}

	_del_specified_food(x_grid, y_grid) {
		this.map[x_grid][y_grid] = 0
		var food_l_index = this._search_food_l_index_from_map_grid(x_grid, y_grid);
		if (food_l_index === -1) {	//no food in (x_grid, y_grid)
			return 1
		} else {
			this.food_l.splice(food_l_index, 1)
			return 0
		}
	}


	_got_food_index(ebi) {
		var gotten_food = []
		for (var i = 0; i < this.food_l.length; i++) {
			if (collision_happen(this.food_l[i].x, this.food_l[i].y, ebi.x, ebi.y)) {
				gotten_food.push(i)
				break;
			}
		}
		return gotten_food;
	}

	get_food_iter(ebi) {
		var got_food_index = this._got_food_index(ebi)
		for (var i = 0; i < got_food_index.length; i++) {
			this._del_specified_food(
				this.food_l[got_food_index[i]].x_grid,
				this.food_l[got_food_index[i]].y_grid
			)
		}
		return got_food_index
	}

	del_outdated_food(tmp_iter = iter) {
		var i = 0;
		for (var i = 0; i < this.food_l.length; i++) {
			if (this.food_l[i].min_life_iter < tmp_iter) {
				this._del_specified_food(this.food_l[i].x_grid, this.food_l[i].y_grid);
				i--;
			}
		}
		return
	}

	maintain_min_food_num() {
		//foodの数が足りなかった場合に追加
		if (this.get_food_n() < this.min_food_n_to_keep) {
			while (this.get_food_n() < this.min_food_n_to_keep) {
				this.add_food()
			}
		}
	}
}

class Food {
	constructor(x_grid, y_grid, tmp_iter, min_lifespan_iter = (80 * grid_size) / ebi.speed) {
		var img_list = ["img/plankton_1.png", "img/plankton_2.png"];
		this.x = x_grid * grid_size;
		this.y = y_grid * grid_size;
		this.x_grid = x_grid;
		this.y_grid = y_grid;
		this.img = new Image();
		this.img.src = img_list[Math.floor(Math.random() * img_list.length)]
		this.min_life_iter = tmp_iter + min_lifespan_iter
	}
}


const max_bird_n = 9;
const first_bird_n = 2;
var bird_l = [];
for (var i = 0; i < first_bird_n; i++) {
	bird_l.push(new Bird());
}

var heart = new Object();
heart.img = new Image();
heart.img.src = "img/heart.png"


var iter = 1;
var map = new FoodMap(iter);

var title = new Object();
title.img = new Image();
title.img.src = "img/logo.png";

const dir = ["right", "left", "up", "down"]
//キーボードのオブジェクトを作成
var key = new Object();
key.up = false;
key.down = false;
key.right = false;
key.left = false;
key.push = '';

//えびが1ます動くまでgrid_size/ebi.speedだけのイテレーションが必要
var feeding_freq_iter = grid_size / ebi.speed * 8

var score = 0;

var life_num = 3;

const food_get_sound = new Audio('sound/papa1.mp3');
food_get_sound.volume;
food_get_sound.preload = "auto;"
var food_get_sound_l = []
for (var i = 0; i < 5; i++) {
	food_get_sound_l.push(food_get_sound.cloneNode());
}
const bird_gotten_sound = new Audio('sound/nyu3.mp3');
bird_gotten_sound.volume = 0.6;
bird_gotten_sound.preload = "auto;"
const button_pushed_sound = new Audio('sound/puyon1.mp3');
button_pushed_sound.preload = "auto;"
button_pushed_sound.volume = 0.4;

var sound_index = 0;
//メインループ
function main() {
	//塗（ぬ）りつぶす色を指定（してい）
	ctx.fillStyle = "rgb( 0, 0, 0 )";
	//塗（ぬ）りつぶす
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (var i = 0; i < map.food_l.length; i++) {
		ctx.drawImage(map.food_l[i].img, map.food_l[i].x, map.food_l[i].y);
	}
	for (var i = 0; i < bird_l.length; i++) {
		if (iter - bird_l[i].last_collision_iter > refactory_iters_after_collision) {
			ctx.drawImage(bird_l[i].img, bird_l[i].x, bird_l[i].y);
		} else {
			ctx.drawImage(bird_l[i].clearimg, bird_l[i].x, bird_l[i].y);
		}
	}
	ctx.drawImage(ebi.img, ebi.x, ebi.y);

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
		ebi.move -= ebi.speed;
		if (key.push === 'left') ebi.x -= ebi.speed;
		if (key.push === 'up') ebi.y -= ebi.speed;
		if (key.push === 'right') ebi.x += ebi.speed;
		if (key.push === 'down') ebi.y += ebi.speed;
	}

	var moved_grid = iter / (grid_size / bird_l[0].speed);
	if ((moved_grid % 100) == 0) {
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

		if (bird_collision_judge) {
			if (collision_happen(ebi.x, ebi.y, bird_l[i].x, bird_l[i].y)) {
				collided = true;
				if (iter - bird_l[i].last_collision_iter > refactory_iters_after_collision) {
					life_num--;
					bird_l[i].last_collision_iter = iter;
					bird_gotten_sound.play();

					info_ctx.fillStyle = info_canvas.basecolor;
					info_ctx.fillRect(0, 0, info_canvas.width, info_canvas.height);

					//画像を表示
					for (var i = 0; i < life_num; i++) {
						info_ctx.drawImage(heart.img, 30 * i + 135, 6, heart.img.width * 0.6, heart.img.height * 0.6)
					}
				}
				if (life_num === 0) {
					info_ctx.fillStyle = info_canvas.basecolor;
					info_ctx.fillRect(0, 0, info_canvas.width, info_canvas.height);
					ctx.fillStyle = "red";
					ctx.textAlign = "center";
					ctx.textBaseline = "middle";
					ctx.font = "bold 60px Arial";
					ctx.fillText("GameOver", canvas.width / 2, canvas.height / 2 - 20);
					add_retry_button();
					break;
				}
			}
		}

	}
	if (life_num > 0) {
		var got_food_index_l = map.get_food_iter(ebi);
		if (got_food_index_l.length > 0) {
			//var sound = food_get_sound.cloneNode();
			//sound.play();
			//food_get_sound_l[sound_index].currentTime = 0;
			food_get_sound_l[sound_index].play();
			sound_index = (sound_index + 1) % food_get_sound_l.length;
			score += got_food_index_l.length * 100;

			score_ctx.fillStyle = "rgb( 100, 100, 100)";
			score_ctx.fillRect(0, 0, score_canvas.width, score_canvas.height);
			//scoreを表示
			score_ctx.fillStyle = "white";
			score_ctx.textAlign = "center";
			score_ctx.textBaseline = "middle";
			score_ctx.font = "bold 40px sans-serif";
			score_ctx.fillText(score, score_canvas.width / 2, score_canvas.height / 2);
		}
		map.del_outdated_food();
		if (iter % feeding_freq_iter == 0) map.add_food()
		map.maintain_min_food_num();
		iter++;
		requestAnimationFrame(main);
	}
}
addEventListener('DOMContentLoaded', show_start_page(), false);

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

function collision_happen(ebi_x, ebi_y, target_x, target_y) {
	var ebi_x_overlap = false;
	if (ebi_x > target_x - grid_size & target_x + grid_size > ebi_x) {
		ebi_x_overlap = true;
	}

	var ebi_y_overlap = false;
	if (ebi_y > target_y - grid_size & target_y + grid_size > ebi_y) {
		ebi_y_overlap = true;
	}
	return ebi_x_overlap & ebi_y_overlap
}


//Function to get the  position
function getMousePos(canvas, event) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top
	};
}

function show_start_page() {
	title.img.onload = function () {
		title.x = canvas.width / 2 - title.img.width / 2
		title.y = canvas.height / 2 - title.img.height / 2 - 60
		ctx.drawImage(title.img, title.x, title.y)
	};
	add_start_button();
}

function add_retry_button() {
	retry_button_shown = true;
	ctx.fillStyle = "white";
	ctx.fillRect(rect_pos.x, rect_pos.y, rect_pos.width, rect_pos.height);
	ctx.strokeStyle = "#6ec7ff";
	ctx.lineWidth = 10;
	ctx.strokeRect(rect_pos.x, rect_pos.y, rect_pos.width, rect_pos.height);
	ctx.fillStyle = "#6ec7ff";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "bold 20px Arial";
	ctx.fillText("Retry?", rect_pos.x + rect_pos.width / 2, rect_pos.y + rect_pos.height / 2);
}

function retry() {
	retry_button_shown = false;
	bird_l = [];
	for (var i = 0; i < first_bird_n; i++) {
		bird_l.push(new Bird());
	}
	iter = 1;
	ebi = new Ebi();
	map = new FoodMap(iter);
	score = 0;
	life_num = 3;
	button_pushed_sound.play();

	score_ctx.fillStyle = "rgb( 100, 100, 100)";
	score_ctx.fillRect(0, 0, score_canvas.width, score_canvas.height);
	//scoreを表示
	score_ctx.fillStyle = "white";
	score_ctx.textAlign = "center";
	score_ctx.textBaseline = "middle";
	score_ctx.font = "bold 40px sans-serif";
	score_ctx.fillText(score, score_canvas.width / 2, score_canvas.height / 2);

	info_ctx.fillStyle = info_canvas.basecolor;
	info_ctx.fillRect(0, 0, info_canvas.width, info_canvas.height);

	//画像を表示
	for (var i = 0; i < life_num; i++) {
		info_ctx.drawImage(heart.img, 30 * i + 135, 6, heart.img.width * 0.6, heart.img.height * 0.6)
	}
	main();
}

function add_start_button() {
	start_button_shown = true;
	ctx.fillStyle = "white";
	ctx.fillRect(rect_pos.x, rect_pos.y, rect_pos.width, rect_pos.height);
	ctx.strokeStyle = "#ff867d";
	ctx.lineWidth = 10;
	ctx.strokeRect(rect_pos.x, rect_pos.y, rect_pos.width, rect_pos.height);
	ctx.fillStyle = "#ff867d";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "bold 20px Arial";
	ctx.fillText("start", rect_pos.x + rect_pos.width / 2, rect_pos.y + rect_pos.height / 2);
}

function start() {
	start_button_shown = false;
	button_pushed_sound.play();
	info_ctx.fillStyle = info_canvas.basecolor;
	info_ctx.fillRect(0, 0, info_canvas.width, info_canvas.height);

	score_ctx.fillStyle = "rgb( 100, 100, 100)";
	score_ctx.fillRect(0, 0, score_canvas.width, score_canvas.height);
	//scoreを表示
	score_ctx.fillStyle = "white";
	score_ctx.textAlign = "center";
	score_ctx.textBaseline = "middle";
	score_ctx.font = "bold 40px sans-serif";
	score_ctx.fillText(score, score_canvas.width / 2, score_canvas.height / 2);

	//ハートを表示

	info_ctx.fillStyle = info_canvas.basecolor;
	info_ctx.fillRect(0, 0, info_canvas.width, info_canvas.height);
	for (var i = 0; i < life_num; i++) {
		info_ctx.drawImage(heart.img, 30 * i + 135, 6, heart.img.width * 0.6, heart.img.height * 0.6)
	}
	main();
}

function isInside(pos, rect) {
	return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y
}
canvas.addEventListener('click', function (evt) {
	var mousePos = getMousePos(canvas, evt);
	if (retry_button_shown && isInside(mousePos, rect_pos)) {
		retry();
	}
}, false);

canvas.addEventListener('click', function (evt) {
	var mousePos = getMousePos(canvas, evt);
	if (start_button_shown && isInside(mousePos, rect_pos)) {
		start();
	}
}, false);

var color_keymap = {
	left: [13, 13, 13, 255],
	right: [0, 255, 0, 255],
	up: [255, 0, 0, 255],
	down: [0, 2, 255, 255]
}

function convert_color_to_key(color) {
	for (key_dir in color_keymap) {
		var color_identical = true;
		for (var i = 0; i < 4; i++) {
			if (color_keymap[key_dir][i] != color[i]) {
				color_identical = false;
				break;
			}
		}
		if (color_identical === true) return key_dir
	} return null
}

//if (!("ontouchend" in document)) {
//if (("ontouchend" in document)) {
if (false) {
	document.getElementById("mobile_area").style.display = "none";
}

//Function to get the mouse position
function getTouchedPos(canvas, event) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: event.targetTouches[0].pageX - rect.left,
		y: event.targetTouches[0].pageY - rect.top
	};
}

controller_upper_canvas.addEventListener("touchstart", function (evt) {
	key.up = false;
	key.up = false;
	key.right = false;
	key.down = false;
	var mousePos = getTouchedPos(controller_canvas, evt);
	var pixel_color = controller_ctx.getImageData(mousePos.x, mousePos.y,
		1, 1).data;
	var pushed_controller_dir = convert_color_to_key(pixel_color);
	if (pushed_controller_dir === null) return;
	switch (pushed_controller_dir) {
		case "left":
			key.left = true;
			break;
		case "up":
			key.up = true;
			break;
		case "right":
			key.right = true;
			break;
		case "down":
			key.down = true;
			break;
	}
}, false);

controller_upper_canvas.addEventListener("touchend", function (evt) {
	key.left = false;
	key.up = false;
	key.right = false;
	key.down = false;
}, false);

controller_upper_canvas.addEventListener("mouseout", function (evt) {
	key.left = false;
	key.up = false;
	key.right = false;
	key.down = false;
}, false);