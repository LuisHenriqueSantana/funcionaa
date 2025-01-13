import multer from "multer";

// Configurar multer para manter o arquivo em memória
const upload = multer({
  storage: multer.memoryStorage(),
});

// ... resto do código do endpoint ...

export default async function handler(req, res) {
  try {
    const imageUrl = await uploadFile(req.file);

    const produto = await Produto.create({
      ...req.body,
      imagem: imageUrl,
    });

    res.status(201).json(produto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Configuração do Next.js para lidar com form-data
export const config = {
  api: {
    bodyParser: false,
  },
};
