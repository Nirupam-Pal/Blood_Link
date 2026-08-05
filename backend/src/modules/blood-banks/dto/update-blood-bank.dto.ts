import { OmitType, PartialType } from "@nestjs/swagger";
import { RegisterBloodBankDto } from "./register-blood-bank.dto";

export class UpdateBloodBankDto extends PartialType(
    OmitType(RegisterBloodBankDto, ['password', 'email'] as const)
) {}