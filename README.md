# Project Eagle

## Status:  
#### first hover test pending

## About
Project Eagle is a project I started 3 years ago with the purpose of building a custom UAV that could be remotely flown from anywhere with a reliable internet connection from both phones and desktops/laptops.

## The Vulture

### Hardware 
Figuring out which parts I needed to build this quad took me on a very enjoyable journey of learning about how UAVs work and how the different characteristics of each part changes the build overall. I decided it would be optimal for this application to use FPV Quad parts on a 7 inch frame that would allow me to maximize the metric I care most about - flight time.

Since the Vulture has to somehow connect with the rest of the web infrastructure meant to support Vulture Ops, I decided to skip on buying an off the shelf flight controller and to build one myself. The idea is to have full control over what the flight computer does so I could easily integrate the Vulture's capabilities with the rest of the infrastructure. For that reason, I decided to use a Resberry Pi 4 as a flight computer and multiple Ardunios as the Hardware Interface Boards. There are way more many details on how this works in the technical docs.

### Software  (This repo)
To have full control over what the Vulture's flight computer does is both a blessing and a curse. It's a blessing because it allows me to add at any point any sensors I'd like to (e.g sonars, LIDAR), but it comes at the cost of having to write the flight controller code from scratch, which has its risks. In essence what the flight controller has to do is simple, compare the current dynamic state of the Vulture that it gets from IMUs to the state that the pilot desires. This means at least a PID control loop is necessary for each axis and things get even more complex when talking about implementing autonomous features (which I'm planning on doing). Currently the biggest risk by far is getting the initial coefficients so wrong the Vulture would fall in a divergent control loop.(spiraling out of control ironically by the system trying to prevent that from happening). To prevent this from happening, I've disabled the I and D terms and added fully manual controls besides the basic proportional term. 

### Desired Architecture

Ideally, this server/app would be broken up in the following way:

Flight Computer/
├─ COMM Service (handling external COMMS)
├─ Autonomy Core/
├── Omega HID Controller
├── Gamma HID Controller 
├── Delta HID Controller

(HID == Hardware Interface Board)

To achieve a good level of redundancy, multiple arduinos would be used with their own HID controller which would allow for critical sensors (such as the IMUs) to have different parent microcontrollers. This would ensure that even if a HID/Arduino would completely fail for any reason, there would be another pair with its own critical sensors that could take over instantly. I'm also considering wiring the motor signal wires to multiple HID/Arduinos at the same time and controlling where they get their signals from using relays. 

All this is coordinated by the Autonomy Core which interfaces with the COMM Service to relay real-time telemetry and pilot inputs from and to the Vulture. 
