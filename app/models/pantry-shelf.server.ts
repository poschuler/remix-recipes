import db from "~/db.server";
import { handleDelete } from "~/models/utils";

export function getAllShelves(userId: string, query: string | null) {
  return db.pantryShelf.findMany({
    where: {
      userId: userId,
      name: {
        contains: query ?? "",
        mode: "insensitive",
      },
    },
    include: {
      pantryItems: {
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export function createShelf(userId: string) {
  return db.pantryShelf.create({
    data: {
      userId: userId,
      name: "New Shelf",
    },
  });
}

export function deleteShelf(shelfId: string) {
  return handleDelete(() =>
    db.pantryShelf.delete({
      where: {
        id: shelfId,
      },
    })
  );
}

export function saveShelfName(shelfId: string, shelfName: string) {
  return db.pantryShelf.update({
    where: {
      id: shelfId,
    },
    data: {
      name: shelfName,
    },
  });
}

export function getShelf(id: string) {
  return db.pantryShelf.findUnique({ where: { id: id } });
}
