"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlarmClock, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  isActive?: boolean;
  initialDate?: string;
  initialTime?: string;
  onSave: (date: string, time: string) => Promise<void>;
  loading?: boolean;
  className?: string;
  iconOnly?: boolean;
};

const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"];

export default function SetReminder({
  isActive,
  initialDate = "",
  initialTime = "",
  onSave,
  loading,
  className,
  iconOnly,
}: Props) {
  const [open, setOpen] = useState(false);

  // Fallback to current date if none provided
  const [currentMonth, setCurrentMonth] = useState(
    initialDate ? new Date(initialDate) : new Date(),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ? new Date(initialDate) : null,
  );

  const defaultHour = initialTime ? initialTime.split(":")[0] : "10";
  const defaultMinute = initialTime ? initialTime.split(":")[1] : "30";

  const [hour, setHour] = useState(defaultHour);
  const [minute, setMinute] = useState(defaultMinute);

  useEffect(() => {
    if (open) {
      const initD = initialDate ? new Date(initialDate) : new Date();
      setCurrentMonth(initD);
      setSelectedDate(initialDate ? initD : null);
      setHour(initialTime ? initialTime.split(":")[0] : "10");
      setMinute(initialTime ? initialTime.split(":")[1] : "30");
    }
  }, [open, initialDate, initialTime]);

  const handleSave = async () => {
    if (!selectedDate || !hour || !minute) return;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hour}:${minute}`;

    await onSave(formattedDate, formattedTime);
    setOpen(false);
  };

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();
  let firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1; // Mon = 0, Sun = 6

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    days.push(i + 100);
  }

  const prevMonthDays = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    0,
  ).getDate();

  const handlePrevMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  const handleNextMonth = () =>
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isSameDate = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={
            className ||
            `gap-2 rounded-xl h-10 ${
              isActive
                ? "text-blue-500 border-blue-500/50 bg-blue-50 dark:bg-blue-500/10"
                : ""
            }`
          }
        >
          <Bell className={`w-4 h-4 ${isActive ? "fill-current" : ""}`} />
          {!iconOnly && (isActive ? "Reminder Set" : "Set Reminder")}
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[340px] rounded-[24px] p-5 sm:p-6 bg-white dark:bg-slate-900 border-none shadow-2xl"
      >
        <DialogTitle className="sr-only">Set Study Reminder</DialogTitle>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
            <AlarmClock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Set Study Reminder
          </h2>
        </div>

        <div className="space-y-4">
          {/* Calendar Section */}
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Date
            </p>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {monthNames[currentMonth.getMonth()]}{" "}
                  {currentMonth.getFullYear()}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-500 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {daysOfWeek.map((day, index) => (
                  <div
                    key={`${day}-${index}`}
                    className="text-center text-[10px] uppercase font-bold text-slate-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {days.map((day, idx) => {
                  if (day === null) {
                    const prevDay = prevMonthDays - firstDay + idx + 1;
                    return (
                      <div
                        key={`prev-${idx}`}
                        className="h-7 w-7 mx-auto flex items-center justify-center text-xs font-medium text-slate-300 dark:text-slate-600"
                      >
                        {prevDay}
                      </div>
                    );
                  }
                  if (day > 100) {
                    const nextDay = day - 100;
                    return (
                      <div
                        key={`next-${idx}`}
                        className="h-7 w-7 mx-auto flex items-center justify-center text-xs font-medium text-slate-300 dark:text-slate-600"
                      >
                        {nextDay}
                      </div>
                    );
                  }
                  const selected = isSameDate(day);
                  return (
                    <button
                      key={day}
                      onClick={() =>
                        setSelectedDate(
                          new Date(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth(),
                            day,
                          ),
                        )
                      }
                      className={`h-7 w-7 mx-auto flex items-center justify-center rounded-full text-xs font-medium transition-all ${
                        selected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-110"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Hour
              </p>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="w-full h-9 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={4}
                  className="rounded-lg max-h-[200px] min-w-[100px]"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const val = String(i).padStart(2, "0");
                    return (
                      <SelectItem
                        key={val}
                        value={val}
                        className="text-sm rounded-md"
                      >
                        {val}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Minute
              </p>
              <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger className="w-full h-9 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Minute" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={4}
                  className="rounded-lg max-h-[200px] min-w-[100px]"
                >
                  {Array.from({ length: 60 }).map((_, i) => {
                    const val = String(i).padStart(2, "0");
                    return (
                      <SelectItem
                        key={val}
                        value={val}
                        className="text-sm rounded-md"
                      >
                        {val}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <Button
            onClick={handleSave}
            disabled={loading || !selectedDate}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors"
          >
            {loading ? "Setting..." : "Set Alarm"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="w-full h-10 rounded-lg font-bold text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
