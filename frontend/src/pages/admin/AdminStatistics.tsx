import { useEffect, useState, useRef } from "react";
import PageSection from "../../components/common/PageSection";
import { fetchAdminStatistics } from "../../services/statisticApi";
import type { AdminStatistics as StatsType } from "../../services/statisticApi";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminStatistics() {
  const [data, setData] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [chartFilter, setChartFilter] = useState("30_days");

  const months = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const y = d.getFullYear();
    months.push({ value: `${y}-${m}`, label: `Tháng ${m}/${y}` });
  }

  useEffect(() => {
    loadData();
  }, [selectedMonth, chartFilter]);

  useEffect(() => {
    if (data && scrollRef.current) {
      const scrollToRight = () => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = scrollRef.current.scrollWidth + 1000;
        }
      };

      // Recharts mất một khoảng thời gian để render animation và tính toán width.
      // Gọi scroll nhiều lần để đảm bảo bắt đúng thời điểm UI đã render xong.
      scrollToRight();
      const t1 = setTimeout(scrollToRight, 100);
      const t2 = setTimeout(scrollToRight, 300);
      const t3 = setTimeout(scrollToRight, 800);
      const t4 = setTimeout(scrollToRight, 1500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [data]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminStatistics(selectedMonth || undefined, chartFilter);
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-white/50 py-10">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-400 mb-4">{error}</div>
        <button 
          onClick={loadData}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageSection
          title="Thống kê Hệ thống"
          subtitle="Tổng quan về doanh thu và lượng người dùng hệ thống."
        />
        <div className="flex-shrink-0">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-white outline-none focus:border-violet-500 transition shadow-inner backdrop-blur-md"
          >
            <option value="">-- Tất cả thời gian --</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tóm tắt Tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-2">
        <div className="rounded-xl border border-white/20 bg-white/5 p-3 backdrop-blur-md">
          <div className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1">
            {selectedMonth ? "Doanh thu ngày" : "DT Hôm nay"}
          </div>
          <div className="text-base font-bold text-white">
            {data.revenue.today.toLocaleString("vi-VN")} đ
          </div>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/5 p-3 backdrop-blur-md">
          <div className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1">
            {selectedMonth ? "Doanh thu Tháng" : "DT Tháng này"}
          </div>
          <div className="text-base font-bold text-white">
            {data.revenue.this_month.toLocaleString("vi-VN")} đ
          </div>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/5 p-3 backdrop-blur-md">
          <div className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1">
            {selectedMonth ? "Doanh thu Năm" : "DT Năm nay"}
          </div>
          <div className="text-base font-bold text-white">
            {data.revenue.this_year.toLocaleString("vi-VN")} đ
          </div>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/5 p-3 backdrop-blur-md">
          <div className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1">
            {selectedMonth ? "KH Mới (Tháng)" : "Tổng số người dùng"}
          </div>
          <div className="text-base font-bold text-white">
            {data.stats.total_users.toLocaleString("vi-VN")}
          </div>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/5 p-3 backdrop-blur-md">
          <div className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1">
            {selectedMonth ? "Admin mới (Tháng)" : "Tổng số Quản trị"}
          </div>
          <div className="text-base font-bold text-white">
            {data.stats.total_admins.toLocaleString("vi-VN")}
          </div>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/5 p-3 backdrop-blur-md">
          <div className="text-white/50 text-[10px] uppercase font-bold tracking-wider mb-1">
            {selectedMonth ? "LP mới (Tháng)" : "LP Đã tạo"}
          </div>
          <div className="text-base font-bold text-white">
            {data.stats.total_landing_pages.toLocaleString("vi-VN")}
          </div>
        </div>
      </div>

      {/* Biểu đồ tăng trưởng */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 mb-2 gap-4">
        <h3 className="text-lg font-bold text-white">
          {chartFilter === 'year' ? (selectedMonth ? `Tăng trưởng (Năm ${selectedMonth.split('-')[0]})` : "Tăng trưởng (Năm nay)") : 
           chartFilter === 'month' ? (selectedMonth ? `Tăng trưởng (Tháng ${selectedMonth.split('-')[1]}/${selectedMonth.split('-')[0]})` : "Tăng trưởng (Tháng này)") : 
           "Tăng trưởng (30 ngày qua)"}
        </h3>
        <select 
          value={chartFilter}
          onChange={(e) => setChartFilter(e.target.value)}
          className="rounded-xl border border-white/20 bg-black/40 px-3 py-1.5 text-sm text-white outline-none focus:border-violet-500 transition shadow-inner backdrop-blur-md"
        >
          <option value="30_days">30 ngày qua</option>
          <option value="month">Tháng này / Tháng chọn</option>
          <option value="year">Cả năm</option>
        </select>
      </div>
      <div className="rounded-3xl border border-white/10 bg-transparent p-2 sm:p-6 overflow-hidden">
        <div 
          ref={scrollRef}
          className="h-[350px] w-full overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        >
          <div className="min-w-[700px] h-full pr-4">
            <ResponsiveContainer width="99%" height="100%">
              <LineChart data={data.chart_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#ffffff66" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#ffffff66" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                  allowDecimals={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#ffffff66" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={10}
                  tickFormatter={(val) => {
                    if (val >= 1000000) return (val / 1000000) + "M";
                    if (val >= 1000) return (val / 1000) + "k";
                    return val;
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                  formatter={(value: any, name: any) => {
                    if (name === "Doanh thu") return [Number(value || 0).toLocaleString("vi-VN") + " đ", name];
                    return [value, name];
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="new_users" 
                  name="User mới"
                  stroke="#a78bfa" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#a78bfa', strokeWidth: 0 }} 
                  activeDot={{ r: 6, fill: '#c4b5fd' }} 
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="new_pages" 
                  name="Landing Page"
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} 
                  activeDot={{ r: 6, fill: '#f87171' }} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  name="Doanh thu"
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} 
                  activeDot={{ r: 6, fill: '#34d399' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
