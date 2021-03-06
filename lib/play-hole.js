const Ball = require("./ball");
const Hole = require("./hole");
const Obstacles = require("./obstacles");
const SandDune = require("./sand-dune");
const Stroke = require("./stroke");
const Sprite = require("./sprite");
let treeImage = new Image();
treeImage.src = "./assets/images/tree-1.jpg";
let sandImage = new Image();
sandImage.src = "./assets/images/fire.jpg";

function PlayHole(game, holeNumber) {
  this.completed = false;
  this.game = game;
  this.holeNumber = holeNumber;
  this.ball = new Ball(170, 350);
  this.hole = new Hole(300, 100);

  this.obstacles = generateObstacles(this.hole,this.holeNumber,this.ball);
  this.sprites = generateSprites(this.obstacles, treeImage);
  this.sandDunes = generateSandDunes(this.hole,this.holeNumber,this.obstacles, this.ball);
  this.spritesSand = generateSprites(this.sandDunes, sandImage);
  this.stroke = new Stroke(this, this.ball);
  this.strokes = 0;
  this.maxStrokes = 10;
  this.walls = [
    { x: -500, y: -100, width: 500, height: game.canvas.height + 100 },
    { x: game.canvas.width, y: 0, width: 500, height: game.canvas.height + 100 },
    { x: -100, y: -500, width: game.canvas.width + 100, height: 500 },
    { x: -100, y: game.canvas.height, width: game.canvas.width + 100, height: 500 },
    { x: 0, y: 0, width: 5, height: 5},
    { x: game.canvas.width-5, y: 0, width: 5, height: 5},
    { x: 0, y: game.canvas.height-5, width: 5, height: 5},
    { x: game.canvas.width-5, y: game.canvas.height-5, width: 5, height: 5}];

    function generateSandDunes(hole,holeNumber,obstacles, ball) {
      let sandDuneArr = [];
      let x = Math.floor((Math.random() * 200) + 50);
      let y = Math.floor((Math.random() * 150) + 25);
      for(let i = 0; i < holeNumber * 10; i++) {
        x = x * (Math.random() * (1.5 - 0.75) + 0.75).toFixed(4);
        y = y * (Math.random() * (1.5 - 0.75) + 0.75).toFixed(4);
        sandDuneArr.push(new SandDune(x,y,holeNumber));
      }
      sandDuneArr = checkObstacles(sandDuneArr,obstacles);
      sandDuneArr = checkBall(ball,sandDuneArr);
      return checkHole(hole ,sandDuneArr);
    }
    function checkBall(ball,objects) {
      for(let i = 0; i < objects.length; i++){
        let dx = (ball.x)-(objects[i].x + objects[i].width/2);
        let dy = (ball.y)-(objects[i].y + objects[i].height/2);
        let width = (ball.radius + objects[i].width)/2;
        let height = (objects[i].height) / 2;
        if(Math.abs(dx) <= width && Math.abs(dy) <= height){
          objects.splice(i,1);
        }

      }
      return objects;
    }

    function generateObstacles(hole,holeNumber,ball) {
      let obstacleArr = [];
      let x = Math.floor((Math.random() * 200) + 50);
      let x1 = Math.floor((Math.random() * 200) + 100);
      let y = Math.floor((Math.random() * 150) + 25);
      let y1 = Math.floor((Math.random() * 150) + 25);
      for(let i = 0; i < holeNumber * 10; i++) {
        x = x * (Math.random() * (1.3 - 0.95) + 0.95).toFixed(4);
        y = y * (Math.random() * (1.3 - 0.95) + 0.95).toFixed(4);
        x1 = x1 * (Math.random() * (1.3 - 0.95) + 0.95).toFixed(4);
        y1 = y1 * (Math.random() * (1.3 - 0.95) + 0.95).toFixed(4);
        obstacleArr.push(new Obstacles(x,y,holeNumber));
        obstacleArr.push(new Obstacles(x1,y1,holeNumber));
      }
      obstacleArr = checkBall(ball, obstacleArr);
      return checkHole(hole ,obstacleArr);
    }

    function generateSprites(obstacles, img) {
      let spriteArr = [];
      for(let i = 0; i < obstacles.length; i++) {
        let currentO = obstacles[i];
        spriteArr.push(new Sprite(img,currentO.width,currentO.height,currentO.x,currentO.y));
      }
      return spriteArr;
    }

    function checkObstacles(sandDunes, objects){
      for(let i = 0; i < objects.length; i++){
        for(let j = 0; i < sandDunes.length; i++) {
          if (sandDunes[j].x < objects[i].x + objects[i].width &&
            sandDunes[j].x + sandDunes[j].width > objects[i].x &&
            sandDunes[j].y < objects[i].y + objects[i].height &&
            sandDunes[j].height + sandDunes[j].y > objects[i].y) {
              sandDunes.splice(j,1);
            }
          }
        }
        return sandDunes;
      }

      function checkHole(hole, objects) {
        for(let i = 0; i < objects.length; i++){
          let dx = (hole.x)-(objects[i].x + objects[i].width/2);
          let dy = (hole.y)-(objects[i].y + objects[i].height/2);
          let width = (hole.radius + objects[i].width)/2;
          let height = (objects[i].height) / 2;
          if(Math.abs(dx) <= width && Math.abs(dy) <= height){
            objects.splice(i,1);
          }
        }
        return objects;
      }
    }


    PlayHole.prototype = {
      update: function(ctx) {
        this.stroke.update(ctx);
        if (this.stroke.completed) {
          this.ball.hit(this.stroke.direction, this.stroke.power);
          this.strokes ++;
          this.game.puttSound.load();
          this.game.puttSound.play();
          this.stroke = new Stroke(this, this.ball);
        }
        this.checkHoleInOne();
        this.obstacleCheck(this.ball, this.obstacles);
        this.obstacleCheck(this.ball, this.walls);
        this.ball.update();
        this.resistanceCheck(this.ball, this.sandDunes);
        if (this.strokes === this.maxStrokes) {this.completed = true;}
      },

      draw: function(ctx) {
        ctx.textAlign = "left";
        if (this.ball.v === 0) {
          this.stroke.draw(ctx);
        }
        this.obstacles.forEach(function(obstacle) {
          obstacle.draw(ctx);
        });
        this.sandDunes.forEach(function(sandDune) {
          sandDune.draw(ctx);
        });

        this.spritesSand.forEach(function(sprite) {
          sprite.draw2(ctx,this.hole);
        });
        this.hole.draw(ctx);
        this.ball.draw(ctx);

        this.sprites.forEach(function(sprite) {
          sprite.draw(ctx,this.hole);
        });
      },

      obstacleCheck: function(ball, objects) {
        objects.forEach(function(object) {
          let [x, y] = ball.nextPos();
          let dx = Math.abs((x)-(object.x + object.width/2));
          let dy = Math.abs((y)-(object.y + object.height/2));
          let width = (ball.radius + object.width)/2;
          let height = (ball.radius + object.height)/2;
          let crossWidth = width * dy;
          let crossHeight = height * dx;
          let collision = 'none';

          if(dx <= width && dy <= height){
            ball.colliding = true;
            if (crossWidth > crossHeight){
              collision = (crossWidth > (crossHeight)) ? 'bottom' : 'left';
            } else {
              collision = (crossWidth > (-1*crossHeight)) ? 'right' : 'top';
            }
            if (collision === "bottom" || collision === "top") {
              ball.yDeflect();
            } else {
              ball.xDeflect();
            }
          }
        });
      },

      resistanceCheck: function(ball, objects) {
        for(let i = 0; i < objects.length; i++){
          let dx = (ball.x)-(objects[i].x + objects[i].width/2);
          let dy = (ball.y)-(objects[i].y + objects[i].height/2);
          let width = (ball.radius + objects[i].width)/2;
          let height = (objects[i].height) / 2;
          if(Math.abs(dx) <= width && Math.abs(dy) <= height){
            ball.v = 0;
          }
        }
      },

      holeCheck: function(hole, objects) {
        for(let i = 0; i < objects.length; i++){
          let dx = (hole.x)-(objects[i].x + objects[i].width/2);
          let dy = (hole.y)-(objects[i].y + objects[i].height/2);
          let width = (hole.radius + objects[i].width)/2;
          let height = (objects[i].height) / 2;
          if(Math.abs(dx) <= width && Math.abs(dy) <= height){
            objects.splice(i,1);
          }
        }
      },

      checkHoleInOne: function() {
        let dx = this.ball.x - this.hole.x;
        let dy = this.ball.y - this.hole.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if(distance < this.ball.radius + this.hole.radius){
          this.game.applauseSound.load();
          this.game.applauseSound.play();
          this.completed = true;
        }
      }
    };

    module.exports = PlayHole;
