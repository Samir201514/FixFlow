import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateStaffProfileDto } from "./create-staff-profile.dto.js";

export class UpdateStaffProfileDto extends PartialType(
  OmitType(CreateStaffProfileDto, ["userId"] as const),
) {}
