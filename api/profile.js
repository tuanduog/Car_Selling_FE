const Base_Url = "http://localhost:7000"

export async function updatePassword(email, currentPassword, newPassword) {
    const token = localStorage.getItem('jwt');
    const response = await fetch(`${Base_Url}/api/profile/password/v1`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, currentPassword, newPassword })
    });
    return response.json();
}