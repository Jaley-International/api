import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { CustomStrategy } from "./strategies/custom.strategy";

@Module({})
export class AuthModule {
  static forRoot() {
    return {
      module: AuthModule,
      imports: [
        PassportModule.register({ defaultStrategy: 'custom' }),
      ],
      providers: [CustomStrategy],
      exports: [CustomStrategy, PassportModule],
    };
  }
}