import { UserCog } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/hooks/use-admin-users";
import { AuthInfo } from "./admin-users-auth-info";
import { RoleControl } from "./admin-users-role-control";
import { PremiumControl } from "./admin-users-premium-control";
import { AccountControl } from "./admin-users-account-control";
import { SheetSection } from "./admin-users-sheet-section";

export function ManageUserSheet({
  user,
  isCurrentUser,
  side = "bottom",
}: {
  user: AdminUser;
  isCurrentUser: boolean;
  side?: "bottom" | "right";
}) {
  const desktop = side === "right";
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size={desktop ? "sm" : "default"}
            className={desktop ? undefined : "w-full"}
          >
            <UserCog className="size-4" aria-hidden="true" />
            Gérer le compte
          </Button>
        }
      />
      <SheetContent side={side} className="gap-0 overflow-y-auto">
        <SheetHeader className="pr-10">
          <SheetTitle>{user.name}</SheetTitle>
          <SheetDescription className="break-all">
            {user.email}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 px-4 pb-4">
          <SheetSection label="Connexion">
            <AuthInfo user={user} />
          </SheetSection>
          <SheetSection label="Rôle">
            <RoleControl user={user} isCurrentUser={isCurrentUser} fullWidth />
          </SheetSection>
          <SheetSection label="Accès premium">
            <PremiumControl user={user} fullWidth />
          </SheetSection>
          <SheetSection label="Compte">
            <AccountControl
              user={user}
              isCurrentUser={isCurrentUser}
              fullWidth
            />
          </SheetSection>
        </div>
      </SheetContent>
    </Sheet>
  );
}
