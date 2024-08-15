import { db } from "./db";

export const findItemById = async (id) => {
  try {
    const item = await db.songs.get(id);

    return item;
  } catch (error) {
    console.error("Failed to find item:", error);
    return null;
  }
};
