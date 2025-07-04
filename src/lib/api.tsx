import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

export const fetchActions = async (zapId: string | string[] | undefined) => {
  if (!zapId || Array.isArray(zapId)) return [];

  const { data, error } = await supabase
    .from("Action")
    .select("*")
    .eq("zapId", zapId);

  if (error) throw new Error(error.message);
  return data;
};

export const fetchAvailableActions = async () => {
  const { data, error } = await supabase.from("AvailableActions").select("*");

  if (error) throw new Error(error.message);
  return data;
};
