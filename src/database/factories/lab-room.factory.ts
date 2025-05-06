import * as casual from "casual";
import { LabRoom } from "@entities/lab-room.entity";
import { setSeederFactory } from "typeorm-extension";

export const labRoomFactory = setSeederFactory(LabRoom, () => {
  const labRoom = new LabRoom();
  labRoom.name = casual._title();
  labRoom.createdAt = new Date();
  labRoom.updatedAt = new Date();
  return labRoom;
});
