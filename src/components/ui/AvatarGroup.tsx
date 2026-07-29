import React from "react";
import { User } from "@/core/domain/types";

interface AvatarGroupProps {
  users: User[];
  limit?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ users, limit = 3 }) => {
  const visibleUsers = users.slice(0, limit);
  const extraCount = users.length - limit;

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {visibleUsers.map((user) => (
        <img
          key={user.id}
          className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover"
          src={user.avatarUrl}
          alt={user.name}
          title={user.name}
        />
      ))}
      {extraCount > 0 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-900/80 text-[10px] font-semibold text-indigo-200 ring-2 ring-slate-900">
          +{extraCount}
        </div>
      )}
    </div>
  );
};
