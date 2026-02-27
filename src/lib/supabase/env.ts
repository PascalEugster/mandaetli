// Next.js requires process.env.NEXT_PUBLIC_* to be written as literal strings
// for static replacement on the client side. Dynamic access via process.env[name]
// prevents inlining and causes runtime errors in client components.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
