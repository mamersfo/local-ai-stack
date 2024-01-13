import { createClient } from '@supabase/supabase-js'
import { Ollama } from '@langchain/community/llms/ollama'
import { vectorSearch } from '@/util'

export async function POST(req: Request) {
  const { prompt } = await req.json()
  const ollama_endpoint = process.env.OLLAMA_URL

  if (!ollama_endpoint) throw new Error(`Expected env var OLLAMA_URL`)

  const ollama_model = process.env.OLLAMA_MODEL

  const privateKey = process.env.SUPABASE_PRIVATE_KEY
  if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`)

  const url = process.env.SUPABASE_URL
  if (!url) throw new Error(`Expected env var SUPABASE_URL`)

  const auth = {
    detectSessionInUrl: false,
    persistSession: false,
    autoRefreshToken: false,
  }
  const client = createClient(url, privateKey, { auth })

  let model

  model = new Ollama({
    baseUrl: ollama_endpoint,
    model: ollama_model ? ollama_model : 'ollama',
  })
  model.verbose = true
  const data = await vectorSearch(client, prompt)
  const contextData = data.map((d: any) => d.content)

  const modifiedPrompt = `Please answer the users question based on the following context. If you can't answer the question based on the context, say 'I don't know'.
  
  Question: ${prompt}
  
  Context: ${JSON.stringify(contextData)}`
  const result = await model.call(modifiedPrompt)

  return new Response(result)
}
