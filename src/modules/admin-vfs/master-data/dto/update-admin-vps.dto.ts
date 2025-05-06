import { PartialType } from '@nestjs/swagger';
import { CreateAdminVpsDto } from './create-admin-vps.dto';
import { AdminVfs } from '@entities/admin-vfs.entity';
import { encrypt } from '@common/helper/aes';
import { hashString } from '@common/helper/string-convertion.helper';

export class UpdateAdminVpsDto extends PartialType(CreateAdminVpsDto) {
  intoUpdateAdminVfs(): AdminVfs {
    const adminVfs = new AdminVfs();
    adminVfs.name = this.name;
    adminVfs.address = this.address;
    adminVfs.phoneNumber = encrypt(this.phoneNumber);
    adminVfs.phoneNumberDisplay = hashString(this.phoneNumber);
    return adminVfs;
  }
}
