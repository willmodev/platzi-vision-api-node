import OpenAI from 'openai';



const generateImage = async (prompt, quality = "standard") => {

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


    try {
        const response = await client.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            quality: quality,
            n: 1,

        })

        console.log("Imagen generada correctamente")
        return response.data[0].url;
    } catch (error) {
        console.log("Error al generar la imagen", error)
        return null;
    }
}

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


        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const tools = [
            {
                type: "function",
                function: {
                    name: "generateImage",
                    description: "Cuando el usuario lo solicite, genera una imagen",
                    parameters: {
                        type: "object",
                        properties: {
                            prompt: {
                                type: "string",
                                description: "El prompt que generará la imagen"
                            },
                            quality: {
                                type: "string",
                                description: "La calidad de la imagen puede ser 'hd' o 'standard'"
                            }
                        }
                    }
                }
            }
        ];



        const generate = async () => {
            let currentToolCallId = null;
            let accumulatedArgs = "";
            let response = null;


            while (true) {

                if (response === null) {
                    response = await client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: formatted_messages,
                        tools: tools,
                        stream: true
                    })
                }

                try {


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

                        if (chunk.choices[0].delta.tool_calls) {
                            let toolCall = chunk.choices[0].delta.tool_calls[0];

                            if (toolCall.id && toolCall.function.name) {
                                currentToolCallId = toolCall.id;
                            }

                            if (toolCall.function.arguments && Object.keys(toolCall.function.arguments).length > 0) {
                                accumulatedArgs += toolCall.function.arguments;
                                console.log(`Argumentos generados: ${toolCall.function.arguments}`);
                            }

                            if (accumulatedArgs.trim().endsWith('}')) {
                                try {
                                    console.log("Iniciando la llamada a la función");
                                    let functionArgs = JSON.parse(accumulatedArgs);

                                    if ('prompt' in functionArgs) {
                                        res.write(`data: ${JSON.stringify({
                                            status: "generating_image"
                                        })}\n\n`);

                                        let imageUrl = await generateImage(functionArgs.prompt, functionArgs.quality);

                                        formatted_messages.push({
                                            role: "assistant",
                                            content: null,
                                            tool_calls: [{
                                                id: currentToolCallId,
                                                function: {
                                                    name: "generated_image",
                                                    arguments: accumulatedArgs
                                                },
                                                type: "function"
                                            }]
                                        })

                                        formatted_messages.push({
                                            role: "tool",
                                            tool_call_id: currentToolCallId,
                                            content: imageUrl
                                        })

                                        response = null;
                                        break;
                                    }
                                } catch (error) {
                                    console.log("Error al parsear los argumentos", error);
                                }
                            }
                        }
                    }
                } catch (error) {
                    if (error.message.includes('Cannot iterate over a consumed stream')) {
                        response = null;
                        continue;
                    }
                    throw error;
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

