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
            <span className="text-6xl">🚗</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hej, jeg er Frederik!</h2>
          <p className="text-gray-600 text-lg">14 år</p>
        </div>

        {/* My Story */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Hvem er jeg?</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Jeg hedder <strong>Frederik Tefre-De Renzy Martin</strong> og jeg er 14 år gammel. 
            Jeg driver denne bilvaskning som et lille foretagende, hvor jeg vasker biler for folk i nærheden.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Jeg startede dette for at tjene mine egne penge, men jeg har en drøm om at bruge det hele 
            på <strong>velgørenhed</strong>. Når jeg bliver ældre, vil jeg gerne kunne give noget tilbage 
            til samfundet og hjælpe dem, der har brug for det.
          </p>
        </div>

        {/* Why I Do This */}
        <div className="bg-green-50 rounded-2xl p-8 mb-8 border-2 border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-4">💚 Hvorfor gør jeg det her?</h3>
          <p className="text-green-700 leading-relaxed">
            Jeg tror på, at man aldrig er for ung til at gøre en forskel. Selvom jeg kun er 14 år, 
            vil jeg gerne vise, at unge mennesker kan bidrage til samfundet. En del af de penge, jeg tjener 
            på at vaske biler, går til <strong>velgørenhed</strong> - og selvfølgelig går der også nogle penge 
            til mig selv, så jeg kan fortsætte med at tilbyde denne service.
          </p>
        </div>

        {/* What I Offer */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Hvad tilbyder jeg?</h3>
          <ul className="text-gray-600 space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Professionel indvendig rengøring af din bil</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Grundig støvsugning</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Rensning af sæder, gulvmåtter og instrumentpanel</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Venlig og pålidelig service</span>
            </li>
          </ul>
        </div>

        {/* Contact / CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Støt en ung iværksætter med et godt formål!
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
