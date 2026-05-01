"use client";

import useAuthStore from "@/Store/AuthStore";
import Header from "./header"; // مكون الهيدر الأصلي الخاص بك

export default function MainHeader() {
    const { isAuthenticated } = useAuthStore();

    if (isAuthenticated) {
        return null;
    }

    return <Header />;
}