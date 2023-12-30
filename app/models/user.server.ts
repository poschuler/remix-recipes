import db from "~/db.server";
import { handleDelete } from "~/models/utils";

export function getUser(email: string) {
  return db.user.findUnique({ where: { email } });
}

export function createUser(email: string, firstName: string, lastName: string) {
  return db.user.create({
    data: {
      email: email,
      firstName: firstName,
      lastName: lastName,
    },
  });
}

export function getUserById(id: string) {
  return db.user.findUnique({ where: { id: id } });
}

export function deleteUser(email: string) {
  return handleDelete(async () => {
    const user = await getUser(email);

    if (!user) {
      return null;
    }

    await db.recipe.deleteMany({ where: { userId: user.id } });
    await db.pantryShelf.deleteMany({ where: { userId: user.id } });
    await db.user.deleteMany({ where: { id: user.id } });
  });
}
