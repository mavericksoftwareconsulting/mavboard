# mavboard

## Installation

1. Clone project from GitHub 

Note: if installing on a RaspberryPi or other debian based OS, will need to run with `sudo` command, if not acting as the root user.

```sh
$ git clone git@github.com:mavericksoftwareconsulting/mavboard.git
```

2. Enter the new mavboard directory

```sh
$ cd mavboard/
```

3. Install all dependencies

```sh
$ npm install
```


## Running mavboard

```sh
$ npm start
```

Mavboard will run on http://localhost:3000

## Developing code

This is a student based project at Maverick Software Consulting to display and control office music and office information at a central hub.  All additional developments and forks should be in the spirit of this, and focus on extending the Mavboard as a learning and teaching project for dynamic web design.

### View Engine

*PUG -> HBS*

The Mavboard transitioned from a pug to an hbs view engine, and all views added to the client should be written in hbs.

### Compiling

Core Javascript logic lives in the `src/` directory, and this is where you should write all Javascript. However, to actually run the code, you need to compile it using [Babel](https://babeljs.io). The easiest way to do this is with the built-in script:

```sh
npm run compile
```

### Using Flow

Mavboard code is capable of running [Flow](https://flow.org), a static type-checker which makes Javascript strongly-typed. Flow will only run on pages which begin with the opt-in comment:

```js
// @flow
```

Once it's enabled, use the built-in script to check all Flow-enabled code:

```sh
npm run flow
```

This script will report any type errors and warnings for you to fix. 

*_remember to compile with `npm run compile` in order to see your changes when mavboard is running_*

## In Case of Emergencies

Sometimes chromium-broswer will seg fault and cause us to have to reburn the disk image file for the pi and start from scratch.  If this happens, here is a step by step guide for gettign it set back up.

* Run the following on the pi `$ sudo shutdown -h now`
* Remove the power chord and the micro SD card from the pi
* Plug the micro SD card into your laptop and flash the image over (either a fresh copy or a backup)
  * I use etcher by resign.io for flashing the image over
* After the image is flashed to the SD card, eject it and safely remove it, then place it back in the PI
* Switch the HDMI cables to the desktop monitor and plug the power chord back in.
* Go through the setup for the PI, changing the timezone to central/chicago and enabling US Keyboard
* Update the PI (tutorial ends with this).
* After PI updates run `$ sudo reboot`
* When the pi starts back up install NodeJS
  * `$ sudo apt-get update`
  * `$ sudo apt-get dist-upgrade`
  * `$ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`
  * `$ sudo apt-get install -y nodejs`
  * Running `$ node -v` will test if the install was successful
* Clone the repository to `~/Desktop/git_repos/mavboard` or someother location
* Run `$ sudo npm install` to install all the needed NodeJS packages
* Now we will need to set up the crontab to run jobs (if the autostart does not work run `$ sudo chmod +x` on it
* Run `$ crontab -e` or with `sudo` if permission errors arise
* Choose nano as the editor of choice
* The setup for a task is `minutes hours day-of-month month day-of-week task`
* We will add the following tasks
  * `30 8 * * * ~/Desktop/git_repos/mavboard/autostart.sh`
  * `30 20 * * * root reboot`
* `$ crontab -l` will list all jobs and the previous ones should show up if done correctly
* Now we need to disable the sleep mode for the PI
* `$ sudo nano /etc/lightdm/lightdm.conf` will open the file we need
* Locate the section labelled `[SeatDefault]` and `[Seat*]`
* Add `xserver-command=X -s 0 dpms` to both sections (this must be added to these sections or it won't work)
* Then Ctr-X y <enter> to save the changes
* Next we need to enable SSH for the PI
* Run `sudo raspi-config` and enable SSH
* Open the IP config file to change the static IP address
  * `$ sudo nano /etc/dhcpcd.conf`
  * Locate the *interface eth0* section
  * Add The following so it looks like this
  
```sh
interface eth0
static ip_address=192.168.140.98/24
static routers=192.168.140.254
static domain_name_servers=8.8.8.8 8.8.4.4
```

* Then reboot the PI
* When it reboots run `$ ping google.com` to make sure the configuration is working properly.

The PI should now be good to go for general use.
