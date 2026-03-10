import Link from "next/link";

export default function Om() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-blue-600 text-white py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Om Mig</h1>
          <p className="text-blue-100">Lær mig at kende</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Profile Section */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 bg-blue-200 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl text-blue-600">Frederik</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hej, jeg er Frederik!</h2>
          <p className="text-gray-600 text-lg">14 år</p>
        </div>

        {/* My Story */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Hvem er jeg?</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Jeg hedder <strong>Frederik</strong> og jeg er 14 år gammel. 
            Jeg vasker biler for folk i nærheden. Det startede jeg med fordi jeg ville 
            tjene mine egne penge og lære noget om at drive en virksomhed.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Jeg gør mit bedste hver gang og sørger for at din bil bliver ordentligt ren. 
            Jeg bruger tid på at gøre det godt, ikke hurtigt.
          </p>
          <p className="text-gray-600 leading-relaxed">
            En del af pengene går til <strong>velgørenhed</strong>, og resten tjener jeg selv. 
            På den måde hjælper jeg både dig og andre!
          </p>
        </div>

        {/* Contact / CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Støt en ung iværksætter!
          </p>
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Book en tid nu →
          </Link>
        </div>

        {/* Footer Message */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 italic">
            &quot;Det er ikke hvor meget man giver, men hvor meget kærlighed man lægger i det.&quot;
          </p>
          <p className="text-gray-400 mt-2">- Frederik, 14 år</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 text-center">
        <p>© 2026 Frederiks Bilvaskning - drevet af Frederik</p>
      </footer>
    </div>
  );
}
