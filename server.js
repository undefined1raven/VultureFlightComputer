const http = require('http');
const express = require('express');
const app = express();
const server = http.Server(app);
const socketio = require('socket.io');
const path = require('path');
const { isContext } = require('vm');
const io_i= socketio(server);
const forever = require('forever');
const five = require('johnny-five');
const acnt_link = '1f81601c-f713-4313-8fdb-f0c4c531c806';
let Servo_, Board_, Proximity_, Accelerometer_, IMU_, GPS_, board_, Pin_;


process.on('exit', () => {
    forever.restart();
});
var hardware_enabled = false;
//run forever for remote reboot capabilities

var sec_acc_acivs = true;
var imu_acivs = true;
var s1_acivs = false;
var s2_acivs = false;
var s3_acivs = false;
var s4_acivs = false;
var s5_acivs = false;
var gps_acivs = false;
var alt_acivs = true;

let sensor_array_active_status = [sec_acc_acivs, imu_acivs, s1_acivs, s2_acivs, s3_acivs, s4_acivs, s5_acivs, gps_acivs, hardware_enabled, alt_acivs];
if(hardware_enabled == false){
  sensor_array_active_status = [false, false, false, false, false, false, false, false];
}

if(hardware_enabled == true){
  const {Servo, Board, Proximity, Accelerometer, IMU, GPS, Pin} = require("johnny-five");
  Servo_ = Servo;
  Board_ = Board;
  Proximity_ = Proximity;
  Accelerometer_ = Accelerometer;
  IMU_ = IMU;
  GPS_ = GPS;
  const board = new Board({port: "COM5"});
  board_ = board;
  Pin_ = Pin;
}


var io = require('socket.io-client');
const { SCHED_NONE } = require('cluster');
const nodemon = require('nodemon');
app.use(express.static(path.join(__dirname, 'public')));

//web_app: https://boiling-citadel-40139.herokuapp.com/
//local: http://localhost:3300/
//H2 local: https://localhost:3900/

var socket = io.connect("http://localhost:3300/", {reconnection: true});
var imu_connected_status;
var imu_connection_status_bin = 0;
var axdl_connection_status_bin = 0;
var sonar_1_connection_status_bin = 0;
var sonar_2_connection_status_bin = 0;
var sonar_3_connection_status_bin = 0;
var sonar_4_connection_status_bin = 0;
var sonar_5_connection_status_bin = 0;
var gps_position_connection_status_bin = 0;
var gps_nav_connection_status_bin = 0;
var barometer_connection_status_bin = 0;
var axdl_connection_status;
var sonar_1_connection_status;
var sonar_2_connection_status;
var sonar_3_connection_status;
var sonar_4_connection_status;
var sonar_5_connection_status;
var gps_position_connection_status;
var gps_nav_connection_status;
var barometer_connection_status;

var RTH = 0;
var imu_pin_;
var axdl_pin_;

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err}`);
});

socket.on('connect', () => {
  socket.on('m1_manual_thrust_lvl_rebound', (rcvd_m1_thrust_lvl) => {
    if(rcvd_m1_thrust_lvl >= 0 && rcvd_m1_thrust_lvl <= 100){
      //m1.throttle(rcvd_m1_thrust_lvl);
      console.log(`M1 | --${rcvd_m1_thrust_lvl} | ${Date.now()}`);
    }
  });
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  
  setInterval(() => {
    socket.emit('sonar_1_rebound', getRandomInt(400));
    socket.emit('sonar_2_rebound', getRandomInt(400));
    socket.emit('sonar_3_rebound', getRandomInt(400));
    socket.emit('sonar_4_rebound', getRandomInt(400));
    socket.emit('sonar_5_rebound', getRandomInt(400));
  }, 1000);
  
  socket.emit('vulture_online_signal', "uplink established");
  socket.emit('vulture_ownr_link', acnt_link);
  socket.on('parsed_cli_cmd', cmd_payload => {
    var scmd_payload = cmd_payload.split(":");
    if(scmd_payload[0].toUpperCase() == "RTH"){
      if(scmd_payload[1] == "1"){
        RTH = 1;
      }
      if(scmd_payload[1] == "0"){
        RTH = 0;
      }
      socket.emit('cli_cmd_confirmation', `RTH:${RTH}`);
    }
    if(scmd_payload[0].toUpperCase() == "REBOOT"){
      if(scmd_payload[1] == "1"){
        socket.emit('cli_cmd_confirmation', "REBOOT:1");
        process.exit();
      }
    }
    if(scmd_payload[0].toUpperCase() == "PING"){
      if(scmd_payload[1] == "0"){
        socket.emit('cli_cmd_confirmation', "PING:0");
      }
      if(scmd_payload[1] == "1"){
        socket.emit('cli_cmd_confirmation', "PING:1");
      }
      if(scmd_payload[1] == "2"){
        socket.emit('cli_cmd_confirmation', "PING:2");
      }
    }
 });

  socket.on('vulture_server_reboot_server_relay', () => {
    console.log("server reboot command received");
    process.exit();
  });
  socket.on('omega_reboot_signal_relay', () => {
    console.log("server reboot command received");
    process.exit();
  })
    console.log("uplink established");
    if(hardware_enabled){
board_.on("ready", () => {
  const m1 = new five.ESC({pin: 9, pwmRange:[1000, 2000]});//pwmRange:[1290, 2000]
  console.log('working_bitch');
  socket.on('m1_manual_thrust_lvl_rebound', (rcvd_m1_thrust_lvl) => {
    if(rcvd_m1_thrust_lvl >= 0 && rcvd_m1_thrust_lvl <= 100){
      m1.throttle(rcvd_m1_thrust_lvl);
      console.log(`M1 | --${rcvd_m1_thrust_lvl} | ${Date.now()}`);
    }
  });
  socket.on('m2_manual_thrust_lvl_rebound', (rcvd_m2_thrust_lvl) => {
    if(rcvd_m2_thrust_lvl >= 0 && rcvd_m2_thrust_lvl <= 100){
      console.log(`M2 | --${rcvd_m2_thrust_lvl} | ${Date.now()}`);
    }
  });
  socket.on('m3_manual_thrust_lvl_rebound', (rcvd_m3_thrust_lvl) => {
    if(rcvd_m3_thrust_lvl >= 0 && rcvd_m3_thrust_lvl <= 100){
      console.log(`M3 | --${rcvd_m3_thrust_lvl} | ${Date.now()}`);
    }
  });
  socket.on('m4_manual_thrust_lvl_rebound', (rcvd_m4_thrust_lvl) => {
    if(rcvd_m4_thrust_lvl >= 0 && rcvd_m4_thrust_lvl <= 100){
      console.log(`M4 | --${rcvd_m4_thrust_lvl} | ${Date.now()}`);
    }
  });

  const imu_pin = new five.Pin({
    pin: 2
  });
  const axdl_pin = new five.Pin({
    pin: 4
  });

      axdl_pin.high();
      imu_pin.low();
     if(sensor_array_active_status[0] == true){
      const imu = new IMU_({
        controller: "MPU6050",
        address: 0x68
      });
      imu.on('change', () =>{
        const imu_data_pkg = [imu.thermometer.celsius - 18, imu.accelerometer.x, imu.accelerometer.y, imu.accelerometer.z, imu.accelerometer.pitch, imu.accelerometer.roll, imu.accelerometer.acceleration, imu.accelerometer.inclination, imu.accelerometer.orientation,
        imu.gyro.x, imu.gyro.y, imu.gyro.z, imu.gyro.pitch, imu.gyro.roll, imu.gyro.yaw, imu.gyro.rate, imu.gyro.isCalibrated];
        socket.emit('imu_data_pkg_broadcast', imu_data_pkg);
        socket.emit('gamma_board_hs');
        imu_connection_status_bin = Date.now();
       // console.log(detect_hardware_connection);
        });
     }
     
      if(sensor_array_active_status[1] == true){
        const accelerometer = new Accelerometer_({
          controller: "ADXL345",
          address: 0x53
        })
        accelerometer.on('change', () =>{
          const {acceleration, inclination, orientation, pitch, roll, x, y, z} = accelerometer;
          const data_pkg = [acceleration, inclination, orientation, pitch, roll, x, y, z];
          //socket.emit('gyro_data', pitch * (-1));
          socket.emit('gyro_data_pkg', data_pkg);
          socket.emit('gamma_board_hs');
          axdl_connection_status_bin = Date.now();
          //console.log("Pitch: " + data_pkg[3] + " | Roll: " + data_pkg[4]);
        })
      }
      if(sensor_array_active_status[9] == true){
        var barometer = new five.Multi({
          controller: "BMP280",
          address: 0x76,
          elevation: 0,//76
        });
      
        barometer.on("change", function() {
          var alt_acx = (((Math.pow((101325 / (this.barometer.pressure * 1000)), (1 / 5.257)) - 1) * this.thermometer.kelvin) / 0.0065);
          socket.emit('barometer_pkg', [this.barometer.pressure, barometer.thermometer.celsius, alt_acx]);
          barometer_connection_status_bin = Date.now();
          //console.log(this.barometer.pressure * 1000);
          //console.log(alt_acx);
          //console.log(altimeter.thermometer.celsius);
        });
      }


      if(sensor_array_active_status[7] == true){
        var gps = new GPS_({
          pins: {
            rx: 2,
            tx: 3,
          }
        });
      
         gps.on("change", position => {
          const {altitude, latitude, longitude} = position;
          var gps_position_pkg = [longitude, latitude, altitude];
          socket.emit('gps_position_pkg', gps_position_pkg);
          gps_position_connection_status_bin = Date.now();
          console.log("GPS Position:");
          socket.emit('gamma_board_hs');
          console.log("  latitude   : ", position.latitude);
          console.log("  longitude  : ", position.longitude);
          console.log("  altitude   : ", position.altitude);
          console.log("--------------------------------------");
          
        });
        gps.on('message', (nmea_stnc) => {
          console.log(`${nmea_stnc} lmao`);
        });
        gps.on("operations", _sat_ops =>{
           socket.emit('sat_ops', _sat_ops);
           socket.emit('gamma_board_hs');
          // console.log(" sat_ops    : ", sat_ops);
        });
        // If speed, course change log it
        gps.on("navigation", velocity => {
          const {course, speed} = velocity;
          var gps_nav_pkg = [course, speed];
          socket.emit('gps_nav_pkg', gps_nav_pkg);
          gps_nav_connection_status_bin = Date.now();
          socket.emit('gamma_board_hs');
          console.log("GPS Navigation:");
          console.log("  course  : ", course);
          console.log("  speed   : ", speed);
          console.log("--------------------------------------");
          
        });
      }
     // });

     if(sensor_array_active_status[2] == true){
        const soanr_1 = new Proximity_({
          controller: "HCSR04",
          pin: 7
        });
        soanr_1.on("change", () => {
          const {centimeters} = soanr_1;
          socket.emit('sonar_1_rebound', centimeters);
          socket.emit('gamma_board_hs');
          sonar_1_connection_status_bin = Date.now();
        });
      }
     
      if(sensor_array_active_status[3] == true){
        const soanr_2 = new Proximity_({
          controller: "HCSR04",
          pin: 11
        });
        soanr_2.on("change", () => {
          const {centimeters} = soanr_2;
          socket.emit('sonar_2_rebound', centimeters);
          socket.emit('gamma_board_hs');
          sonar_2_connection_status_bin = Date.now();
        });
       }

       if(sensor_array_active_status[4] == true){
        const soanr_3 = new Proximity_({
          controller: "HCSR04",
          pin: 5
        });
        soanr_3.on("change", () => {
          const {centimeters} = soanr_3;
          socket.emit('sonar_3_rebound', centimeters);
          socket.emit('gamma_board_hs');
          sonar_3_connection_status_bin = Date.now();
        });
       }

       if(sensor_array_active_status[5] == true){
        const soanr_4 = new Proximity_({
          controller: "HCSR04",
          pin: 6
        });
        soanr_4.on("change", () => {
          const {centimeters} = soanr_4;
          socket.emit('sonar_4_rebound', centimeters);
          socket.emit('gamma_board_hs');
          sonar_4_connection_status_bin = Date.now();
        });
       }

       if(sensor_array_active_status[6] == true){
        const soanr_5 = new Proximity_({
          controller: "HCSR04",
          pin: 9
        });
        soanr_5.on("change", () => {
          const {centimeters} = soanr_5;
          socket.emit('sonar_5_rebound', centimeters);
          socket.emit('gamma_board_hs');
          sonar_5_connection_status_bin = Date.now();
        });
       }
       socket.on('imu_restart_signal_sr', () => {
         //imu_pin_ = imu_pin;
        imu_pin.high();
        setTimeout(() => {
          imu_pin.low();
        }, 100);
       });
       
       const b_led = new five.Led(7);
       const r_led = new five.Led(6);
       setInterval(() => {
         b_led.on();
         setTimeout(() => {
             b_led.off();
         }, 200);
         setTimeout(() => {
             b_led.on();
         }, 300);
         setTimeout(() => {
             b_led.off();
         }, 500);
     
       }, 1200);
       
       setInterval(() => {
         r_led.fadeIn();
         setTimeout(() => {
           r_led.fadeOut();
         }, 500)
       }, 1500)

   });
   }
    setInterval(() =>{
     
        if(Math.abs(imu_connection_status_bin - Date.now()) > 200){
          imu_connected_status = false;
        }
        else{
          imu_connected_status = true;
        }
        if(Math.abs(axdl_connection_status_bin - Date.now()) > 300){
          axdl_connection_status = false;
        }
        else{
          axdl_connection_status = true;
        }
        if(Math.abs(sonar_1_connection_status_bin - Date.now()) > 600){
          sonar_1_connection_status = false;
        }
        else{
          sonar_1_connection_status = true;
        }
        if(Math.abs(sonar_2_connection_status_bin - Date.now()) > 600){
          sonar_2_connection_status = false;
        }
        else{
          sonar_2_connection_status = true;
        }
        if(Math.abs(sonar_3_connection_status_bin - Date.now()) > 600){
          sonar_3_connection_status = false;
        }
        else{
          sonar_3_connection_status = true;
        }
        if(Math.abs(sonar_4_connection_status_bin - Date.now()) > 600){
          sonar_4_connection_status = false;
        }
        else{
          sonar_4_connection_status = true;
        }
        if(Math.abs(sonar_5_connection_status_bin - Date.now()) > 600){
          sonar_5_connection_status = false;
        }
        else{
          sonar_5_connection_status = true;
        }
        if(Math.abs(gps_position_connection_status_bin - Date.now()) > 1200){
          gps_position_connection_status = false;
        }
        else{
          gps_position_connection_status = true;
        }
        if(Math.abs(gps_nav_connection_status_bin - Date.now()) > 600){
          gps_nav_connection_status = false;
        }
        else{
          gps_nav_connection_status = true;
        }
        if(Math.abs(barometer_connection_status_bin - Date.now()) > 600){
          barometer_connection_status = false;
        }
        else{
          barometer_connection_status = true;
        }
        var sensor_array_hardware_cs = [imu_connected_status, axdl_connection_status, sonar_1_connection_status, sonar_2_connection_status, sonar_3_connection_status, sonar_4_connection_status, sonar_5_connection_status, gps_position_connection_status, barometer_connection_status];
        socket.emit('sensor_array_hardware_cs', sensor_array_hardware_cs);
        
        socket.emit('sensor_array_es', sensor_array_active_status);
    }, 250)

    setInterval(() =>{
      socket.emit('local_server_ping_emitter', Date.now());
   }, 50)
  
    socket.on('local_relay_ping', () =>{
      socket.emit('local_relay_ping_back');
    })
    socket.on('input_pkg_local_relay_emitter', joystick_input_pkg =>{
      io_i.emit('input_pkg_local_relay', joystick_input_pkg);
      socket.emit('input_pkg_local_rebound', joystick_input_pkg);
    });
    socket.on('be_rth_status_rqst', () => {
      socket.emit('rth_status_rqst_payload', RTH);
    });


    socket.on('client_event', function(data){
       // console.log(data);
    })
  })


server.listen(3400);


//cuz vendor fuck up
// const five = require('johnny-five');
// const board = new five.Board({port: "COM8"});

// board.on('ready', () => {
//     console.log('br');
//     const compass = new Compass({
//       controller: "fuckyou"
//     });
  
//     compass.on("change", () => {
//       const {bearing, heading} = compass;
//       console.log("Compass:");
//       console.log("  bearing     : ", bearing);
//       console.log("  heading     : ", heading);
//       console.log("--------------------------------------");
//     });
// });