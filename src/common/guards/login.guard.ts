import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class LoginGuard extends AuthGuard('local'){
    async canActivate(context: ExecutionContext) {
        var result = (await super.canActivate(context)) as boolean;
        const request = context.switchToHttp().getRequest();
        await super.logIn(request);
  
        return result;
      }
}