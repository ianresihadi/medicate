import { encrypt } from "@common/helper/aes";
import { hashString } from "@common/helper/string-convertion.helper";
import { AdminVfs } from "@entities/admin-vfs.entity";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateAdminVpsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  intoAdminVfs(): AdminVfs {
    const adminVfs = new AdminVfs();
    adminVfs.name = this.name;
    adminVfs.address = this.address;
    adminVfs.phoneNumber = encrypt(this.phoneNumber);
    adminVfs.phoneNumberDisplay = hashString(this.phoneNumber);
    return adminVfs;
  }
}
