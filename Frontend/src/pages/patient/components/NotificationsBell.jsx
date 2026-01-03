import React from "react";
import { FiBell } from "react-icons/fi";
import { formatDateTimeRome } from "../../../lib/date";

export default function NotificationsBell({
  open,
  onToggle,
  notifications,
  loading,
  onNotificationClick,
}) {
  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="relative w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100"
      >
        <FiBell className="text-slate-700 text-lg" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-[10px] text-white rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-20 p-2">
          <h4 className="text-sm font-semibold px-2 pt-1 pb-2 border-b">
            Notifiche
          </h4>
          {loading ? (
            <p className="text-xs text-slate-500 px-2 py-3">
              Caricamento notifiche...
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-xs text-slate-500 px-2 py-3">
              Nessuna notifica al momento.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto text-xs">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`px-2 py-2 border-b last:border-b-0 cursor-pointer ${
                    n.read ? "bg-white" : "bg-blue-50"
                  }`}
                  onClick={() =>
                    onNotificationClick && onNotificationClick(n)
                  }
                >
                  <div className="flex justify-between items-center gap-2">
                    <div className="font-medium text-slate-800 text-[11px]">
                      {n.title || "Notifica"}
                    </div>
                    {n.createdAt && (
                      <div className="text-[10px] text-slate-400">
                        {formatDateTimeRome(n.createdAt)}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {n.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
