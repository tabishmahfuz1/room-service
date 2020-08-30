import { TokenHandler } from '../../src/app/providers/TokenHandler';
import { injectable } from 'inversify';
import { Permissions } from '../../src/app/graphql/resolvers/Resolver';

@injectable()
export class MockTokenHandler implements TokenHandler {
  tokens= {
    YOU_SHALL_LET_ME_PASS: {
      userId: "abc@xyz.com",
      permissions: [ Permissions.Default ]
    },
    I_CAN_ADD_UPDATE_COMPANY: {
      userId: "abc@xyz.com",
      permissions: [ Permissions.AddUpdateCompany ]
    },
    I_CAN_ADD_UPDATE_DIVISION: {
      userId: "abc@xyz.com",
      permissions: [ Permissions.AddUpdateDivision ]
    },
    I_CAN_ADD_UPDATE_PMT: {
      userId: "abc@xyz.com",
      permissions: [ Permissions.AddUpdatePMT ]
    } ,
    TRUST_ME_I_AM_AN_ADMIN: {
      userId: "abc@xyz.com",
      permissions: [ Permissions.Admin ]
    }  
  }
  generate(payload: any): string {
    return payload.toString();
  }
  validate(token: string) {
    return this.tokens[token] ?? null;
  }
}
