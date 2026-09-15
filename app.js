let serialPort = null;
let serialReader = null;
let serialWriter = null;

let devicesDict = {};
let framesToDownload = [];
let seconds = 0;

document
    .getElementById("freqForm")
    .addEventListener("submit", setFrequency);

navigator.serial.addEventListener("disconnect", () => {
    console.log("Serial disconnected");

    updateConnectionState(false);

    serialPort = null;
    serialReader = null;
    serialWriter = null;
});

function updateConnectionState(connected) {

    const button =
        document.getElementById("connectButton");

    if (connected) {
        button.classList.remove("disconnected");
        button.classList.add("connected");
        button.textContent = "Connected";
    }
    else {
        button.classList.remove("connected");
        button.classList.add("disconnected");
        button.textContent = "Disconnected";
    }
}

async function connectSerial() {

    try {

        serialPort =
            await navigator.serial.requestPort();

        await serialPort.open({
            baudRate: 115200
        });

        serialWriter =
            serialPort.writable.getWriter();

        updateConnectionState(true);

        readSerialLoop();
    }
    catch (err) {

        console.error(err);

        updateConnectionState(false);
    }
}

async function readSerialLoop() {

    const decoder = new TextDecoder();

    serialReader =
        serialPort.readable.getReader();

    let buffer = "";

    try {

        while (true) {

            const { value, done } =
                await serialReader.read();

            if (done) {
                updateConnectionState(false);
                break;
            }

            buffer += decoder.decode(value);

            let lines = buffer.split("\n");

            buffer = lines.pop();

            for (const line of lines) {

                const frame = line.trim();

                if (frame.length > 0) {
                    parseFrame(frame);
                }
            }
        }
    }
    catch (err) {

        console.error(err);

        updateConnectionState(false);
    }
}

async function sendSerial(data) {

    if (!serialWriter) {
        alert("Serial not connected");
        return;
    }

    const encoder = new TextEncoder();

    await serialWriter.write(
        encoder.encode(data + "\n")
    );
}

async function setFrequency(event) {

    event.preventDefault();

    const freq =
        document.getElementById("freqmhz").value;

    await sendSerial("_FREQ;" + freq);
}

function selectCommand() {

    const command =
        document.getElementById("commandList").value;

    sendCommand(command);
}

async function sendCommand(command) {

    const selectedDevice =
        document.getElementById("deviceList").value;

    if (!selectedDevice)
        return;

    const commandString =
        selectedDevice + ";" + command;

    if (confirm("Send " + command + "?")) {
        await sendSerial(commandString);
    }
}

function parseFrame(receivedData) {

    framesToDownload.push(receivedData + "\n");

    const [callsign, ...content] =
        receivedData.split(";");

    devicesDict[callsign] = content;

    const select =
        document.getElementById("deviceList");

    let exists = false;

    for (let option of select.options) {
        if (option.value === callsign) {
            exists = true;
            break;
        }
    }

    if (!exists) {

        const option =
            document.createElement("option");

        option.value = callsign;
        option.text = callsign;

        select.add(option);

        if (select.options.length === 1) {
            select.value = callsign;
        }
    }

    loadDeviceData(select.value, callsign);
}

function deviceChanged() {

    const selectedDevice =
        document.getElementById("deviceList").value;

    loadDeviceData(selectedDevice, "");
}

function loadDeviceData(deviceName, frameCallsign) {

    const data = devicesDict[deviceName];

    if (!data)
        return;

    document.getElementById("gpsStr").textContent =
        data[0] + ", " + data[1];

    document.getElementById("altitude").textContent =
        data[6];

    if (deviceName === frameCallsign)
        seconds = 0;

    const continuity = parseInt(data[8]);

    document.getElementById("cont1").style.backgroundColor =
        (continuity & 1) ? "#005c00" : "#ff0000";

    document.getElementById("cont2").style.backgroundColor =
        (continuity & 2) ? "#005c00" : "#ff0000";

    document.getElementById("mosState").style.backgroundColor =
        (continuity & 4) ? "#005c00" : "#ff0000";

    const state = parseInt(data[9]);

    const stateLabel =
        document.getElementById("rocketState");

    const progress =
        document.getElementById("progressbar_fill");

    switch (state) {

        case 0:
            stateLabel.textContent = "On rail";
            progress.style.width = "10%";
            break;

        case 1:
            stateLabel.textContent = "Flight";
            progress.style.width = "25%";
            break;

        case 2:
            stateLabel.textContent =
                "First separation";
            progress.style.width = "50%";
            break;

        case 3:
            stateLabel.textContent =
                "Second separation";
            progress.style.width = "75%";
            break;

        case 4:
            stateLabel.textContent = "On ground";
            progress.style.width = "100%";
            break;
    }
}

function downloadData() {

    if (framesToDownload.length === 0) {
        alert("No data to download");
        return;
    }

    const blob = new Blob(
        framesToDownload,
        { type: "text/plain" }
    );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;
    a.download = "ApogemixData.txt";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

function frameTimer() {

    document.getElementById("time_s").textContent =
        seconds.toFixed(1);

    seconds += 0.1;
}

setInterval(frameTimer, 100);
