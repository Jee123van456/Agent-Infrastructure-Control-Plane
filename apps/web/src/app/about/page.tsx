import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-white mb-6">About TylerDeck</h1>
        <p className="text-slate-300 text-lg leading-relaxed mb-8">
          TylerDeck was founded to solve the core engineering challenge of the AI era: making autonomous AI agents 
          reliable, observable, and secure in production.
        </p>

        <div className="p-8 rounded-xl bg-dark-900 border border-dark-800 text-left space-y-4 text-sm text-slate-300">
          <p>
            As software shifts from deterministic code loops to non-deterministic LLM agent reasoning, traditional APM 
            tools fail to answer critical engineering questions.
          </p>
          <p>
            TylerDeck acts as the production control plane, turning raw telemetry traces into actionable failure intelligence 
            and version regression insights for small AI teams worldwide.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
