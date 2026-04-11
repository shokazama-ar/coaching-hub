"use client";

import { useState, useTransition } from "react";
import { createRoleAction, deleteRoleAction, assignRoleAction } from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Role = { id: string; name: string; is_admin: boolean };
type Member = { id: string; display_name: string | null; role_id: string | null };

export default function RolesManager({
  roles: initialRoles,
  members,
  teamId,
}: {
  roles: Role[];
  members: Member[];
  teamId: string;
}) {
  const router = useRouter();
  const [roles, setRoles] = useState(initialRoles);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createRoleAction(formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        (e.target as HTMLFormElement).reset();
        router.refresh();
      }
    });
  };

  const handleDelete = (roleId: string) => {
    startTransition(async () => {
      const result = await deleteRoleAction(roleId);
      if ("error" in result) setError(result.error);
      else router.refresh();
    });
  };

  const handleAssign = (profileId: string, roleId: string) => {
    startTransition(async () => {
      const result = await assignRoleAction(profileId, roleId);
      if ("error" in result) setError(result.error);
      else router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Role list */}
      <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">ロール一覧</h2>
        {roles.length === 0 && (
          <p className="text-xs text-gray-400">ロールがありません</p>
        )}
        <ul className="space-y-2">
          {roles.map((role) => (
            <li
              key={role.id}
              className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-800">{role.name}</span>
                {role.is_admin && (
                  <Badge variant="secondary" className="text-[10px]">
                    管理者
                  </Badge>
                )}
              </div>
              <button
                onClick={() => handleDelete(role.id)}
                className="text-gray-400 hover:text-red-500"
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <Separator />

        <form onSubmit={handleCreate} className="space-y-3">
          <h3 className="text-xs font-medium text-gray-600">新しいロールを追加</h3>
          <div className="flex gap-2">
            <Input name="name" placeholder="ロール名" required className="flex-1" />
            <Button type="submit" disabled={isPending} size="sm">
              追加
            </Button>
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" name="is_admin" value="true" className="h-3.5 w-3.5" />
            管理者権限を付与
          </label>
        </form>
      </div>

      {/* Member role assignment */}
      <div className="rounded-2xl bg-white p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">メンバーロール設定</h2>
        <ul className="space-y-3">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-800">
                {member.display_name ?? "名前未設定"}
              </span>
              <select
                defaultValue={member.role_id ?? ""}
                onChange={(e) => handleAssign(member.id, e.target.value)}
                className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs"
                disabled={isPending}
              >
                <option value="">ロールなし</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
