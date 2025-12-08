import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { API_PATHS } from "../../utils/config";
import { useAuth } from "../../hooks/useAuth";

export default function TotalOrders() {
  const [isOpen, setIsOpen] = useState(false);
  const [barColor, setBarColor] = useState("#465FFF");

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const { adminToken } = useAuth();

  const [series, setSeries] = useState<number[]>([0]); // default chart %

  const [orderData, setOrderData] = useState({
    currentMonthOrders: 0,
    previousMonthOrders: 0,
    todayOrders: 0,
    completedOrders: 0,
    percentageChange: 0,
    totalOrders: 0,
    allCompletedOrders: 0,
    allPendingOrders: 0,
  });

  useEffect(() => {
    if (!adminToken) return;

    fetch(API_PATHS.COMPARE_ORDERS, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrderData(data);
        setSeries([parseFloat(data.percentageChange)]);
        setBarColor(
          data.currentMonthOrders >= data.previousMonthOrders
            ? "#465FFF"
            : "#EF4444"
        );
      })
      .catch((err) => {
        console.error("Error fetching order stats:", err);
      });
  }, [adminToken]);

  const options: ApexOptions = useMemo(() => ({
    colors: [barColor],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: [barColor],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Orders Progress"],
  }), [barColor]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {`Current Month Orders – ${new Date().toLocaleString("default", {
                month: "long",
              })}`}
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Previous Month (
              {new Date(
                new Date().setMonth(new Date().getMonth() - 1)
              ).toLocaleString("default", { month: "long" })}
              ): {orderData.previousMonthOrders} orders
            </p>
            <p className="text-gray-500 text-theme-xs dark:text-gray-400">
              Today: {orderData.todayOrders} orders • Completed:{" "}
              {orderData.completedOrders} orders
            </p>
          </div>
          <div className="relative inline-block">
            <button className="dropdown-toggle" onClick={toggleDropdown}>
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View More
              </DropdownItem>
              <DropdownItem
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
        <div className="relative">
          <div className="max-h-[330px]" id="chartDarkStyle">
            <Chart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          <span
            className={`absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full px-3 py-1 text-xs font-medium 
  ${orderData.percentageChange >= 0
                ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500"
              }
`}
          >
            {orderData.percentageChange >= 0 ? "+" : ""}
            {orderData.percentageChange}%
          </span>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[380px] text-center text-sm text-gray-500 sm:text-base">
          {orderData.percentageChange >= 0
            ? `You have successfully delivered ${orderData.currentMonthOrders} orders so far this month, which is ${orderData.percentageChange}% more than the same period last month. Great progress!`
            : `You have successfully delivered ${orderData.currentMonthOrders} orders so far this month, which is ${Math.abs(orderData.percentageChange)}% fewer than the same period last month. Let's aim higher next month!`}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Total Orders
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {orderData.totalOrders} Orders
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Completed Orders
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-green-500 dark:text-white/90 sm:text-lg">
            {orderData.allCompletedOrders} Orders
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Pending Orders
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-yellow-500 dark:text-white/90 sm:text-lg">
            {orderData.allPendingOrders} Orders

          </p>
        </div>
      </div>
    </div>
  );
}
