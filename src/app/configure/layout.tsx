//import MaxWidthWrapper from '@/components/Max'
import { ReactNode } from "react";
import MaxWidtWrapper from "../components/MaxWidtWrapper";
import Steps from "../components/Steps";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <MaxWidtWrapper className="flex-1 flex flex-col">
      <Steps />
      {children}
    </MaxWidtWrapper>
  );
};

export default Layout;
//<Steps />
