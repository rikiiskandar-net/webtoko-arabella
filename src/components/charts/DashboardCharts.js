"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues with 'window'
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function AreaChart({ data = [], categories = [], height = 300, color = "#2563EB" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height: `${height}px` }} className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg"></div>;

  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
      background: "transparent",
      fontFamily: "inherit",
    },
    colors: [color],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: isDarkMode ? "#8b949e" : "#64748B" }
      }
    },
    yaxis: {
      labels: {
        style: { colors: isDarkMode ? "#8b949e" : "#64748B" }
      }
    },
    grid: {
      borderColor: isDarkMode ? "#30363d" : "#E2E8F0",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    theme: { mode: isDarkMode ? "dark" : "light" },
    tooltip: {
      theme: isDarkMode ? "dark" : "light"
    }
  };

  const series = [{ name: "Pengunjung", data }];

  return <Chart options={options} series={series} type="area" height={height} width="100%" />;
}

export function DonutChart({ data = [], labels = [], height = 280 }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height: `${height}px` }} className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg"></div>;

  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';

  const options = {
    chart: {
      type: "donut",
      background: "transparent",
      fontFamily: "inherit",
    },
    labels: labels,
    colors: ["#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"],
    stroke: {
      colors: isDarkMode ? ["#161b22"] : ["#ffffff"],
      width: 2
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              color: isDarkMode ? "#8b949e" : "#64748B"
            },
            value: {
              color: isDarkMode ? "#c9d1d9" : "#0F172A",
              fontSize: '24px',
              fontWeight: 600
            }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: {
      show: true,
      position: 'bottom',
      labels: {
        colors: isDarkMode ? "#8b949e" : "#64748B"
      }
    },
    theme: { mode: isDarkMode ? "dark" : "light" },
  };

  return <Chart options={options} series={data} type="donut" height={height} width="100%" />;
}
