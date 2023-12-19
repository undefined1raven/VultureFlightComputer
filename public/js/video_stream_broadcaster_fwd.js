

const root = document.documentElement;
const carrier = io({path: "/real-time/"})
var video_sources_id_arr = [];
navigator.mediaDevices.enumerateDevices().then(async (devices) => {
    for(const w of devices){
        if (w.kind === 'videoinput') {
            video_sources_id_arr.push(w.deviceId);
        }
    }
    console.log(video_sources_id_arr);
    return navigator.mediaDevices.getUserMedia({video: { aspectRatio: 1.777777778, frameRate: 60 }, audio: false}).then((stream) => {//{ aspectRatio: 1.777777778, frameRate: 30 }
        var broadcaster_peer = new SimplePeer({initiator: true, trickle: false, stream: stream});
        broadcaster_peer.on('signal', (cnt) => {
            carrier.emit('local_fwd_cam_rtc_req', cnt);
            console.log('offer sent')
        });  

        broadcaster_peer.on('connect', () => {
            console.log('connected');
            root.style.setProperty('--cam_cs_acx_cl', '#00FFF0');
            document.getElementById('cam_cs_acx').innerText = 'UPLINK ESTABLISHED';
        });

        setInterval(() => {
            broadcaster_peer.send('f');
        }, 1000)

        carrier.on('local_fwd_cam_rtc_res', answer => {
            broadcaster_peer.signal(answer);
            console.log(answer) 
        });
    }).catch((e) =>{
        root.style.setProperty('--cam_cs_acx_cl', '#FF006B');
        document.getElementById('cam_cs_acx').innerText = `STREAM ERROR [${e}]`;
    });
});

function dynamic_font_resize(def_font, def_screen_width){
    return (Math.round((root.clientWidth * def_font) / def_screen_width * 1000) / 1000);
}
function dynamic_font_resize_acx(){
    var def_desktop_width = 1920;

    root.style.setProperty('--desktop_const_28px_font_size', `${dynamic_font_resize(28, def_desktop_width)}px`);
}
dynamic_font_resize_acx();
window.addEventListener('resize', () => {
    dynamic_font_resize_acx();
});

carrier.on('downlink_request_signal', () => {
    console.log(`downlink request received at ${Date.now()}`)
    // location.reload();
});

setInterval(() => {
    carrier.emit('fwd_video_broadcaster_status_sig', Date.now());
}, 250);