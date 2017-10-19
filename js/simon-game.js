$("document").ready( function () {

var device = {
  numCorrect: 0,
  winScore: 20,
  turn: true,
  score: 0,
  speed: 0,
  strict: 0, //0 or 1 (false or true)
  start: false,
  sequence: [],
  button: [
    // 0, green, upper-left
    { id: "#green0",
      sound: new sound("http://res.cloudinary.com/dcenatiempo/video/upload/v1499548753/green_cl8zdp.m4a"), // E - lower octive
      colorOff: "#00b359",
      colorOn: "#99ffcc" },
    // 1, red, upper-right
    { id: "#red1",
      sound: new sound("http://res.cloudinary.com/dcenatiempo/video/upload/v1499548753/red_d3r8or.m4a"), // A
      colorOff: "#cc3300",
      colorOn: "#ffc266" },
    // 2, yellow, lower-left
    { id: "#yellow2",
      sound: new sound("http://res.cloudinary.com/dcenatiempo/video/upload/v1499548752/yellow_am0xi0.m4a"), // C#
      colorOff: "#e6e600",
      colorOn: "#ffffb3" },
    // 3, blue, lower-right
    { id: "#blue3",
      sound: new sound("http://res.cloudinary.com/dcenatiempo/video/upload/v1499548752/blue_n6wtpd.m4a"), // E - upper octive
      colorOff: "#1a75ff",
      colorOn: "#66ffff" }
]}

// main game loop
var gameLoop = setInterval(function(){
  if (device.start == true){
    if (device.turn) {
      if (device.score === device.sequence.length) {
        device.sequence.push(getRand(0,3)); // add a tone to sequence
        $("#score").text(device.sequence.length);
        // Usage!
        sleep(500).then(() => { playTone(); });
        device.numCorrect = 0; // reset numCorrect for current round
        switch (device.sequence.length){
          case 5:
            device.speed = device.speed + 1; break;
          case 9:
            device.speed = device.speed + 1; break;
          case 13:
            device.speed = device.speed + 1;
        }
      }
    }
  }
}, 200);

// computer play back of current tone sequence
function playTone() {
  device.turn = true; // 
  var count = 0;
  var loop = setInterval(function(){ 
    var i = count;
    // turn light/sound on
    $(device.button[device.sequence[i]].id).css("fill", device.button[device.sequence[i]].colorOn);
    device.button[device.sequence[i]].sound.play();
    //turn light off, stop sound
    setTimeout( function (){
      $(device.button[device.sequence[i]].id).css("fill", device.button[device.sequence[i]].colorOff);
      device.button[device.sequence[i]].sound.stop();
      device.button[device.sequence[i]].sound.load();
    } , 550-(device.speed*100));
    count++;
    if (count == device.sequence.length){
      device.turn = false;
      clearInterval(loop);
    }
  }, 600-(device.speed*100));
}

// on press, click, sound, light
$("path").click(function(){
  var temp = $(this).attr('id').split("");    // takes this "red1"
  var id = temp[temp.length-1];               // creates this "1"
  var button = device.button[id];
  var onColor = device.button[id].colorOn;
  var offColor = device.button[id].colorOff;
  clicky.play();                              // play button press click

  // reset all buttons to off - in case user clicks really fast
  if(!device.turn)
      resetButtons();
  setTimeout( function (){
    // if it is the players turn, do the following, else do nothing...
    if (!device.turn) {
      // if correct button pressed...
      if (id == device.sequence[device.numCorrect]) {
          device.numCorrect++;                  // increase number correct in current sequence
          $(button.id).css("fill", onColor);    // light up button
          button.sound.play();                  // play button tone
          setTimeout ( function (){             // turn off button light
            $(button.id).css("fill", offColor);
          }, 600);
          // if player got all correct in current sequence
          if (device.numCorrect == device.sequence.length){
            device.score++;                             // increase score
            $("#score").text(device.sequence.length);   // update digital display
            device.turn = true;                         // devices turn
            if (device.numCorrect == device.winScore)   // did player win???
              win();
          }
      }
      // if wrong button pressed in strict mode...
      else if (device.strict == 1) {
        device.start=  false;                   // game over!!
        device.turn = true;                     //
        $(button.id).css("fill", onColor);      // light up button
        buzzer.play();                          // play buzzer
        setTimeout ( function (){               // turn off button light
            $(button.id).css("fill", offColor);
        }, 2500);
      }
      // if wrong button pressed NOT in strict mode...
      else {
        device.numCorrect = 0;                  // reset numCorrect
        $(button.id).css("fill", onColor);      // light up button
        buzzer.play();                          // play buzzer
        setTimeout ( function (){               // turn off buzzer/light
          $(button.id).css("fill", offColor);
          buzzer.stop();
          buzzer.load();
        }, 1000);
        sleep(800).then(() => { playTone(); }); // replay sequence
      }
    }
  } , 100);
});

//when start is clicked, reset game and start a new one
$("#start").click(function(){
  resetButtons();	
  device.start = true;
  device.turn = true;
  device.sequence = [];
  device.numCorrect = 0;
  device.score = 0;
  device.speed = 0;
});

// toggles strict mode
$("#strict").click(function(){
  device.strict = Math.abs(device.strict-1);
  console.log("strict" + device.strict)
  if (device.strict == 1)
    $("#strict").addClass("pressed");
  else $("#strict").removeClass("pressed");
});

function resetButtons () {
    for (i=0; i<device.button.length; i++){
      $(device.button[i].id).css("fill", device.button[i].colorOff);
      device.button[i].sound.stop();
      device.button[i].sound.load(); // must reload or sound starts where it was started
    }
}

function win() {
  device.start = false;
  console.log("you won!");
  var winning = setInterval (function (){
    for (i=0; i<device.button.length; i++)
      $(device.button[i].id).css("fill", device.button[i].colorOn);
    setTimeout (function (){
        for (i=0; i<device.button.length; i++)
      $(device.button[i].id).css("fill", device.button[i].colorOff);
    }, 100);
  }, 200);
  setTimeout (function (){
    for (i=0; i<device.button.length; i++)
      $(device.button[i].id).css("fill", device.button[i].colorOff);
    clearInterval(winning);
  },4000);
}

// random number generator, inclusive
function getRand(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  //The maximum is inclusive and the minimum is inclusive 
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// sound constructor https://www.w3schools.com/graphics/game_sound.asp
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
    this.load = function(){
        this.sound.load();
    }
}

// create sound effects
var clicky = new sound('http://res.cloudinary.com/dcenatiempo/video/upload/v1499727069/click_rnmyzb.wav');
var click1 = new sound('http://res.cloudinary.com/dcenatiempo/video/upload/v1499548433/click1_rdidib.wav');
var click2 = new sound('http://res.cloudinary.com/dcenatiempo/video/upload/v1499548433/click2_is8oyj.wav');
var buzzer = new sound("http://res.cloudinary.com/dcenatiempo/video/upload/v1499571473/buzzer_cogzhf.m4a");

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

}); // close $((document).ready()