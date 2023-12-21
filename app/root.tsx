import type { LinksFunction, MetaFunction } from "@remix-run/node";
import stylesheet from "~/tailwind.css";

import {
  Link,
  Links,
  LiveReload,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useNavigation,
  useResolvedPath,
  useRouteError,
} from "@remix-run/react";
import {
  DiscoverIcon,
  HomeIcon,
  RecipeBookIcon,
  SettingsIcon,
} from "~/components/icons";
import { classNames } from "~/utils/misc";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Recipes" },
    { name: "description", content: "Welcome to Remix Recipes App!" },
  ];
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="md:flex md:h-screen bg-background">
        <nav className="bg-primary text-white">
          <ul className="flex md:flex-col">
            <AppNavLink to="/">
              <HomeIcon />
            </AppNavLink>

            <AppNavLink to="discover">
              <DiscoverIcon />
            </AppNavLink>

            <AppNavLink to="app">
              <RecipeBookIcon />
            </AppNavLink>

            <AppNavLink to="settings">
              <SettingsIcon />
            </AppNavLink>
          </ul>
        </nav>
        <div className="p-4 w-full md:w-[calc(100%-4rem)]">
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

type AppNavLinkProps = {
  to: string;
  children: React.ReactNode;
};

function AppNavLink({ to, children }: AppNavLinkProps) {
  const path = useResolvedPath(to);
  const navigation = useNavigation();

  const isLoading =
    navigation.state === "loading" &&
    navigation.location.pathname === path.pathname &&
    !navigation.formData;

  return (
    <li className="w-16">
      <NavLink to={to}>
        {({ isActive }) => (
          <div
            className={classNames(
              "py-4 flex justify-center hover:bg-primary-light",
              isActive ? "bg-primary-light" : "",
              isLoading ? "animate-pulse bg-primary-light" : ""
            )}
          >
            {children}
          </div>
        )}
      </NavLink>
    </li>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <html>
        <head>
          <title>Whoops!</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          <div className="p-4">
            <h1 className="text-2xl pb-3">
              {error.status} - {error.statusText}
            </h1>
            <p>You're seeing this page because an error occurred.</p>
            <p className="my-4 font-bold">{error.data.message}</p>
            <Link to="/" className="text-primary">
              Take me home
            </Link>
          </div>
        </body>
      </html>
    );
  }

  let errorMessage = "Unknown error";
  let stacktrace = "";
  if (error instanceof Error) {
    errorMessage = error.message;
    stacktrace = error.stack ? error.stack : "";
  }

  return (
    <html>
      <head>
        <title>Whoops!</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="p-4">
          <h1 className="text-2xl pb-3">Whoops!</h1>
          <p>You're seeing this page because an unexpected error occurred.</p>
          <p className="my-4 font-bold">{errorMessage}</p>
          <p className="my-4 font-bold">{stacktrace}</p>
          <Link to="/" className="text-primary">
            Take me home
          </Link>
        </div>
      </body>
    </html>
  );
}
