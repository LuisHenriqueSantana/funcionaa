export function ImagePreview({ file, processedFile }) {
  if (!file) return null;

  return (
    <div className="mt-4 p-4 border rounded">
      <h4 className="font-bold mb-2">Informações da Imagem</h4>
      <p>Tamanho original: {(file.size / 1024 / 1024).toFixed(2)}MB</p>
      {processedFile && (
        <p>
          Tamanho após otimização:{" "}
          {(processedFile.size / 1024 / 1024).toFixed(2)}MB
        </p>
      )}
      <p>
        Redução:{" "}
        {processedFile
          ? ((1 - processedFile.size / file.size) * 100).toFixed(1) + "%"
          : "Processando..."}
      </p>
    </div>
  );
}
