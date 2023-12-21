import { json } from "@remix-run/node";
import { useLoaderData, useRouteError } from "@remix-run/react";

export const loader = () => {
  return json({ message: "Yo" });
};

export default function Profile() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Profile settings</h1>
      <p>This is the profile settings page</p>
      <p>Message form loader function: {data.message}</p>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (error instanceof Error) {
    return (
      <div>
        <h1>Something went wrong!</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Something went wrong!</h1>
    </div>
  );
}
