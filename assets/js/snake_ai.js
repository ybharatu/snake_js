// Used this as the base: https://www.educative.io/blog/javascript-snake-game-tutorial

// class Node{
//   constructor(coord ,visited, left, right, up, down){
//     this.coord = coord;
//     this.visited = visited;
//     this.left = left;
//     this.right = right;
//     this.up = up;
//     this.down = down;
//   }
// }

// class Path{
//   constructor(height, width){
//     this.height = height;
//     this.width = width;
//     this.length = 0;
//     this.path = [];
//     this.init_path();
//   }

//   get_height(){
//     return this.height;
//   }

//   get_width(){
//     return this.width;
//   }

//   get_path(){
//     return this.path;
//   }

//   // Good resource: https://weblog.jamisbuck.org/2011/1/10/maze-generation-prim-s-algorithm
//   init_path(){
//     // Making the start point the head of the snake. NEEED TO CHANGE if snake gets relocated
//     this.path[this.length] = new Node({x: 100, y: 100},1, 1, 1, 1, 1);
//     this.length = this.length + 1;
//   }
// }
// Another Good resource: https://github.com/CheranMahalingam/Snake_Hamiltonian_Cycle_Solver/blob/master/
const board_border = 'white';
const board_background = "black";
const snake_col = 'lightgreen';
const snake_border = 'darkgreen';
const head_col = 'yellow'
const head_border = 'darkyellow'

const newGameButton = document.querySelector('#new_game_ai');
const showGridButton = document.querySelector('#show_grid_ai');
const showNumButton = document.querySelector('#show_num_ai');

// Get the canvas element
const snakeboard = document.getElementById("snakeboard_comp");
// Return a two dimensional drawing context
const snakeboard_ctx = snakeboard.getContext("2d");

// Box width
var bw = 120;
// Box height
var bh = 120;
// Padding
var p = 0;
// True if changing direction
let changing_direction = false;
// Horizontal velocity
let dx = 10;
// Vertical velocity
let dy = 0;

let snake = [  {x: snakeboard.width/2 , y: snakeboard.height/2 },  {x: snakeboard.width/2 - dx, y: snakeboard.height/2},  {x: snakeboard.width/2-2*dx, y: snakeboard.height/2},  {x: snakeboard.width/2-3*dx, y: snakeboard.height/2},  {x: snakeboard.width/2-4*dx, y: snakeboard.height/2},];

grid_margin = 20

let food_x;
let food_y;

let score = 0

let grid_show = 0;

let num_show = 0;

//let board = makeArray(40,40,0)



// let ham_path = new Path(snakeboard.height/2, snakeboard.width/2);
// console.log(ham_path.get_path())
// Start game
// main();

// gen_food();
clear_board();
newGameButton.addEventListener('click', driver);
showGridButton.addEventListener('click', changeGrid);
showNumButton.addEventListener('click', changeNum);

document.addEventListener("keydown", change_direction);
window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

directions = prim_maze();
graph = generate_cycle(directions);
path = make_hamiltonian_path(graph);

function driver() {
  snake = [  {x: snakeboard.width/2 , y: snakeboard.height/2 },  {x: snakeboard.width/2 - dx, y: snakeboard.height/2},  {x: snakeboard.width/2-2*dx, y: snakeboard.height/2},  {x: snakeboard.width/2-3*dx, y: snakeboard.height/2},  {x: snakeboard.width/2-4*dx, y: snakeboard.height/2},];

	// True if changing direction
	changing_direction = false;
	// Horizontal velocity
	dx = 10;
	// Vertical velocity
	dy = 0;

	score = 0;
  document.getElementById('score').innerHTML = score;
	main();
	gen_food();
}
// main function called repeatedly to keep the game running
function main() {
        if (has_game_ended()) return;

        changing_direction = false;
        setTimeout(function onTick() {
        clear_board();
        gridBoard();
        numBoard();
        drawFood();
        move_snake();
        drawSnake();
        // Call main again
        main();
      }, 100)
    }

// draw a border around the canvas
function clearCanvas() {
  //  Select the colour to fill the drawing
  snakeboard_ctx.fillStyle = board_background;
  //  Select the colour for the border of the canvas
  snakeboard_ctx.strokestyle = board_border;
  // Draw a "filled" rectangle to cover the entire canvas
  snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
  // Draw a "border" around the entire canvas
  snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
}

// draw a border around the canvas
function clear_board() {
  //  Select the colour to fill the drawing
  snakeboard_ctx.fillStyle = board_background;
  //  Select the colour for the border of the canvas
  snakeboard_ctx.strokestyle = board_border;
  // Draw a "filled" rectangle to cover the entire canvas
  snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
  // Draw a "border" around the entire canvas
  snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
}

// Draw the snake on the canvas
function drawSnake() {
  // Draw each part
  snake.forEach(drawSnakePart)
}

function has_game_ended() {
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true
  }
  const hitLeftWall = snake[0].x < 0;
  const hitRightWall = snake[0].x > snakeboard.width - 10;
  const hitToptWall = snake[0].y < 0;
  const hitBottomWall = snake[0].y > snakeboard.height - 10;
  return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall
}

function change_direction(event) {
  const LEFT_KEY = 37;
  const RIGHT_KEY = 39;
  const UP_KEY = 38;
  const DOWN_KEY = 40;
  
// Prevent the snake from reversing

  if (changing_direction) return;
  changing_direction = true;
  const keyPressed = event.keyCode;
  const goingUp = dy === -10;
  const goingDown = dy === 10;
  const goingRight = dx === 10;
  const goingLeft = dx === -10;
  if (keyPressed === LEFT_KEY && !goingRight) {
    dx = -10;
    dy = 0;
  }
  if (keyPressed === UP_KEY && !goingDown) {
    dx = 0;
    dy = -10;
  }
  if (keyPressed === RIGHT_KEY && !goingLeft) {
    dx = 10;
    dy = 0;
  }
  if (keyPressed === DOWN_KEY && !goingUp) {
    dx = 0;
    dy = 10;
  }
}

// Draw one snake part
function drawSnakePart(snakePart, i) {
  if(i === 0){
  	// Set the colour of the snake part
    snakeboard_ctx.fillStyle = head_col;
    // Set the border colour of the snake part
    snakeboard_ctx.strokestyle = head_border;
    // Draw a "filled" rectangle to represent the snake part at the coordinates
    // the part is located
    snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
    // Draw a border around the snake part
    snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
  }
  else {
  	// Set the colour of the snake part
    snakeboard_ctx.fillStyle = snake_col;
    // Set the border colour of the snake part
    snakeboard_ctx.strokestyle = snake_border;
    // Draw a "filled" rectangle to represent the snake part at the coordinates
    // the part is located
    snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
    // Draw a border around the snake part
    snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
  }
  
}



function random_food(min, max) {
  return Math.round((Math.random() * (max-min) + min) / 10) * 10;
}

function gen_food() {
  // Generate a random number the food x-coordinate
  food_x = random_food(0, snakeboard.width - 10);
  // Generate a random number for the food y-coordinate
  food_y = random_food(0, snakeboard.height - 10);
  // if the new food location is where the snake currently is, generate a new food location
  snake.forEach(function has_snake_eaten_food(part) {
    const has_eaten = part.x == food_x && part.y == food_y;
    if (has_eaten) gen_food();
  });
}

function drawFood()
{
      snakeboard_ctx.fillStyle = 'red';
      snakeboard_ctx.strokestyle = 'darkred';
      snakeboard_ctx.fillRect(food_x, food_y, 10, 10);
      snakeboard_ctx.strokeRect(food_x, food_y, 10, 10);
}

function move_snake() {
  // Create the new Snake's head
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};
  // Add the new head to the beginning of snake body
  snake.unshift(head);
  const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
  if (has_eaten_food) {
    // Increase score
    score += 10;
    // Display score on screen
    document.getElementById('score').innerHTML = score;
    // Generate new food location
    gen_food();
  } else {
    // Remove the last part of snake body
    snake.pop();
  }
}

//found from https://stackoverflow.com/questions/11735856/draw-a-grid-on-an-html-5-canvas-element
function gridBoard(){
  //console.log("Toggle Grid")
  var count = 0;
	if(grid_show){
		for (var x = 0; x <= snakeboard.width; x += grid_margin) {
	        snakeboard_ctx.moveTo(0.5 + x + p, p);
	        snakeboard_ctx.lineTo(0.5 + x + p, snakeboard.height + p);
          // snakeboard_ctx.font = "10px Arial";
          // snakeboard_ctx.fillStyle = "red";
          // snakeboard_ctx.fillText("1", 102, 100);
	    }

	    for (var x = 0; x <= snakeboard.height; x += grid_margin) {
	        snakeboard_ctx.moveTo(p, 0.5 + x + p);
	        snakeboard_ctx.lineTo(snakeboard.width + p, 0.5 + x + p);
	    }
	    snakeboard_ctx.strokeStyle = "white";
	    snakeboard_ctx.stroke();
	}
    
}

function numBoard(){
  //console.log("Toggle Grid")
  var count = 0;
  if(num_show){
    for (var y = 0; y <= snakeboard.height - 1; y += grid_margin) {
          
      for (var x = 0; x <= snakeboard.height - 1; x += grid_margin) {
          
          if (count < (100) ){
            if (count === 10){
              console.log(x + 2 + " " + y + 8);
            }
            snakeboard_ctx.font = "7px Arial";
            snakeboard_ctx.fillStyle = "red";
            snakeboard_ctx.fillText(count, x + 2, y + 8);
            count = count + 1;
          }
          
          //console.log(count);
      }
    }
  }
    
}

function changeGrid(){
	//console.log("Changed Grid")
	if (grid_show === 1){
		grid_show = 0;
	}else{
		grid_show = 1;
	}
  clear_board();
  gridBoard();
  numBoard();
}

function changeNum(){
  //console.log("Changed Grid")
  if (num_show === 1){
    num_show = 0;
  }else{
    num_show = 1;
  }
  clear_board();
  gridBoard();
  numBoard();
}

// Found from https://stackoverflow.com/questions/13808325/creating-a-2d-array-with-specific-length-and-width
function makeArray(w, h, val) {
    var arr = [];
    for(let i = 0; i < h; i++) {
        arr[i] = [];
        for(let j = 0; j < w; j++) {
            arr[i][j] = val;
        }
    }
    return arr;
}

function set_pop(s){
  let value;
  for(value of s);
  return value;
}

function count_ones(arr){
  count = 0;
  for(let i = 0; i < arr.length;i++){
    for(let j = 0; j < arr[0].length;j++){
      if (arr[i][j] === 1){
        count += 1;
      }
    }
  }
  return count;
}


// Referenced: https://github.com/CheranMahalingam/Snake_Hamiltonian_Cycle_Solver/blob/master/
// Use Prim's algorithm to create a maze
function prim_maze(){
  // Calculate all verticies. Needs to be half the size of the original board. 
  num_rows = snakeboard.height/20/2;
  num_cols = snakeboard.width/20/2;
  num_vert = num_cols * num_rows;

  // directions = Array.from(Array(num_rows), () => new Array(num_cols));
  // visited = Array.from(Array(num_rows), () => new Array(num_cols));
  //directions = {}
  //visited = {}

// Got this from: https://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript
var directions = new Array(num_rows);
var visited = new Array(num_rows);

for (var i = 0; i < directions.length; i++) {
  directions[i] = new Array(num_cols);
  visited[i] = new Array(num_cols);
}
for (var i = 0; i < directions.length; i++){
  for (var j = 0; j < directions[0].length; j++){
    directions[i][j] = [];
    visited[i][j] = 0;
  }
}

//console.log(visited);
  // Key Generation
  // for (var y = 0; y <= num_rows; y++){
  //   for (var x = 0; x <= num_cols; x++){
  //     directions[x][y] = [];
  //     visited[x][y] = 0;
  //   }
  // }

  init_x = Math.floor(Math.random() * num_cols); 
  init_y = Math.floor(Math.random() * num_rows); 

  curr_x = init_x;
  curr_y = init_y;
  new_x = curr_x;
  new_y = curr_y;

  console.log("Current pos:");
  console.log(curr_x);
  console.log(curr_y);

  // Need to keep track of visited points
  visited[curr_x][curr_y] = 1;

  // Found from https://stackoverflow.com/questions/63179867/set-of-tuples-in-javascript
  class ObjectSet extends Set{
    add(elem){
      return super.add(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
    has(elem){
    return super.has(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
  }

  // Need to keep track of adjacent points
  let adjacent = new ObjectSet();

  //while (Object.keys(visited).length != num_vert){
  while(count_ones(visited) != num_vert){

    curr_x = new_x;
    curr_y = new_y;

    // Need to list all the cases to check adjacent cells

    // Case #1: Not on any edge of the board. Have neighbors above, below, right, and left of you
    if (curr_x != 0 && curr_y != 0 && curr_x != num_cols - 1 && curr_y != num_rows - 1){
      //adjacent.add({x: curr_x, y: curr_y })
      // Right neighbor
      adjacent.add([curr_x + 1, curr_y ]);
      // Left neighbor
      adjacent.add([curr_x - 1, curr_y ]);
      // Above neighbor
      adjacent.add([curr_x , curr_y - 1]);
      // Below neighbor
      adjacent.add([curr_x , curr_y + 1 ]);
    }
    // Case #2: Top left corner. Have neighbors below, and right of you
    else if (curr_x === 0 && curr_y === 0 ){
      // Right neighbor
      adjacent.add([curr_x + 1, curr_y ]);
      // Below neighbor
      adjacent.add([curr_x, curr_y + 1 ]);
    }
    // Case #3: Top Right corner. Have neighbors below, and left of you
    else if (curr_x === num_cols - 1 && curr_y === 0 ){
      // Below neighbor
      adjacent.add([curr_x, curr_y + 1 ]);
      // Left neighbor
      adjacent.add([curr_x - 1, curr_y ]);
    }
    // Case #4: Bottom Right corner. Have neighbors above, and left of you
    else if (curr_x === num_cols - 1 && curr_y === num_rows - 1 ){
      // Above neighbor
      adjacent.add([curr_x , curr_y - 1]);
      // Left neighbor
      adjacent.add([curr_x - 1, curr_y ]);
    }
    // Case #5: Bottom Left corner. Have neighbors above, and right of you
    else if (curr_x === 0 && curr_y === num_rows - 1 ){
      // Above neighbor
      adjacent.add([curr_x , curr_y - 1]);
      // Right neighbor
      adjacent.add([curr_x + 1, curr_y ]);
    }
    // Case #6: Left Edge. Have neighbors above, below, and right of you
    else if (curr_x === 0 ){
      // Above neighbor
      adjacent.add([curr_x , curr_y - 1]);
      // Right neighbor
      adjacent.add([curr_x + 1, curr_y ]);
      // Below neighbor
      adjacent.add([curr_x, curr_y + 1 ]);
    }
    // Case #7: Right Edge. Have neighbors above, below, and left of you
    else if (curr_x === num_cols - 1 ){
      // Above neighbor
      adjacent.add([curr_x , curr_y - 1]);
      /// Left neighbor
      adjacent.add([curr_x - 1, curr_y ]);
      // Below neighbor
      adjacent.add([curr_x, curr_y + 1 ]);
    }
    // Case #8: Top Edge. Have neighbors below, right and left of you
    else if (curr_y === 0 ){
      // Right neighbor
      adjacent.add([curr_x + 1, curr_y ]);
      /// Left neighbor
      adjacent.add([curr_x - 1, curr_y ]);
      // Below neighbor
      adjacent.add([curr_x, curr_y + 1 ]);
    }
    // Case #9: Bottom Edge. Have neighbors above, right and left of you
    else if (curr_y === num_rows - 1 ){
      // Right neighbor
      adjacent.add([curr_x + 1, curr_y ]);
      /// Left neighbor
      adjacent.add([curr_x - 1, curr_y ]);
      // Above neighbor
      adjacent.add([curr_x , curr_y - 1]);
    }

    console.log(adjacent);

    while (true){

      // Pick random adjacent cell to check. 
      new_cell = set_pop(adjacent);
      //console.log(new_cell);
      
      new_x = parseInt(new_cell.split(",")[0].split("[")[1],10);
      new_y = parseInt(new_cell.split(",")[1].split("]")[0],10);
      console.log(new_x + " " +  new_y);
      //console.log(visited);
      adjacent.delete(new_cell)   
      //console.log(adjacent)
      // Checks if a wall already exists. If it does, it will pick a new cell
      if (visited[new_x][new_y] == 0) {

        // Marks this location as visited
        visited[new_x][new_y] = 1;

        // Creating the wall. Check the adjacent cells until you find a visited cell. Then make a wall towards it. 
        // Only consider walls to be the right or down
        if (new_x+1 <= num_cols-1 && visited[new_x+1][new_y] == 1){
          directions[new_x][new_y].push("right");
        }
        else if(new_x != 0 && visited[new_x-1][new_y] == 1){
          directions[new_x-1][new_y].push("right");
        }
        else if(new_y+1 <= num_rows && visited[new_x][new_y+1] == 1){
          directions[new_x][new_y].push("down");
        }
        else if(new_y != 0 && visited[new_x][new_y-1] == 1){
          directions[new_x][new_y-1].push("down");
        }
        else{
          console.log("Something went wrong in prim_maze()");
        }

        break;
      }
    }
      console.log("num visited:");
      console.log(count_ones(visited));
      
  }
   console.log(directions); 
   return directions;
  //}
}

function generate_cycle(directions){

  num_rows = snakeboard.height/20/2;
  num_cols = snakeboard.width/20/2;
  num_vert = num_cols * num_rows;

  // 2D Array that acts like a dictionary
  // Key is the (x,y) location
  // Value is the (x,y) locations it can travel to from the (x,y) location from key
  var graph = new Array(num_rows*2);

  for (var i = 0; i < graph.length; i++) {
    graph[i] = new Array(num_cols*2);
  }
  for (var i = 0; i < graph.length; i++){
    for (var j = 0; j < graph[0].length; j++){
      graph[i][j] = [];
    }
  }

  for (var i = 0; i < num_rows; i++){
    for (var j = 0; j < num_cols; j++){
      // Case #1: Not on any edge of the board. Have neighbors above, below, right, and left of you
      if (j != num_cols - 1 && i != num_rows - 1 && j != 0 && i != 0){
        if (directions[j][i].includes("right")){
          graph[j*2 + 1][i*2].push([j*2 + 2, i*2]);
          graph[j*2 + 1][i*2 + 1].push([j*2 + 2, i*2 + 1]);
        } else {
          graph[j*2 + 1][i*2].push([j*2 + 1, i*2 + 1]);
        }

        if (directions[j][i].includes("down")){
          graph[j*2][i*2 + 1].push([j*2, i*2 + 2]);
          graph[j*2 + 1][i*2 + 1].push([j*2 + 1, i*2 + 2]);
        } else {
          graph[j*2][i*2 + 1].push([j*2 + 1, i*2 + 1]);
        }

        if (!(directions[j][i-1].includes("down"))){
          graph[j*2][i*2].push([j*2 + 1, i*2]);
        }

        if (!(directions[j-1][i].includes("right"))){
            graph[j*2][i*2].push([j*2, i*2 + 1]);
        }

      }

      // Case #2: Top left corner. Have neighbors below, and right of you
      else if (j == 0 && i == 0) {
        graph[j*2][i*2].push([j*2 + 1, i*2]);
        graph[j*2][i*2].push([j*2, i*2 + 1]);

        if (directions[j][i].includes("right")){
          graph[j*2 + 1][i*2].push([j*2 + 2, i*2]);
          graph[j*2 + 1][i*2 + 1].push([j*2 + 2, i*2 + 1]);
        } else {
          graph[j*2 + 1][i*2].push([j*2 + 1, i*2 + 1]);
        }

        if (directions[j][i].includes("down")){
          graph[j*2][i*2 + 1].push([j*2, i*2 + 2]);
          graph[j*2 + 1][i*2 + 1].push([j*2 + 1, i*2 + 2]);
        } else {
          graph[j*2][i*2 + 1].push([j*2 + 1, i*2 + 1]);
        }

      }

      // Case #3: Top Right corner. Have neighbors below, and left of you
      else if (j == num_cols-1 && i == 0) {
        //console.log("Got here? when j = " + j + " and i = " + i );
        graph[j*2][i*2].push([j*2 + 1, i*2]);
        graph[j*2 + 1][i*2].push([j*2 + 1, i*2 + 1]);

        if (directions[j][i].includes("down")){
          graph[j*2][i*2 + 1].push([j*2, i*2 + 2]);
          graph[j*2 + 1][i*2 + 1].push([j*2 + 1, i*2 + 2]);
        } else {
          graph[j*2][i*2 + 1].push([j*2 + 1, i*2 + 1]);
        }

        if(!(directions[j-1][i].includes("right"))){
          graph[j*2][i*2].push([j*2,i*2 + 1]);
        }

      }

      // Case #4: Bottom Right corner. Have neighbors above, and left of you
      else if (j == num_cols-1 && i == num_rows - 1) {
        graph[j*2][i*2 + 1].push([j*2 + 1, i*2 + 1]);
        graph[j*2 + 1][i*2].push([j*2 + 1, i*2 + 1]);

        if(!(directions[j][i-1].includes("down"))){
          graph[j*2][i*2].push([j*2,i*2 + 1]);
        }
        else if(!(directions[j-1][i].includes("right"))){
          graph[j*2][i*2].push([j*2,i*2 + 1]);
        }

      }

      // Case #5: Bottom Left corner. Have neighbors above, and right of you
      else if (j == 0 && i == num_rows-1){
        graph[j*2][i*2].push([j*2 , i*2 + 1]);
        graph[j*2][i*2 + 1].push([j*2 + 1, i*2 + 1]);

        if (directions[j][i].includes("right")){
          graph[j*2 + 1][i*2].push([j*2 + 2, i*2]);
          graph[j*2 + 1][i*2 + 1].push([j*2 + 2, i*2 + 1]);
        } else {
          graph[j*2 + 1][i*2].push([j*2 + 1, i*2 + 1]);
        }

        if(!(directions[j][i-1].includes("down"))){
          graph[j*2][i*2].push([j*2 + 1,i*2 ]);
        }

      }

      // Case #6: Left Edge. Have neighbors above, below, and right of you
      else if(j == 0){
        graph[j*2][i*2].push([j*2 , i*2 + 1]);

        if (directions[j][i].includes("right")){
          graph[j*2 + 1][i*2].push([j*2 + 2, i*2]);
          graph[j*2 + 1][i*2 + 1].push([j*2 + 2, i*2 + 1]);
        } else {
          graph[j*2 + 1][i*2].push([j*2 + 1, i*2 + 1]);
        }

        if (directions[j][i].includes("down")){
          graph[j*2][i*2 + 1].push([j*2, i*2 + 2]);
          graph[j*2 + 1][i*2 + 1].push([j*2 + 1, i*2 + 2]);
        } else {
          graph[j*2][i*2 + 1].push([j*2 + 1, i*2 + 1]);
        }

        if(!(directions[j][i-1].includes("down"))){
          graph[j*2][i*2].push([j*2 + 1,i*2 ]);
        }

      }

      // Case #7: Right Edge. Have neighbors above, below, and left of you
      else if(j == num_cols-1){
        graph[j*2 + 1][i*2].push([j*2 + 1, i*2 + 1]);

        if (directions[j][i].includes("down")){
          graph[j*2][i*2 + 1].push([j*2, i*2 + 2]);
          graph[j*2 + 1][i*2 + 1].push([j*2 + 1, i*2 + 2]);
        } else {
          graph[j*2][i*2 + 1].push([j*2 + 1, i*2 + 1]);
        }

        if(!(directions[j][i-1].includes("down"))){
          graph[j*2][i*2].push([j*2 + 1, i*2 ]);
        }

        if(!(directions[j-1][i].includes("right"))){
          graph[j*2][i*2].push([j*2,i*2 + 1]);
        }

      }

      // Case #8: Top Edge. Have neighbors below, right and left of you
      else if(i == 0){
        graph[j*2][i*2].push([j*2 + 1, i*2 ]);

        if (directions[j][i].includes("right")){
          graph[j*2 + 1][i*2].push([j*2 + 2, i*2]);
          graph[j*2 + 1][i*2 + 1].push([j*2 + 2, i*2 + 1]);
        } else {
          graph[j*2 + 1][i*2].push([j*2 + 1, i*2 + 1]);
        }

        if (directions[j][i].includes("down")){
          graph[j*2][i*2 + 1].push([j*2, i*2 + 2]);
          graph[j*2 + 1][i*2 + 1].push([j*2 + 1, i*2 + 2]);
        } else {
          graph[j*2][i*2 + 1].push([j*2 + 1, i*2 + 1]);
        }

        if(!(directions[j-1][i].includes("right"))){
          graph[j*2][i*2].push([j*2,i*2 + 1]);
        }

      }

      // Case #9: Bottom Edge. Have neighbors above, right and left of you
      else if( i == num_rows-1){
        graph[j*2][i*2 + 1].push([j*2 + 1, i*2 + 1]);

        if (directions[j][i].includes("right")){
          graph[j*2 + 1][i*2].push([j*2 + 2, i*2]);
          graph[j*2 + 1][i*2 + 1].push([j*2 + 2, i*2 + 1]);
        } else {
          graph[j*2 + 1][i*2].push([j*2 + 1, i*2 + 1]);
        }

        if(!(directions[j][i-1].includes("down"))){
          graph[j*2][i*2].push([j*2 + 1, i*2 ]);
        }

        if(!(directions[j-1][i].includes("right"))){
          graph[j*2][i*2].push([j*2,i*2 + 1]);
        }

      }

    }
  }
  console.log(graph);
  return graph;
}

function make_hamiltonian_path (graph){
  
}


// document.addEventListener("DOMContentLoaded", function () {
//   pTag = document.querySelector("div");
//   newVal = document.createElement("p");
//   newVal.innerHTML = '';
//   pTag.appendChild(newVal);
// });