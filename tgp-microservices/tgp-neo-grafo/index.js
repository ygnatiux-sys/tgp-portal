import express from 'express';
import neo4j from 'neo4j-driver';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(express.json());

const port = process.env.PORT || 8080;
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || 'password')
);

app.post('/procesar', async (req, res) => {
    try {
        const { texto } = req.body;
        if (!texto) return res.status(400).json({ error: 'Texto requerido en el body' });

        const prompt = `Convierte este texto en una consulta Cypher de Neo4j (solo la consulta, sin markdown): ${texto}`;
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const response = await model.generateContent(prompt);
        
        const cypher = response.response.text().replace(/```cypher|```/g, '').trim();
        
        const session = driver.session();
        try {
            const result = await session.run(cypher);
            res.json({ cypher, result: result.records });
        } finally {
            await session.close();
        }
    } catch (error) {
        console.error('Error procesando:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`tgp-neo-grafo listening on port ${port}`);
});
