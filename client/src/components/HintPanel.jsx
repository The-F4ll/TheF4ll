function HintPanel({ hints }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Indices</h2>
      <div className="space-y-4">
        {hints.map((hint, index) => (
          <div
            key={index}
            className="bg-gray-700 p-3 rounded-lg border border-gray-600"
          >
            <p className="text-gray-300">{hint}</p>
          </div>
        ))}
        {hints.length === 0 && (
          <p className="text-gray-400 italic">Aucun indice disponible pour le moment</p>
        )}
      </div>
    </div>
  );
}

export default HintPanel; 