import Composition from "@/components/Composition";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between p-24 bg-black">
      <div className="mb-32 grid text-center w-full">
        <Composition />
      </div>
    </main>
  );
}
