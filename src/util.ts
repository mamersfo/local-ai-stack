import { SupabaseClient } from '@supabase/supabase-js'
import { pipeline } from '@xenova/transformers'

const embedding_endpoint = process.env.SUPABASE_EMBEDDING_ENDPOINT!

export async function vectorSearch(
  client: SupabaseClient,
  contentToSearch: string
) {
  const embedding = await generateEmbedding(contentToSearch)
  const result = await client.rpc('match_documents', {
    query_embedding: embedding,
    match_count: 3,
  })

  if (result.error) {
    console.error('ERROR: ', result.error)
  }
  return result.data || ''
}

export async function generateEmbedding(content: string) {
  const generateEmbedding = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  )

  // Generate a vector using Transformers.js
  const output = await generateEmbedding(content, {
    pooling: 'mean',
    normalize: true,
  })

  // Extract the embedding output
  const embedding = Array.from(output.data)
  return embedding
}
