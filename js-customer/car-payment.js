
export function renderDetail(){
    const carImage = localStorage.getItem('carImage');
    document.getElementById('carImage').src = carImage;
    const wheelBase = localStorage.getItem('wheelBase');
    document.getElementById('wheelBase').innerHTML = `${wheelBase} mm`;
    const batteryRange = localStorage.getItem('batteryRange');
    document.getElementById('batteryRange').innerHTML = `${batteryRange} (NEDC)`;
    const maxPower = localStorage.getItem('maxPower');
    document.getElementById('maxPower').innerHTML = `${maxPower} kW`;
}