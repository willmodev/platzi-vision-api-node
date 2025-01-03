import OpenAI from 'openai';


export const postChat = async (req, res) => {
    try {
        const data = req.body;

        const formatted_messages = [
            {
                role: "system",
                content: "Eres un asistente llamado PlatziVision, tu objetivo es ayudar a los usuarios a resolver sus dudas con claridad y precisión."
            }
        ]

        for (const message of data.messages) {
            const content_parts = [];
            if (message.content) {
                content_parts.push({
                    type: "text",
                    text: message.content
                });
            }
            if (message.image_data) {
                for (const image_data_base64 of message.image_data) {
                    content_parts.push({
                        type: "image_url",
                        image_url: {
                            url: `data:image/png;base64,${image_data_base64}`
                        }
                    });
                }
            }
            formatted_messages.push({
                role: message.role,
                content: content_parts
            });
        }

        console.log(JSON.stringify(formatted_messages, null, 2))

        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: formatted_messages,
            stream: true
        })

        const generate = async () => {
            for await (const chunk of response) {
                if (chunk.choices[0]?.delta?.content) {
                    res.write(`data: ${JSON.stringify({
                        content: chunk.choices[0]?.delta?.content,
                        status: "streaming"
                    })}\n\n`);
                }
    
                if (chunk.choices[0]?.finish_reason === "stop") {
                    res.write(`data: ${JSON.stringify({
                        status: "done"
                    })}\n\n`);
                    res.end();
                    break;
                }
            }
        }

        generate();


    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error al procesar la solicitud",
            status: "error"
        });

    }



}

