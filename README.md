# ApogApka - Serial Web Application for Apogemix

**ApogApka Serial Edition** is a browser-based ground station for **Apogemix** flight computers:
[https://github.com/KowalDrzo/Apogemix](https://github.com/KowalDrzo/Apogemix)

The application allows the user to connect to an ApogemixRx (Apogemix ground station) device through a USB serial connection, receive telemetry frames, monitor the current flight state and remotely send commands to the rocket.

The application runs entirely in the web browser and does not require any additional software installation.

## Features

 - USB serial connection using **Web Serial API**,
 - Reception of Apogemix telemetry frames,
 - Support for multiple Apogemix devices,
 - Display of GPS coordinates,
 - Display of barometric altitude,
 - Display of time since the last received frame,
 - Igniter continuity monitoring,
 - MOSFET state monitoring,
 - Display of the current rocket state,
 - Visual flight progress indicator,
 - Remote frequency configuration,
 - Remote recovery test commands,
 - Download of all received telemetry frames as a text file.

## Requirements

The application requires a browser supporting the **Web Serial API**.

A Chromium-based browser such as **Google Chrome** or **Microsoft Edge** is recommended.

The computer must also have a USB connection to the ApogemixRx device exposing a serial interface.

## Running the application

No build system or dependencies are required.
The application is hosted using GitHub Pages, but can be also cloned and run locally.

## Connecting to Apogemix

1. Connect the ApogemixRx device to the computer using USB.
2. Open the web application.
3. Press `Disconnected`.
4. Select the serial port corresponding to Apogemix.
5. The button should change to `Connected`.
6. The application will start listening for telemetry frames automatically.
7. You can change the LoRa frequency by filling the new value (in MHz) in the text input and clicking `Set Frequency` button.

When the USB connection is lost, the application automatically changes its state back to `Disconnected`.

## Telemetry

Received frames are stored by the application's device identifier (callsign).

When a new device is detected, it is automatically added to the `Devices List`.

Select a device from the list to display its latest received data.

The following information is displayed:

### GPS

The latest latitude and longitude received from the selected Apogemix.

```text
+NN.NNNN, +EEE.EEEE
```

### Barometric altitude

Altitude measured by the Apogemix barometric sensor:

```text
Baro altitude [m]
```

### Time from last frame

The timer shows the time elapsed since the last frame received from the currently selected device.

Receiving a new frame resets the timer to zero.

### Continuity

The application displays the state of:

- **Continuity 1**
- **Continuity 2**
- **MOSFET**

Green indicates an active/valid state, while red indicates an inactive state.

## Rocket state

The application displays the current flight state reported by Apogemix.

| State | Description |
|---:|---|
| 0 | On rail |
| 1 | Flight |
| 2 | First separation |
| 3 | Second separation |
| 4 | On ground |

The progress bar provides a visual representation of the current state of the flight.

## Changing radio frequency

The **Frequency MHz** field allows the user to send a new radio frequency to Apogemix.

Enter the desired frequency and press:

**Set frequency**

The application sends the following command:

```text
_FREQ;<frequency>
```

For example:

```text
_FREQ;433
```

The valid input range currently defined by the application is:

```text
100–500 MHz
```

The actual usable frequency range also depends on the radio hardware and Apogemix firmware configuration.

## Remote commands

The application provides several commands that can be sent to the selected Apogemix device.

### Test commands

Two dedicated buttons are available:

```text
Test 1
Test 2
```

They send:

```text
<callsign>;TEST1
```

or

```text
<callsign>;TEST2
```

A confirmation dialog is displayed before the command is transmitted.

### Other commands

The command selector currently contains:

```text
RECALIBRATE
MOS_ON
MOS_OFF
MOS_CLK
```

After selecting a command, press:

**Send command**

The command is sent in the form:

```text
<callsign>;<command>
```

For example:

```text
APOGEMIX1;RECALIBRATE
```

## Downloading received data

All received telemetry frames are temporarily stored in the browser memory.

Press:

**Download received frames**

to save the received data as:

```text
ApogemixData.txt
```

The downloaded file contains the original received frames, one frame per line.

This allows the received telemetry to be saved for later analysis.

> The data is stored only for the current browser session. Reloading the page clears the collected frames.

## Communication protocol

The application communicates with Apogemix using plain-text serial messages terminated by a newline character.

### Receiving frames

Each received line is interpreted as one telemetry frame.

The first field is treated as the device callsign:

```text
CALLSIGN;data1;data2;...
```

The application uses the callsign to distinguish between multiple transmitting devices.

Selected telemetry fields are used for displaying:

- GPS latitude
- GPS longitude
- barometric altitude
- continuity status
- rocket state

The exact frame format must match the format generated by the Apogemix firmware.

### Sending commands

Commands sent from the application are terminated with a newline:

```text
COMMAND
```

Device-specific commands are prefixed with the selected callsign:

```text
CALLSIGN;COMMAND
```

## Project structure

### `index.html`

Contains the user interface:

- connection button
- frequency configuration
- device selector
- telemetry display
- continuity indicators
- command controls
- rocket state indicator
- data download link

### `style.css`

Contains the visual styling of the application, including the responsive layout.

On screens narrower than 768 px, the telemetry tiles are displayed in a single column.

### `app.js`

Contains the application logic:

- Web Serial connection
- serial data reception
- frame parsing
- device management
- telemetry display
- command transmission
- frequency configuration
- flight-state handling
- received-data export

## Browser compatibility

The application depends on:

```javascript
navigator.serial
```

Therefore, a browser with Web Serial API support is required.

If the **Connect** button does not open a serial-port selection dialog, check whether the browser supports Web Serial and whether the application is being served from an allowed context.

## Security and operational notes

This application provides direct control over functions of an Apogemix device, including commands related to MOSFET outputs.

Before using remote commands on a real flight computer:

- verify that the correct device is selected,
- verify the radio/serial connection,
- make sure the rocket and recovery system are in a safe state,
- perform tests without pyrotechnic devices connected whenever possible.

The application itself does not implement additional safety interlocks beyond the confirmation dialog for commands.

## Author contact

The best way to contact me is just write to me using Discord: `sp3mik`.