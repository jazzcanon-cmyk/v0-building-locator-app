import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url)
    const id = pathname.split('/api/posts/')[1]?.split('/')[0]
    if (!id || id === 'undefined') {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, content, author, image_url, created_at, view_count, comments(id, content, author, created_at)')
      .eq('id', id)
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    return NextResponse.json({ post: data })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { pathname } = new URL(request.url)
    const id = pathname.split('/api/posts/')[1]?.split('/')[0]
    if (!id || id === 'undefined') {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }
    const { title, content } = await request.json()
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('posts')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ post: data })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { pathname } = new URL(request.url)
    const id = pathname.split('/api/posts/')[1]?.split('/')[0]
    if (!id || id === 'undefined') {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
    }
    // 댓글 먼저 삭제
    await supabase.from('comments').delete().eq('post_id', id)
    // 게시글 삭제
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
