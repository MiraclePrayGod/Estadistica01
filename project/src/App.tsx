import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import GaussCurve from './components/GaussCurve';

interface Stratum {
  id: string;
  name: string;
  population: number;
  variance: number;
}

function App() {
  const [strata, setStrata] = useState<Stratum[]>([
    { id: '1', name: 'Estrato 1', population: 60, variance: 12 },
    { id: '2', name: 'Estrato 2', population: 58, variance: 15 },
    { id: '3', name: 'Estrato 3', population: 70, variance: 20 },
    { id: '4', name: 'Estrato 4', population: 45, variance: 40 }
  ]);
  
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [maxError, setMaxError] = useState(Math.sqrt(25000));
  const [varianceData, setVarianceData] = useState('');
  const [calculatedVariance, setCalculatedVariance] = useState(0);

  // Calculate Z value based on confidence level
  const getZValue = (confidence: number) => {
    switch (confidence) {
      case 90: return 1.645;
      case 95: return 1.96;
      case 99: return 2.576;
      default: return 1.96;
    }
  };

  // Calculate variance from input data
  const calculateVariance = (data: string) => {
    const numbers = data.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
    if (numbers.length === 0) return 0;
    
    const mean = numbers.reduce((a, b) => a + b) / numbers.length;
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
    return variance;
  };

  // Calculate sample size
  const calculateSampleSize = () => {
    const z = getZValue(confidenceLevel);
    const e = maxError;
    
    let numerator = 0;
    let denominator = 0;
    
    strata.forEach(stratum => {
      const Ni = stratum.population;
      const Si2 = stratum.variance;
      numerator += Ni * Math.sqrt(Si2);
      denominator += Ni;
    });
    
    const n = Math.ceil(Math.pow(z * numerator / (e * denominator), 2));
    return n;
  };

  // Add new stratum
  const addStratum = () => {
    const newId = (strata.length + 1).toString();
    setStrata([...strata, {
      id: newId,
      name: `Estrato ${newId}`,
      population: 0,
      variance: 0
    }]);
  };

  // Remove stratum
  const removeStratum = (id: string) => {
    setStrata(strata.filter(s => s.id !== id));
  };

  // Update stratum
  const updateStratum = (id: string, field: keyof Stratum, value: string | number) => {
    setStrata(strata.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  // Calculate proportional distribution
  const calculateDistribution = () => {
    const totalSample = calculateSampleSize();
    const totalPopulation = strata.reduce((sum, s) => sum + s.population, 0);
    
    return strata.map(stratum => ({
      ...stratum,
      sampleSize: Math.round(totalSample * (stratum.population / totalPopulation))
    }));
  };

  // Update variance when input changes
  useEffect(() => {
    setCalculatedVariance(calculateVariance(varianceData));
  }, [varianceData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Strata Table */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Datos de Estratos</h2>
              <button
                onClick={addStratum}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={16} /> Añadir Estrato
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Población (Ni)</th>
                    <th className="px-4 py-2 text-left">Varianza (Si²)</th>
                    <th className="px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {strata.map(stratum => (
                    <tr key={stratum.id} className="border-t">
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={stratum.name}
                          onChange={e => updateStratum(stratum.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={stratum.population}
                          onChange={e => updateStratum(stratum.id, 'population', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={stratum.variance}
                          onChange={e => updateStratum(stratum.id, 'variance', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => removeStratum(stratum.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Results Section */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Resultados del Muestreo</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-md shadow">
                  <p className="text-sm text-gray-600">Tamaño Total de Muestra</p>
                  <p className="text-2xl font-bold">{calculateSampleSize()}</p>
                </div>
                <div className="bg-white p-4 rounded-md shadow">
                  <p className="text-sm text-gray-600">Error Máximo (e²)</p>
                  <p className="text-2xl font-bold">{Math.pow(maxError, 2)}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Distribución por Estratos</h4>
                <div className="bg-white rounded-md shadow overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Estrato</th>
                        <th className="px-4 py-2 text-left">Muestra</th>
                        <th className="px-4 py-2 text-left">Proporción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculateDistribution().map(stratum => (
                        <tr key={stratum.id} className="border-t">
                          <td className="px-4 py-2">{stratum.name}</td>
                          <td className="px-4 py-2">{stratum.sampleSize}</td>
                          <td className="px-4 py-2">
                            {((stratum.sampleSize! / calculateSampleSize()) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>




          {/* Right Column - Controls and Calculations */}
          <div className="space-y-6">
            {/* Gauss Curve */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Distribución Normal</h3>
              <GaussCurve confidenceLevel={confidenceLevel} />
              <div className="mt-4 text-sm text-gray-600">
                <p>Z = {getZValue(confidenceLevel)} para {confidenceLevel}% de confianza</p>
              </div>
            </div>

            {/* Confidence Level Control */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Nivel de Confianza</h3>
              <div className="space-y-4">
                {[90, 95, 99].map(level => (
                  <button
                    key={level}
                    onClick={() => setConfidenceLevel(level)}
                    className={`w-full py-2 px-4 rounded-md ${
                      confidenceLevel === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}% (Z = {getZValue(level)})
                  </button>
                ))}
              </div>
            </div>



            {/* Error Control */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Error Máximo (e²)</h3>
              <input
                type="number"
                value={Math.pow(maxError, 2)}
                onChange={e => setMaxError(Math.sqrt(parseFloat(e.target.value) || 0))}
                className="w-full px-4 py-2 border rounded-md"
                min="0"
                step="1000"
              />
              <p className="mt-2 text-sm text-gray-600">e² = 25000 (según el problema)</p>
            </div>

       
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;