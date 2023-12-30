import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { PrimaryButton } from "~/components/form";
import { themeCookie } from "~/cookies";
import { validateForm } from "~/utils/validation";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("cookie");
  const theme = await themeCookie.parse(cookieHeader);
  return {
    theme: typeof theme !== "string" ? "green" : theme,
  };
};

const themeSchema = z.object({
  theme: z.string(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  return validateForm(
    formData,
    themeSchema,
    async ({ theme }) =>
      json(
        { theme },
        {
          headers: { "Set-Cookie": await themeCookie.serialize(theme) },
        }
      ),
    (errors) => json({ errors }, { status: 400 })
  );
};

export default function App() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<any>();

  return (
    <Form reloadDocument method="post">
      <div className="mb-4 flex flex-col">
        <label htmlFor="theme"></label>
        <select
          name="theme"
          id="theme"
          className="p-2 mt-2 border-2 border-gray-200 rounded-md w-full md:w-64"
          defaultValue={actionData?.theme ?? data.theme}
        >
          <option value="red">Red</option>
          <option value="orange">Orange</option>
          <option value="yellow">Yellow</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
          <option value="purple">Purple</option>
        </select>
      </div>
      <PrimaryButton>Save</PrimaryButton>
    </Form>
  );
}
