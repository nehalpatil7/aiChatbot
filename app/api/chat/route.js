import { NextResponse } from "next/server";
import OpenAI from "openai";


let conversationHistory = [];

export async function POST(req) {
    const openai = new OpenAI({
        baseURL: process.env.NEXT_PUBLIC_OPENROUTER_ENDPOINT,
        apiKey: process.env.OPENROUTER_API_KEY,
    });

    const { userinfo, messages }  = await req.json();
    if (conversationHistory.length === 0 || conversationHistory[0].content !== userinfo) {
        conversationHistory = [{ role: 'system', content: userinfo }];
    }
    conversationHistory.push(...messages);

    const completion = await openai.chat.completions.create({
        messages: conversationHistory,
        model: 'gpt-4o-mini',
        stream: true
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0].delta.content;
                    if (content) {
                        const lastItem = conversationHistory[conversationHistory.length - 1];
                        if (lastItem.role !== 'assistant') {
                            conversationHistory.push({ role: 'assistant', content: content });
                        } else {
                            lastItem.content += content;
                        }

                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (error) {
                controller.error(error);
            } finally {
                controller.close();
            }
        },
    });

    return new NextResponse(stream);
}