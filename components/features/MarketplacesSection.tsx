export function MarketplacesSection() {
  const marketplaces = [
    { name: 'OLX', status: 'active' },
    { name: 'Mercado Livre', status: 'soon' },
    { name: 'Facebook', status: 'soon' },
    { name: 'Instagram', status: 'soon' },
    { name: 'Shopee', status: 'soon' },
    { name: 'Magazine Luiza', status: 'soon' },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">
          Marketplaces Integrados
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Buscamos nos principais marketplaces do Brasil
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {marketplaces.map((marketplace) => (
            <div
              key={marketplace.name}
              className="bg-white p-6 rounded-xl shadow-sm text-center relative"
            >
              <div className="font-semibold text-gray-900 mb-2">
                {marketplace.name}
              </div>
              {marketplace.status === 'active' ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Ativo
                </span>
              ) : (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  Em breve
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
