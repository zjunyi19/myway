export const convertBase64ToImage = (avatar) => {
    if (!avatar || !avatar.data || !avatar.contentType) {
        return 'https://via.placeholder.com/40';
    }
    return `data:${avatar.contentType};base64,${arrayBufferToBase64(avatar.data.data)}`;
};

export const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}; 