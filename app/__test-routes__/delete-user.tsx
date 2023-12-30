import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { deleteUser } from "~/models/user.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (!email) {
    throw new Error("email is required to delete user");
  }

  await deleteUser(email);
  return redirect("/");
};
