const Base_Url = "http://localhost:7000"; // URL backend

export async function initAddCar() {
    const btn = document.getElementById('addCar');
    console.log('Button found:', btn);
    if(!btn) return;

    btn.addEventListener('click', async function (event) {
        event.preventDefault();
        const token = localStorage.getItem('jwt');

        const code = document.getElementById('inputCarCode')?.value.trim() || '';
        const name = document.getElementById('inputCarName')?.value.trim() || '';
        const version = document.querySelector('input[name="version"]:checked')?.value;

        const imageInput = document.getElementById('inputImage');
        const imageFile = imageInput.files.length > 0 ? imageInput.files[0] : null;
        const description = document.getElementById('description')?.value.trim() || '';
        const detail = document.getElementById('detail')?.value.trim() || '';
        const price = parseFloat(document.getElementById('inputPrice')?.value || 0);
        const releaseDate = document.getElementById('inputDate')?.value || null;

        if(!code || !name || !imageFile || !price || !releaseDate){
            alert("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
            return;
        }

        const sizeWeight = {
            dimension: document.getElementById('dimension')?.value.trim() || '',
            wheelBase: document.getElementById('wheelbase')?.value.trim() || '',
            groundClearance: document.getElementById('groundClearance')?.value.trim() || '',
            curbWeight: document.getElementById('curbWeight')?.value.trim() || '',
            seat: document.getElementById('seat')?.value.trim() || '',
            trunkVolume: document.getElementById('trunkVolume')?.value.trim() || ''
        };

        const engineOperation = {
            motorType: document.getElementById('motorType')?.value.trim() || '',
            maxPower: document.getElementById('maxPower')?.value.trim() || '',
            driveMode: document.getElementById('driverMode')?.value.trim() || '',
            maxSpeed: document.getElementById('maxSpeed')?.value.trim() || ''
        };

        const batteryRange = {
            batteryCapacity: document.getElementById('batteryCapacity')?.value.trim() || '',
            range: document.getElementById('range')?.value.trim() || '',
            normalChargeTime: document.getElementById('normalChargeTime')?.value.trim() || '',
            fastChargeSupport: document.getElementById('fastChargeSupport')?.value.trim() || ''
        };

        const interiorFeature = {
            centralScreen: document.getElementById('centralScreen')?.value.trim() || '',
            operatingSystem: document.getElementById('operatingSystem')?.value.trim() || '',
            airConditioning: document.getElementById('airConditioning')?.value.trim() || '',
            seats: document.getElementById('seats')?.value.trim() || '',
            connectivity: document.getElementById('connectivity')?.value.trim() || ''
        };

        const vehicleData = {
            code,
            name,
            version,
            releaseDate,
            price,
            description,
            detail,
            sizeWeight,
            engineOperation,
            batteryRange,
            interiorFeature
        };

        const formData = new FormData();

        formData.append(
            'vehicle',
            new Blob([JSON.stringify(vehicleData)], { type: 'application/json' })
        );

        if(imageFile){
            formData.append('image', imageFile);
        }
        try {
            const response = await fetch(`${Base_Url}/api/vehicle/v1`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            let result;
            const contentType = response.headers.get("Content-Type") || "";
            if (contentType.includes("application/json")) {
                result = await response.json();
            } else {
                const text = await response.text();
                result = { statusCode: response.status, message: text || "" };
            }
            if(result.statusCode === 200){
                localStorage.setItem("toastMessage", "Thêm thành công");
                localStorage.setItem("toastType", "success");
                localStorage.setItem("redirectPage", "pages/car-management.html");
                window.location.href = "index.html";
            } else {
                showToast("Thêm thất bại", "error");
                return;
            }
        } catch(error){
            console.error(error);
        }
    })
}