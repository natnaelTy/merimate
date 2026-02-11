import MarketingFooter from "@/components/Footer";
import MarketingHeader from "@/components/Header";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="mx-auto flex w-full flex-col">
        <div className="px-6">
          <MarketingHeader />
        </div>
        {children}
        <div>
          <MarketingFooter />
        </div>
      </div>
    </div>
  );
}

export default ClientLayout;
