export async function addPayment(data){
    try {
        const token = localStorage.getItem('jwt');
        const response = await fetch(`${Base_Url}/api/payment/v1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if(result.statusCode === 200){
            localStorage.setItem("toastMessage", "Tạo đơn hàng thành công");
            localStorage.setItem("toastType", "success");
            localStorage.setItem("redirectPage", "pages-customer/product.html");
            window.location.href = "customer.html";
        } else {
            showToast("Tạo thất bại", "error");
            return;
        }
    } catch(error){
        console.error(error);
    }
}

export async function acceptPayment(){

    const btn = document.getElementById('addPayment');
    if(!btn) return;

    btn.addEventListener('click', async () => {
        // step 1 info
        const carColor = sessionStorage.getItem('selectedColor');
        const carVersion = sessionStorage.getItem('selectedVersion');
        const carName = sessionStorage.getItem('carName');
        const carId = localStorage.getItem('carId');

        // step 2 info
        const paymentName = sessionStorage.getItem('fullName');
        const paymentEmail = sessionStorage.getItem('email');
        const phoneNumber = sessionStorage.getItem('phoneNumber');
        const identityNumber = sessionStorage.getItem('identityNumber');
        const showRoomCity = sessionStorage.getItem('showRoomCity');
        const showRoomName = sessionStorage.getItem('showRoomName');

        // step 3 info
        const bankId = sessionStorage.getItem('bankId');
        const downPayment = sessionStorage.getItem('downPayment');
        const loanDuration = sessionStorage.getItem('loanDuration');
        const paymentType = sessionStorage.getItem('paymentType');

        const price = localStorage.getItem('onlyPrice');

        if(paymentType == 1){
            const data = {
                carId: Number(carId),
                carName: carName,
                carColor,
                carVersion: Number(carVersion),
                price: Number(price),

                paymentName,
                paymentEmail,
                phone: phoneNumber,
                identityNumber,

                showRoomCity,
                showRoomName,

                paymentType: 1,
                installment: null
            };
            console.log(data);
            await addPayment(data);
        } else if(paymentType == 0){
            if(!bankId || !downPayment || !loanDuration){
                showToast("Vui lòng chọn các thông tin cần thiết (*)", "warning");
                return;
            } 
            const data = {
                carId: Number(sessionStorage.getItem('carId')),
                carName: sessionStorage.getItem('carName'),
                carColor,
                carVersion: Number(carVersion),
                price: Number(price),

                paymentName,
                paymentEmail,
                phone: phoneNumber,
                identityNumber,

                showRoomCity,
                showRoomName,

                paymentType: 0,
                installment: {
                bankId: Number(bankId),
                downPayment: Number(downPayment),
                loanDuration: Number(loanDuration)
                }
            };

            await addPayment(data);
        }
    })
}