import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../../components/common/GlassCard";
import PageSection from "../../components/common/PageSection";
import { useAuthStore } from "../../store/authStore";
import {
  fetchAdminUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  type UserResource,
} from "../../services/adminUserApi";

export default function AdminUsers() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const currentUser = useAuthStore((s) => s.user) as any;

  const [users, setUsers] = useState<UserResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "Admin" | "User">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "active" | "locked">("ALL");

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  async function loadUsers() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers(token);
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setUsers(list);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? "Lỗi tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [token]);

  // Handle changing role
  async function onToggleRole(user: UserResource) {
    if (!token) return;
    const currentRole = user.role ?? user.roles?.[0]?.name ?? "User";
    const newRole = currentRole === "Admin" ? "User" : "Admin";

    if (user.id === currentUser?.id && newRole === "User") {
      alert("⚠️ Bạn không thể tự hạ quyền Admin của chính tài khoản đang đăng nhập!");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn đổi quyền của tài khoản [${user.email}] thành "${newRole}"?`)) {
      return;
    }

    setActionLoadingId(user.id);
    try {
      await updateUserRole(user.id, newRole, token);
      await loadUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Lỗi cập nhật quyền.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // Handle locking/unlocking status
  async function onToggleStatus(user: UserResource) {
    if (!token) return;
    const newStatus = user.status === "locked" ? "active" : "locked";

    if (user.id === currentUser?.id && newStatus === "locked") {
      alert("⚠️ Bạn không thể tự khóa chính tài khoản Admin đang đăng nhập!");
      return;
    }

    const confirmMsg =
      newStatus === "locked"
        ? `Bạn có chắc chắn muốn KHÓA tài khoản [${user.email}]? Người dùng sẽ bị thu hồi toàn bộ token đăng nhập và không thể truy cập hệ thống.`
        : `Bạn có muốn MỞ KHÓA cho tài khoản [${user.email}]?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setActionLoadingId(user.id);
    try {
      await updateUserStatus(user.id, newStatus, token);
      await loadUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Lỗi cập nhật trạng thái.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // Handle deleting user
  async function onDeleteUser(user: UserResource) {
    if (!token) return;
    if (user.id === currentUser?.id) {
      alert("⚠️ Bạn không thể tự xóa chính tài khoản Admin đang đăng nhập!");
      return;
    }

    if (
      !window.confirm(
        `🚨 CẢNH BÁO: Bạn có thực sự muốn XÓA VĨNH VIỄN tài khoản [${user.email}] khỏi hệ thống? Tất cả dữ liệu của user này có thể bị mất.`
      )
    ) {
      return;
    }

    setActionLoadingId(user.id);
    try {
      await deleteUser(user.id, token);
      await loadUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Lỗi xóa tài khoản.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const nameOrEmail = `${u.name ?? ""} ${u.email ?? ""}`.toLowerCase();
      if (searchTerm && !nameOrEmail.includes(searchTerm.toLowerCase())) {
        return false;
      }
      const role = u.role ?? u.roles?.[0]?.name ?? "User";
      if (roleFilter !== "ALL" && role !== roleFilter) {
        return false;
      }
      if (statusFilter !== "ALL" && (u.status ?? "active") !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => (u.role ?? u.roles?.[0]?.name) === "Admin").length;
    const active = users.filter((u) => (u.status ?? "active") === "active").length;
    const locked = total - active;
    return { total, admins, active, locked };
  }, [users]);

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
          <span
            onClick={() => navigate("/admin")}
            className="cursor-pointer font-semibold text-violet-300 hover:underline"
          >
            🏠 Admin Dashboard
          </span>
          <span>/</span>
          <span className="text-white">Quản lý Tài khoản & Phân quyền</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="ghost-btn px-4 py-2 text-xs self-start sm:self-center border-white/15"
        >
          ← Quay lại Trang Quản Trị
        </button>
      </div>

      <PageSection
        title="Admin • Quản lý Tài khoản & Phân quyền"
        subtitle="Quản lý danh sách người dùng, thay đổi vai trò (User/Admin), khóa/mở khóa hoặc xóa tài khoản"
      />

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs text-white/50">Tổng thành viên</div>
          <div className="mt-1 text-2xl font-black text-white">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs text-white/50">Quản trị viên (Admin)</div>
          <div className="mt-1 text-2xl font-black text-violet-300">{stats.admins}</div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs text-white/50">Đang hoạt động</div>
          <div className="mt-1 text-2xl font-black text-emerald-300">{stats.active}</div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
          <div className="text-xs text-white/50">Đã bị khóa</div>
          <div className="mt-1 text-2xl font-black text-rose-300">{stats.locked}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <GlassCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-white/70 mb-1.5">
              🔍 Tìm kiếm người dùng (Tên hoặc Email)
            </label>
            <input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-violet-400/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">Vai trò</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400/50"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1.5">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400/50"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="active">🟢 Hoạt động</option>
                <option value="locked">🔴 Đã khóa</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Users List Table */}
      <GlassCard
        title={`Danh sách Tài khoản (${filteredUsers.length})`}
        subtitle="Bấm các nút thao tác để chuyển quyền, khóa tài khoản hoặc xóa"
      >
        {loading ? (
          <div className="py-12 text-center text-sm text-white/60 animate-pulse">
            Đang tải danh sách người dùng...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-center">
            <div className="text-rose-200 font-semibold mb-2">{error}</div>
            <button onClick={loadUsers} className="primary-btn px-4 py-2 text-xs mt-2">
              Thử lại
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-sm text-white/50">
            Không tìm thấy tài khoản nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/80">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-white/50">
                  <th className="py-3 px-4">Thành viên</th>
                  <th className="py-3 px-4">Quyền hạn (Role)</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày tham gia</th>
                  <th className="py-3 px-4 text-right">Thao tác Quản trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const role = u.role ?? u.roles?.[0]?.name ?? "User";
                  const isAdmin = role === "Admin";
                  const isLocked = u.status === "locked";
                  const isMe = u.id === currentUser?.id;
                  const isBusy = actionLoadingId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className={`transition duration-200 hover:bg-white/5 ${
                        isLocked ? "opacity-60 bg-rose-950/10" : ""
                      }`}
                    >
                      {/* Member info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold ${
                              isAdmin
                                ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20"
                                : "border border-white/15 bg-white/10 text-white/80"
                            }`}
                          >
                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{u.name || "Chưa đặt tên"}</span>
                              {isMe && (
                                <span className="rounded-full border border-violet-400/40 bg-violet-500/20 px-2 py-0.5 text-[10px] font-mono text-violet-300">
                                  Bạn (Admin)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-white/50">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role column */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                            isAdmin
                              ? "border-violet-400/40 bg-violet-500/15 text-violet-300"
                              : "border-white/15 bg-white/5 text-white/75"
                          }`}
                        >
                          {isAdmin ? "🛡️ Admin" : "👤 User"}
                        </span>
                      </td>

                      {/* Status column */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                            !isLocked
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                              : "border-rose-400/40 bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              !isLocked ? "bg-emerald-400" : "bg-rose-400 animate-ping"
                            }`}
                          />
                          {!isLocked ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-xs text-white/60">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "---"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Role Button */}
                          <button
                            type="button"
                            disabled={isBusy || (isMe && isAdmin)}
                            onClick={() => onToggleRole(u)}
                            title={
                              isAdmin
                                ? "Chuyển thành quyền User thông thường"
                                : "Nâng cấp lên vai trò Quản trị viên (Admin)"
                            }
                            className={`ghost-btn px-3 py-1.5 text-xs border-white/15 ${
                              isBusy ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            {isAdmin ? "Hạ xuống User" : "👑 Lên Admin"}
                          </button>

                          {/* Toggle Lock Button */}
                          <button
                            type="button"
                            disabled={isBusy || isMe}
                            onClick={() => onToggleStatus(u)}
                            title={!isLocked ? "Khóa tài khoản này" : "Mở khóa cho tài khoản này"}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                              !isLocked
                                ? "border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                            } ${isBusy || isMe ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            {!isLocked ? "🔒 Khóa" : "🟢 Mở khóa"}
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={isBusy || isMe}
                            onClick={() => onDeleteUser(u)}
                            title="Xóa vĩnh viễn tài khoản này"
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/25 transition ${
                              isBusy || isMe ? "opacity-40 cursor-not-allowed" : ""
                            }`}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
