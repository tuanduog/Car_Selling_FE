const Base_Url = "http://localhost:7000"; // URL backend

let editAttached = false;

export async function initEditCar(){
    const id = localStorage.getItem('carId');
    if(!id) return;

    try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(`${Base_Url}/api/vehicle/v1/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const result = await response.json();
        if(result.statusCode === 200){
            const data = result.data;
            console.log(data);
            document.getElementById('inputCarCode').value = data.code || '';
            document.getElementById('inputCarName').value = data.name || '';
            
            const versionRadios = document.querySelectorAll('input[name="version"]');
            versionRadios.forEach(radio => {
                radio.checked = (parseInt(radio.value) === data.version);
            });

            const imagePreview = document.getElementById('imagePreview');
            const imageUploadText = document.getElementById('imageUploadText');

            if (data.imageUrl) {
                imagePreview.src = data.imageUrl; 
                imagePreview.style.display = 'block';
                if (imageUploadText) imageUploadText.style.display = 'none';
            } else {
                imagePreview.src = '';
                imagePreview.style.display = 'none';
                if (imageUploadText) imageUploadText.style.display = 'block';
            }

            const imageBox = document.getElementById('imageUploadBox');
            const imageInput = document.getElementById('inputImage');

            imageBox.addEventListener('click', () => {
                imageInput.click();
            });

            imageInput.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (file) {
                    const url = URL.createObjectURL(file);
                    imagePreview.src = url;
                    imagePreview.style.display = 'block';
                    imageUploadText.style.display = 'none';
                } else {
                    imagePreview.src = '';
                    imagePreview.style.display = 'none';
                    imageUploadText.style.display = 'block';
                }
            });

            document.getElementById('description').value = data.description || '';
            document.getElementById('detail').value = data.detail || '';
            document.getElementById('inputPrice').value = data.price || '';
            document.getElementById('inputDate').value = data.releaseDate || '';

            const sizeWeight = data.sizeWeight || {};
            document.getElementById('dimension').value = sizeWeight.dimension.value || '';
            document.getElementById('wheelbase').value = sizeWeight.wheelBase.value || '';
            document.getElementById('groundClearance').value = sizeWeight.groundClearance.value || '';
            document.getElementById('curbWeight').value = sizeWeight.curbWeight.value || '';
            document.getElementById('seat').value = sizeWeight.seat.value || '';
            document.getElementById('trunkVolume').value = sizeWeight.trunkVolume.value || '';

            const engineOperation = data.engineOperate || {};
            document.getElementById('motorType').value = engineOperation.motorType.value || '';
            document.getElementById('maxPower').value = engineOperation.maxPower.value || '';
            document.getElementById('driverMode').value = engineOperation.driveMode.value || '';
            document.getElementById('maxSpeed').value = engineOperation.maxSpeed.value || '';

            const batteryRange = data.batteryRange || {};
            document.getElementById('batteryCapacity').value = batteryRange.batteryCapacity.value || '';
            document.getElementById('range').value = batteryRange.range.value || '';
            document.getElementById('normalChargeTime').value = batteryRange.normalChargeTime.value || '';
            document.getElementById('fastChargeSupport').value = batteryRange.fastChargeSupport.value || '';

            const interiorFeature = data.interiorFeature || {};
            document.getElementById('centralScreen').value = interiorFeature.centralScreen.value || '';
            document.getElementById('operatingSystem').value = interiorFeature.operatingSystem.value || '';
            document.getElementById('airConditioning').value = interiorFeature.airConditioning.value || '';
            document.getElementById('seats').value = interiorFeature.seats.value || '';
            document.getElementById('connectivity').value = interiorFeature.connectivity.value || '';

        } else {
            showToast("Lấy thông tin thất bại", "error");
            return null;
        }
    } catch(error){
        console.error(error);
        return null;
    }
    if(!editAttached){
        attachEditSubmit();
        editAttached = true;
    }
}

function attachEditSubmit(){
     const btn = document.getElementById('editCar');

    btn.addEventListener('click', async (event) => {
        event.preventDefault();

        const id = localStorage.getItem('carId');
        if(!id) return;

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
            const res = await fetch(`${Base_Url}/api/vehicle/v1/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const result = await res.json();

            if(result.statusCode === 200){
                localStorage.removeItem('carId');
                localStorage.setItem("toastMessage", "Cập nhật thành công");
                localStorage.setItem("toastType", "success");
                localStorage.setItem("redirectPage", "pages/car-management.html");
                window.location.href = "index.html";
            } else {
                showToast("Cập nhật thất bại", "error");
            }
        } catch (e){
            console.error(e);
        }
    });
}
