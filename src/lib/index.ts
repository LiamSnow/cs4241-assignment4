import { redirect, cache, action } from '@solidjs/router';
import { db } from './database';
import { clearUserSession, getUserSession, setUserSession } from './session';

export const getUser = cache(async () => {
  "use server";
  try {
    console.log(1111111);
    const userID = await getUserSession();
    console.log(2222222);
    if (userID === undefined || userID === null) throw new Error("User not found");
    console.log(3333333);
    const username = await db.user.getUsername(userID);
    if (!username) throw new Error("User not found");
    console.log(4444444);
    return { id: userID, username: username };
  } catch {
    console.log(999999);
    clearUserSession();
    console.log(888888);
    throw redirect("/login");
  }
}, "user");

export const register = action(async (formData: FormData) => {
  "use server";
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  if (typeof username !== "string" || username.length < 3) {
    return new Error(`Usernames must be at least 3 characters long`);
  }
  if (typeof password !== "string" || password.length < 6) {
    return new Error(`Passwords must be at least 6 characters long`);
  }

  try {
    const userID = await db.user.makeUser(username, password);
    await setUserSession(userID);
  } catch (err) {
    return err as Error;
  }
  return redirect("/");
});

export const login = action(async (formData: FormData) => {
  "use server";
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));

  try {
    const userID = await db.user.tryLogin(username, password);
    if (!userID) throw "Invalid Login";
    await setUserSession(userID);
  } catch (err) {
    return err as Error;
  }
  return redirect("/");
});

export const logout = action(async () => {
  "use server";
  await clearUserSession();
  return redirect("/login");
});
