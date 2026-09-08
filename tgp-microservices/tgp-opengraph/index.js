import express from 'express';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const app = express();
const port = process.env.PORT || 8080;

app.get('/generar', async (req, res) => {
    try {
        const title = req.query.title || 'The Great Puzzle Project';
        
        const fontData = await fetch('https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.woff')
            .then(res => res.arrayBuffer());
            
        const svg = await satori(
            {
                type: 'div',
                props: {
                    style: {
                        backgroundColor: '#0f0f0f',
                        color: '#d4af37',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 80,
                        fontFamily: 'Inter',
                        textAlign: 'center',
                        padding: '40px'
                    },
                    children: title,
                }
            },
            {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        name: 'Inter',
                        data: fontData,
                        weight: 400,
                        style: 'normal',
                    }
                ],
            }
        );

        const resvg = new Resvg(svg, {
            background: '#0f0f0f',
            font: {
                loadSystemFonts: false,
            },
        });
        const pngData = resvg.render();
        const pngBuffer = pngData.asPng();

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(pngBuffer);
    } catch (error) {
        console.error('Error generando opengraph:', error);
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`tgp-opengraph listening on port ${port}`);
});
