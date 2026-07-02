"use client";

import Header from "@/components/Header";

export default function ProductClientHeader() {
  return (
    <Header 
      searchQuery="" 
      onSearchChange={() => {}} 
      cartItemCount={0} 
      onCartClick={() => {}} 
    />
  );
}
