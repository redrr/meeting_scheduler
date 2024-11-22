export async function apiCall(url: string, options?: any) {
    return await fetch(`http://localhost:8000${url}`, options)
}