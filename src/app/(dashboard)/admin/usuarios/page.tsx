import { getAllUsersForAdmin } from "@/features/events/infrastructure/event.repository";
import { AdminUsersTable } from "@/features/admin/presentation/components/admin-users-table";

export default async function AdminUsersPage() {
  const users = await getAllUsersForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold">Usuarios</h1>
      <p className="text-zinc-500">{users.length} usuarios registrados</p>
      <div className="mt-6">
        <AdminUsersTable users={users} />
      </div>
    </div>
  );
}
