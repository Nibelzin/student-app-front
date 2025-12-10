import { GoogleGenAI } from "@google/genai"

type GeneratedText = {
    originalText?: string
    generatedContent: unknown
}

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY

const ai = new GoogleGenAI({ apiKey: geminiApiKey })

export async function generateText(prompt?: string): Promise<GeneratedText> {
    if (!prompt || !prompt.trim()) {
        throw new Error('O prompt não pode ser vazio')
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: `
                Você é um assistente de organização de estudos.
        A cada entrada do usuário, você deve interpretar o texto original e então organizar, resumir, estruturar ou responder, sempre de forma simples e objetiva, adequada para ser usada diretamente em uma nota de estudo.

        Como decidir o que fazer:

        Se o texto for uma pergunta, responda de forma clara, objetiva e curta.

        Se o texto for conteúdo de estudo, anotações, tópicos ou texto solto, organize, resuma e deixe estruturado.

        Não invente fatos não mencionados ou sem base no texto.

        Formato obrigatório da resposta:
        Você sempre deve responder exclusivamente no seguinte formato JSON:

        {
        "originalText": "TEXTO ORIGINAL AQUI",
        "generatedContent": "{\"type\":\"doc\",\"content\":[ ... ]}"
        }


        Regras para generatedContent:

        O valor de "generatedContent" deve ser uma string JSON válida, seguindo o modelo de documentos no estilo ProseMirror / Tiptap.

        Você pode usar Markdown dentro dos textos, desde que o JSON permaneça válido.

        Utilize apenas elementos como:

        heading

        paragraph

        bulletList

        listItem

        horizontalRule

        Exemplo de resposta esperada:

        {
        "originalText": "originalText",
        "generatedContent": "{\"type\":\"doc\",\"content\":[{\"type\":\"heading\",\"attrs\":{\"level\":1},\"content\":[{\"type\":\"text\",\"text\":\"TESTE 1\"}]},{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Olá\"}]},{\"type\":\"horizontalRule\"}]}"
        }
        ` + (prompt ? `\n\nUsuário: ${prompt}` : ""),
    })

    const rawText: any = (response as any).text
    const text = typeof rawText === 'function' ? rawText() : rawText

    if (!text) {
        throw new Error('Nenhuma resposta foi retornada pelo modelo')
    }

    const cleaned = text.replace(/```json|```/g, '').trim()

    let parsed: { originalText?: string; generatedContent?: string }
    try {
        parsed = JSON.parse(cleaned)
    } catch (error) {
        throw new Error('Não foi possível interpretar a resposta do modelo')
    }

    if (!parsed.generatedContent) {
        throw new Error('A resposta não contém generatedContent')
    }

    let generatedContent: unknown
    try {
        generatedContent = JSON.parse(parsed.generatedContent)
    } catch (error) {
        throw new Error('generatedContent não é um JSON válido para o Tiptap')
    }

    return {
        originalText: parsed.originalText,
        generatedContent,
    }
}