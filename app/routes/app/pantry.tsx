import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
} from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { z } from "zod";
import { DeleteButton, ErrorMessage, PrimaryButton } from "~/components/form";
import { PlusIcon, SaveIcon, SearchIcon } from "~/components/icons";
import {
  createShelf,
  deleteShelf,
  getAllShelves,
  saveShelfName,
} from "~/models/pantry-shelf.server";
import { classNames } from "~/utils/misc";
import { validateForm } from "~/utils/validation";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const shelves = await getAllShelves(q);
  return json({ shelves });
};

const saveShelfNameSchema = z.object({
  shelfId: z.string(),
  shelfName: z.string().min(1, "Shelf name cannot be blank"),
});

const deleteShelfSchema = z.object({
  shelfId: z.string(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const _action = formData.get("_action");
  //const { _action } = Object.fromEntries(formData);

  if (_action === "createShelf") {
    return createShelf();
  }

  if (_action === "deleteShelf") {
    return validateForm(
      formData,
      deleteShelfSchema,
      (data) => deleteShelf(data.shelfId),
      (errors) => json({ errors }, { status: 400 })
    );
  }

  if (_action === "saveShelfName") {
    return validateForm(
      formData,
      saveShelfNameSchema,
      (data) => saveShelfName(data.shelfId, data.shelfName),
      (errors) => json({ errors }, { status: 400 })
    );
  }

  return null;

  // switch (formData.get("_action")) {
  //   case "createShelf": {
  //     return createShelf();
  //   }
  //   case "deleteShelf": {
  //     const shelfId = formData.get("shelfId");
  //     if (typeof shelfId !== "string") {
  //       return json({ errors: { shelfId: "Shelf ID must be a string" } });
  //     }
  //     return deleteShelf(shelfId);
  //   }
  //   default: {
  //     return null;
  //   }
  // }
};

export default function Pantry() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const createShelfFetcher = useFetcher();
  const navigation = useNavigation();

  const isSearching = navigation.formData?.has("q");
  const isCreatingShelf =
    createShelfFetcher.formData?.get("_action") === "createShelf";

  return (
    <div>
      <Form
        className={classNames(
          "flex border-2 border-gray-300 rounded-md",
          "focus-within:border-primary md:w-80",
          isSearching ? "animate-pulse" : ""
        )}
      >
        <button className="px-2 mr-1">
          <SearchIcon />
        </button>
        <input
          defaultValue={searchParams.get("q") ?? ""}
          type="text"
          name="q"
          autoComplete="false"
          placeholder="Search Shelves..."
          className="w-full py-3 px-2 outline-none"
        />
      </Form>

      <createShelfFetcher.Form method="post">
        <PrimaryButton
          name="_action"
          value="createShelf"
          className={classNames("mt-4 w-full md:w-fit")}
          isLoading={isCreatingShelf}
        >
          <PlusIcon />
          <span className="pl-2">
            {isCreatingShelf ? "Creating Shelf" : "Create Shelf"}
          </span>
        </PrimaryButton>
      </createShelfFetcher.Form>

      <ul
        className={classNames(
          "flex gap-8 overflow-x-auto mt-4 pb-4",
          "snap-x snap-mandatory",
          "md:snap-none"
        )}
      >
        {data.shelves.map((shelf) => (
          <Shelf key={shelf.id} shelf={shelf} />
        ))}
      </ul>
    </div>
  );
}

type ShelfProps = {
  shelf: {
    id: string;
    name: string;
    pantryItems: {
      id: string;
      name: string;
    }[];
  };
};

function Shelf({ shelf }: ShelfProps) {
  const deleteShelfFetcher = useFetcher();
  const saveShelfNameFetcher = useFetcher<any>();

  const isDeletingShelf =
    deleteShelfFetcher.formData?.get("_action") === "deleteShelf" &&
    deleteShelfFetcher.formData?.get("shelfId") === shelf.id;

  return isDeletingShelf ? null : (
    <li
      key={shelf.id}
      className={classNames(
        "border-2 border-primary rounded-md p-4",
        "w-[calc(100vw-2rem)] flex-none snap-center h-fit",
        "md:w-96"
      )}
    >
      <saveShelfNameFetcher.Form method="post" className="flex">
        <div className="w-full mb-2">
          <input
            type="text"
            name="shelfName"
            placeholder="Shelf Name"
            autoComplete="off"
            defaultValue={shelf.name}
            className={classNames(
              "text-2xl font-extrabold w-full outline-none",
              "border-b-2 border-b-background focus:border-b-primary",
              saveShelfNameFetcher.data?.errors?.shelfName
                ? "border-b-red-600"
                : ""
            )}
          />
          <ErrorMessage>
            {saveShelfNameFetcher.data?.errors?.shelfName}
          </ErrorMessage>
        </div>
        <button name="_action" value="saveShelfName" className="ml-4">
          <SaveIcon />
        </button>
        <input type="hidden" name="shelfId" value={shelf.id} />
        <ErrorMessage className="pl-2">
          {saveShelfNameFetcher.data?.errors?.shelfId}
        </ErrorMessage>
      </saveShelfNameFetcher.Form>
      <ul>
        {shelf.pantryItems.map((item) => (
          <li key={item.id} className="py-2">
            {item.name}
          </li>
        ))}
      </ul>
      <deleteShelfFetcher.Form method="post" className="pt-8">
        <input type="hidden" name="shelfId" value={shelf.id} />
        <ErrorMessage className="pb-2">
          {deleteShelfFetcher.data?.errors?.shelfId}
        </ErrorMessage>
        <DeleteButton className="w-full" value="deleteShelf" name="_action">
          Delete Shelf
        </DeleteButton>
      </deleteShelfFetcher.Form>
    </li>
  );
}
