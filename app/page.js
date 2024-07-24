import AuthBar from "@/components/AuthBar";
import Composition from "@/components/Composition";
import StripeSubscription from "@/components/StripeSubscription";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between p-4 bg-slate-950 w-screen">
      <div className="flex flex-col text-center w-full">
        <AuthBar />
        <Composition apiUrl={process.env.API_URL} />
      </div>
    </main>
  );
}
