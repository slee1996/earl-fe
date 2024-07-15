import Composition from "@/components/Composition";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between p-4 bg-black">
      <div className="grid text-center w-full">
        <Composition apiUrl={process.env.API_URL} />
      </div>
    </main>
  );
}
