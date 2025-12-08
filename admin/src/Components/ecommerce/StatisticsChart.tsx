import { useMemo, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useAuth } from "../../hooks/useAuth";
import { API_PATHS } from "../../utils/config";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const defaultColors = ["#ee46bc", "#f7a0d3", "#6a5acd", "#00bcd4", "#ffa500", "#9c27b0"];

export default function StatisticsChart() {
  const { adminToken } = useAuth();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!adminToken) return;

    setLoading(true);
    fetch(`${API_PATHS.AGENTS_PROFIT}?year=${year}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSeries(Array.isArray(data) ? data : data.series || []);
      })
      .catch((err) => {
        console.error("Error fetching agent profit chart:", err);
        setSeries([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [adminToken, year]);

  const options: ApexOptions = useMemo(() => ({
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: defaultColors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
    },
    stroke: {
      curve: "straight",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      x: { format: "MMM" },
    },
    xaxis: {
      type: "category",
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: "",
        style: { fontSize: "0px" },
      },
    },
  }), []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Agent Sales Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Monthly profit performance by agent
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            {[...Array(5)].map((_, idx) => {
              const y = new Date().getFullYear() - idx;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          Loading chart...
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[1000px] xl:min-w-full">
            <Chart
              key={JSON.stringify(series.map(s => s.name))}
              options={options}
              series={series.length ? series : [{ name: "No Data", data: new Array(12).fill(0) }]}
              type="area"
              height={310}
            />
          </div>
        </div>
      )}
    </div>
  );
}
