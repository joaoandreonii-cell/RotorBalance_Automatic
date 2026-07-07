/* ─── Compressão de imagem client-side (logo do relatório) ───────────────── */

export function fileToCompressedDataUrl(file, { maxDim = 512, quality = 0.85 } = {}) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(img.width * scale));
                canvas.height = Math.max(1, Math.round(img.height * scale));
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
                resolve(canvas.toDataURL(mime, quality));
            };
            img.onerror = () => reject(new Error("Imagem inválida"));
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}
