import { createClient } from '@/utils/supabase/server';

export default async function Expenses() {
  const supabase = await createClient();
  const { data: expenses } = await supabase.from("expenses").select();

  return <pre>{JSON.stringify(expenses, null, 2)}</pre>
}