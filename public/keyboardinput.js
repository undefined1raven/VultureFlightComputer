var bw = 0;
var bs = 0;
var ba = 0;
var bd = 0;
var bq = 0;
var be = 0;
var bspc = 0;
var bc = 0;
function main(){
    
    var pitch = document.getElementById('w');
    var roll = document.getElementById('a');
    var yaw = document.getElementById('q');
    var thrust = document.getElementById('thrust');
    document.addEventListener('keydown', e =>{
        if(e.key == "w"){     
          bw = 1;
        }
        if(e.key == "s"){     
            bs = 1;
        }
        if(e.key == "a"){     
            ba = 1;
        }
        if(e.key == "d"){     
            bd = 1;
        }
        if(e.key == "q"){     
            bq = 1;
        }
        if(e.key == "e"){     
            be = 1;
        }
        if(e.keyCode == 32){     
            bspc = 1;
        }
        if(e.key == "c"){     
            bc = 1;
        }
    })
    document.addEventListener('keyup', e =>{
        if(e.key == "w"){
            bw = 0;
        }
        if(e.key == "s"){     
            bs = 0;
        }
        if(e.key == "a"){     
            ba = 0;
        }
        if(e.key == "d"){     
            bd = 0;
        }
        if(e.key == "q"){     
            bq = 0;
        }
        if(e.key == "e"){     
            be = 0;
        }
        if(e.keyCode == 32){     
            bspc = 0;
        }
        if(e.key == "c"){     
            bc = 0;
        }
    })
    var offset = 2;
    if(bw == "1" && parseInt(pitch.innerText) < 100){
        pitch.innerText = parseInt(pitch.innerText) + offset;
    }
    if(bs == "1" && parseInt(pitch.innerText) > -100){
        pitch.innerText = parseInt(pitch.innerText) - offset;
    }
    if(ba == "1" && parseInt(roll.innerText) > -100){
        roll.innerText = parseInt(roll.innerText) - offset;
    }
    if(bd == "1" && parseInt(roll.innerText) < 100){
        roll.innerText = parseInt(roll.innerText) + offset;
    }
    if(bq == "1" && parseInt(yaw.innerText) > -100){
        yaw.innerText = parseInt(yaw.innerText) - offset;
    }
    if(be == "1" && parseInt(yaw.innerText) < 100){
        yaw.innerText = parseInt(yaw.innerText) + offset;
    }
    if(bspc == "1" && parseInt(thrust.innerText) < 100){
        thrust.innerText = parseInt(thrust.innerText) + 1; 
    }
    if(bc == "1" && parseInt(thrust.innerText) > 0){
        thrust.innerText = parseInt(thrust.innerText) - 1; 
    }
}


setInterval(main, 25);