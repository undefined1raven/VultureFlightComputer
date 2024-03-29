const http = require('http');
const express = require('express');
const app = express();
const server = http.Server(app);
const socketio = require('socket.io');
const path = require('path');
const io_i = socketio(server, { path: "/real-time/" });
const forever = require('forever');
const five = require('johnny-five');
const encryptor = require('simple-encryptor')('FJSLG345KJKL43LJKF04KF4MJF034JF0P34KFKWJAPVPSMVNVPXPWFMKNBUBYU');//process.env.WEB_RELAY_ENCRYPTION_KEY
const vid = 'a5ef02a9-7838-42bc-b4e8-f156cc1f06c7';//  1f81601x-f713-4313-8fdb-f0c4c531c806 [permanent vulture id ref req for data transit]
let Servo_, Board_, Proximity_, Accelerometer_, IMU_, GPS_, board_, Pin_;


function RangeScaler(
  num,
  in_min,
  in_max,
  out_min,
  out_max
) {
  return (
    ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  )
}

///--Omega Hardware Interface Board COMMS--///


var visual_core_iox = require('socket.io-client');
var visual_core_sktx = visual_core_iox.connect("ws://localhost:5000/", { reconnection: true });

visual_core_sktx.on('connect', (s) => {
  console.log('Visual Processing IXServer Uplink Established');
  setInterval(() => {
    visual_core_sktx.emit('req_objects', Date.now());
  }, 50)
  visual_core_sktx.on('idk', payload => {
    console.log(payload)
  })
})

///--Omega Hardware Interface Board COMMS--///

var omega_iox = require('socket.io-client');
var omega_sktx = omega_iox.connect("ws://localhost:7200/", { reconnection: true });
var omega_controller_last_unx = 0;
var omega_controller_cs = false;

omega_sktx.on('connect', (x) => {
  console.log(`Omega Uplink Active | UNX [${Date.now()}]`)

  omega_sktx.on('baseThrustLvl', thrust_lvl => {
    baseThrustLvl = thrust_lvl
  });

  setInterval(() => {
    omega_sktx.emit('FLT_CTRL', FLT_OBJ)
    omega_sktx.emit('FLT_EAX', FLT_EAX)
    if (Math.abs(omega_controller_last_unx - Date.now()) > 1000) {
      omega_controller_cs = false;
    }
    else {
      omega_controller_cs = true;
    }
  }, 10);
});

var xt;

let baseThrustLvl = -1
io_i.on('connection', (x) => {
  xt = x;

  x.on('local_fwd_cam_rtc_req', offer => {
    socket.emit('fwd_cam_rtc_req', offer);
  });

  x.on('local_fwd_cam_rtc_res', data => {
    socket.emit('relayed_fwd_cam_rts_res', data)
  });

  x.on('omega_heartbeat', px => {
    console.log(`Omega Downlink Active | UNX [${Date.now()}]`)
  });



  x.on('omega_ct', unx => {
    omega_controller_last_unx = unx.payload;
  });
  x.on('ix_imu_data_pkg_broadcast', omega_telemetry_pkg => {
    socket.emit('imu_data_pkg_broadcast', omega_telemetry_pkg.payload);
  });
});


///HIB Connection Status Handler///
setInterval(() => {
  socket.emit('omega_controller_cs', omega_controller_cs);
}, 200);

///--Autonomy Preferances Storage--///
var rth_pref_arr = [true, true, true]; //[2]true == auto | false == traceback
var ca_pref_arr = [true, 2, true]; //[1]m
var obj_recog_pref_arr = [true];
var obj_tracking_pref_arr = [];
var wnav_pref_arr = [false];


///--Global general purpose functions [gg]--///
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

////--Process Up Insurance--////

process.on('exit', () => {
  forever.restart();
});

//enables or disables hardware link req for dev purposes [dev]
var hardware_enabled = true;
//run forever for remote reboot capabilities

//enables or disables telemetry broadcast of specific sensors dev purposes [dev]
var sec_acc_acivs = true;
var imu_acivs = true;
var s1_acivs = false;
var s2_acivs = false;
var s3_acivs = false;
var s4_acivs = false;
var s5_acivs = false;
var gps_acivs = false;
var alt_acivs = true;

//array telemetry relay status to Advanced_Telemetry F/E
let sensor_array_active_status = [sec_acc_acivs, imu_acivs, s1_acivs, s2_acivs, s3_acivs, s4_acivs, s5_acivs, gps_acivs, hardware_enabled, alt_acivs];
if (hardware_enabled == false) {
  sensor_array_active_status = [true, true, true, true, true, true, true, true];
}

if (hardware_enabled == true) {
  const { Servo, Board, Proximity, Accelerometer, IMU, GPS, Pin } = require("johnny-five");
  Servo_ = Servo;
  Board_ = Board;
  Proximity_ = Proximity;
  Accelerometer_ = Accelerometer;
  IMU_ = IMU;
  GPS_ = GPS;
  const board = new Board({ port: "/dev/ttyUSB0" });
  board_ = board;
  Pin_ = Pin;
}


var io = require('socket.io-client');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/fwd_cam_broadcaster', (req, res) => {
  res.sendFile('/home/revs/hot_storage/local_relay/public/fwd_cam_broadcaster.html')
});

//web_app: wss://vulture-uplink.herokuapp.com/
//web_app_cx: wss://vulture-uplink.com/
//local: ws://localhost:3300/
//H2 local: ws://localhost:3900/
///vf
//vue
var socket = io.connect("ws://localhost:7780/", { reconnection: true, path: "/real-time/" }); //, path: "/real-time/"
// var socket = io.connect("wss://vulture-uplinkv.herokuapp.com/", { reconnection: true, path: "/real-time/" });

//non vue
// var socket = io.connect("ws://localhost:3300/", { reconnection: true });
// var socket = io.connect("wss://vulture-uplink.com/", { reconnection: true });

////--Hardware Status Overview vars--////
var imu_connection_status = false;
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
var axdl_connection_status = false;
var sonar_1_connection_status = false;
var sonar_2_connection_status = false;
var sonar_3_connection_status = false;
var sonar_4_connection_status = false;
var sonar_5_connection_status = false;
var gps_position_connection_status = true;
var gps_nav_connection_status = false;
var barometer_connection_status = true;
var magnetometer_connection_status = true;

var RTH = 0;
var CA = 0;
var WNAV = 0;
var OBJ_RECOG = 0;

var FLT_OBJ = { rollRate: 0, pitchRate: 0, yawRate: 0, altRate: 0 };
var FLT_EAX = false;

//experimental hard reset for specific sensors
var imu_pin_;
var axdl_pin_;

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err}`);
});


/// FLT CRITICAL /// 
let TELCO = false;


let currentAltRate = 0
let currentPitchRate = 0
let currentRollRate = 0

let currentM1 = 0;
let currentM2 = 0;
let currentM3 = 0;
let currentM4 = 0;

let lastM1 = 0;
let lastM2 = 0;
let lastM3 = 0;
let lastM4 = 0;

let currentPitch = 0;
var pitchAcArray = [];
pitchAcArray.length = 30;
pitchAcArray.fill(0, 0, 29)
let targetPitch = 0;

let currentRoll = 0;
var rollAcArray = [];
rollAcArray.length = 30
rollAcArray.fill(0, 0, 29)
let targetRoll = 0;

////--this ⇄ Server | Telemetry Relay to: Advanced_Telemetry F/E, Command--////
socket.on('connect', (s) => {
  socket.emit('vulture_handshake', { handshake_vid: vid });

  setInterval(() => {
    socket.emit('baseThrustLvl', { m1: currentM1, m2: currentM2, m3: currentM3, m4: currentM4, pitch: currentPitch, roll: currentRoll, EAX: FLT_EAX, unix: Date.now(), TELCO: TELCO })
  }, 100);

  socket.on('relayed_fwd_cam_rtc_res', answer => {
    xt.emit('local_fwd_cam_rtc_res', answer);
  });

  /// Global Relay handshake ///
  socket.on('relayed_fwd_cam_rtc_req', (data) => {
  });//fwd_cam_broadcaster ⇄ this | Initial peer signaling | Relayed to: Advanced_Telemetry F/E


  socket.on('relayed_request_vulture_uplink', relayed_request_vulture_uplink_payload => {
    console.log(`downlink request received at ${Date.now()}`)
    if (xt != undefined) {
      xt.emit('downlink_request_signal');
    }
  });






  socket.on('onEAX', () => {
    FLT_EAX = !FLT_EAX
  })
  socket.on('onFCRestart', () => {
    process.exit();
  })
  socket.on('onTELCO', (status) => {
    TELCO = status;
  })
  socket.on('onPowerOp', powerOp => {
    console.log(powerOp.type)
    var exec = require('child_process').exec;
    if (powerOp.type == 'shutdown') {

      function shutdown(callback) {
        exec('sudo shutdown now', function (error, stdout, stderr) { callback(stdout); });
      }

      shutdown(() => { });
    } else if (powerOp.type == 'reboot') {
      function reboot(callback) {
        exec('sudo shutdown -r now', function (error, stdout, stderr) { callback(stdout); });
      }

      reboot(() => { });
    }
  })
  socket.on('FlightInputOnChange', FlightInputOnChangePayload => {
    if (FlightInputOnChangePayload.vid == vid) {
      FLT_OBJ = FlightInputOnChangePayload.telemetry
      currentAltRate = FlightInputOnChangePayload.telemetry.altRate
      currentPitchRate = FlightInputOnChangePayload.telemetry.pitchRate
      currentRollRate = FlightInputOnChangePayload.telemetry.rollRate
      targetPitch = parseFloat(currentPitchRate).toFixed(2);
      targetRoll = parseFloat(currentRollRate).toFixed(2);
    }
  });

  socket.on('fwd_video_feed_connection_ilr_x', d => {
    xt.emit('fwd_video_feed_connection_ilr_x', d)
  })

  ////--Advanced_Telemetry F/E ⇄ Server ⇄ this | Autonomy Pref Sync&Transmission--////
  socket.on('rth_pref_arr_xq', _rth_pref_arr => {
    rth_pref_arr = _rth_pref_arr;
    socket.emit('vulture_local_autonomy_pref_broadcast', { vid: vid, rth: rth_pref_arr, ca: ca_pref_arr, obj_recog: obj_recog_pref_arr, wnav: wnav_pref_arr, obj_tracking: obj_tracking_pref_arr });
  });
  socket.on('ca_pref_arr_xq', _ca_pref_arr => {
    ca_pref_arr = _ca_pref_arr;
    socket.emit('vulture_local_autonomy_pref_broadcast', { vid: vid, rth: rth_pref_arr, ca: ca_pref_arr, obj_recog: obj_recog_pref_arr, wnav: wnav_pref_arr, obj_tracking: obj_tracking_pref_arr });
  });
  socket.on('wnav_pref_arr_xq', _wnav_pref_arr => {
    wnav_pref_arr = _wnav_pref_arr;
    socket.emit('vulture_local_autonomy_pref_broadcast', { vid: vid, rth: rth_pref_arr, ca: ca_pref_arr, obj_recog: obj_recog_pref_arr, wnav: wnav_pref_arr, obj_tracking: obj_tracking_pref_arr });
  });
  socket.on('obj_recog_pref_arr_xq', _obj_recog_pref_arr => {
    obj_recog_pref_arr = _obj_recog_pref_arr;
    socket.emit('vulture_local_autonomy_pref_broadcast', { vid: vid, rth: rth_pref_arr, ca: ca_pref_arr, obj_recog: obj_recog_pref_arr, wnav: wnav_pref_arr, obj_tracking: obj_tracking_pref_arr });
  });
  socket.on('vulture_autonomy_prefs_req_xq', () => {
    socket.emit('vulture_local_autonomy_pref_broadcast', { vid: vid, rth: rth_pref_arr, ca: ca_pref_arr, obj_recog: obj_recog_pref_arr, wnav: wnav_pref_arr, obj_tracking: obj_tracking_pref_arr });
  });
  socket.on('rth_status_xq', rth_status => {
    if (rth_status) {
      RTH = 1;
    }
    else {
      RTH = 0;
    }
    socket.emit('vulture_local_autonomy_rth_status_broadcast', RTH);
  });
  socket.on('ca_status_xq', _ca_status => {
    CA = _ca_status;
    socket.emit('vulture_local_autonomy_ca_status_broadcast', CA);
  });
  socket.on('wnav_status_xq', _wnav_status => {
    if (_wnav_status) {
      WNAV = 1;
    }
    else {
      WNAV = 0;
    }
    socket.emit('vulture_local_autonomy_wnav_status_broadcast', WNAV);
  });
  socket.on('obj_recog_status_xq', (_obj_recog_status) => {
    if (_obj_recog_status) {
      OBJ_RECOG = 1;
    }
    else {
      OBJ_RECOG = 0;
    }
    socket.emit('vulture_local_autonomy_obj_recog_status_broadcast', OBJ_RECOG);
  });
  socket.on('vulture_local_autonomy_rth_status_broadcast_req_xq', () => {
    socket.emit('vulture_local_autonomy_rth_status_broadcast', RTH);
  });
  socket.on('vulture_local_autonomy_wnav_status_broadcast_req_xq', () => {
    socket.emit('vulture_local_autonomy_wnav_status_broadcast', WNAV);
  });
  socket.on('vulture_local_autonomy_obj_recog_status_broadcast_req_xq', () => {
    socket.emit('vulture_local_autonomy_obj_recog_status_broadcast', OBJ_RECOG);
  });
  socket.on('vulture_local_autonomy_ca_status_broadcast_req_xq', () => {
    socket.emit('vulture_local_autonomy_ca_status_broadcast', CA);
  });
  //artificial sonar array dev purposes [dev]
  setInterval(() => {
    socket.emit('sonar_1_rebound', { telemetry: getRandomInt(255), vid: vid });
    socket.emit('sonar_2_rebound', { telemetry: getRandomInt(400), vid: vid });
    socket.emit('sonar_3_rebound', { telemetry: getRandomInt(400), vid: vid });
    socket.emit('sonar_4_rebound', { telemetry: getRandomInt(400), vid: vid });
    socket.emit('sonar_5_rebound', { telemetry: getRandomInt(400), vid: vid });
    socket.emit('sonar_telemetry_pkg', {
      telemetry: {
        fwd_sonar: getRandomInt(400),
        lft_sonar: getRandomInt(400),
        bwd_sonar: getRandomInt(400),
        rgt_sonar: getRandomInt(400),
        gnd_sonar: getRandomInt(400)
      }, vid: vid
    })
  }, 1000);

  ///--this ⇄ Server | ID handshake for req for client link--///
  socket.emit('vulture_online_signal', "uplink established");
  socket.emit('vulture_local_autonomy_pref_broadcast', { rth: rth_pref_arr, ca: ca_pref_arr, obj_recog: obj_recog_pref_arr, wnav: wnav_pref_arr, obj_tracking: obj_tracking_pref_arr });
  socket.emit('vulture_ownr_link', vid);

  ///--this ⇄ Server | client CLI parser and execution--///
  socket.on('parsed_cli_cmd', cmd_payload => {
    var scmd_payload = cmd_payload.split(":");
    if (scmd_payload[0].toUpperCase() == "RTH") {
      if (scmd_payload[1] == "1") {
        RTH = 1;
      }
      if (scmd_payload[1] == "0") {
        RTH = 0;
      }
      socket.emit('cli_cmd_confirmation', `RTH:${RTH}`);
    }
    if (scmd_payload[0].toUpperCase() == "REBOOT") {
      if (scmd_payload[1] == "1") {
        socket.emit('cli_cmd_confirmation', "REBOOT:1");
        process.exit();
      }
    }
    if (scmd_payload[0].toUpperCase() == "PING") {
      if (scmd_payload[1] == "0") {
        socket.emit('cli_cmd_confirmation', "PING:0");
      }
      if (scmd_payload[1] == "1") {
        socket.emit('cli_cmd_confirmation', "PING:1");
      }
      if (scmd_payload[1] == "2") {
        socket.emit('cli_cmd_confirmation', "PING:2");
      }
    }
  });
  socket.on('be_rth_status_rqst', () => {
    socket.emit('rth_status_rqst_payload', RTH);
  });

  ///--this ⇄ Server | special client CMDS--///
  socket.on('vulture_server_reboot_server_relay', () => {
    console.log("server reboot command received");
    process.exit();
  });
  socket.on('omega_reboot_signal_relay', () => {// Omega Hardware Interface Board Restart
    console.log("server reboot command received");
    process.exit();
  });






  console.log("uplink established");// client link ack
  if (hardware_enabled) {
    board_.on("ready", () => {//hardware interface board ini

      let pin = new five.Pin('A0')
      pin.read((e, val) => {
        // console.log(val)
      })

      ////---Propulsion---////[prop]
      /*
      1-Left Up
      2-Right down
      3-Left Down
      4-Right Up 
      */

      function rollPID() {
        let kP = 0.01;
        let kI = 0.000;
        let kD = 0.000;

        let delta = currentRoll - targetRoll;


        function motRangeCheck(cv) {
          return cv < 100 && cv >= 0
        }
        function magSense() {
          if (delta >= 0) {
            return { m1: -1, m2: 1, m3: -1, m4: 1 }
          } else {
            return { m1: 1, m2: -1, m3: 1, m4: -1 }
          }
        }
        if (Math.abs(delta) > 20) {
          if (motRangeCheck(currentM1 + (Math.abs(delta) * kP * magSense().m1))) {
            currentM1 = currentM1 + (Math.abs(delta) * kP * magSense().m1);
          }
          if (motRangeCheck(currentM2 + (Math.abs(delta) * kP * magSense().m2))) {
            currentM2 = currentM2 + (Math.abs(delta) * kP * magSense().m2);
          }
          if (motRangeCheck(currentM3 + (Math.abs(delta) * kP * magSense().m3))) {
            currentM3 = currentM3 + (Math.abs(delta) * kP * magSense().m3);
          }
          if (motRangeCheck(currentM4 + (Math.abs(delta) * kP * magSense().m4))) {
            currentM4 = currentM4 + (Math.abs(delta) * kP * magSense().m4);
          }
        } else if (Math.abs(currentPitch - targetPitch) < 20) {
          let avg = ((currentM1 + currentM2 + currentM3 + currentM4) / 4)
          currentM1 = avg
          currentM2 = avg
          currentM3 = avg
          currentM4 = avg
        }
        console.log(`P ${parseFloat(currentPitch).toFixed(2)} | DP ${parseFloat(delta).toFixed(2)} | R ${parseFloat(currentRoll).toFixed(2)} | DR ${parseFloat(currentRoll - targetRoll).toFixed(2)} | M1 ${parseFloat(currentM1).toFixed(2)} | M2 ${parseFloat(currentM2).toFixed(2)} | M3 ${parseFloat(currentM3).toFixed(2)} | M4 ${parseFloat(currentM4).toFixed(2)}`)

      }
      function pitchPID() {
        let kP = 0.01;
        let kI = 0.000;
        let kD = 0.000;

        let delta = currentPitch - targetPitch;


        function motRangeCheck(cv) {
          return cv < 100 && cv >= 0
        }
        function magSense(motorID) {
          if (delta >= 0) {
            return { m1: -1, m2: 1, m3: 1, m4: -1 }
          } else {
            return { m1: 1, m2: -1, m3: -1, m4: 1 }
          }
        }
        if (Math.abs(delta) > 20) {
          if (motRangeCheck(currentM1 + (Math.abs(delta) * kP * magSense().m1))) {
            currentM1 = currentM1 + Math.abs(delta) * kP * magSense().m1;
            console.log(delta * kP)

          }
          if (motRangeCheck(currentM2 + (Math.abs(delta) * kP * magSense().m2))) {
            currentM2 = currentM2 + Math.abs(delta) * kP * magSense().m2;
            console.log(Math.abs(delta) * kP)
          }
          if (motRangeCheck(currentM3 + (Math.abs(delta) * kP * magSense().m3))) {
            currentM3 = currentM3 + Math.abs(delta) * kP * magSense().m3;
            console.log(Math.abs(delta) * kP)
          }
          if (motRangeCheck(currentM4 + (Math.abs(delta) * kP * magSense().m4))) {
            currentM4 = currentM4 + Math.abs(delta) * kP * magSense().m4;
            console.log(Math.abs(delta) * kP)
          }
        } else if (Math.abs(currentRoll - targetRoll) < 20) {
          let avg = ((currentM1 + currentM2 + currentM3 + currentM4) / 4)
          currentM1 = avg
          currentM2 = avg
          currentM3 = avg
          currentM4 = avg

          console.log('r A')
        }

        console.log(`P ${parseFloat(currentPitch).toFixed(2)} | DP ${parseFloat(delta).toFixed(2)} | R ${parseFloat(currentRoll).toFixed(2)} | DR ${parseFloat(currentRoll - targetRoll).toFixed(2)} | M1 ${parseFloat(currentM1).toFixed(2)} | M2 ${parseFloat(currentM2).toFixed(2)} | M3 ${parseFloat(currentM3).toFixed(2)} | M4 ${parseFloat(currentM4).toFixed(2)}`)
      }


      function TargetStateUpdate() {
        //ALT
        if (currentAltRate != 0) {
          if ((currentM1 + parseInt(currentAltRate / 7)) <= 100 && (currentM1 + parseInt(currentAltRate / 7)) >= 0) {
            currentM1 = currentM1 + currentAltRate / 7;
          }
          if ((currentM2 + parseInt(currentAltRate) / 7) <= 100 && (currentM2 + parseInt(currentAltRate / 7)) >= 0) {
            currentM2 = currentM2 + currentAltRate / 7;
          }
          if ((currentM3 + parseInt(currentAltRate) / 7) <= 100 && (currentM3 + parseInt(currentAltRate / 7)) >= 0) {
            currentM3 = currentM3 + currentAltRate / 7;
          }
          if ((currentM4 + parseInt(currentAltRate / 7)) <= 100 && (currentM4 + parseInt(currentAltRate / 7)) >= 0) {
            currentM4 = currentM4 + currentAltRate / 7;
          }
        }

        // currentM1 = parseInt(currentM1)
        // currentM2 = parseInt(currentM2)
        // currentM3 = parseInt(currentM3)
        // currentM4 = parseInt(currentM4)
      }


      let propDebug = true;


      setInterval(() => {
        if (!propDebug) {
          TargetStateUpdate()
          pitchPID()
          rollPID()
        }
      }, 150)

      if (!propDebug) {
        const m1 = new five.ESC({ pin: 11 });//pwmRange:[1290, 2000]
        const m2 = new five.ESC({ pin: 9 });//pwmRange:[1290, 2000]
        const m3 = new five.ESC({ pin: 6 });//pwmRange:[1290, 2000]
        const m4 = new five.ESC({ pin: 5 });//pwmRange:[1290, 2000]
        setInterval(() => {
          if (parseInt(currentM1) == 0 && parseInt(currentM2) == 0 && parseInt(currentM3) == 0 && parseInt(currentM4) == 0) {
            if (currentM1 >= 0 && currentM1 <= 100) {
              m1.throttle(0);
              console.log(`M1 | ${parseInt(currentM1)}% | ${Date.now()}`);
            }

            if (currentM2 >= 0 && currentM2 <= 100) {
              m2.throttle(0);
              console.log(`M2 | ${parseInt(currentM2)}% | ${Date.now()}`);
            }

            if (currentM3 >= 0 && currentM3 <= 100) {
              m3.throttle(0);
              console.log(`M3 | ${parseInt(currentM3)}% | ${Date.now()}`);
            }

            if (currentM4 >= 0 && currentM4 <= 100) {
              m4.throttle(0);
              console.log(`M4 | ${parseInt(currentM4)}% | ${Date.now()}`);
            }
          }
          if (currentM1 >= 0 && currentM1 <= 100) {
            m1.throttle(parseInt(currentM1));
            console.log(`M1 | ${parseInt(currentM1)}% | ${Date.now()}`);
          }
          if (currentM2 >= 0 && currentM2 <= 100) {
            m2.throttle(parseInt(currentM2));
            console.log(`M2 | ${parseInt(currentM2)}% | ${Date.now()}`);
          }
          if (currentM3 >= 0 && currentM3 <= 100) {
            m3.throttle(parseInt(currentM3));
            console.log(`M3 | ${parseInt(currentM3)}% | ${Date.now()}`);
          }
          if (currentM4 >= 0 && currentM4 <= 100) {
            m4.throttle(parseInt(currentM4));
            console.log(`M4 | ${parseInt(currentM4)}% | ${Date.now()}`);
          }
        }, 50);
      }

      ///--Propulsion Manual Testing Controller--///
      if (propDebug) {
        const m1 = new five.ESC({ pin: 11 });//pwmRange:[1290, 2000]
        socket.on('m1_manual_thrust_lvl_rebound', (rcvd_m1_thrust_lvl) => {
          if (rcvd_m1_thrust_lvl >= 0 && rcvd_m1_thrust_lvl <= 100) {
            m1.throttle(rcvd_m1_thrust_lvl);
            console.log(`M1 | ${rcvd_m1_thrust_lvl}% | ${Date.now()}`);
          }
        });

        const m2 = new five.ESC({ pin: 9 });//pwmRange:[1290, 2000]
        socket.on('m2_manual_thrust_lvl_rebound', (rcvd_m2_thrust_lvl) => {
          if (rcvd_m2_thrust_lvl >= 0 && rcvd_m2_thrust_lvl <= 100) {
            m2.throttle(rcvd_m2_thrust_lvl);
            console.log(`M2 | ${rcvd_m2_thrust_lvl}% | ${Date.now()}`);
          }
        });

        const m3 = new five.ESC({ pin: 6 });//pwmRange:[1290, 2000]
        socket.on('m3_manual_thrust_lvl_rebound', (rcvd_m3_thrust_lvl) => {
          if (rcvd_m3_thrust_lvl >= 0 && rcvd_m3_thrust_lvl <= 100) {
            m3.throttle(rcvd_m3_thrust_lvl);
            console.log(`M3 | ${rcvd_m3_thrust_lvl}% | ${Date.now()}`);
          }
        });

        const m4 = new five.ESC({ pin: 5 });//pwmRange:[1290, 2000]
        socket.on('m4_manual_thrust_lvl_rebound', (rcvd_m4_thrust_lvl) => {
          if (rcvd_m4_thrust_lvl >= 0 && rcvd_m4_thrust_lvl <= 100) {
            m4.throttle(rcvd_m4_thrust_lvl);
            console.log(`M4 | ${rcvd_m4_thrust_lvl}% | ${Date.now()}`);
          }
        });
      }


      ////---Dynamics---////[dyn]

      ///--IMU Telemetry Broadcaster & Status Watcher | HID [02C] | [temperture(C), x, y, z, pitch, roll, accel, inclination, orientation, Gyro x, Gyro y, Gyro z, Gyro pitch, Gyro roll, Gyro yaw, Gyro rate, Gyro isCalibrated]--///
      let lastTelemetryUnix = 0;
      let telemetry = [];

      if (sensor_array_active_status[0] == true) {
        const imu = new IMU_({
          controller: "MPU6050",
          address: 0x68
        });
        imu.on('change', () => {
          const imu_data_pkg = [imu.thermometer.celsius - 18, imu.accelerometer.x, imu.accelerometer.y, imu.accelerometer.z, imu.accelerometer.pitch, imu.accelerometer.roll, imu.accelerometer.acceleration, imu.accelerometer.inclination, imu.accelerometer.orientation,
          imu.gyro.x, imu.gyro.y, imu.gyro.z, imu.gyro.pitch, imu.gyro.roll, imu.gyro.yaw, imu.gyro.rate, imu.gyro.isCalibrated];

          const imu_alpha_data_pkg = {
            gyro: { pitch: imu.gyro.pitch, roll: imu.gyro.roll, yaw: imu.gyro.yaw },
            accelerometer: { pitch: imu.accelerometer.pitch + 14, roll: imu.accelerometer.roll + 27 }
          }


          socket.emit('imu_data_pkg_broadcast', { vid: vid, telemetry: imu_data_pkg });

          socket.emit('imu_alpha_data_pkg_broadcast', { vid: vid, telemetry: imu_alpha_data_pkg });

          socket.emit('gamma_board_hs');


          ///// INVERTED ON PURPOSE
          if (imu_alpha_data_pkg.accelerometer.pitch >= 0) {
            instantCurrentRoll = parseFloat(6 + imu_alpha_data_pkg.accelerometer.pitch).toFixed(2)
            instantCurrentRoll = parseFloat(instantCurrentRoll)
            rollAcArray.push(instantCurrentRoll);
            rollAcArray.shift();
            let rollAcumulated = 0;
            for (let ix = 0; ix < rollAcArray.length; ix++) {
              rollAcumulated += rollAcArray[ix];
            }
            currentRoll = parseFloat(rollAcumulated / rollAcArray.length, 3)
          } else {
            instantCurrentRoll = RangeScaler(parseFloat(8 + imu_alpha_data_pkg.accelerometer.pitch).toFixed(2), -53, 0, -90, 0);
            rollAcArray.push(instantCurrentRoll);
            rollAcArray.shift();
            let rollAcumulated = 0;
            for (let ix = 0; ix < rollAcArray.length; ix++) {
              rollAcumulated += rollAcArray[ix];
            }
            currentRoll = parseFloat(rollAcumulated / rollAcArray.length, 3)
          }


          if (imu_alpha_data_pkg.accelerometer.roll >= 0) {
            instantCurrentPitch = RangeScaler(parseFloat(imu_alpha_data_pkg.accelerometer.roll).toFixed(2), 0, 103, 0, 90)
            pitchAcArray.push(instantCurrentPitch);
            pitchAcArray.shift();
            let pitchAcumulated = 0;
            for (let ix = 0; ix < pitchAcArray.length; ix++) {
              pitchAcumulated += pitchAcArray[ix];
            }
            currentPitch = parseFloat(pitchAcumulated / pitchAcArray.length, 3) * -1
          } else {
            instantCurrentPitch = RangeScaler(parseFloat(imu_alpha_data_pkg.accelerometer.roll).toFixed(2), -51, 0, -90, 0)
            pitchAcArray.push(instantCurrentPitch);
            pitchAcArray.shift();
            let pitchAcumulated = 0;
            for (let ix = 0; ix < pitchAcArray.length; ix++) {
              pitchAcumulated += pitchAcArray[ix];
            }
            currentPitch = parseFloat(pitchAcumulated / pitchAcArray.length, 3) * -1
          }

          telemetry.push({ 
            throttle: { m1: currentM1, m2: currentM2, m3: currentM3, m4: currentM4 }, 
            accel: { pitch: { average: currentPitch, frame: pitchAcArray }, roll: { average: currentRoll, frame: rollAcArray } }, 
            inputs: {pitch: currentPitchRate, roll: currentRollRate, alt: currentAltRate},
            tx: Date.now() });
          imu_connection_status_bin = Date.now();
        });
      }

      setInterval(() => {
        if(telemetry != []){
          socket.emit('telemetryLogPackage', { vid: vid, telemetry: telemetry, TELCO: TELCO });
          telemetry = [];
        }
        lastTelemetryUnix = Date.now();
      }, 25);

      ///--Acc Telemetry Broadcaster & Status Watcher | HID [02E] | [acceleration, inclination, orientation, pitch, roll, x, y, z]--///     
      if (sensor_array_active_status[1] == true) {
        const accelerometer = new Accelerometer_({
          controller: "ADXL345",
          address: 0x53
        })
        accelerometer.on('change', () => {
          const { acceleration, inclination, orientation, pitch, roll, x, y, z } = accelerometer;
          const data_pkg = [acceleration, inclination, orientation, pitch, roll, x, y, z];
          socket.emit('gyro_data_pkg', { vid: vid, telemetry: data_pkg });
          socket.emit('gamma_board_hs');


          axdl_connection_status_bin = Date.now();
          // console.log(data_pkg) // ax
        })
      }


      ////---Nav---////[nav]

      ///--Barometer Telemetry Broadcaster & Status Watcher | HID [02I] | [pressure(Pa), temperture(C), altitude(m)]--///     
      if (sensor_array_active_status[9] == true) {
        var barometer = new five.Multi({
          controller: "BMP280",
          address: 0x76,
          elevation: 0,//76
        });

        barometer.on("change", function () {
          var alt_acx = (((Math.pow((101325 / (this.barometer.pressure * 1000)), (1 / 5.257)) - 1) * this.thermometer.kelvin) / 0.0065);
          socket.emit('barometer_pkg', { vid: vid, telemetry: [this.barometer.pressure, barometer.thermometer.celsius, alt_acx] });
          barometer_connection_status_bin = Date.now();
        });
      }

      ///--GPS Telemetry Broadcaster & Status Watcher | HID [02F] | [sat_ops][Sat Ops] [gps_position_pkg][longitude, latitude, altitude] [gps_nav_pkg][heading, speed]--///     
      if (sensor_array_active_status[7] == true) {
        var gps = new GPS_({
          pins: {
            rx: 2,
            tx: 3,
          }
        });

        gps.on("change", position => {
          const { altitude, latitude, longitude } = position;
          var gps_position_pkg = [longitude, latitude, altitude];
          socket.emit('gps_position_pkg', { vid: vid, telemetry: gps_position_pkg });
          gps_position_connection_status_bin = Date.now();
          console.log("GPS Position:");
          socket.emit('gamma_board_hs');
          console.log("  latitude   : ", position.latitude);
          console.log("  longitude  : ", position.longitude);
          console.log("  altitude   : ", position.altitude);
          console.log("--------------------------------------");

        });
        gps.on('message', (nmea_stnc) => {
          console.log(`${nmea_stnc} lmao`);//[dev]
        });
        gps.on("operations", _sat_ops => {
          socket.emit('sat_ops', { vid: vid, telemetry: _sat_ops });
          socket.emit('gamma_board_hs');
        });
        gps.on("navigation", velocity => {
          const { course, speed } = velocity;
          var gps_nav_pkg = [course, speed];
          socket.emit('gps_nav_pkg', { vid: vid, telemetry: gps_nav_pkg });
          gps_nav_connection_status_bin = Date.now();
          socket.emit('gamma_board_hs');
          console.log("GPS Navigation:");
          console.log("  course  : ", course);
          console.log("  speed   : ", speed);
          console.log("--------------------------------------");

        });
      }

      ////---Sonar Array---////[sar]

      ///--FWD Sonar Telemetry Broadcaster & Status Watcher | HID [02D-0] | [Front Sonar distance(cm)]--///     
      if (sensor_array_active_status[2] == true) {
        const soanr_1 = new Proximity_({
          controller: "HCSR04",
          pin: 7
        });
        soanr_1.on("change", () => {
          const { centimeters } = soanr_1;
          socket.emit('sonar_1_rebound', { vid: vid, telemetry: centimeters });
          socket.emit('gamma_board_hs');
          sonar_1_connection_status_bin = Date.now();
        });
      }


      ///--LFT Sonar Telemetry Broadcaster & Status Watcher | HID [02D-1] | [Left-side Sonar distance(cm)]--///     
      if (sensor_array_active_status[3] == true) {
        const soanr_2 = new Proximity_({
          controller: "HCSR04",
          pin: 13
        });
        soanr_2.on("change", () => {
          const { centimeters } = soanr_2;
          console.log(centimeters)
          socket.emit('sonar_2_rebound', { vid: vid, telemetry: centimeters });
          socket.emit('gamma_board_hs');
          sonar_2_connection_status_bin = Date.now();
        });
      }


      ///--BWD Sonar Telemetry Broadcaster & Status Watcher | HID [02D-2] | [Rear Sonar distance(cm)]--///
      if (sensor_array_active_status[4] == true) {
        const soanr_3 = new Proximity_({
          controller: "HCSR04",
          pin: 5
        });
        soanr_3.on("change", () => {
          const { centimeters } = soanr_3;
          socket.emit('sonar_3_rebound', { vid: vid, telemetry: centimeters });
          socket.emit('gamma_board_hs');
          sonar_3_connection_status_bin = Date.now();
        });
      }


      ///--RGT Sonar Telemetry Broadcaster & Status Watcher | HID [02D-3] | [Right-side Sonar distance(cm)]--///
      if (sensor_array_active_status[5] == true) {
        const soanr_4 = new Proximity_({
          controller: "HCSR04",
          pin: 8
        });
        soanr_4.on("change", () => {
          const { centimeters } = soanr_4;
          console.log(`${centimeters} right`)
          socket.emit('sonar_4_rebound', { vid: vid, telemetry: centimeters });
          socket.emit('gamma_board_hs');
          sonar_4_connection_status_bin = Date.now();
        });
      }


      ///--GND Sonar Telemetry Broadcaster & Status Watcher | HID [02D-4] | [Ground Sonar distance(cm)]--///
      if (sensor_array_active_status[6] == true) {
        const soanr_5 = new Proximity_({
          controller: "HCSR04",
          pin: 9
        });
        soanr_5.on("change", () => {
          const { centimeters } = soanr_5;
          socket.emit('sonar_5_rebound', { vid: vid, telemetry: centimeters });
          socket.emit('gamma_board_hs');
          sonar_5_connection_status_bin = Date.now();
        });
      }


      //--experimental sensor hard reset via solid state relays--//
      const relay_ch0 = new five.Pin(8);
      const relay_ch1 = new five.Pin(10);
      var relay_ch0_state = false;
      var relay_ch1_state = true;
      socket.on('imu_restart_signal_sr', () => {
        //imu_pin_ = imu_pin;
        // imu_pin.high();
        // setTimeout(() => {
        //   imu_pin.low();
        // }, 100);
        if (!relay_ch0_state) {
          relay_ch0.high();
          relay_ch0_state = true;
        }
        else {
          relay_ch0.low();
          relay_ch0_state = false;
        }
        if (relay_ch1_state) {
          relay_ch1.low();
          relay_ch1_state = false;
        }
        else {
          relay_ch1.high();
          relay_ch1_state = true;
        }
      });


      //--Board controller link status indicator--//
      const b_led = new five.Led(7);
      //const r_led = new five.Led(6);
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

      //  setInterval(() => {
      //    r_led.fadeIn();
      //    setTimeout(() => {
      //      r_led.fadeOut();
      //    }, 500);
      //  }, 1500);

    });
  }

  ////---Hardware Status Compute and broadcast---////[sar]
  setInterval(() => {
    if (hardware_enabled) {
      //Dynamics//
      if (Math.abs(imu_connection_status_bin - Date.now()) > 200) {
        imu_connection_status = false;
      }
      else {
        imu_connection_status = true;
      }
      if (Math.abs(axdl_connection_status_bin - Date.now()) > 300) {
        axdl_connection_status = false;
      }
      else {
        axdl_connection_status = true;
      }

      //Sonar Array//
      if (Math.abs(sonar_1_connection_status_bin - Date.now()) > 600) {
        sonar_1_connection_status = false;
      }
      else {
        sonar_1_connection_status = true;
      }
      if (Math.abs(sonar_2_connection_status_bin - Date.now()) > 600) {
        sonar_2_connection_status = false;
      }
      else {
        sonar_2_connection_status = true;
      }
      if (Math.abs(sonar_3_connection_status_bin - Date.now()) > 600) {
        sonar_3_connection_status = false;
      }
      else {
        sonar_3_connection_status = true;
      }
      if (Math.abs(sonar_4_connection_status_bin - Date.now()) > 600) {
        sonar_4_connection_status = false;
      }
      else {
        sonar_4_connection_status = true;
      }
      if (Math.abs(sonar_5_connection_status_bin - Date.now()) > 600) {
        sonar_5_connection_status = false;
      }
      else {
        sonar_5_connection_status = true;
      }

      //Nav//
      if (Math.abs(gps_position_connection_status_bin - Date.now()) > 1200) {
        gps_position_connection_status = false;
      }
      else {
        gps_position_connection_status = true;
      }
      if (Math.abs(gps_nav_connection_status_bin - Date.now()) > 600) {
        gps_nav_connection_status = false;
      }
      else {
        gps_nav_connection_status = true;
      }
      if (Math.abs(barometer_connection_status_bin - Date.now()) > 600) {
        barometer_connection_status = false;
      }
      else {
        barometer_connection_status = true;
      }
    }

    var sensor_array_hardware_cs;//legacy

    let hardware_status_obj = {};

    function system_overall_status_assessment(system_hardware_status_array) {
      let system_overall_status = true;
      for (let ix = 0; ix <= system_hardware_status_array.length - 1; ix++) {
        if (!system_hardware_status_array[ix]) {
          system_overall_status = false;
        }
        if (system_hardware_status_array.length - 1 == ix) {
          return system_overall_status;
        }
      }
    }

    hardware_status_obj = { 
      sonar_array:
      {
        fwd_sonar: { status: sonar_1_connection_status, status_type: 0 },//0 == offline | 1 == faulty | 2 == unknown
        lft_sonar: { status: sonar_2_connection_status, status_type: 0 },
        bwd_sonar: { status: sonar_3_connection_status, status_type: 0 },
        rgt_sonar: { status: sonar_4_connection_status, status_type: 0 },
        gnd_sonar: { status: sonar_5_connection_status, status_type: 0 },
        overall_status: system_overall_status_assessment([sonar_1_connection_status, sonar_2_connection_status, sonar_3_connection_status, sonar_4_connection_status, sonar_5_connection_status]),
      },
      dynamics: {
        primary_imu: { status: imu_connection_status, status_type: 0 },
        primary_acc: { status: axdl_connection_status, status_type: 0 },
        overall_status: system_overall_status_assessment([imu_connection_status, axdl_connection_status]),
      },
      navigation: {
        gps: { status: gps_nav_connection_status, status_type: 0 },
        magnetometer: { status: magnetometer_connection_status, status_type: 1 },
        barometer: { status: barometer_connection_status, status_type: 0 },
        overall_status: system_overall_status_assessment([gps_nav_connection_status, magnetometer_connection_status, barometer_connection_status]),
      }
    }
    //Broadcast//
    if (hardware_enabled) {
      sensor_array_hardware_cs = [imu_connection_status, axdl_connection_status, sonar_1_connection_status, sonar_2_connection_status, sonar_3_connection_status, sonar_4_connection_status, sonar_5_connection_status, gps_position_connection_status, barometer_connection_status, magnetometer_connection_status];
    }
    else {
      sensor_array_hardware_cs = [true, true, true, true, true, true, false, true, true, true];
    }

    socket.emit('hardware_status', { vid: vid, telemetry: hardware_status_obj });

    socket.emit('sensor_array_hardware_cs', { vid: vid, telemetry: sensor_array_hardware_cs });//legacy

    socket.emit('sensor_array_es', { vid: vid, telemetry: sensor_array_active_status });

  }, 250)

  ////--Ping Emitters--////

  setInterval(() => {
    socket.emit('local_server_ping_emitter', { vid: vid, tx: Date.now() });
  }, 50);

  setInterval(() => {
    socket.emit('vulture_heartbeat_emitter', { vid: vid, tx: Date.now() });
  }, 1000);

  // socket.on('vulture_ping', () => {
  //   socket.emit('vulture_ping_echo', { vid: vid });
  // });

  socket.on('req_vulture_connection_vitals', () => {
    socket.emit('vulture_connection_vitals_res', { tx: Date.now(), vid: vid });
  });

  ////--User Input--////
  socket.on('input_pkg_local_relay_emitter', joystick_input_pkg => {
    io_i.emit('input_pkg_local_relay', joystick_input_pkg);
    socket.emit('input_pkg_local_rebound', joystick_input_pkg);
  });

})

server.listen(3410);

