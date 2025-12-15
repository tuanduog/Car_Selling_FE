const Base_Url = "http://localhost:7000"; // URL backend

async function getLeaderById(id){
    try {
        const response = await fetch(`${Base_Url}/api/employee/v1/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        const result = await response.json();
        if(result.statusCode === 200){
            return result.data;
        } else {
            showToast("Lấy thông tin thất bại", "error");
            return null;
        }
    } catch(error){
        console.error(error);
        return null;
    }
}

export async function handleEdit(id){
    const leader = await getLeaderById(id);
    if(!leader) return;

    document.getElementById('employeeCode1').value = leader.code;
}
