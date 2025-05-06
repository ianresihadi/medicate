import * as casual from "casual";
import { Account } from "@entities/account.entity";
import { setSeederFactory } from "typeorm-extension";

export const accountFactory = setSeederFactory(Account, () => {
  const account = new Account();
  account.email = casual._email();
  account.password = "password123";
  account.activeStatus = true;
  account.createdAt = new Date();
  account.updatedAt = new Date();
  return account;
});
