"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Bell } from "lucide-react";
import { useState } from "react";

type Props = {
    isActive?: boolean;
    initialDate?: string;
    initialTime?: string;
    onSave: (date: string, time: string) => Promise<void>;
    loading?: boolean;
};

export default function SetReminder({
    isActive,
    initialDate = "",
    initialTime = "",
    onSave,
    loading,
}: Props) {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);

    const handleSave = async () => {
        if (!date || !time) return;
        await onSave(date, time);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className={`gap-2 rounded-xl h-10 ${isActive
                            ? "text-blue-500 border-blue-500/50 bg-blue-50 dark:bg-blue-500/10"
                            : ""
                        }`}
                >
                    <Bell className={`w-4 h-4 ${isActive ? "fill-current" : ""}`} />
                    {isActive ? "Reminder Set" : "Set Reminder"}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">
                        Study Reminder
                    </DialogTitle>
                    <DialogDescription>
                        Pick a date and time to receive a notification.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-bold">Date</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-bold">Time</label>
                        <Input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-8"
                    >
                        {loading ? "Setting..." : "Save Reminder"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}