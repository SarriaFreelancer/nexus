import React from "react";
import { User } from "@/core/domain/types";

interface AvatarGroupProps {
  users: User[];
  limit?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ users, limit = 3 }) => {
  // Deduplicate users by ID to guarantee unique React keys
  const uniqueUsers = Array.from(
    new Map((users || []).map((u, i) => [u?.id || `user-${i}`, u])).values()
  );

  const visibleUsers = uniqueUsers.slice(0, limit);
  const extraCount = uniqueUsers.length - limit;

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {visibleUsers.map((user, idx) => (
        <img
          key={user.id ? `${user.id}-${idx}` : `avatar-${idx}`}
          className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover"
          src={user.avatarUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(user.name || "user")}`}
          alt={user.name || "User"}
          title={user.name || "User"}
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
