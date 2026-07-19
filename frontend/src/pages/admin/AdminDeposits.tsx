import { useState, useEffect } from "react";
import { fetchAdminDeposits, approveAdminDeposit, rejectAdminDeposit, type DepositRecord } from "../../services/depositApi";
import { useAuthStore } from "../../store/authStore";
import GlassCard from "../../components/common/GlassCard";
import PageSection from "../../components/common/PageSection";

export default function AdminDeposits() {
  const token = useAuthStore((s) => s.token);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminDeposits(token);
      setDeposits(res.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Không thể tải danh sách đơn nạp tiền");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  async function handleApprove(id: number, code: string, amount: number | string) {
    if (!window.confirm(`Xác nhận đã nhận tiền CK và DUYỆT đơn ${code} (cộng ${Number(amount).toLocaleString()} VNĐ vào tài khoản User)?`)) return;
    setActionLoadingId(id);
    try {
      const res = await approveAdminDeposit(token, id);
      alert(res.message);
      loadData();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Lỗi khi duyệt đơn nạp");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleReject(id: number, code: string) {
    if (!window.confirm(`Xác nhận TỪ CHỐI đơn nạp tiền ${code}?`)) return;
    setActionLoadingId(id);
    try {
      const res = await rejectAdminDeposit(token, id);
      alert(res.message);
      loadData();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Lỗi khi từ chối đơn nạp");
    } finally {
      setActionLoadingId(null);
    }
  }

  const filteredDeposits = deposits.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  });

  return (
    <div>
      <PageSection
        title="Duyệt đơn thanh toán & Nạp tiền (Admin)"
        subtitle="Kiểm tra và cộng số dư tài khoản cho người dùng sau khi họ chuyển khoản"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "Tất cả đơn" },
              { key: "pending", label: `Chờ duyệt (${deposits.filter((x) => x.status === "pending").length})` },
              { key: "approved", label: "Đã duyệt" },
              { key: "rejected", label: "Từ chối" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  filter === tab.key
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30 scale-105"
                    : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold hover:bg-white/10 transition"
          >
            Làm mới danh sách
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <GlassCard>
          {loading ? (
            <div className="py-12 text-center text-white/60 text-sm">Đang tải danh sách đơn nạp...</div>
          ) : filteredDeposits.length === 0 ? (
            <div className="py-12 text-center text-white/50 text-sm italic">
              Không có đơn nạp tiền nào phù hợp.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/80">
                <thead className="border-b border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-violet-300">
                  <tr>
                    <th className="py-3.5 px-4">ID</th>
                    <th className="py-3.5 px-4">Mã nội dung CK</th>
                    <th className="py-3.5 px-4">Thành viên (User)</th>
                    <th className="py-3.5 px-4">Số tiền VNĐ</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4">Thời gian tạo</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 font-medium">
                  {filteredDeposits.map((d) => (
                    <tr key={d.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-mono text-xs text-white/50">#{d.id}</td>
                      <td className="py-4 px-4 font-black text-amber-300 tracking-wider text-sm">
                        {d.code}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{d.user?.name || `User #${d.user_id}`}</div>
                        <div className="text-xs text-white/60">{d.user?.email || ""}</div>
                        {d.user?.balance !== undefined ? (
                          <div className="text-[11px] text-emerald-400 mt-0.5">
                            Số dư: {Number(d.user.balance).toLocaleString("vi-VN")} đ
                          </div>
                        ) : null}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-violet-300 text-base">
                        {Number(d.amount).toLocaleString("vi-VN")} đ
                      </td>
                      <td className="py-4 px-4">
                        {d.status === "pending" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300 animate-pulse">
                            Chờ thanh toán
                          </span>
                        ) : d.status === "approved" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                            🟢 Đã cộng tiền
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-300">
                            🔴 Từ chối
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-white/60">
                        {new Date(d.created_at).toLocaleString("vi-VN")}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {d.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(d.id, d.code, d.amount)}
                              disabled={actionLoadingId === d.id}
                              className="rounded-xl border border-emerald-500/50 bg-transparent px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                              Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(d.id, d.code)}
                              disabled={actionLoadingId === d.id}
                              className="rounded-xl border border-rose-500/50 bg-transparent px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-white/40 italic">Đã hoàn tất</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </PageSection>
    </div>
  );
}
