let rain =[]; 
let circle = [];
let Num = 400;  //雨の数
let NumRain = 0;
let NumCircle = 0;
let r = 200;   //キーポイントからの認識半径
let a, b, d;
let captureSize = 1.5;

window.canvas;
let video;
let bodypose;
let poses = [];
let pd;
let noiseval = 0.01;
let leftArmUp = false;
let rightArmUp = false;
let switcher = 0;
let preSwitcher;


//カウンター
let counter = 0;
let count = 0;
let countLimit = 180;
let timer;

const KEY_POINT_IND = {
    NOSE : 0,
    LEFT_EYE : 1,
    RIGHT_EYE : 2,
    LEFT_EAR : 3,
    RIGHT_EAR : 4,
    LEFT_SHOULDER : 5,
    RIGHT_SHOULDER : 6,
    LEFT_ELBOW : 7,
    RIGHT_ELBOW : 8,
    LEFT_WRIST : 9,
    RIGHT_WRIST : 10,
    LEFT_HIP : 11,
    RIGHT_HIP :12,
    LEFT_KNEE : 13,
    RIGHT_KNEE : 14,
    LEFT_ANKLE : 15,
    RIGHT_ANKLE : 16,
};


let cx,cy;

function preload() {
  //Load the handpose model.
  bodypose = ml5.bodypose();
}

function setup() {
 createCanvas(1920, 1080); 

  
  
  let constraints = {
        video: {
          mandatory: {
            minWidth: 1280,
            minHeight: 720
          },
          optional: [{ maxFrameRate: 30 }]
        },
        audio: false
      };
  
  
  video = createCapture(constraints); //webカメラ読み込み
  video.size(width, height);
  video.hide();
  
  bodypose.detectStart(video, gotPoses);

  
  for(let i = 0; i < Num; i ++){
    rain.push(
    new Rain(random(0, width),random(-2*height, -1),random(15, 30), random(5, 30))
      )
    
  }
  
  for(let i = 0; i < Num; i ++){
    circle.push(
    new Circle(random(0, width),random(-1.3*height, -1),random(0.6,1.5), random(1))
      )
    
  }
  
}

function draw() {
  background(10);
  //顔映像
  image(video, 0, 0, width, height);
    for(let i = 0; i < NumRain; i++){    //雨を降らせる
        rain[i].display();
        rain[i].update();
  }

    for(let i = 0; i < NumCircle; i++){
    circle[i].display();
    circle[i].update();
  }
 
  if(poses.length > 0){   //人を認識したら
    if(counter == 0){    //タイマー開始
      timer = setInterval(countUp, 1000);
    }
  counter = 1;
  // console.log(poses);
    
  if(NumRain < Num && count < countLimit && switcher == 0){  //タイマーの範囲内なら雨の数を増やしていく
    NumRain ++;
  }
    
    
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    cx = new Array(pose.keypoints.length);
    cy = new Array(pose.keypoints.length);
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      // Only draw a circle if the keypoint's confidence is bigger than 0.2
      if (keypoint.score > 0.1) {
        cx[j] = keypoint.x * captureSize;
        cy[j] = keypoint.y * captureSize;
        fill(0, 255, 0, 150);
        noStroke();
        // ellipse(cx[j], cy[j], 10);
        
    
        pd = dist(cx[1], cy[1], cx[2], cy[2]);
       r = pd*5
      }
    }
    
    
    //左肘の角度
    let = left_elbow_angle = vector(
      pose.keypoints[KEY_POINT_IND.LEFT_SHOULDER],
      pose.keypoints[KEY_POINT_IND.LEFT_WRIST],
      pose.keypoints[KEY_POINT_IND.LEFT_ELBOW]
    );
    
    //右肘の角度
    let = right_elbow_angle = vector(
      pose.keypoints[KEY_POINT_IND.RIGHT_SHOULDER],
      pose.keypoints[KEY_POINT_IND.RIGHT_WRIST],
      pose.keypoints[KEY_POINT_IND.RIGHT_ELBOW]
    );
    
    
    //傘を構えると
    if(
      pose.keypoints[KEY_POINT_IND.LEFT_WRIST].y < pose.keypoints[KEY_POINT_IND.NOSE].y
    ){
      leftArmUp = true;
    }
    
    if( pose.keypoints[KEY_POINT_IND.RIGHT_WRIST].y < pose.keypoints[KEY_POINT_IND.NOSE].y
    ){
      rightArmUp = true;
    }

  }
    //タイマー範囲外になったら
    if(count >= countLimit){
      if(NumRain > 0){  //雨を徐々に止ませる
          NumRain --;
        }
      if(NumCircle > 0){  //シャボンを徐々に止ませる
          NumCircle --;
        }
        clearTimeout(timer);  //タイマーを止める
    }
    
  }
  
  if(poses.lenght <= 0){   //人を認識しなくなったらリセット
    counter = 0;
    clearTimeout(timer);
    count = 0;
    if(NumRain > 0){
      NumRain --;
    }
   if(NumCircle > 0){  //シャボンを徐々に止ませる
          NumCircle --;  
   }
  }
  

  if(leftArmUp){
    switcher = 1;
    leftArmUp = false;
  }else if(rightArmUp){
    switcher = 0;
    rightArmUp = false;
  }else if(leftArmUp && rightArmUp){
    leftArmUp = false;
    rightArmUp = false;
    switcher = 0;
  }
  
  if(switcher == 1){
    console.log('左')
   if(NumCircle < Num && count < countLimit){  //タイマーの範囲内ならシャボンの数を増やしていく
      NumCircle ++;
    }
    if(NumRain > 0){  //雨を徐々に止ませる
      NumRain --;
    }
  }else if(switcher == 0){
    console.log('右');
    leftArmUp = false;
    if(NumCircle > 0){  //シャボンを徐々に止ませる
        NumCircle --;
      }
  
  }
    
  preSwitcher = switcher;
}

  
  
  
// Callback function for when bodypose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}

  
  
  
//ベクトルによる角度計算
function vector(p1,p2,v0){
  let angle;
  
  let Vp1 = {x: p1.x - v0.x, y: p1.y - v0.y};
  let Vp2 = {x: p2.x - v0.x, y: p2.y - v0.y};
  
  let dot = Vp1.x*Vp2.x + Vp1.y*Vp2.y;
  
  let absVp1 = Math.sqrt(Vp1.x*Vp1.x + Vp1.y*Vp1.y) ;
  let absVp2 = Math.sqrt(Vp2.x*Vp2.x + Vp2.y*Vp2.y) ;
  
  let cosAngle = dot / (absVp1*absVp2);
  
  angle = Math.round(Math.acos(cosAngle)*(180/Math.PI));
  
  return angle;
  
}


function countUp() {
  count++;
  console.log(count);
}



  
class Rain {
  constructor(_x, _y, _g, _len){
    this.x = _x;
    this.y = _y;
    this.g = _g;
    this.len = _len;
  }
  
  display(){
    stroke(233);
    strokeWeight(2);
    line(this.x, this.y, this.x, this.y + this.len);
  }
  
  update(){
    this.y = this.y + this.g;
    
    for (let i = 0; i < poses.length; i++) {
      let pose = poses[i];
      for (let j = 0; j < pose.keypoints.length; j++) {
        if(j == 0 || (6 < j && j < 11) ){
          d = dist(cx[j], cy[j], this.x, this.y + this.len);
        }

        if(this.y > height || d <= r/2){
          this.y = random(-2*height, -1);
        }
        
        if((cx[j] - r/2 < this.x && cx[j] + r/2 > this.x) && this.y > cy[j] - r/2){
          this.y = random(-2*height, -1);
        }
      }
    }
    
  }
}



class Circle {
  constructor(_x, _y, _g, _len){
    this.x = _x;
    this.y = _y;
    this.g = _g;
    this.len = random(-0.4,0.4);
    this.d = random(30,60);
    this.xnoise = random(60);

  }
  
  display(){
    stroke(200);
    noFill();
    ellipse(this.x, this.y, this.d);
  }
  
  update(){
    this.y = this.y + this.g;
    this.d = this.d - 0.01;
    this.x = this.x + noise(this.xnoise) * 2 - 1;
    this.xnoise = this.xnoise + noiseval;
    let d = dist(mouseX, mouseY, this.x, this.y);
    

        if(this.y > height || d <= r + this.d){
          this.y = random(-1.3*height, -1);
          this.x = random(0,width);
          this.d = random(40,50);
        }
        
    if(NumCircle == 0){
      this.y = random(-2*height, -1);
    }

    if(poses.length <= 0){
      this.y = random(-2*height, -10);
    }


    for (let i = 0; i < poses.length; i++) {
      let pose = poses[i];
      for (let j = 0; j < pose.keypoints.length; j++) {
        if(j == 0 || (6 < j && j < 11) ){
          d = dist(cx[j], cy[j], this.x, this.y + this.len);
        }

        if(this.y > height || d <= r/2 || counter == 0){
          this.y = random(-2*height, -1);
        }
        
        if((cx[j] - r/2 < this.x && cx[j] + r/2 > this.x) && this.y > cy[j] - r/2){
          this.y = random(-2*height, -1);
        }
      }
    }
  
  }
}