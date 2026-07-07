/* ─── Rasterização de SVG para PNG (usado no relatório PDF) ──────────────── */

export function svgElementToPngDataUrl(svgEl, size = 900) {
    return new Promise((resolve, reject) => {
        const clone = svgEl.cloneNode(true);
        clone.setAttribute("width", String(size));
        clone.setAttribute("height", String(size));
        const data = new XMLSerializer().serializeToString(clone);
        const url = URL.createObjectURL(new Blob([data], { type: "image/svg+xml;charset=utf-8" }));
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            canvas.getContext("2d").drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Falha ao rasterizar o diagrama"));
        };
        img.src = url;
    });
}
