document.addEventListener('DOMContentLoaded', function () {
    getFiles();
    setInterval(getFiles, 1000);

    const clearButton = document.getElementById('clearButton');
    clearButton.addEventListener('click', clearFiles);
});

let lastJson = null;
function getFiles() {
    fetch('http://localhost:12001/listFiles')
        .then(async response => {
            const currentJson = await response.json();
            if (JSON.stringify(currentJson) === lastJson) return;
            lastJson = JSON.stringify(currentJson);

            const fileList = document.getElementById('fileList');
            fileList.innerHTML = '';
            currentJson.forEach(file => {
                const li = document.createElement('li');
                li.className = "list-group-item";
                const link = document.createElement('a');
                link.href = "file://" + file.fullPath;
                const dateWithouthSecond = new Date(file.time);
                const time = dateWithouthSecond.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                link.textContent = `${time} - ${file.fileName}`;

                link.type = "text/plain";
                li.appendChild(link);
                fileList.appendChild(li);
            });
        })
        .catch(error => console.error('Erro ao obter a lista de arquivos:', error));
}

function clearFiles() {
    fetch('http://localhost:12001/clearFiles', { method: 'DELETE' })
        .then(() => getFiles())
        .catch(error => console.error('Erro ao limpar a lista de arquivos:', error));
}
