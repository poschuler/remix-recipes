import db from "~/db.server";
import { handleDelete } from "~/models/utils";

export function createShelfItem(userId: string, shelfId: string, name: string) {
  return db.pantryItem.create({
    data: {
      userId: userId,
      shelfId: shelfId,
      name: name,
    },
  });
}

export function deleteShelfItem(shelfItemId: string) {
  return handleDelete(() =>
    db.pantryItem.delete({
      where: {
        id: shelfItemId,
      },
    })
  );
}

export function getShelfItem(id: string) {
  return db.pantryItem.findUnique({ where: { id: id } });
}
