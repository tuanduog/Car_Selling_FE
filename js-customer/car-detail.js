const Base_Url = "http://localhost:7000"; // URL backend

export async function getCarById(){
    try {
        const id = localStorage.getItem('carId');
        const token = localStorage.getItem('jwt');

        const response = await fetch(`${Base_Url}/api/customer/vehicle/v1/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    return response.json();
    } catch (error) {
        console.log(error);
    }
}

export async function renderCarDetail(){
    try {
        const car = await getCarById();
        const data = car.data;
        document.getElementById('carName').innerHTML = data.name;
        document.getElementById('carPrice').innerHTML = formatPrice(data.price);
        document.getElementById('carName1').innerHTML = data.name;
        document.getElementById('carDescription').innerHTML = data.description;
        document.getElementById('carDetail').innerHTML = data.detail;
        document.getElementById('carImage').src = data.imageUrl;
        document.getElementById('carPrice1').innerHTML = formatPrice(data.price);
        document.getElementById('carName2').innerHTML = data.name;
        document.getElementById('carName3').innerHTML = data.name;
        document.getElementById('carName4').innerHTML = data.name;

        const sw = data.sizeWeight;

        document.getElementById("size-dimensions").innerText =
            sw.dimension.value;

        document.getElementById("size-wheelbase").innerText =
            sw.wheelBase.value;

        document.getElementById("size-clearance").innerText =
            sw.groundClearance.value;

        document.getElementById("size-weight").innerText =
            sw.curbWeight.value;

        document.getElementById("size-seat").innerText =
            sw.seat.value + " chỗ";

        document.getElementById("size-trunk").innerText =
            sw.trunkVolume.value + " L";

        const eo = car.engineOperate;

        document.getElementById("engine-type").innerText =
            eo.engineType.value;

        document.getElementById("engine-power").innerText =
            `${eo.maxPower.value} kW (~${Math.round(eo.maxPower.value * 1.34)} mã lực)`;

        document.getElementById("engine-drive-mode").innerText =
            eo.driveMode.value;

        document.getElementById("engine-max-speed").innerText =
            eo.maxSpeed.value + " km/h";

        const br = car.batteryRange;

        document.getElementById("battery-capacity").innerText =
            br.batteryCapacity.value + " kWh";

        document.getElementById("battery-range").innerText =
            "~" + br.range.value + " km";

        document.getElementById("battery-normal-charge").innerText =
            "Khoảng " + br.normalChargeTime.value + " giờ";

        document.getElementById("battery-fast-charge").innerText =
            br.fastChargeSupport.value ? "Hỗ trợ" : "Không hỗ trợ";

        const it = car.interiorFeature;

        document.getElementById("interior-screen").innerText =
            it.centralScreen.value;

        document.getElementById("interior-os").innerText =
            it.operatingSystem.value;

        document.getElementById("interior-ac").innerText =
            it.airConditioner;

        document.getElementById("interior-seat").innerText =
            it.seat;

        document.getElementById("interior-connect").innerText =
            it.connectivity;


    } catch (error){
        console.log(error);
    }
}

function formatPrice(price) {
    return Number(price).toLocaleString("vi-VN") + " VNĐ";
}