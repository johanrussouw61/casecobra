import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs";
import type { Dispatch, SetStateAction } from "react";

const LoginModal = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <div className="bg-white">
        <DialogContent className="absolute z-99999">
          <DialogHeader>
            <DialogTitle className="mt-5 text-3xl text-center font-bold tracking-tight text-gray-900 bg-white">
              Log in to continue
            </DialogTitle>
            <DialogDescription className="text-base text-center py-2 bg-white">
              <span className="font-medium text-zinc-900">
                Your configuration was saved!
              </span>{" "}
              Please login or create an account to complete your purchase.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 divide-x divide-gray-200 bg-white">
            <LoginLink className={buttonVariants({ variant: "outline" })}>
              Login
            </LoginLink>
            <RegisterLink className={buttonVariants({ variant: "default" })}>
              Sign up
            </RegisterLink>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default LoginModal;
