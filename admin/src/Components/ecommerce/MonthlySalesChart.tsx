import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useState, useEffect } from "react";
import { API_PATHS } from "../../utils/config";
import { useAuth } from "../../hooks/useAuth";

const currentYear = new Date().getFullYear();

export default function MonthlySalesChart() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [series, setSeries] = useState([{ name: "Profit", data: Array(12).fill(0) }]);
  const [isOpen, setIsOpen] = useState(false);
  const { adminToken } = useAuth();

  const fetchProfits = (year: number) => {
    fetch(`${API_PATHS.MONTHLY_PROFITS}?year=${year}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSeries([{ name: "Profit", data }]);
      })
      .catch((err) => console.error("Error fetching monthly profits:", err));
  };

  useEffect(() => {
    if (adminToken) fetchProfits(selectedYear);
  }, [adminToken, selectedYear]);

  const options: ApexOptions = {
    colors: ["#ee46bc"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: true, position: "top", horizontalAlign: "left", fontFamily: "Outfit" },
    yaxis: { title: { text: undefined } },
    grid: {
      yaxis: { lines: { show: true } },
    },
    fill: { opacity: 1 },
    tooltip: {
      x: { show: false },
      y: { formatter: (val: number) => `${val}` },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Profit
        </h3>
        <div className="relative inline-block">
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 rounded dark:bg-gray-800">
            {selectedYear}
            <MoreDotIcon className="text-gray-500 size-4" />
          </button>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-32 p-2">
            {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
              <DropdownItem
                key={year}
                onItemClick={() => {
                  setSelectedYear(year);
                  setIsOpen(false);
                }}
                className="text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
              >
                {year}
              </DropdownItem>
            ))}
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}
