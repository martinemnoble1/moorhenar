export const doDownload = (content: string) => {
    const url = window.URL.createObjectURL(
        new Blob([content]),
    );
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
        'download',
        "download.gltf",
    );

    // Append to html link element page
    document.body.appendChild(link);

    // Start download
    link.click();

    // Clean up and remove the link
    link.parentNode?.removeChild(link);
}