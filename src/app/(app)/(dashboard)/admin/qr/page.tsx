import { AdminQrManager } from "@/features/admin/presentation/components/admin-qr-manager";
import { getSiteQrUrl } from "@/config/site";

export default async function AdminQrPage() {
  const siteUrl = getSiteQrUrl();

  return (
    <div>
      <h1 className="text-2xl font-bold">QR de la web</h1>
      <p className="text-on-surface-variant">
        Código único para folletos y carteles — apunta a estuveahi.com.ar
      </p>
      <div className="mt-8">
        <AdminQrManager siteUrl={siteUrl} />
      </div>
    </div>
  );
}
