import imageCompression from "browser-image-compression";

export async function processImageClient(file) {
  try {
    // Primeiro, comprimir a imagem
    const compressionOptions = {
      maxSizeMB: 0.5, // Reduzido para 500KB
      maxWidthOrHeight: 800,
      useWebWorker: true,
      initialQuality: 0.8,
    };

    const compressedFile = await imageCompression(file, compressionOptions);

    // Converter para WebP usando Canvas
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Calcular dimensões mantendo proporção
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > 800) {
            height = Math.round((height * 800) / width);
            width = 800;
          }
        } else {
          if (height > 800) {
            width = Math.round((width * 800) / height);
            height = 800;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para WebP com qualidade otimizada
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Falha ao converter para WebP"));
              return;
            }

            // Criar arquivo com nome apropriado
            const webpFile = new File(
              [blob],
              `${file.name.split(".")[0]}.webp`,
              {
                type: "image/webp",
                lastModified: Date.now(),
              }
            );

            resolve(webpFile);
          },
          "image/webp",
          0.8 // qualidade do WebP
        );
      };

      img.onerror = () => {
        reject(new Error("Erro ao carregar imagem"));
      };

      // Carregar imagem comprimida
      const reader = new FileReader();
      reader.onload = (e) => (img.src = e.target.result);
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    console.error("Erro ao processar imagem no cliente:", error);
    throw error;
  }
}
