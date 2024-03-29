import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { z } from "zod";
import { ErrorMessage, PrimaryButton, PrimaryInput } from "~/components/form";
import { generateMagicLink, sendMagicLinkEmail } from "~/magic-links.server";
import { commitSession, getSession } from "~/sessions";
import { validateForm } from "~/utils/validation";
import { v4 as uuid } from "uuid";
import { requireLoggedOutUser } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireLoggedOutUser(request);
  return null;
};

const loginSchema = z.object({
  email: z.string().email(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  await requireLoggedOutUser(request);
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);
  const formData = await request.formData();

  return validateForm(
    formData,
    loginSchema,
    async (data) => {
      const nonce = uuid();
      session.set("nonce", nonce);

      const link = generateMagicLink(data.email, nonce);
      //console.log(link);
      //await sendMagicLinkEmail(link, data.email);
      return json(
        { ok: "ok", link },
        {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    },
    (errors) => json({ errors, email: formData.get("email") }, { status: 400 })
  );
};

export default function Login() {
  const actionData = useActionData<any>();

  return (
    <div className="text-center mt-36">
      {/* {actionData === "ok" ? (
        <div>
          <h1 className="text-2xl py-8">Yum!</h1>
          <p>
            Check your email and follow the instructions to finish logging in.
          </p>
        </div>
      ) : ( */}
      <div>
        <h1 className="text-3xl">Remix Recipes</h1>
        <h1 className="text-base mb-8">(me@example.com)</h1>
        <form method="post" className="mx-auto md:w-1/3">
          <div className="text-left pb-4">
            <PrimaryInput
              type="email"
              name="email"
              placeholder="Email"
              autoComplete="off"
              defaultValue={actionData?.email}
            />
            <ErrorMessage>{actionData?.errors?.email}</ErrorMessage>
          </div>
          <PrimaryButton className="w-1/3 mx-auto">Log In</PrimaryButton>
        </form>

        {actionData?.ok === "ok" ? (
          <a href={actionData?.link}>
            <h1 className="text-xl mt-4">
              Magic link generated, please click to enter
            </h1>
            <h1>Click here to enter</h1>
          </a>
        ) : null}
      </div>
    </div>
  );
}
