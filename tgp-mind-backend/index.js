const { http } = require('@google-cloud/functions-framework');
const { GoogleGenAI } = require('@google/genai');

http('tgpApp', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'GET, POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(204).send('');
    }

    if (req.method !== 'POST') return res.status(405).send('Solo POST.');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const { imageBase64, mimeType, ambito, coleccion } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader || authHeader !== `Bearer ${process.env.TGP_SECRET_TOKEN}`) {
            return res.status(401).json({ success: false, error: 'Acceso no autorizado.' });
        }

        if (!imageBase64 || !ambito || !coleccion) {
            return res.status(400).json({ success: false, error: 'Faltan datos en el payload.' });
        }

        const systemPrompt = "Actúa como el motor cognitivo de The Great Puzzle Project. Analiza esta imagen y redacta un artículo breve y denso en estilo ensayístico. Enfócate en la dimensión simbólica, la profundidad histórica y las condiciones materiales o narrativas que la imagen sugiere. Devuelve el resultado ESTRICTAMENTE en formato JSON con dos claves: 'title' (un título atractivo) y 'content' (el cuerpo del texto, sin título inicial).";

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-pro',
            contents: [
                systemPrompt,
                { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } }
            ],
            config: { responseMimeType: "application/json" }
        });

        const geminiOutput = JSON.parse(response.text);
        const date = new Date().toISOString().split('T')[0];
        const slug = geminiOutput.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const fileName = `${slug}.mdx`;

        let githubPath = '';
        let markdownContent = '';

        if (ambito === 'web-principal') {
            githubPath = `src/content/${coleccion}/${fileName}`;
            markdownContent = `---\ntitle: "${geminiOutput.title}"\ndate: ${date}\nstatus: 'draft'\n---\n${geminiOutput.content}`;
        } else if (ambito === 'tgp-ebooks') {
            githubPath = `tgp-ebooks/src/content/${coleccion}/${fileName}`;
            markdownContent = `---\ntitle: "${geminiOutput.title}"\nchapter_number: 0\ndraft: true\n---\n${geminiOutput.content}`;
        }

        const base64Content = Buffer.from(markdownContent).toString('base64');
        const githubUrl = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${githubPath}`;
        
        const githubResponse = await fetch(githubUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'TGP-App',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `TGP App: Nueva captura visual - ${geminiOutput.title}`,
                content: base64Content,
                branch: process.env.GITHUB_BRANCH || 'main'
            })
        });

        if (!githubResponse.ok) {
            const errorData = await githubResponse.text();
            console.error("Error de API GitHub:", errorData);
            throw new Error("Falla al escribir en el repositorio.");
        }

        return res.status(200).json({ success: true, message: 'Documento forjado y archivado con éxito.', path: githubPath });

    } catch (error) {
        console.error('Error en TGP App FaaS:', error);
        return res.status(500).json({ success: false, error: 'Falla interna en el motor cognitivo.' });
    }
});
