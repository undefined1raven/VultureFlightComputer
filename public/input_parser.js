
const socket = io();

socket.on('input_pkg_local_relay', input_pkg =>{
    document.getElementById('d_thrust').innerText = input_pkg[0] + "%";
    document.getElementById('d_pitch').innerText = input_pkg[3];
    document.getElementById('d_roll').innerText = input_pkg[1];
    document.getElementById('d_yaw').innerText = input_pkg[2];
})
