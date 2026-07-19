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
  updateUserLandingPageDates,
  updateUserBalance,
  updateUserLandingPageLimit,
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

  // Landing Page Dates Management Modal
  const [selectedUserForPages, setSelectedUserForPages] = useState<UserResource | null>(null);
  const [pageDateEdits, setPageDateEdits] = useState<Record<number, { created_at: string; expires_at: string }>>({});
  const [savingPageDateId, setSavingPageDateId] = useState<number | null>(null);

  // Balance Management Modal
  const [editingBalanceUser, setEditingBalanceUser] = useState<UserResource | null>(null);
  const [newBalanceInput, setNewBalanceInput] = useState<string>("");
  const [savingBalance, setSavingBalance] = useState<boolean>(false);

  function handleOpenEditBalance(user: UserResource) {
    setEditingBalanceUser(user);
    setNewBalanceInput(String(user.balance || 0));
  }

  async function handleSaveBalance(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBalanceUser) return;
    const numericBalance = Number(newBalanceInput);
    if (isNaN(numericBalance) || numericBalance < 0) {
      alert("Số dư phải là số nguyên dương hoặc bằng 0!");
      return;
    }
    setSavingBalance(true);
    try {
      await updateUserBalance(editingBalanceUser.id, numericBalance, token);
      setEditingBalanceUser(null);
      await loadUsers();
      alert(`Đã cập nhật số dư cho tài khoản ${editingBalanceUser.email} thành công!`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Lỗi khi cập nhật số dư!");
    } finally {
      setSavingBalance(false);
    }
  }

  // Landing Page Limit Management Modal
  const [editingLimitUser, setEditingLimitUser] = useState<UserResource | null>(null);
  const [newLimitInput, setNewLimitInput] = useState<string>("");
  const [savingLimit, setSavingLimit] = useState<boolean>(false);

  function handleOpenEditLimit(user: UserResource) {
    setEditingLimitUser(user);
    setNewLimitInput(user.custom_landing_page_limit != null ? String(user.custom_landing_page_limit) : "");
  }

  async function handleSaveLimit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLimitUser) return;
    let numericLimit: number | null = null;
    if (newLimitInput.trim() !== "") {
      numericLimit = Number(newLimitInput);
      if (isNaN(numericLimit) || numericLimit < 0) {
        alert("Giới hạn phải là số nguyên dương hoặc bằng 0 (hoặc để trống để theo gói mặc định)!");
        return;
      }
    }
    setSavingLimit(true);
    try {
      await updateUserLandingPageLimit(editingLimitUser.id, numericLimit, token);
      setEditingLimitUser(null);
      await loadUsers();
      alert(`Đã cập nhật giới hạn tạo Landing Page cho tài khoản ${editingLimitUser.email} thành công!`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Lỗi khi cập nhật giới hạn!");
    } finally {
      setSavingLimit(false);
    }
  }

  function formatInputDate(dateStr?: string | null): string {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return dateStr.slice(0, 16).replace(" ", "T");
      }
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
      return "";
    }
  }

  useEffect(() => {
    if (selectedUserForPages && selectedUserForPages.landing_pages) {
      const initEdits: Record<number, { created_at: string; expires_at: string }> = {};
      selectedUserForPages.landing_pages.forEach((p) => {
        initEdits[p.id] = {
          created_at: formatInputDate(p.created_at),
          expires_at: formatInputDate(p.expires_at),
        };
      });
      setPageDateEdits(initEdits);
    }
  }, [selectedUserForPages]);

  async function handleSavePageDates(userId: number, pageId: number) {
    if (!token) return;
    const edit = pageDateEdits[pageId];
    if (!edit) return;
    setSavingPageDateId(pageId);
    try {
      const res = await updateUserLandingPageDates(
        userId,
        pageId,
        {
          created_at: edit.created_at ? edit.created_at.replace("T", " ") + ":00" : undefined,
          expires_at: edit.expires_at ? edit.expires_at.replace("T", " ") + ":00" : undefined,
        },
        token
      );
      alert(res.message || "Đã lưu ngày cho Landing Page thành công!");
      if (res.user) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? res.user : u)));
        setSelectedUserForPages(res.user);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Lỗi khi cập nhật ngày!");
    } finally {
      setSavingPageDateId(null);
    }
  }

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
              Tìm kiếm người dùng (Tên hoặc Email)
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
                <option value="active">Hoạt động</option>
                <option value="locked">Đã khóa</option>
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
                  <th className="py-3 px-4">Số dư (VNĐ)</th>
                  <th className="py-3 px-4">Giới hạn LP</th>
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
                          {isAdmin ? "Admin" : "User"}
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

                      {/* Balance column */}
                      <td className="py-4 px-4 font-mono font-bold text-emerald-300">
                        <div className="flex items-center gap-2">
                          <span>{(u.balance || 0).toLocaleString("vi-VN")} đ</span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditBalance(u)}
                            className="inline-flex items-center gap-1 h-6 px-2.5 text-[11px] font-sans font-semibold rounded-lg border border-emerald-400/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/30 transition shadow-sm"
                            title="Chỉnh sửa số dư tài khoản này"
                          >
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Sửa</span>
                          </button>
                        </div>
                      </td>

                      {/* Landing Page Limit column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-violet-300">
                            {u.landing_pages_count || 0} / {u.landing_page_limit || 1}
                          </span>
                          {u.custom_landing_page_limit != null && (
                            <span className="rounded px-1.5 py-0.5 text-[10px] bg-amber-500/20 border border-amber-400/30 text-amber-300" title="Đã đặt giới hạn tùy chỉnh cho user này">
                              ★ {u.custom_landing_page_limit}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEditLimit(u)}
                            className="inline-flex items-center gap-1 h-6 px-2.5 text-[11px] font-sans font-semibold rounded-lg border border-violet-400/30 bg-violet-500/15 text-violet-300 hover:bg-violet-500/30 transition shadow-sm"
                            title="Chỉnh sửa giới hạn tạo Landing Page của tài khoản này"
                          >
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Sửa</span>
                          </button>
                        </div>
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
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {/* Landing Pages Dates Management Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedUserForPages(u)}
                            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-xl border border-violet-400/40 bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 transition shadow-sm shrink-0"
                            title="Quản lý ngày tạo & ngày hết hạn cho Landing Pages của user này"
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Landing Pages ({u.landing_pages?.length || 0})</span>
                          </button>

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
                            className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-xl border border-white/20 bg-white/5 text-white hover:bg-white/15 transition shrink-0 ${
                              isBusy || (isMe && isAdmin) ? "opacity-40 cursor-not-allowed" : ""
                            }`}
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>{isAdmin ? "Hạ quyền User" : "Lên Admin"}</span>
                          </button>

                          {/* Toggle Lock Button */}
                          <button
                            type="button"
                            disabled={isBusy || isMe}
                            onClick={() => onToggleStatus(u)}
                            title={!isLocked ? "Khóa tài khoản này" : "Mở khóa cho tài khoản này"}
                            className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-xl border transition shrink-0 ${
                              !isLocked
                                ? "border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                                : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                            } ${isBusy || isMe ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            {!isLocked ? (
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                            )}
                            <span>{!isLocked ? "Khóa tài khoản" : "Mở khóa"}</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            disabled={isBusy || isMe}
                            onClick={() => onDeleteUser(u)}
                            title="Xóa vĩnh viễn tài khoản này"
                            className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/25 transition shrink-0 ${
                              isBusy || isMe ? "opacity-40 cursor-not-allowed" : ""
                            }`}
                          >
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Xóa</span>
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

      {/* Modal: Quản lý Ngày tạo & Hết hạn Landing Pages cho User */}
      {selectedUserForPages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Quản lý Ngày hạn Landing Pages</span>
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  Chỉnh sửa Ngày Tạo và Ngày Hết Hạn cho phép sửa/duy trì của user: <strong className="text-violet-300">{selectedUserForPages.name}</strong> ({selectedUserForPages.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForPages(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 hover:bg-white/15 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            {!selectedUserForPages.landing_pages || selectedUserForPages.landing_pages.length === 0 ? (
              <div className="py-12 text-center text-sm text-white/50 border border-dashed border-white/15 rounded-2xl">
                Thành viên này hiện tại chưa tạo Landing Page nào.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {selectedUserForPages.landing_pages.map((p) => {
                  const edit = pageDateEdits[p.id] || { created_at: "", expires_at: "" };
                  const isSaving = savingPageDateId === p.id;

                  return (
                    <div
                      key={p.id}
                      className="rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:border-white/25"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3.5">
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            <span>{p.title || "Trang chưa đặt tên"}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                              #{p.id}
                            </span>
                          </div>
                          <a
                            href={`/page/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-violet-300 hover:underline mt-0.5 inline-block"
                          >
                            /page/{p.slug} ↗
                          </a>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            p.status === "published"
                              ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                              : "border-amber-400/40 bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {p.status === "published" ? "Published" : "Draft"}
                        </span>
                      </div>

                      {/* Date Inputs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-white/80 mb-1.5">
                            Ngày Tạo (created_at)
                          </label>
                          <input
                            type="datetime-local"
                            value={edit.created_at}
                            onChange={(e) =>
                              setPageDateEdits((prev) => ({
                                ...prev,
                                [p.id]: { ...edit, created_at: e.target.value },
                              }))
                            }
                            className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-violet-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-white/80 mb-1.5">
                            Ngày Hết Hạn cho phép sửa (expires_at)
                          </label>
                          <input
                            type="datetime-local"
                            value={edit.expires_at}
                            onChange={(e) =>
                              setPageDateEdits((prev) => ({
                                ...prev,
                                [p.id]: { ...edit, expires_at: e.target.value },
                              }))
                            }
                            className="w-full rounded-xl border border-white/15 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-violet-400"
                          />
                        </div>
                      </div>

                      {/* Quick Shortcuts & Save Button */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-white/50 mr-1">Gia hạn nhanh:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const d = new Date();
                              d.setDate(d.getDate() + 30);
                              const pad = (n: number) => String(n).padStart(2, "0");
                              const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                              setPageDateEdits((prev) => ({
                                ...prev,
                                [p.id]: { ...edit, expires_at: formatted },
                              }));
                            }}
                            className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-violet-400/30 bg-violet-500/10 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition shrink-0"
                          >
                            +30 Ngày
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const d = new Date();
                              d.setFullYear(d.getFullYear() + 1);
                              const pad = (n: number) => String(n).padStart(2, "0");
                              const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                              setPageDateEdits((prev) => ({
                                ...prev,
                                [p.id]: { ...edit, expires_at: formatted },
                              }));
                            }}
                            className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-indigo-400/30 bg-indigo-500/10 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition shrink-0"
                          >
                            +1 Năm
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPageDateEdits((prev) => ({
                                ...prev,
                                [p.id]: { ...edit, expires_at: "2099-12-31T23:59" },
                              }));
                            }}
                            className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition shrink-0"
                          >
                            Vĩnh viễn
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPageDateEdits((prev) => ({
                                ...prev,
                                [p.id]: { ...edit, expires_at: "" },
                              }));
                            }}
                            className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-rose-400/30 bg-rose-500/10 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition shrink-0"
                          >
                            Xóa hạn
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleSavePageDates(selectedUserForPages.id, p.id)}
                          className="inline-flex items-center justify-center h-8 px-4 rounded-xl border border-violet-400/40 bg-violet-600 text-xs font-semibold text-white hover:bg-violet-500 shadow-lg transition shrink-0 disabled:opacity-50"
                        >
                          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedUserForPages(null)}
                className="px-5 py-2.5 rounded-xl border border-white/15 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {editingBalanceUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Chỉnh sửa Số dư Tài khoản</span>
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  Thành viên: <strong className="text-emerald-300">{editingBalanceUser.name}</strong> ({editingBalanceUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingBalanceUser(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 hover:bg-white/15 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBalance} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-2">
                  Số dư mới (VNĐ)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={newBalanceInput}
                  onChange={(e) => setNewBalanceInput(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm font-mono font-bold text-emerald-300 outline-none focus:border-emerald-400"
                  placeholder="Nhập số tiền..."
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewBalanceInput(String((Number(newBalanceInput) || 0) + 50000))}
                  className="inline-flex items-center justify-center h-7 px-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                >
                  +50.000 đ
                </button>
                <button
                  type="button"
                  onClick={() => setNewBalanceInput(String((Number(newBalanceInput) || 0) + 100000))}
                  className="inline-flex items-center justify-center h-7 px-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                >
                  +100.000 đ
                </button>
                <button
                  type="button"
                  onClick={() => setNewBalanceInput(String((Number(newBalanceInput) || 0) + 500000))}
                  className="inline-flex items-center justify-center h-7 px-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                >
                  +500.000 đ
                </button>
                <button
                  type="button"
                  onClick={() => setNewBalanceInput("0")}
                  className="inline-flex items-center justify-center h-7 px-3 rounded-lg border border-rose-400/30 bg-rose-500/10 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                >
                  về 0 đ
                </button>
              </div>

              <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingBalanceUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingBalance}
                  className="inline-flex items-center justify-center h-9 px-5 rounded-xl border border-emerald-400/40 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 shadow-lg transition disabled:opacity-50"
                >
                  {savingBalance ? "Đang lưu..." : "Lưu số dư"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Landing Page Limit Modal */}
      {editingLimitUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-violet-400/30 bg-slate-900 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-violet-300">
                Quản lý Giới hạn tạo Landing Page
              </h3>
              <button
                type="button"
                onClick={() => setEditingLimitUser(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/15 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLimit} className="mt-4 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Tài khoản
                </label>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white/90">
                  {editingLimitUser.email} ({editingLimitUser.name})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Số lượng tối đa được phép tạo (hiện tại đã tạo: {editingLimitUser.landing_pages_count || 0} trang)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newLimitInput}
                  onChange={(e) => setNewLimitInput(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm font-mono font-bold text-violet-300 outline-none focus:border-violet-400"
                  placeholder="Để trống để theo gói mặc định (VD: 1 hoặc 100)"
                />
                <p className="mt-1.5 text-[11px] text-white/50">
                  Lưu ý: Để trống (xóa số và bấm lưu) thì giới hạn sẽ tự động khôi phục theo gói dịch vụ (Miễn phí = 1 trang).
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNewLimitInput("1")}
                  className="inline-flex items-center justify-center h-7 px-3 rounded-lg border border-violet-400/30 bg-violet-500/10 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition"
                >
                  1 trang
                </button>
                <button
                  type="button"
                  onClick={() => setNewLimitInput("5")}
                  className="inline-flex items-center justify-center h-7 px-3 rounded-lg border border-violet-400/30 bg-violet-500/10 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition"
                >
                  5 trang
                </button>
                <button
                  type="button"
                  onClick={() => setNewLimitInput("10")}
                  className="inline-flex items-center justify-center h-7 px-3 rounded-lg border border-violet-400/30 bg-violet-500/10 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition"
                >
                  10 trang
                </button>
                <button
                  type="button"
                  onClick={() => setNewLimitInput("100")}
                  className="inline-flex items-center justify-center h-7 px-3 rounded-lg border border-violet-400/30 bg-violet-500/10 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition"
                >
                  100 trang
                </button>
                <button
                  type="button"
                  onClick={() => setNewLimitInput("")}
                  className="inline-flex items-center justify-center h-7 px-3 rounded-lg border border-amber-400/30 bg-amber-500/10 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
                >
                  Theo gói (Mặc định)
                </button>
              </div>

              <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingLimitUser(null)}
                  className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingLimit}
                  className="inline-flex items-center justify-center h-9 px-5 rounded-xl border border-violet-400/40 bg-violet-600 text-xs font-semibold text-white hover:bg-violet-500 shadow-lg transition disabled:opacity-50"
                >
                  {savingLimit ? "Đang lưu..." : "Lưu giới hạn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
